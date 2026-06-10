# Migration Patterns

Approved patterns for migrating legacy concurrency to Swift concurrency. Unless the user requested modernisation, prefer leaving existing callback code alone and wrapping it instead.

## Project Settings That Change Concurrency Behaviour

Before interpreting diagnostics or choosing a fix, confirm the target/module settings:

| Setting | Where to check | Why it matters |
|---|---|---|
| Swift language mode (5.x vs 6) | `SWIFT_VERSION` / `swift-tools-version:` | Swift 6 turns warnings into errors |
| Strict concurrency checking | `SWIFT_STRICT_CONCURRENCY` | Controls how aggressively Sendable + isolation rules are enforced |
| Default actor isolation | `SWIFT_DEFAULT_ACTOR_ISOLATION` / `.defaultIsolation(MainActor.self)` | Changes default isolation — can reduce noise but changes behaviour |
| Approachable Concurrency | Build setting / SwiftPM upcoming features | Bundles multiple upcoming features; migrate individually first |

## Migration Strategy

### The Concurrency Rabbit Hole

Fixing isolation in one place exposes issues elsewhere. This is normal. Enable strict checking, see 50+ errors, fix some, rebuild and see 80+. Manageable with the right approach.

### Six Rules of Thumb

1. **Don't panic — iterate.** 30 minutes per day. Small PRs. Checkpoints.
2. **Sendable by default for new code.** Easier to design for concurrency than to retrofit.
3. **Swift 6 for new packages.** Prevent scope creep in new code.
4. **Resist refactoring.** Focus solely on concurrency. Separate tickets for everything else.
5. **Minimal changes.** One class or module per PR. Get merged fast.
6. **Don't @MainActor everything.** Consider whether a custom actor, `nonisolated`, or `@concurrent` is more appropriate. Exception: for app targets, default main-actor isolation is reasonable.

### 9-Step Migration Process

1. **Find isolated code** — standalone packages with minimal dependencies
2. **Update dependencies** — latest versions in a separate PR
3. **Add async wrappers** — `withCheckedThrowingContinuation` for existing callback APIs (Xcode: Refactor → Add Async Wrapper)
4. **Set default isolation** (Swift 6.2+) — `@MainActor` for app targets: `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor`
5. **Enable strict checking** — Minimal → Targeted → Complete, fixing at each level
6. **Add Sendable conformances** — even when the compiler doesn't complain yet
7. **Enable Approachable Concurrency** (Swift 6.2+) — migrate feature-by-feature first
8. **Enable upcoming features** — `ExistentialAny`, `InferIsolatedConformances`, etc.
9. **Switch to Swift 6 language mode** — `SWIFT_VERSION = 6` / `swift-tools-version: 6.0`

### Migration Tooling (Swift 6.2+)

**Xcode:** Set an upcoming feature to "Migrate" (temporary), build, click Apply on each warning.

**SwiftPM CLI:**
```bash
# Migrate all targets
swift package migrate --to-feature ExistentialAny

# Migrate specific target
swift package migrate --target MyTarget --to-feature ExistentialAny
```

Automatically applies fix-its and updates `Package.swift`.

### @preconcurrency

Suppresses Sendable warnings from modules you don't control:

```swift
// TODO: Remove when SomeLibrary adds Sendable support
// Last checked: 2026-03-19 (version 2.3.0)
@preconcurrency import SomeLibrary
```

Risks: no compile-time safety, hides real issues, creates tech debt. Compiler warns when unused.

---

## Code Patterns

## Completion handlers to async/await

Wrap with `withCheckedThrowingContinuation`. Resume exactly once on every path.

```swift
// Before
func loadUser(id: String, completion: @escaping (Result<User, Error>) -> Void) {
    api.fetchUser(id: id, completion: completion)
}

// After -- async wrapper
func loadUser(id: String) async throws -> User {
    try await withCheckedThrowingContinuation { continuation in
        api.fetchUser(id: id) { result in
            continuation.resume(with: result)
        }
    }
}
```

If the SDK already provides an async overload, use it directly.

## Delegates to AsyncStream

Delegates delivering multiple values map to `AsyncStream`. Single-shot delegates use `withCheckedContinuation`.

```swift
// Multi-value delegate
let (stream, continuation) = AsyncStream.makeStream(of: Location.self)
manager.onUpdate = { loc in continuation.yield(loc) }
continuation.onTermination = { _ in manager.stopUpdating() }
```

## DispatchQueue.main.async to @MainActor

```swift
// Before
DispatchQueue.main.async {
    self.label.text = "Done"
}

// After -- make the enclosing function or type @MainActor
@MainActor
func updateLabel() {
    label.text = "Done"
}

// From non-isolated async context:
await updateLabel()
```

## DispatchQueue.global().async to @concurrent or Task Group

```swift
// Before
DispatchQueue.global().async {
    let result = heavyComputation()
    DispatchQueue.main.async { self.result = result }
}

// After (Swift 6.2)
@concurrent
func heavyComputation() async -> ComputationResult { ... }

// Call site:
self.result = await heavyComputation()
```

A plain `async` helper does not offload CPU work by itself in Swift 6.2. If the goal is to leave the caller's executor, use `@concurrent`.

For parallel batch work, use `withTaskGroup`.

## Serial DispatchQueue to actor

```swift
// Before
class TokenStore {
    private let queue = DispatchQueue(label: "token-store")
    private var token: String?

    func setToken(_ t: String) { queue.sync { token = t } }
    func getToken() -> String? { queue.sync { token } }
}

// After
actor TokenStore {
    private var token: String?

    func setToken(_ t: String) { token = t }
    func getToken() -> String? { token }
}
```

## NSLock / locks to Mutex or actor

If the API must stay synchronous, prefer `Mutex` over actor:

```swift
import Synchronization

final class Counter: @unchecked Sendable {
    private let value = Mutex(0)
    func increment() { value.withLock { $0 += 1 } }
    func current() -> Int { value.withLock { $0 } }
}
```

Choose an actor only when the API itself should become actor-isolated.

## Combine to AsyncSequence

| Combine | Swift Concurrency |
|---------|-------------------|
| `publisher.sink { }` | `for await value in stream { }` |
| `publisher.map { }` | `stream.map { }` |
| `PassthroughSubject` | `AsyncStream` via `makeStream(of:)` |
| `publisher.values` | Already an `AsyncSequence` -- use directly |

If a Combine publisher already exposes `.values`, consume it directly rather than wrapping in a new `AsyncStream`.

Combine is not officially deprecated, but Apple's guidance is to prefer async/await for new code.

### Combine → AsyncAlgorithms (Debouncing)

```swift
import AsyncAlgorithms

// Manual debouncing with Task.sleep is fragile — every keystroke spawns a task
// Use AsyncAlgorithms debounce instead:
@Observable
final class ArticleSearcher {
    @MainActor private(set) var results: [Article] = []
    private var continuation: AsyncStream<String>.Continuation?

    private lazy var queryStream: AsyncStream<String> = {
        AsyncStream { continuation in
            self.continuation = continuation
        }
    }()

    func search(_ query: String) {
        continuation?.yield(query)
    }

    func startDebouncedSearch() {
        Task { @MainActor in
            for await query in queryStream.debounce(for: .milliseconds(500)) {
                self.results = await APIClient.searchArticles(query)
            }
        }
    }
}
```

### Combine Actor Isolation Trap

`sink` closures don't respect actor isolation at compile time:

```swift
@MainActor
final class Observer {
    init() {
        NotificationCenter.default.publisher(for: .someNotification)
            .sink { [weak self] _ in
                self?.handle()  // may crash if posted from background thread
            }
            .store(in: &cancellables)
    }
}

// Fix: migrate to async notifications
Task { [weak self] in
    for await _ in NotificationCenter.default.notifications(named: .someNotification) {
        await self?.handle()  // compile-time safe
    }
}
```

## Concurrency-Safe Notifications (iOS 26+)

### MainActorMessage — Guaranteed Main Actor Delivery

```swift
// Old: no isolation guarantee
NotificationCenter.default.addObserver(forName: .didBecomeActive, object: nil, queue: .main) { _ in
    self.handle()  // concurrency warning
}

// New: guaranteed @MainActor
token = NotificationCenter.default.addObserver(
    of: UIApplication.self,
    for: .didBecomeActive
) { message in
    self.handle()  // no warning, guaranteed main actor
}
```

### AsyncMessage — Typed, Thread-Safe Custom Notifications

```swift
struct BuildsChangedMessage: NotificationCenter.AsyncMessage {
    typealias Subject = [RecentBuild]
    let recentBuilds: Subject
}

// Post
NotificationCenter.default.post(BuildsChangedMessage(recentBuilds: builds))

// Observe — strongly typed, no casting
token = NotificationCenter.default.addObserver(
    of: [RecentBuild].self,
    for: .recentBuildsChanged
) { message in
    handleBuilds(message.recentBuilds)
}
```
