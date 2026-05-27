# Sendable and Data Safety

## What must be Sendable

All values crossing isolation boundaries (passed to `Task {}`, sent between actors, captured in `@Sendable` closures) must satisfy `Sendable`.

## Sendable conformance by type

### Structs (preferred)

Structs with all-Sendable stored properties just need the conformance declared:

```swift
struct DataModel: Codable, Sendable {
    let id: UUID
    let name: String
    let timestamp: Date
}
```

### Enums

Enums with Sendable associated values conform naturally:

```swift
enum AppEvent: Sendable {
    case loaded(DataModel)
    case failed(String)
}
```

### Final classes with immutable state

```swift
final class Configuration: Sendable {
    let apiURL: URL
    let timeout: TimeInterval
    init(apiURL: URL, timeout: TimeInterval) {
        self.apiURL = apiURL
        self.timeout = timeout
    }
}
```

### Sendable-compatible standard types

`String`, `Int`, `Bool`, `Double`, `Float`, `Date`, `URL`, `UUID`, `Data`, collections of Sendable types, enums with Sendable associated values.

## @unchecked Sendable -- dangers

This silences all Sendable checks. It is a promise that you have verified thread safety yourself.

**Legitimate uses:**
- Types with internal locking (`NSLock`, `os_unfair_lock`, `Mutex`) that are genuinely thread-safe.
- Reference types whose state is protected by an actor in practice but cannot express that to the compiler.

**Red flags:**
- Applied to silence a compiler error without understanding why.
- Applied to a class with mutable `var` properties and no synchronization.
- Used as a shortcut instead of restructuring to value types or actors.

```swift
// LEGITIMATE: Internal locking provides safety
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var cache: [String: Data] = [:]

    func get(_ key: String) -> Data? {
        lock.lock()
        defer { lock.unlock() }
        return cache[key]
    }

    func set(_ key: String, value: Data) {
        lock.lock()
        defer { lock.unlock() }
        cache[key] = value
    }
}
```

Before reaching for `@unchecked Sendable`, check whether Swift 6's region-based isolation already solves the problem.

## Mutex for simple sync state (preferred over @unchecked Sendable)

```swift
import Synchronization

final class StateContainer: @unchecked Sendable {
    private let state = Mutex<State>()

    struct State {
        var pending: [Job] = []
        var active: Job?
    }

    func enqueue(_ job: Job) {
        state.withLock { $0.pending.append(job) }
    }
}
```

If the API must stay synchronous, prefer `Mutex` over introducing actor isolation just to serialize access. Choose an actor only when the API itself should become actor-isolated.

## sending parameters

The `sending` keyword tells the compiler the caller transfers ownership and will not access the value afterward:

```swift
func process(_ data: sending Data) async { ... }
```

This is relatively niche but resolves some "sending risks causing data races" diagnostics.

## @preconcurrency imports

For non-Sendable third-party types:

```swift
@preconcurrency import ThirdPartyLib
@preconcurrency import AVFoundation
```

Keep this as a fallback only when isolated conformance or restructuring is unavailable.

## Sendable closures in SwiftUI

SwiftUI may run some closures off the main thread (`Shape` paths, `Layout` methods, `visualEffect`, `onGeometryChange`). These require `@Sendable` closures.

- Do not capture `@MainActor` state directly in `@Sendable` closures.
- Prefer capturing value copies in the capture list.
- Do not send `self` into a sendable closure just to read a single property.

## Runtime actor assertions in callback code

Callback-based APIs are common places for actor assumptions to fail at runtime. Use `MainActor.assumeIsolated()` only when the callback really is main-actor-bound and the compiler cannot see the guarantee.
