# LLDB Essentials

## `v` vs `p` vs `po` -- The Decision Framework

This is the single most important thing to know about LLDB with Swift. Most developers abandon LLDB because they use `po` on a struct and get garbage. The fix is knowing which command to use.

### Command Matrix

| Command | Full form | Mechanism | Best for | Fails when |
|---|---|---|---|---|
| `v` | `frame variable` | Reads memory directly, no compilation | Stored properties, locals, enums, optionals, actor state | Computed properties, lazy vars before first access, projected values (`$binding`) |
| `p` | `expression` (formatted) | Compiles and executes expression | Computed properties, function calls, `.count`, method results | Type metadata missing, complex generics, large modules |
| `po` | `expression --object-description` | Calls `debugDescription` on result | Classes with `CustomDebugStringConvertible`, `NSError`, `Notification` | Swift structs, protocol-typed values, enums |
| `expr` | `expression` | Evaluates arbitrary code | Modifying state at runtime, calling methods | Same as `p` plus side-effect risks |

### Decision Flow

1. **Start with `v`.** It always works for stored properties. No compilation, no failure.
2. **If `v` shows nothing useful** (computed property, function result), use `p`.
3. **If `p` fails** (type resolution error), try `expr -l objc -- (id)0x<address>` for ObjC-bridged types.
4. **Use `po` only** when you specifically want `debugDescription` output from a class.
5. **If everything fails**, `v self` always works inside a method.

### Examples

```
(lldb) v self.userName                    # Stored property -- always works
(lldb) v self.items[0]                    # Collection element
(lldb) v optionalValue                   # Shows: (String?) some = "hello" or none
(lldb) v self._isPresented               # SwiftUI @State backing store
(lldb) v actor                           # All actor stored properties

(lldb) p self.computedProperty           # Needs compilation
(lldb) p self.items.count                # Method call
(lldb) p Array(myArray.prefix(5))        # Limit large collection output

(lldb) po myNSError                      # Class with debugDescription
(lldb) po notification.userInfo          # ObjC dictionary
```

### `v` Flags

| Flag | Effect |
|---|---|
| `-d run` | Dynamic type resolution (slower, more accurate for protocols) |
| `-T` | Show types alongside values |
| `-R` | Raw unformatted output |
| `-D N` | Limit nested type depth to N levels |
| `-P N` | Limit pointer depth to N levels |

---

## SwiftUI State Inspection

SwiftUI `@State` is backed by stored properties with underscore prefix. Use `v` to read them:

```
(lldb) v self._isPresented               # @State var isPresented: Bool
(lldb) v self._items                     # @State var items: [Item]
(lldb) v self.viewModel.propertyName     # @Observable model property
```

**Diagnosing "view doesn't update":**

If a property changes (confirmed with `v`) but the view does not re-render, check:
1. Which thread the mutation happens on (`bt`). `@Observable` mutations must be on `@MainActor`.
2. Whether the view actually reads the property in `body` (SwiftUI tracks reads, not writes).
3. Use `Self._printChanges()` to see what triggered (or failed to trigger) a redraw:

```
(lldb) expr Self._printChanges()
```

---

## Actor Inspection

LLDB pauses the entire process. Actor isolation is a compile-time concept, not a runtime lock (for default actors). You can read any actor's state with `v`:

```
(lldb) v actor                           # All stored properties
(lldb) v actor.someProperty              # Specific property
```

This works regardless of which thread the debugger stopped on.

---

## Breakpoint Types

### Source Breakpoints

```
(lldb) b MyFile.swift:42                 # Short form
(lldb) breakpoint set -f MyFile.swift -l 42  # Full form
```

### Conditional Breakpoints

Break only when a condition is true:

```
(lldb) breakpoint set -f MyFile.swift -l 42 -c "value == nil"
(lldb) breakpoint set -f MyFile.swift -l 42 -c "index > 100"
```

### Ignore Count

Skip the first N hits, then break:

```
(lldb) breakpoint set -f MyFile.swift -l 42 -i 50
```

Use this instead of expensive conditional expressions in tight loops.

### One-Shot Breakpoints

Break once, then auto-delete:

```
(lldb) breakpoint set -f MyFile.swift -l 42 -o
```

### Exception Breakpoints

**Set these at the start of every debug session.** They stop at the throw site instead of the crash site.

```
(lldb) breakpoint set -E swift           # All Swift errors
(lldb) breakpoint set -E objc            # All ObjC exceptions
```

### Symbolic Breakpoints

Break on any call to a method by name:

```
(lldb) breakpoint set -n viewDidLoad
(lldb) breakpoint set -n "MyClass.myMethod"
(lldb) breakpoint set -S layoutSubviews  # ObjC selector
(lldb) breakpoint set -r "viewDid.*"     # Regex
```

**Auto Layout symbolic breakpoint:** Set a symbolic breakpoint on `UIViewAlertForUnsatisfiableConstraints` to catch constraint conflicts at the moment they occur. See the auto-layout skill for the full constraint debugging workflow.

### Logpoints (Breakpoint + Auto-Continue)

Log without stopping -- like `print()` but no rebuild:

```
(lldb) breakpoint set -f MyFile.swift -l 42
(lldb) breakpoint command add 1
> v self.value
> continue
> DONE
```

Or single-line:

```
(lldb) breakpoint command add 1 -o "v self.state"
```

### Managing Breakpoints

```
(lldb) breakpoint list                   # List all
(lldb) breakpoint disable 3             # Disable #3
(lldb) breakpoint enable 3              # Enable #3
(lldb) breakpoint delete 3             # Delete #3
(lldb) breakpoint modify 3 -c "x > 10" # Add condition to existing
```

---

## Watchpoints

Hardware-backed. Break when a variable's memory changes. Limited to approximately 4 per process.

```
(lldb) watchpoint set variable self.count              # Write only
(lldb) watchpoint set variable -w read_write myGlobal  # Read or write
(lldb) watchpoint set expression -- &myVariable        # Watch address
(lldb) watchpoint modify 1 -c "self.count > 10"        # Conditional
(lldb) watchpoint list
(lldb) watchpoint delete 1
```

Use sparingly due to the hardware limit.

---

## Thread and Frame Navigation

```
(lldb) thread info                       # Stop reason
(lldb) thread list                       # All threads with state
(lldb) thread select 3                   # Switch to thread 3
(lldb) bt                                # Backtrace current thread
(lldb) bt 10                             # Limit to 10 frames
(lldb) bt all                            # All threads (hang diagnosis)
(lldb) frame select 5                    # Jump to frame 5
(lldb) up                                # One frame toward caller
(lldb) down                              # One frame toward callee
```

### Execution Control

```
(lldb) c                                 # Continue
(lldb) n                                 # Step over
(lldb) s                                 # Step into
(lldb) finish                            # Step out
(lldb) process interrupt                 # Pause running process
(lldb) thread return 42                  # Force early return (use with caution)
```

---

## Register Reading (Last Resort)

When variables show `<variable not available>` in optimized builds:

```
(lldb) register read
(lldb) register read x0 x1 x2
```

ARM64 calling convention:
- `x0` = self (or first argument for free functions)
- `x1` through `x7` = next 7 arguments
- `x0` = return value after function call

Only use this when per-file `-Onone` is not an option.

---

## `.lldbinit` Customization

LLDB reads `~/.lldbinit` at startup. Per-project init files can be set in Xcode: Edit Scheme > Run > Options > "LLDB Init File".

### Useful Aliases

```
# ~/.lldbinit

# Flush UI changes made via expression
command alias flush expr -l objc -- (void)[CATransaction flush]

# Print view hierarchy
command alias views expr -l objc -- (void)[[[UIApplication sharedApplication] keyWindow] recursiveDescription]
```

### Custom Type Summaries

```
type summary add CLLocationCoordinate2D --summary-string "${var.latitude}, ${var.longitude}"
```

### Settings

```
(lldb) settings set target.language swift               # Force Swift mode
(lldb) settings set target.max-children-count 100       # Show more collection items
```

---

## Troubleshooting: "LLDB Is Broken"

| What You See | Cause | Fix |
|---|---|---|
| `<uninitialized>` | `po` failed or optimizer hasn't populated variable | Use `v` instead |
| `expression failed to parse, unknown type name` | Swift expression parser cannot resolve the type | Use `v`, or try `expr -l objc -- (id)0x<addr>` |
| `<variable not available>` | Compiler optimized it out (Release build) | Debug config, per-file `-Onone`, or `register read` |
| `error: Couldn't apply expression side effects` | Expression mutated state LLDB couldn't reverse | Simplify expression; use `v` for read-only |
| `po` shows memory address, not value | Object lacks `CustomDebugStringConvertible` | Use `v` for raw value |
| `cannot find 'self' in scope` | Breakpoint in static method or closure without `self` | Use `v` with explicit variable name |
| `p` works but `po` crashes | Different compilation paths | Stick with `p` |
| LLDB hangs or is very slow | Compiling complex expression in large project | Use `v` (no compilation). Ctrl+C to cancel hung `po`. |
| Breakpoint not hit | Wrong file/line, disabled, code not reached, or Release build | `breakpoint list` to verify; check config |

---

## Crash Triage Checklist

1. `thread info` -- read the stop reason.
2. `bt` -- find the first frame in your module.
3. `frame select N` -- navigate to that frame.
4. `v` -- inspect local state.
5. Classify the exception:

| Exception | Typical Cause | Fix Pattern |
|---|---|---|
| `EXC_BAD_ACCESS` at low address (0x0-0x10) | Force-unwrap nil | `guard let` / `if let` |
| `EXC_BAD_ACCESS` at high address | Use-after-free, dangling pointer | Check lifetime, `[weak self]` |
| `EXC_BREAKPOINT (SIGTRAP)` | Swift runtime trap (bounds, unwrap, precondition) | Fix the violated precondition |
| `EXC_CRASH (SIGABRT)` | `fatalError()` or uncaught ObjC exception | Read the exception message |

6. Set a conditional breakpoint to catch it earlier next time.

---

## Async/Concurrency Debugging

Swift concurrency backtraces are noisy. Expect `swift_task_switch`, `_dispatch_call_block_and_release`, and executor internals. Focus on frames from your module.

```
(lldb) bt all                            # Find threads with swift_task frames
(lldb) v self                            # Inside actor: all stored properties
```

Each child task in a task group runs on its own thread. Use `bt all` to see them all.
