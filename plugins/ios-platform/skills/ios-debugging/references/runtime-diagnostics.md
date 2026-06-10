# Runtime Diagnostics

## `Self._printChanges()` -- SwiftUI Update Diagnosis

The single fastest way to understand why a SwiftUI view's `body` was called.

### Usage in LLDB

Set a breakpoint inside a view's `body`, then:

```
(lldb) expr Self._printChanges()
```

### Usage in Code (Temporary Only)

```swift
var body: some View {
    let _ = Self._printChanges()  // Remove before shipping

    Text("Hello")
}
```

**Never submit to App Store with `_printChanges()` calls.** It is underscore-prefixed API that may be removed.

### Output Interpretation

| Output | Meaning | Action |
|---|---|---|
| `MyView: @self changed` | The view value itself changed (parent passed new parameters) | Check parent -- is it recreating this view unnecessarily? |
| `MyView: count changed` | `@State` property `count` triggered the update | Expected if you modified `count`; investigate if you did not |
| `MyView: @self changed` (with `@Environment`) | An environment value changed | Check which environment value; frequent changes cause cascading updates |
| No output at all | `body` is not being called | View identity may have changed (removed from hierarchy). Check conditionals and `.id()` modifiers. |
| Multiple properties listed | Several dependencies changed simultaneously | Broad dependency -- view reads too much state. Extract subviews that depend on specific properties. |

### Common Discoveries

**"@self changed" when unexpected:** Parent is recreating the view. Trace upward -- the parent's state change is rebuilding its entire `body`, which creates a new instance of this child view.

**Property changed but you didn't change it:** Indirect dependency. The view reads from an `@Observable` object whose other properties changed. With `@Observable`, SwiftUI tracks property-level reads -- verify the view actually reads only what it needs.

**Body never called:** The view has been removed from the hierarchy (conditional `if` toggled) or its identity changed. Search for `.id()` modifiers or `if/else` branches containing this view.

---

## Memory Graph Debugger

The fastest way to find retain cycles. No Instruments setup required.

### Workflow

1. Run the app in the simulator.
2. Xcode menu: Debug > Memory Graph Debugger (or click the debug bar icon).
3. Look for objects marked with a purple/red warning badge.
4. Click a flagged object -- Xcode shows the retain chain.
5. Trace the chain to find the cycle (A retains B retains A).

### What to Look For

| Visual | Meaning |
|---|---|
| Purple circle with warning badge | Leaked object -- retained but unreachable |
| Object with high instance count | Possible accumulation leak (e.g., 50 instances of a view model that should have 1) |
| Cycle in the graph (arrows forming a loop) | Retain cycle -- the root cause |

### Common Retain Cycle Sources

| Source | Frequency | Fix |
|---|---|---|
| Timer not invalidated | ~50% of leaks | `timer.invalidate()` in teardown + `timer = nil`. Or use Combine `Timer.publish`. |
| NotificationCenter observer not removed | ~25% | Use Combine `publisher(for:)` with `store(in: &cancellables)`. |
| Closure capturing `self` strongly | ~15% | `[weak self]` in closure capture list. |
| Delegate held strongly | ~10% | Declare delegate property as `weak`. |

### Verification

After applying a fix:
1. Add `deinit { print("deallocated: \(type(of: self))") }` to the suspect class.
2. Navigate to the view, then navigate away.
3. Confirm the deinit message prints.
4. Re-run Memory Graph Debugger -- the object should no longer appear.

---

## Thread Sanitizer (TSan)

Detects data races at runtime. A data race occurs when two threads access the same memory without synchronization and at least one is a write.

### Enabling

Xcode: Edit Scheme > Run > Diagnostics > Thread Sanitizer.

Or add to build flags:

```
OTHER_SWIFT_FLAGS = -sanitize=thread
OTHER_CFLAGS = -fsanitize=thread
```

### Runtime Overhead

Approximately 5-15x slower execution and 5-10x more memory. Use only during testing, not in production builds.

### Reading TSan Reports

TSan reports show two stack traces:
1. **Previous access** -- the first thread that touched the memory.
2. **Current access** -- the second thread that raced with it.

Look for the frames in your module in both traces. The fix is to ensure both accesses go through the same synchronization mechanism (actor, lock, serial queue).

### Common Data Races in Swift

| Pattern | Symptom | Fix |
|---|---|---|
| Property accessed from multiple threads | TSan warning on stored property | Move property to an actor, or protect with a lock |
| `@Observable` mutated off `@MainActor` | SwiftUI doesn't observe the change; TSan may also fire | Ensure mutations happen on `@MainActor` |
| Dictionary/array modified concurrently | Crash or TSan warning | Use actor-isolated storage or `os_unfair_lock` |

---

## Address Sanitizer (ASan)

Detects memory errors: use-after-free, buffer overflows, stack overflows, use-after-return.

### Enabling

Xcode: Edit Scheme > Run > Diagnostics > Address Sanitizer.

Or:

```
OTHER_SWIFT_FLAGS = -sanitize=address
OTHER_CFLAGS = -fsanitize=address
```

### Runtime Overhead

Approximately 2-3x slower, 2-3x more memory. Significantly lighter than TSan. Safe to enable routinely during development.

### When to Use

- Crash with `EXC_BAD_ACCESS` that you cannot reproduce reliably.
- Any code using `UnsafePointer`, `UnsafeMutableBufferPointer`, or C interop.
- Release-only crashes that might be memory corruption.

### Reading ASan Reports

ASan stops execution at the point of the invalid access and prints:
- The type of error (heap-use-after-free, heap-buffer-overflow, stack-buffer-overflow).
- The address and size of the access.
- Stack trace of the current access.
- Stack trace of where the memory was freed (for use-after-free).

The "freed by" trace tells you where the object's lifetime ended. The "accessed by" trace tells you who is still holding a dangling reference.

---

## Undefined Behavior Sanitizer (UBSan)

Catches undefined behavior: integer overflow, misaligned pointers, null pointer dereference, invalid enum values.

### Enabling

Xcode: Edit Scheme > Run > Diagnostics > Undefined Behavior Sanitizer.

### When to Use

- Arithmetic on user input or parsed data (overflow risk).
- C/C++ interop code.
- Bitwise operations on enums.

Lighter than ASan or TSan. Can run alongside ASan but not alongside TSan.

---

## Environment Variable Diagnostics

Set these in Xcode: Edit Scheme > Run > Arguments > Environment Variables.

| Variable | Value | Effect |
|---|---|---|
| `MALLOC_STACK_LOGGING` | `1` | Records allocation/deallocation stack traces. Required for `leaks` CLI tool and Malloc Stack in Instruments. |
| `MALLOC_SCRIBBLE` | `1` | Fills freed memory with `0x55` and allocated memory with `0xAA`. Makes use-after-free crash immediately instead of silently corrupting. |
| `MALLOC_GUARD_EDGES` | `1` | Adds guard pages around large allocations. Catches buffer overflows on heap. |
| `DYLD_PRINT_LIBRARIES` | `1` | Prints each dylib as it loads. Useful for diagnosing missing framework errors. |
| `OBJC_PRINT_LOAD_METHODS` | `YES` | Prints each `+load` method as it runs. Useful for diagnosing slow launch. |
| `CA_DEBUG_TRANSACTIONS` | `1` | Logs Core Animation transactions. Warns about off-main-thread UI updates. |

### `leaks` Command-Line Tool

Requires `MALLOC_STACK_LOGGING=1`:

```bash
leaks --atExit --list -- /path/to/YourApp.app/YourApp
```

Or attach to a running process:

```bash
leaks <pid>
```

Shows leaked objects with allocation stack traces.

---

## Diagnostic Decision Tree

```
What are you investigating?
|
+-- SwiftUI view not updating?
|   +-- Add Self._printChanges() to body
|   +-- Check output (see interpretation table above)
|
+-- Memory growing over time?
|   +-- Memory Graph Debugger (fastest)
|   +-- Look for purple/red badges
|   +-- If retain cycle found: fix with [weak self] / invalidate timer
|
+-- Crash with EXC_BAD_ACCESS?
|   +-- Enable Address Sanitizer
|   +-- Reproduce crash
|   +-- Read ASan report for freed-by trace
|
+-- Intermittent crash or corruption?
|   +-- Enable Thread Sanitizer
|   +-- Reproduce under load
|   +-- Read TSan report for both access traces
|
+-- Arithmetic overflow or C interop issue?
    +-- Enable UBSan
    +-- Reproduce with edge-case inputs
```
