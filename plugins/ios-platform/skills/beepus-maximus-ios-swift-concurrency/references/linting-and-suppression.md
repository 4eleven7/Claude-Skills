# Linting and Suppression

Guidance for handling SwiftLint rules and compiler warnings related to Swift concurrency. Know when to fix vs suppress.

## SwiftLint: async_without_await

Flags `async` functions that never `await`. **Never "fix" by inserting fake suspension** (`Task.yield()`, `await Task { }.value`). Those mask the real issue.

### Diagnose Why the Declaration Is async

1. **Protocol requirement** — the protocol method is `async`
2. **Override requirement** — base class API is `async`
3. **`@concurrent` requirement** — stays `async` even without `await`
4. **Accidental/legacy** — no caller needs async semantics

### Preferred Fixes (in order)

1. **Remove `async`** and adjust call sites — when no async semantics are needed
2. If `async` is required (protocol/override/@concurrent):
   - Re-evaluate the upstream API if you own it (can it be non-async?)
   - If you cannot change it, keep `async` and **narrowly suppress**

```swift
// Tight suppression for required-async stubs
// swiftlint:disable:next async_without_await
func fetch() async { performSync() }
```

### Checklist

- [ ] Confirm `async` is truly required (protocol/override/@concurrent)
- [ ] If not required, remove `async` and update callers
- [ ] If required, use localised suppression — never dummy awaits

## Compiler Sendable Warnings

### "Capture of non-sendable type"

```swift
// Warning: Capture of 'self' with non-sendable type in @Sendable closure
Task { self.doWork() }
```

Fixes (in order):
1. Make the type `Sendable` (value type with all Sendable properties)
2. Use `@MainActor` isolation if UI-related
3. Capture only Sendable values instead of `self`
4. `@unchecked Sendable` with documented safety invariant (last resort)

### "Non-sendable result returned"

```swift
// Warning: Non-sendable type returned by implicitly async call
let result = await actor.getData()
```

Fixes:
1. Make the return type Sendable
2. Return Sendable projections (IDs, copies)
3. Keep processing within the actor's isolation

### "Main actor-isolated property accessed from non-isolated context"

```swift
// Warning: @MainActor property cannot be referenced from non-isolated context
func update() { viewModel.title = "New" }
```

Fixes:
1. Mark the calling function `@MainActor`
2. Use `await MainActor.run { }` for one-off access
3. Reconsider if the property truly needs @MainActor isolation

## Suppression Strategies

### When to Fix vs Suppress

**Fix when:**
- The warning identifies a real data race risk
- The fix is straightforward (add Sendable, adjust isolation)
- The code is new or actively maintained

**Suppress when:**
- Protocol/inheritance requires the signature
- Third-party code forces the pattern
- Migration is in progress (with tracked ticket)

### Suppression Annotations

```swift
// Legacy imports that lack Sendable
@preconcurrency import LegacyFramework

// Single declaration escape hatch
nonisolated(unsafe) var legacyCallback: (() -> Void)?

// Type-level (use sparingly, document why)
/// Thread-safe: internal lock protects all mutations.
/// TODO: Remove @unchecked when migrated to actor (TICKET-123)
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Data] = [:]
}
```

### @preconcurrency import

Suppresses Sendable warnings from modules you don't control.

```swift
// TODO: Remove @preconcurrency when SomeLibrary adds Sendable support
// Last checked: 2026-03-19 (version 2.3.0)
@preconcurrency import SomeLibrary
```

Risks:
- **No compile-time safety** — you're responsible for thread safety
- **Hides real issues** — library might not be thread-safe
- **Technical debt** — easy to forget

The compiler warns when `@preconcurrency` becomes unnecessary:
```
'@preconcurrency' attribute on module 'SomeModule' is unused
```

### @preconcurrency protocol conformance

When a protocol's delegate callbacks are guaranteed to run on a specific actor but the protocol hasn't adopted actor isolation yet, use `@preconcurrency` on the conformance. This is equivalent to wrapping each callback body in `assumeIsolated` but cleaner:

```swift
// Verbose manual approach
extension MyClass: SomeDelegate {
    nonisolated func callback() {
        MainActor.assumeIsolated {
            self.updateUI()
        }
    }
}

// Equivalent using @preconcurrency conformance
extension MyClass: @preconcurrency SomeDelegate {
    func callback() {
        self.updateUI()  // Compiler inserts isolation check
    }
}
```

**Lifecycle:** When the protocol later adds explicit actor isolation, `@preconcurrency` becomes unnecessary and the compiler warns:

```
@preconcurrency attribute on conformance has no effect
```

Remove `@preconcurrency` when you see this warning — the conformance is now natively safe.

### Documentation Requirements

When using suppression, always document:
1. **Why** the suppression is needed
2. **What** invariant makes it safe
3. **When** it can be removed (link to ticket)

## SwiftLint Rules Summary

| Rule | Default | Action |
|------|---------|--------|
| `async_without_await` | warning | Diagnose why async exists, remove or suppress narrowly |
| `unowned_variable_capture` | warning | Prefer `weak` in async closures (unowned crashes on dealloc) |
| `class_delegate_protocol` | warning | Ensure delegates are `AnyObject`-bound |
| `weak_delegate` | warning | Delegates should be `weak` to avoid retain cycles |
