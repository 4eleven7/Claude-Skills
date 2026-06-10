# Hang Diagnostics

## Responsibility

**Owns:** Hang diagnosis, main thread responsiveness, watchdog terminations, MetricKit MXHangDiagnostic, hang prevention patterns, System Trace for blocked threads, Swift concurrency hang patterns.

**Does NOT own:** Animation hitches and frame pacing (see ios-metal for Metal/Core Animation hitches), general performance profiling (see ios-tooling), LLDB fundamentals (see ios-debugging), crash symbolication, memory pressure / Jetsam (see ios-debugging).

## Core Principles

1. **A hang is >1 second of main thread unresponsiveness.** The user taps, nothing happens. This is the threshold Apple uses in Organizer and MetricKit.
2. **Every hang is either BUSY or BLOCKED.** Busy = main thread doing work. Blocked = main thread waiting for something. The fix depends on which.
3. **Classify before fixing.** Use the decision framework below. Wrong classification leads to wrong fix.
4. **Field data beats local profiling.** Hangs depend on device, network, disk state, and thermal conditions. MetricKit and Organizer catch what local testing misses.
5. **Swift concurrency can hang too.** Actor reentrancy, MainActor.run blocking, and semaphore-based bridging are modern hang sources.
6. **Mutex deadlocks are silent hangs.** `Mutex` (Synchronization framework) does not support recursive locking — re-locking on the same thread deadlocks permanently. Nested Mutex acquisition across threads is another common deadlock source. See `swift-concurrency` skill's `references/synchronization-framework.md`.

## Hang vs Hitch vs Lag

| Issue | Duration | Experience | Diagnosis Tool |
|---|---|---|---|
| **Hang** | >1 second | App frozen, unresponsive | Time Profiler, System Trace |
| **Hitch** | 1-3 frames (16-50ms) | Animation stutters | Animation Hitches instrument |
| **Lag** | 100-500ms | Feels slow but responsive | Time Profiler |

This skill covers **hangs only**.

## Decision Framework

1. **Do you have field hang reports?** (Organizer or MetricKit)
   - YES with stack showing your code running -> **BUSY** -> Time Profiler
   - YES with stack showing wait/semaphore/lock -> **BLOCKED** -> System Trace
   - NO, can reproduce locally -> step 2
   - NO, cannot reproduce -> Enable MetricKit, check Organizer > Hangs

2. **Profile locally with Time Profiler**
   - High CPU on main thread -> **BUSY**: optimise or move work off main
   - Low CPU, thread blocked -> **BLOCKED**: use System Trace to find what's blocking

3. **Apply the matching pattern** from `references/hang-patterns.md`

## Tool Selection

| Scenario | Tool | Why |
|---|---|---|
| Reproduces locally, need to see what main thread does | Time Profiler | Shows call tree with self-time |
| Blocked thread suspected | System Trace | Shows thread states at nanosecond level |
| App frozen in debugger | LLDB `bt all` | Classifies all thread states immediately |
| Field reports only | Xcode Organizer > Hangs | Aggregated diagnostics with stack traces |
| Want in-app hang data | MetricKit MXHangDiagnostic | Programmatic access to hang call stacks |
| Need precise thread timing | System Trace | Thread state timeline (running/blocked/preempted) |

## LLDB Quick Triage

When the app is frozen and attached to the debugger:

```
(lldb) process interrupt          # Pause if running
(lldb) thread list                # See all thread states
(lldb) bt all                     # Full backtrace of every thread
(lldb) thread info                # Stop reason for current thread
```

Look at thread 1 (main thread):
- Stack shows your code with computation -> **BUSY**
- Stack shows `__psynch_mutexwait`, `dispatch_sync`, `semaphore_wait` -> **BLOCKED**
- Stack shows `mach_msg_trap` in a system service call -> **BLOCKED on IPC**

## Root Cause Taxonomy

### BUSY: Main Thread Doing Work

| Subcategory | Example | Fix |
|---|---|---|
| Proactive work | Pre-computing data user hasn't requested | Lazy init, compute on demand |
| Irrelevant work | Processing all notifications, not just relevant | Filter observers, targeted notifications |
| Suboptimal API | Blocking API when async exists | Switch to async variant |
| Image processing | Decoding/resizing on main thread | Move to background with `@concurrent` |
| Expensive layout | Complex SwiftUI body with O(n) work | Extract to background, cache results |

### BLOCKED: Main Thread Waiting

| Subcategory | Example | Fix |
|---|---|---|
| Synchronous IPC | Calling system service synchronously | Use async API variant |
| File I/O | `Data(contentsOf:)` on main thread | Move to background queue |
| Network | Synchronous URL request | Use URLSession async |
| Lock contention | Waiting for lock held by background thread | Reduce critical section, use actors |
| Semaphore bridging | `semaphore.wait()` to bridge async to sync | Restructure to async/await |
| dispatch_sync | `DispatchQueue.main.sync` from main | Remove or use `DispatchQueue.main.async` |

### Swift Concurrency Hangs

| Pattern | Mechanism | Fix |
|---|---|---|
| `MainActor.run {}` from main | Redundant hop, can queue behind other work | Check if already on MainActor first |
| Semaphore bridging async | `semaphore.wait()` blocks main while async work needs main | Use `Task {}` or structured concurrency |
| Actor reentrancy starvation | Many callers queue on actor, main thread caller starved | Reduce actor critical sections, use `@concurrent` for reads |
| Blocking `assumeIsolated` | Assumes MainActor but work is heavy | Move heavy work to `@concurrent` function |
| Priority inversion | High-priority task waits for low-priority task on same actor | Shorten actor critical sections, split actors, use explicit `Task(priority:)` |

## Watchdog Terminations

The system watchdog kills apps that hang too long during lifecycle transitions:

| Transition | Time Limit | Crash Code |
|---|---|---|
| Launch (time to first frame) | ~20 seconds | `0x8badf00d` |
| Background transition | ~5 seconds | `0x8badf00d` |
| Resume from suspend | ~10 seconds | `0xdead10cc` (if holding file lock) |

**Launch hang prevention:**
- Defer non-essential work with `Task {}`
- Never do synchronous network or database migration in `application(_:didFinishLaunchingWithOptions:)`
- Use `@MainActor` init sparingly in app delegate

## MetricKit Integration

```swift
import MetricKit

final class HangDiagnosticsSubscriber: NSObject, MXMetricManagerSubscriber {
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            if let hangDiagnostics = payload.hangDiagnostics {
                for diagnostic in hangDiagnostics {
                    // diagnostic.callStackTree contains the hang stack
                    // diagnostic.hangDuration is the Duration
                    logger.warning("Hang: \(diagnostic.hangDuration)s")
                }
            }
        }
    }
}

// Register in app init:
MXMetricManager.shared.add(subscriber)
```

## Xcode Organizer

Organizer > select app > Hangs tab shows:
- **Hang Rate**: percentage of foreground time spent hanging
- **Stack traces**: weighted by frequency
- **Affected versions**: which builds have the worst hang rates

Target: <1% hang rate. Apple considers >3% a significant problem.

## Swift Concurrency Instruments Template

When profiling concurrency issues in Instruments, use the **Swift Concurrency** template.

### Tracks

| Track | Information |
|---|---|
| **Swift Tasks** | Task lifetimes, parent-child relationships, execution spans |
| **Swift Actors** | Actor access patterns, contention visualization |
| **Thread States** | Blocked vs running vs suspended per thread |

### Color Coding

| Color | Meaning | Action |
|---|---|---|
| **Blue** | Task executing | Normal -- check duration if long |
| **Red** | Task waiting (contention) | High red:blue ratio = contention problem |
| **Gray** | Task suspended (awaiting) | Normal for async -- check if unexpectedly long |

### Statistics to Check

- **Running Tasks**: Currently executing -- should match core count at most
- **Alive Tasks**: Present at a point in time -- growing unbounded = leak
- **Total Tasks**: Cumulative count -- unexpectedly high = tight-loop task creation

### Debug Flag

Set `SWIFT_CONCURRENCY_COOPERATIVE_THREAD_BOUNDS=1` as an environment variable in the scheme to detect unsafe blocking calls inside async contexts at runtime. Triggers a runtime warning when code violates the cooperative thread pool's forward-progress guarantee.

### Priority Inversion

**Symptom:** High-priority task waits for a low-priority task to release an actor or resource.

**Diagnosis:**
1. Inspect task priorities in the Swift Tasks track
2. Follow wait chains -- a `.userInitiated` task blocked behind `.background` work
3. Check actor access ordering

**Fixes:**
- Use `Task(priority: .userInitiated)` for critical-path work
- Keep actor critical sections short so high-priority callers don't queue behind long low-priority work
- Split actors by access pattern (read-heavy vs write-heavy) to reduce serialization

## Prevention Checklist

- [ ] No synchronous file I/O on main thread
- [ ] No `Data(contentsOf:)` or `String(contentsOfFile:)` on main thread
- [ ] No `DispatchQueue.main.sync` calls (ever)
- [ ] No `semaphore.wait()` on main thread
- [ ] No synchronous network requests
- [ ] Image decoding happens on background queue
- [ ] Heavy formatters (DateFormatter, NumberFormatter) created once or on background
- [ ] Launch path defers non-essential work
- [ ] MetricKit subscriber registered for field monitoring
- [ ] Core Data / SwiftData fetches on background context for large datasets

## Anti-Patterns

| Anti-Pattern | Why It Hangs | Fix |
|---|---|---|
| `DispatchQueue.main.sync` from any thread | Deadlocks if already on main; blocks caller otherwise | Use `.async` or remove |
| `semaphore.wait()` to bridge async | Blocks main thread while awaited work may need main | Use `Task {}` pattern |
| `JSONDecoder().decode` on main for large payloads | CPU-bound work | Move to `Task.detached` or `@concurrent` |
| Creating `DateFormatter` per cell | Expensive init repeated per layout pass | Cache formatter as static or actor property |
| Synchronous `UserDefaults` for large data | File I/O on main thread | Use async read or keep data small |
| `NotificationCenter` observer doing heavy work | Runs on posting thread (often main) | Filter first, dispatch heavy work to background |

## Output Format

When diagnosing a hang:

1. **Classification**: BUSY or BLOCKED (with confidence: HIGH/MEDIUM/LOW)
2. **Evidence**: What points to this classification
3. **Root cause**: Specific code pattern causing the hang
4. **Fix**: Code change with before/after
5. **Verification**: How to confirm the fix worked (Time Profiler, MetricKit)
6. **Prevention**: Assertion or check to catch regression

## References

- `references/hang-patterns.md` -- Common hang patterns with before/after Swift code examples
