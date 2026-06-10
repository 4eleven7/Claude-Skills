# Actors and Isolation

## Reentrancy -- the most common concurrency bug

After every `await` inside an actor, all assumptions about the actor's state are invalidated. Other calls may have run during the suspension.

```swift
// BUG: Two callers both see nil and both download.
// Force unwrap crashes if a third caller clears the cache mid-flight.
actor Cache {
    var items: [URL: Data] = [:]

    func load(_ url: URL) async throws -> Data {
        if items[url] == nil {
            items[url] = try await download(url)
        }
        return items[url]!
    }
}

// FIX: Capture result in a local before writing.
actor Cache {
    var items: [URL: Data] = [:]

    func load(_ url: URL) async throws -> Data {
        if let cached = items[url] { return cached }
        let data = try await download(url)
        items[url] = data
        return data
    }
}
```

To deduplicate in-flight requests, store `Task` handles:

```swift
actor Cache {
    var items: [URL: Data] = [:]
    var inFlight: [URL: Task<Data, Error>] = [:]

    func load(_ url: URL) async throws -> Data {
        if let cached = items[url] { return cached }
        if let task = inFlight[url] { return try await task.value }

        let task = Task { try await download(url) }
        inFlight[url] = task

        do {
            let data = try await task.value
            items[url] = data
            inFlight[url] = nil
            return data
        } catch {
            inFlight[url] = nil
            throw error
        }
    }
}
```

## @MainActor vs actor decision

Use `@MainActor` when the type owns UI-bound state (ViewModels, UI controllers). Use a custom `actor` when the type manages shared background state (caches, network services, data processors).

Flag actor types whose API mostly forwards work or owns little mutable state -- they may not need to be actors.

## Global actor inference rules

`@MainActor` propagates automatically:
- Subclass of a `@MainActor` class inherits it.
- Conforming to a `@MainActor` protocol (e.g., SwiftUI `View`) infers `@MainActor` on the entire type.
- Extensions of a `@MainActor` type inherit that isolation.
- Property wrappers like `@StateObject` infer actor context.

`@MainActor` does NOT propagate to closures passed to non-isolated functions unless the parameter is explicitly `@MainActor`.

## Protecting global and static state

Global/static mutable variables need explicit isolation:

```swift
// Protect with @MainActor (most common for app code)
@MainActor
final class Library {
    static let shared = Library()
    var books = [Book]()
}
```

With main-actor-by-default enabled for the target, this annotation may be implicit -- check the build settings.

## nonisolated and @concurrent (Swift 6.2)

In Swift 6.2, `nonisolated` async functions stay on the caller's actor by default. They no longer hop to the concurrent pool automatically.

```swift
// This stays on whatever actor calls it -- no implicit background hop.
struct Helper {
    func process(_ data: Data) async -> Result { ... }
}
```

Use `@concurrent` to explicitly offload CPU-heavy work:

```swift
nonisolated struct Processor {
    @concurrent
    func heavyWork(_ data: Data) async -> Output { ... }
}
```

## Isolated conformances (Swift 6.2)

A conformance can live on a global actor:

```swift
@MainActor
class User: @MainActor Equatable {
    var id: UUID
    static func ==(lhs: User, rhs: User) -> Bool { lhs.id == rhs.id }
}
```

The compiler rejects uses of that conformance from the wrong isolation domain.

## isolated deinit (Swift 6.2)

By default, deinit on actor-isolated classes runs outside the actor. Mark it `isolated` to access actor-protected state:

```swift
@MainActor
class Session {
    let user: User
    init(user: User) { self.user = user; user.isLoggedIn = true }
    isolated deinit { user.isLoggedIn = false }
}
```

## Inferred main-actor mode (Swift 6.2)

An opt-in build setting that makes `@MainActor` the default isolation for all declarations in a target. Recommended for app and executable targets where most code is single-threaded.

When enabled:
- Most types, functions, and globals are implicitly `@MainActor`
- No need to annotate every ViewModel, service, or global with `@MainActor`
- Use `nonisolated` to explicitly opt out for background-safe code
- Use `@concurrent` to explicitly offload to the concurrent pool

This pairs with the Swift 6.2 change where async functions on mutable state no longer cause compiler errors — they stay on the caller's actor by default, eliminating data races without code changes.

Enable in Xcode: Build Settings → "Default Actor Isolation" or in Package.swift swift settings.

## Safe vs Unsafe Primitives for the Cooperative Thread Pool

Swift's cooperative thread pool has a fixed number of threads (matching CPU core count). Blocking any of them starves all tasks.

**Safe (preserve forward progress):**

| Primitive | Why safe |
|---|---|
| `await`, actors, task groups | Suspends without blocking a thread |
| `os_unfair_lock` / `NSLock` | OK for short critical sections (microseconds) |
| `Mutex` (iOS 18+) | Purpose-built for short sync access |

**Unsafe (violate forward progress -- never use inside a `Task`):**

| Primitive | Why unsafe |
|---|---|
| `DispatchSemaphore.wait()` | Blocks the cooperative thread indefinitely |
| `pthread_cond_wait` | Same -- kernel-level block |
| `Thread.sleep()` | Holds cooperative thread doing nothing |
| Synchronous file I/O (`Data(contentsOf:)`) | Blocks on disk/network |
| Synchronous network (`URLSession` without async) | Blocks on network round-trip |

Using unsafe primitives inside `Task {}` can deadlock the app when all cooperative threads are blocked simultaneously.

## Assertions and assumeIsolated

### assertIsolated (debug only)

Use `MainActor.assertIsolated()` for debugging -- it halts debug builds if the code is not on the main actor. Compiled out in release builds.

```swift
func refresh() {
    MainActor.assertIsolated()
    // safe to touch UI state
}
```

### assumeIsolated (synchronous actor access)

Synchronously access actor-isolated state when you **know** you're already on the correct isolation domain. Crashes in both debug and release if the assumption is wrong -- this is intentional (better to crash than corrupt data with a race).

```swift
static func assumeIsolated<T>(
    _ operation: @MainActor () throws -> T,
    file: StaticString = #fileID,
    line: UInt = #line
) rethrows -> T where T: Sendable
```

Custom actors have an equivalent that passes the isolated self:

```swift
func assumeIsolated<T>(
    _ operation: (isolated Self) throws -> T,
    file: StaticString = #fileID,
    line: UInt = #line
) rethrows -> T where T: Sendable
```

### Task vs assumeIsolated

| Aspect | `Task { @MainActor in }` | `MainActor.assumeIsolated` |
|--------|--------------------------|---------------------------|
| Timing | Deferred (next run loop) | Synchronous (inline) |
| Async support | Yes (can await) | No (sync only) |
| Context | From any context | Must be sync function |
| Failure mode | Runs anyway | **Crashes** if wrong isolation |
| Use case | Start async work | Verify + access isolated state |

### When to use assumeIsolated

**Use when:**
- Legacy delegate callbacks documented to run on main thread
- Protocol conformances where callbacks are guaranteed on a specific actor
- Performance-critical code avoiding async hop overhead

**Don't use when:**
- Uncertain about current isolation (use `await` instead)
- Already in an async context on the correct actor (you have isolation -- just access directly)
- Callback origin is unknown or untrusted

### Pattern: Legacy delegate callbacks

When Apple documentation guarantees main-thread delivery (WWDC 2024-10169):

```swift
@MainActor
class LocationDelegate: NSObject, CLLocationManagerDelegate {
    var location: CLLocation?

    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        MainActor.assumeIsolated {
            self.location = locations.last
        }
    }
}
```

### Common mistakes

**Silencing compiler errors with assumeIsolated:**

```swift
// WRONG: Using assumeIsolated to silence warnings in unknown context
func unknownContext() {
    MainActor.assumeIsolated {
        updateUI()  // Crashes if not actually on main actor
    }
}

// FIX: When uncertain, use proper async
func unknownContext() async {
    await MainActor.run {
        updateUI()
    }
}
```

**Using in async context where you already have isolation:**

```swift
// WRONG: Unnecessary -- you already have isolation
@MainActor
func updateState() async {
    MainActor.assumeIsolated {
        self.state = .ready
    }
}

// FIX: Direct access
@MainActor
func updateState() async {
    self.state = .ready
}
```
