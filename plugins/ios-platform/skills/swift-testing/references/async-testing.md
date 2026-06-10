# Async Testing

Swift Testing is built for async and parallel test execution. Special care is needed with Swift concurrency.

## Serialising Tests

The `.serialized` trait only works on parameterised tests. It serialises that parameterised test's cases. It has no effect on non-parameterised tests.

Applying `.serialized` to a suite serialises its parameterised tests only -- other tests in the suite are unaffected.

## confirmation() for Async Work

Use `confirmation(expectedCount:)` to verify async callbacks execute the expected number of times. All tested code must finish before the `confirmation()` closure returns.

### Completion handlers will not work directly

`confirmation()` does not know to wait for completion handlers. Either make the method `async`:

```swift
struct Worker {
    func run(_ work: @escaping () -> Void) async {
        let start = CFAbsoluteTimeGetCurrent()
        work()
        print("Elapsed:", CFAbsoluteTimeGetCurrent() - start)
    }
}

@Test
func workerRunsThreeTimes() async {
    let worker = Worker()

    await confirmation(expectedCount: 3) { confirm in
        for _ in 0..<3 {
            await worker.run {
                // your work here
            }
            confirm()
        }
    }
}
```

Or return the `Task` so tests can await it:

```swift
@Test
func workerRunsThreeTimes() async {
    let worker = Worker()

    await confirmation(expectedCount: 3) { confirm in
        for _ in 0..<3 {
            let task = worker.run {
                // simulated work
            }
            await task.value
            confirm()
        }
    }
}
```

### Zero expected count

`confirmation(expectedCount: 0)` is valid -- means "ensure the event never happens."

### Range-based confirmations (Swift 6.1+)

Support a range of completion counts:

```swift
await confirmation(expectedCount: 5...10) { confirm in
    for await _ in loader {
        confirm()
    }
}
```

Partial ranges are allowed (`5...`) but ranges without lower bounds (`...10`) are disallowed.

## Time Limits

Set via `.timeLimit(.minutes())` in the `@Test` macro. Only `.minutes()` is available -- there is no `.seconds()`.

```swift
@Test("Loading view model names", .timeLimit(.minutes(1)))
func loadNames() async {
    let viewModel = ViewModel()
    await viewModel.loadNames()
    #expect(viewModel.names.isEmpty == false, "Names should be full of values.")
}
```

Suite-level time limits apply to each test individually. When both suite and test limits exist, the shorter one wins.

## @MainActor Tests

Mark individual tests or whole suites with `@MainActor`:

```swift
@MainActor
@Test("Loading view model names")
func loadNames() async {
    // runs on the main actor
}
```

`confirmation()` and `withKnownIssue()` accept an `isolation:` parameter for actor-specific closures:

```swift
await withKnownIssue("Names issue", isolation: MainActor.shared) {
    // runs on main actor
}
```

Check if the test target has default actor isolation enabled, which may force all tests onto a specific actor.

## Testing Actor State

Always test actors through their async interface. Never add `nonisolated` properties or bypass isolation to read actor state — this defeats data-race protection and produces flaky tests.

```swift
// Wrong — bypasses actor isolation
actor ShoppingCart {
    private(set) var items: [CartItem] = []

    func add(_ item: CartItem) { items.append(item) }

    nonisolated var itemSnapshot: [CartItem] { [] } // breaks isolation
}

func testAddItem() {
    let cart = ShoppingCart()
    Task { await cart.add(item) }
    #expect(cart.itemSnapshot.count == 1) // race condition
}
```

```swift
// Right — awaits actor's async interface
actor ShoppingCart {
    private(set) var items: [CartItem] = []

    func add(_ item: CartItem) { items.append(item) }
    var itemCount: Int { items.count } // actor-isolated — safe to await
}

@Test func addItemIncreasesCount() async {
    let cart = ShoppingCart()
    await cart.add(CartItem(sku: "SHOE-001", quantity: 1))
    let count = await cart.itemCount // awaits actor hop — no data race
    #expect(count == 1)
}
```

## Testing Task Cancellation

Async functions that ignore `Task.isCancelled` or `try Task.checkCancellation()` continue executing after cancellation, leaking connections and resources. Explicitly test cancellation paths to verify cleanup runs.

```swift
// Wrong — cancellation path never tested
@Test func loadImage() async throws {
    let loader = ImageLoader(downloader: StubDownloader())
    let image = try await loader.load(url: catalogURL)
    #expect(image.size.width == 800)
    // cancellation path untested — leaked connections go unnoticed
}
```

```swift
// Right — verify cancellation stops work and cleans up
@Test func loadImageStopsOnCancellation() async throws {
    let downloader = StubDownloader(delay: .seconds(5))
    let loader = ImageLoader(downloader: downloader)

    let task = Task {
        try await loader.load(url: catalogURL)
    }

    task.cancel()

    do {
        _ = try await task.value
        Issue.record("Expected CancellationError")
    } catch is CancellationError {
        #expect(downloader.wasCancelled == true) // verifies cleanup ran
    }
}
```

When to test cancellation:
- Any long-running async operation (downloads, streaming, batch processing)
- Operations that hold resources (file handles, network connections, database transactions)
- Task groups or structured concurrency where child tasks should propagate cancellation

## Testing Pre-Concurrency Code

Do not modernise callback-based production code without permission. Wrap it with `withCheckedContinuation()`:

```swift
@Test("Loading view model readings")
func loadReadings() async {
    let viewModel = ViewModel()

    await withCheckedContinuation { continuation in
        viewModel.loadReadings { readings in
            #expect(readings.count >= 10, "At least 10 readings must be returned.")
            continuation.resume()
        }
    }
}
```

## Mocking Networking

Unit tests should never do live networking. Create a protocol matching the methods used:

```swift
protocol URLSessionProtocol {
    func data(from url: URL) async throws -> (Data, URLResponse)
}

extension URLSession: URLSessionProtocol { }
```

Create a mock:

```swift
class URLSessionMock: URLSessionProtocol {
    var testData: Data?
    var testError: (any Error)?

    func data(from url: URL) async throws -> (Data, URLResponse) {
        if let testError { throw testError }
        return (testData ?? Data(), URLResponse())
    }
}
```

Inject in tests:

```swift
@Test func newsStoriesAreFetched() async throws {
    let url = URL(string: "https://www.apple.com/newsroom/rss-feed.rss")!
    var news = News(url: url)
    let session = URLSessionMock()
    session.testData = Data("Hello, world!".utf8)
    try await news.fetch(using: session)
    #expect(news.stories == "Hello, world!")
}
```
