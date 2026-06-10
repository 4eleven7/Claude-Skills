# Memory Leak Detection

Systematic workflow for finding and fixing memory leaks. For Memory Graph Debugger and sanitizer details, see `runtime-diagnostics.md`.

## 3-Phase Workflow

### Phase 1: Confirm the Leak (5 min)

Profile with the Memory template (Cmd+I > Memory). Repeat the suspect action 10 times.

| Memory graph shape | Diagnosis | Action |
|---|---|---|
| Flat line | Not a leak | Stop investigating |
| Rises then plateaus | Normal caching | Stop investigating |
| Steady climb, never flattens | Classic leak | Continue to Phase 2 |
| Spikes that stack higher each time | Compound leak | Continue to Phase 2 |

### Phase 2: Locate the Leak (10-15 min)

Use Memory Graph Debugger (Debug > Memory Graph Debugger). Look for purple/red warning badges. Click a flagged object to see the retain chain.

If Memory Graph Debugger is not conclusive, add `deinit` logging to suspect classes:

```swift
deinit { print("deallocated: \(type(of: self))") }
```

Navigate to the view, navigate away. Missing print = retained somewhere.

**Common locations by frequency:**

| Source | ~Frequency | Typical fix |
|---|---|---|
| Timer not invalidated | 50% | `timer.invalidate()` in teardown + `timer = nil`, or Combine `Timer.publish` |
| NotificationCenter observer not removed | 25% | Combine `publisher(for:)` with `.store(in: &cancellables)` |
| Closure capturing `self` strongly | 15% | `[weak self]` in capture list |
| Delegate held strongly | 10% | `weak var delegate` |

### Phase 3: Fix and Verify (5 min)

Apply the fix. Re-run Instruments. Memory should stay flat.

For compound leaks (real apps often have 2-3 stacking): fix the largest first, re-profile, repeat until flat.

## Common Leak Patterns With Fixes

### Timer Leaks

`[weak self]` alone does not fix timer leaks. The RunLoop retains scheduled timers. You must explicitly `invalidate()`.

```swift
// BAD: Timer never invalidated -- RunLoop keeps it alive
progressTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
    self?.updateProgress()
}

// GOOD: Combine auto-cleanup
cancellable = Timer.publish(every: 1.0, tolerance: 0.1, on: .main, in: .default)
    .autoconnect()
    .sink { [weak self] _ in self?.updateProgress() }

// GOOD: Manual invalidation in BOTH teardown AND deinit
func stop() {
    timer?.invalidate()
    timer = nil
}

deinit {
    timer?.invalidate()
    timer = nil
}
```

### Observer/Notification Leaks

```swift
// BAD: No removeObserver
NotificationCenter.default.addObserver(self, selector: #selector(handle),
    name: .someNotification, object: nil)

// GOOD: Combine publisher auto-cleans with cancellables
NotificationCenter.default.publisher(for: .someNotification)
    .sink { [weak self] _ in self?.handleChange() }
    .store(in: &cancellables)
```

### Closure Capture in Collections

```swift
// BAD: Strong self captured in stored closure
updateCallbacks.append { [self] track in
    self.refreshUI(with: track)
}

// GOOD: Weak self
updateCallbacks.append { [weak self] track in
    self?.refreshUI(with: track)
}
```

Clear callback arrays in `deinit` or teardown.

## Common Mistakes

| Mistake | Why it fails | Fix |
|---|---|---|
| `[weak self]` without `invalidate()` | Timer keeps running and consuming CPU | Always call `invalidate()` or `cancel()` |
| `timer?.invalidate()` without nil | Reference remains, timer object not freed | Always follow with `timer = nil` |
| Local `AnyCancellable` | Goes out of scope immediately, subscription dies | Store in `Set<AnyCancellable>` property |
| `deinit` with only logging | No actual cleanup runs | Add `invalidate()`, `removeObserver()`, `cancel()` alongside the print |

## Jetsam and Memory Pressure

Jetsam is iOS terminating background apps to free memory. It is not a crash (no crash log), but frequent kills degrade UX.

| Termination type | Cause | Solution |
|---|---|---|
| Memory Limit Exceeded | App used too much memory while active | Reduce peak memory footprint |
| Jetsam (background) | System needed memory for foreground apps | Reduce background memory to <50MB |

### Reducing Background Memory

Clear caches when entering background:

```swift
.onChange(of: scenePhase) { _, newPhase in
    if newPhase == .background {
        imageCache.clearAll()
        URLCache.shared.removeAllCachedResponses()
    }
}
```

### State Restoration

Users should not notice jetsam. Use `@SceneStorage` to restore navigation position, drafts, and scroll position.

### Monitoring with MetricKit

```swift
class JetsamMonitor: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            guard let exitData = payload.applicationExitMetrics else { continue }
            let bgData = exitData.backgroundExitData
            if bgData.cumulativeMemoryPressureExitCount > 0 {
                // Send to analytics
            }
        }
    }
}
```

## Intermittent Leak Diagnostics

When leaks only reproduce intermittently or cannot be caught in Instruments:

1. **deinit logging as primary diagnostic.** Add `deinit { print("deallocated: \(type(of: self))") }` to all suspect classes. Run 20+ sessions. Missing deinit messages reveal which objects are retained.

2. **Isolate the trigger.** Test each navigation path independently. Rapidly toggle background/foreground if timing-dependent. Narrow to the specific path that leaks.

3. **MetricKit for field diagnostics.** Monitor peak memory in production via `MXMetricPayload.memoryMetrics.peakMemoryUsage`. Alert when exceeding threshold (e.g., 400MB).

**Common cause of intermittent leaks:** Notification observers added on lifecycle events (`viewWillAppear`, `applicationDidBecomeActive`) without removing duplicates first. Each re-registration accumulates a listener.

## Instruments Quick Reference

| Scenario | Instrument | What to look for |
|---|---|---|
| Progressive memory growth | Memory | Line steadily climbing = leak |
| Specific object leaking | Memory Graph Debugger | Purple/red circles = leak objects |
| Direct leak detection | Leaks | Red "! Leak" badge = confirmed |
| Memory by type | VM Tracker | Which objects consume most memory |
| Cache behavior | Allocations | Objects allocated but not freed |

### Command Line

```bash
xcrun xctrace record --template "Memory" --output memory.trace
leaks --atExit --list -- /path/to/YourApp.app/YourApp
```
