# Testing Concurrency

## Async tests with Swift Testing

Swift Testing supports async test functions natively:

```swift
@Test func userLoads() async throws {
    let user = try await UserService().load(id: "123")
    #expect(user.name == "Alice")
}
```

Do not wrap async work in `Task {}` or use expectations/semaphores inside Swift Testing tests.

## Testing actor state

Access actor properties through `await`, just like production code. Do not add `nonisolated` accessors just for testing.

```swift
@Test func cachingWorks() async throws {
    let cache = ImageCache()
    let image = try await cache.image(for: testURL)
    let cached = try await cache.image(for: testURL)
    #expect(image == cached)
}
```

## confirmation() for async events

When testing that an async event fires, use `confirmation()`:

```swift
@Test func notificationFires() async {
    await confirmation { confirmed in
        let task = Task {
            for await _ in NotificationCenter.default.notifications(named: .dataDidChange) {
                confirmed()
                break
            }
        }
        await Task.yield()  // let the for-await loop start
        NotificationCenter.default.post(name: .dataDidChange, object: nil)
        await task.value
    }
}
```

All async work must complete before the `confirmation()` closure returns. If the code under test spawns an internal `Task`, either make the API async or return the `Task` handle so the test can `await task.value`.

## .serialized trait

`.serialized` only affects parameterized tests -- it runs argument cases one at a time. Applying it to a non-parameterized test does nothing.

```swift
@Test(.serialized, arguments: ["alice", "bob"])
func accountCreation(username: String) async throws {
    let account = try await AccountService().create(username: username)
    #expect(account.isActive)
}
```

## @MainActor in tests

Swift Testing runs tests on any executor. Constrain with `@MainActor` when needed:

```swift
@MainActor
@Test func viewModelUpdatesOnMainActor() async {
    let vm = ViewModel()
    await vm.refresh()
    #expect(vm.items.isEmpty == false)
}
```

`confirmation()` and `withKnownIssue()` accept an `isolation` parameter for finer control:

```swift
@Test func loadingUpdatesUI() async {
    await confirmation(isolation: MainActor.shared) { confirmed in
        let vm = ViewModel(onUpdate: { confirmed() })
        await vm.load()
    }
}
```

Check whether test targets have default actor isolation enabled at the module level.

## Test scoping traits with @TaskLocal (Swift 6.1+)

Concurrency-safe test configuration using task-local values:

```swift
struct MockEnvironmentTrait: TestTrait, TestScoping {
    func provideScope(
        for test: Test, testCase: Test.Case?,
        performing function: () async throws -> Void
    ) async throws {
        let env = Environment(apiBase: URL(string: "https://test.example.com")!)
        try await Environment.$current.withValue(env) {
            try await function()
        }
    }
}

extension Trait where Self == MockEnvironmentTrait {
    static var mockEnvironment: Self { Self() }
}

@Test(.mockEnvironment) func fetchUsesTestAPI() async throws {
    let users = try await UserService().fetchAll()
    #expect(users.isEmpty == false)
}
```

Each test's configuration lives in the task-local, so parallel tests get independent values automatically.

## Avoid timing-based tests

Never use `Task.sleep` or fixed delays to wait for something:

```swift
// BROKEN: Relies on timing.
viewModel.load()
try await Task.sleep(for: .seconds(1))
#expect(viewModel.items.isEmpty == false)

// CORRECT: Await the actual work.
await viewModel.load()
#expect(viewModel.items.isEmpty == false)
```

## Testing cancellation

Test that production code checks for cancellation, not that `Task.checkCancellation()` works:

```swift
@Test func processorRespectsCancel() async throws {
    let processor = Processor(items: Array(repeating: .stub, count: 1_000))
    let task = Task { try await processor.run() }

    try await Task.sleep(for: .zero)
    task.cancel()

    await #expect(throws: CancellationError.self) {
        try await task.value
    }
}
```

## CancellationError in catch blocks

Always filter out `CancellationError` before handling other errors:

```swift
do {
    try await loadData()
} catch is CancellationError {
    // Normal lifecycle event -- do nothing.
} catch {
    self.errorMessage = error.localizedDescription
}
```

## Race detection

Enable Thread Sanitizer (TSan) in your test scheme to catch runtime data races, especially in code using `@unchecked Sendable` or unsafe pointers.

Xcode: Product > Scheme > Edit Scheme > Diagnostics > Thread Sanitizer.

TSan adds overhead -- consider enabling it for a dedicated CI job.
