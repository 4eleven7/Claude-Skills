---
name: ios-debugging
description: Use when debugging iOS runtime issues with LLDB, diagnostics, memory tools, stack traces, breakpoints, or SwiftUI state inspection.
---

# iOS Debugging

## Responsibility

**Owns:** LLDB commands, runtime variable inspection, breakpoint strategies, crash triage, hang diagnosis, runtime diagnostics (sanitizers, memory graph, `_printChanges`), memory leak detection workflows, Jetsam/memory pressure diagnostics.

**Does NOT own:** Build/environment debugging, CI pipelines, crash log symbolication from production. Concurrency-specific memory issues (Task retention, AsyncStream leaks) are owned by the swift-concurrency skill.

## Core Principles

1. **Inspect before print-debug.** One breakpoint replaces 5-10 print-rebuild cycles. A breakpoint costs 30 seconds; a print-debug cycle costs 3-5 minutes.
2. **Use `v`, not `po`, for Swift values.** `v` reads memory directly with no compilation. `po` fails on structs, enums, and protocol-typed values. `v` is your default; `po` is for classes with `CustomDebugStringConvertible`.
3. **Read the stop reason first.** `thread info` before anything else. The stop reason tells you whether you hit a breakpoint, a trap, or a memory fault.
4. **Backtraces are not optional.** `bt` after every stop. Find the first frame in YOUR module. That is where investigation starts.
5. **LLDB pauses the entire process.** Actor isolation is a compile-time concept. When the debugger stops, you can read any memory with `v`, regardless of actor boundaries.
6. **Diagnostics before guesses.** Use `Self._printChanges()`, Memory Graph Debugger, or sanitizers to confirm a theory before writing a fix.

## Decision Framework: When to Use What

| Situation | Tool |
|---|---|
| Need to inspect state at a specific moment | LLDB breakpoint + `v` |
| Need to understand what triggered a SwiftUI redraw | `Self._printChanges()` in LLDB or view body |
| Need to measure CPU/memory trends over time | Instruments (not LLDB) |
| Memory growing without bound | Memory leak detection workflow (see `references/memory-leak-detection.md`) |
| App killed in background repeatedly | Jetsam diagnostics (see `references/memory-leak-detection.md`) |
| App completely frozen | Pause (`process interrupt`) + `bt all` to classify thread states |
| Crash you can reproduce locally | Exception breakpoints (`breakpoint set -E swift`) + `bt` |
| Release-only crash, variables optimized out | Per-file `-Onone`, or `register read` as last resort |
| Data race suspicion | Thread Sanitizer (`-fsanitize=thread`) |
| Use-after-free or buffer overflow | Address Sanitizer (`-fsanitize=address`) |

## Quick Reference

### Variable Inspection

| Command | Use for | Notes |
|---|---|---|
| `v` | Stored properties, locals, actor state | Default choice. Reads memory directly. |
| `v self._isPresented` | SwiftUI `@State` backing store | Underscore prefix for property wrappers. |
| `p` | Computed properties, function calls | Compiles expression. Slower, can fail. |
| `po` | Classes with `debugDescription` | Calls `CustomDebugStringConvertible`. |
| `expr` | Modify state at runtime | `expr self.debugFlag = true` |

### Breakpoints

```
(lldb) b MyFile.swift:42                          # Source breakpoint
(lldb) breakpoint set -f MyFile.swift -l 42 -c "value == nil"  # Conditional
(lldb) breakpoint set -E swift                    # All Swift errors (set this always)
(lldb) breakpoint set -E objc                     # All ObjC exceptions
(lldb) watchpoint set variable self.count         # Hardware watchpoint (~4 max)
```

### Navigation

```
(lldb) thread info           # Stop reason
(lldb) bt                    # Backtrace current thread
(lldb) bt all                # All threads (hang diagnosis)
(lldb) frame select 3        # Jump to frame
(lldb) v                     # All variables in frame
```

### Runtime Modification

```
(lldb) expr self.view.backgroundColor = UIColor.red
(lldb) expr Self._printChanges()                  # SwiftUI: what triggered body
(lldb) expr -l objc -- (void)[CATransaction flush]  # Force UI update
```

## Anti-Patterns

| Anti-Pattern | Why It Fails | Alternative |
|---|---|---|
| `po` everything | Fails for Swift structs, enums, optionals | `v` for values, `po` only for classes |
| Print-debug cycles | 3-5 min per cycle, no interactivity | Breakpoint + `v` (30 seconds) |
| Skipping exception breakpoints | Crash lands in system code, not throw site | Always set `-E swift` and `-E objc` |
| Debugging Release builds | Variables optimized out, code reordered | Debug config, or per-file `-Onone` |
| `po` shows garbage, conclude "LLDB is broken" | Wrong command for the type | Use `v` instead |

## Output Format

When helping debug an issue, structure the response as:

1. **Diagnosis** -- what the symptoms point to (tag confidence: HIGH/MEDIUM/LOW).
2. **Commands to run** -- numbered, copy-paste ready, with `(lldb)` prefix.
3. **What to look for** -- command output, expected values, interpretation.
4. **Root cause** -- ranked by probability.
5. **Prevention** -- breakpoint or assertion to catch recurrence.

## References

- `references/lldb-essentials.md` -- `v` vs `p` vs `po` decision framework, breakpoint types, watchpoints, actor inspection, SwiftUI state inspection, `.lldbinit` customization, troubleshooting table.
- `references/runtime-diagnostics.md` -- `Self._printChanges()`, Memory Graph Debugger, Thread Sanitizer, Address Sanitizer, environment variable diagnostics.
- `references/memory-leak-detection.md` -- 3-phase leak detection workflow, common retain cycle patterns with fixes, Jetsam/memory pressure handling, intermittent leak diagnostics, MetricKit monitoring.
