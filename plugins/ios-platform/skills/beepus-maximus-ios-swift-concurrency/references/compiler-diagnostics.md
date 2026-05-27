# Compiler Diagnostics

Maps common strict-concurrency compiler errors to likely fixes. Target: Swift 6.2+.

## "Sending 'x' risks causing data races"

A value crosses an isolation boundary where it could still be accessed from the sending side.

Fixes (try in order):
1. **Check region-based isolation.** If the sender stops using the value after passing it, the compiler may accept it.
2. **Mark the parameter `sending`.** Transfers ownership -- caller cannot touch the value afterward.
3. **Make the type `Sendable`** if it genuinely can be shared safely (value type, immutable class, or internally synchronized).
4. **Check `nonisolated(nonsending)`.** If the function no longer hops executors, the value may not cross a boundary.
5. **Last resort: `@unchecked Sendable`** only with verified manual synchronization.

In Swift 6.2 with approachable concurrency, many of these errors disappear because `nonisolated` async functions stay on the caller's actor by default.

## "Static property 'x' is not concurrency-safe"

A global or static variable is accessible from multiple isolation domains.

```swift
// Error
final class StickerLibrary {
    static let shared: StickerLibrary = .init()
    // error: Static property 'shared' is not concurrency-safe
}

// Fix: Protect with @MainActor
@MainActor
final class StickerLibrary {
    static let shared: StickerLibrary = .init()
}
```

Other fixes:
- If truly constant and immutable, conform to `Sendable`.
- Use `nonisolated(unsafe)` only for genuinely immutable state the compiler cannot prove safe (e.g., C interop constants).
- Check whether main-actor-by-default mode makes this implicit.

## "Capture of 'x' with non-sendable type in a @Sendable closure"

A closure crossing isolation boundaries captures a non-Sendable value.

Fixes:
1. **Make the captured value Sendable.** Structs/enums with Sendable properties just need conformance. Final classes with `let` Sendable properties can conform.
2. **Restructure to avoid capture.** Extract needed data before the closure: `let id = object.id; Task { use(id) }`
3. **Move work onto the same actor** if it does not need to run concurrently.
4. **Use `sending` on the parameter** for clean ownership transfer.

## "Conformance of 'X' to protocol 'Y' crosses into main actor-isolated code"

The protocol and type describe different isolation boundaries.

```swift
// Error
extension StickerModel: Exportable {
    // error: Conformance crosses into main actor-isolated code
    func export() { photoProcessor.exportAsPNG() }
}

// Fix: Isolated conformance (Swift 6.2)
extension StickerModel: @MainActor Exportable {
    func export() { photoProcessor.exportAsPNG() }
}
```

The compiler ensures the conformance is only used on the main actor.

## "Main actor-isolated conformance of 'X' to 'Y' cannot be used in nonisolated context"

An isolated conformance is used from code that does not share the isolation.

Fixes:
1. **Move the use site onto the same actor.**
2. **Remove isolation from the conformance** if the protocol methods do not need actor-protected state.

## "Expression is 'async' but is not marked with 'await'"

A call crosses an isolation boundary requiring an async hop.

Fix: Add `await`. If in synchronous code that cannot be async, wrap in `Task {}` (see structured-concurrency.md for appropriate use).

## Approachable concurrency mode (Swift 6.2)

Detect: Check Xcode build settings under "Swift Compiler - Concurrency" for default actor isolation / main-actor-by-default. For SwiftPM, check `Package.swift` swiftSettings.

Behavior changes:
- Async functions stay on caller's actor by default.
- Main-actor-by-default reduces data race errors for UI-bound code and global state.
- Protocol conformances can be isolated.

Pitfalls:
- `Task.detached` ignores inherited actor context -- avoid unless truly needed.
- Main-actor-by-default can hide performance issues if CPU-heavy work stays on the main actor. Offload with `@concurrent`.
- This is a per-module setting. Neighboring modules can use different defaults.

## Quick Diagnostic-to-Fix Reference

When a concurrency compiler error appears, use this table for rapid triage before diving into the detailed sections above.

| Compiler Diagnostic | First Check | Smallest Safe Fix | Escalation |
|---|---|---|---|
| "Main actor-isolated ... cannot be used from a nonisolated context" | Is the function truly UI-bound? | Add `@MainActor` to the function or type | If not UI-bound, restructure to pass data instead of accessing actor state |
| "Sending value of non-Sendable type..." | Does the value actually cross a boundary? | Make the type `Sendable` (if value type) or mark parameter `sending` | Restructure to avoid crossing the boundary |
| "Static property 'x' is not concurrency-safe" | Is it truly mutable shared state? | Add `@MainActor` if UI-bound, or `nonisolated(unsafe)` if genuinely immutable | Convert to actor-isolated property or `Mutex<T>` |
| "Capture of 'x' with non-sendable type in @Sendable closure" | Can you extract the needed data before the closure? | Extract values: `let id = obj.id; Task { use(id) }` | Make the type Sendable or move work onto the same actor |
| "Conformance of 'X' to 'Y' crosses into main actor-isolated code" | Is the conformance genuinely actor-bound? | Use isolated conformance: `extension X: @MainActor Y` (Swift 6.2) | Remove isolation from conformance if methods don't need it |
| "Expression is 'async' but is not marked with 'await'" | Is an isolation hop occurring? | Add `await` | If in sync code, wrap in `Task {}` (structured preferred) |
| "Non-sendable type returned by implicitly asynchronous call" | Is the return value actually shared? | Make return type Sendable | Restructure to return value types or use `sending` |
| "Task-isolated value cannot be referenced from a @Sendable closure" | Is the value escaping the task's scope? | Copy the value before the closure | Use `sending` parameter or restructure |

### Build Settings to Check First

Before diagnosing any concurrency error, verify these project settings:

| Setting | Where to Find (Xcode) | Where to Find (SwiftPM) | Impact |
|---|---|---|---|
| Swift Language Mode | Build Settings > Swift Compiler - Language > Swift Language Version | `swiftLanguageMode: .v6` in Package.swift | Determines strictness level |
| Strict Concurrency | Build Settings > Swift Compiler - Concurrency > Strict Concurrency Checking | `StrictConcurrency` in swiftSettings | `complete` = all errors; `targeted` = partial |
| Default Actor Isolation | Build Settings > Swift Compiler - Concurrency > Default Actor Isolation | `defaultIsolation: .MainActor` in swiftSettings | When set, all code is MainActor by default |
| Upcoming Features | Build Settings > Swift Compiler - Upcoming Features | `.enableUpcomingFeature("...")` | Individual feature flags |

**Rule:** Always check these settings before proposing a fix. A "missing `@MainActor`" may be implicit under default-main-actor mode.

## Quick Fix Mode

For simple, localized concurrency errors, use Quick Fix Mode to resolve them efficiently.

### Entry Criteria (ALL must be true)
- The issue is in a single file or a single type
- The actor isolation context is clear
- The fix is 1-2 edits
- No unsafe escape hatches needed (`@unchecked Sendable`, `nonisolated(unsafe)`)

### Exit Criteria (ANY triggers full analysis)
- Build settings are unknown or inconsistent across modules
- The issue crosses module boundaries
- The fix requires `@preconcurrency`, `@unchecked Sendable`, or `nonisolated(unsafe)`
- Fixing one error produces 2+ new errors in different files

### Quick Fix Workflow
1. Read the exact compiler diagnostic
2. Match it to the table above
3. Apply the "Smallest Safe Fix"
4. Rebuild
5. If the fix resolved the error cleanly — done
6. If new errors appeared — exit Quick Fix Mode, do full analysis with the reference files
