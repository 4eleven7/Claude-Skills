# Mocking Patterns

## Protocol-Based Mocking for Networking

Create a protocol matching the methods used in production code:

```swift
protocol URLSessionProtocol {
    func data(from url: URL) async throws -> (Data, URLResponse)
}

extension URLSession: URLSessionProtocol { }
```

Create a mock conforming to the same protocol:

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

Inject in tests while keeping production call sites unchanged:

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

## Dependency Injection

Expose hidden dependencies through injection with sensible defaults. The production call site should not change.

### URLSession

```swift
// Bad -- hidden dependency
func fetch() async throws {
    let (data, _) = try await URLSession.shared.data(from: url)
    stories = String(decoding: data, as: UTF8.self)
}

// Good -- injectable with default
func fetch(using session: any URLSessionProtocol = URLSession.shared) async throws {
    let (data, _) = try await session.data(from: url)
    stories = String(decoding: data, as: UTF8.self)
}
```

### UserDefaults

Create an isolated `UserDefaults` instance per test to avoid shared state:

```swift
let suite = "suite-\(UUID().uuidString)"
let userDefaults = UserDefaults(suiteName: suite)
defer { userDefaults?.removePersistentDomain(forName: suite) }
```

### General principle

Control time, randomness, networking, and persistence in tests. Any external dependency that makes a test non-deterministic should be injectable.

## In-Memory Containers

Use in-memory persistence containers for integration tests. This avoids disk I/O, test pollution, and cleanup.

Reserve real on-disk containers for migration tests that specifically need to verify schema evolution against stored data.

## What to Mock

- Network layer (always mock in unit tests)
- Persistence layer (use in-memory containers)
- Date/time (inject fixed dates)
- UUIDs (inject fixed values)
- External services (HealthKit, system frameworks)

## Spy Pattern for Interaction Verification

Testing only return values misses critical side effects like persistence writes, analytics events, or delegate calls. Spies record method calls and arguments so tests verify that the correct interactions happened with the correct data.

**When to use a spy:** When the behaviour under test produces a side effect (not just a return value) and you need to verify that the side effect happened with the correct arguments.

```swift
// Wrong — only checks final state, misses whether the side effect fired
@Test func completePurchaseUpdatesState() async {
    let viewModel = PurchaseViewModel(
        paymentService: StubPaymentService(result: .success(.confirmed)),
        analytics: StubAnalytics()
    )

    await viewModel.completePurchase(itemId: "SKU-100", amount: 49_99)

    #expect(viewModel.state == .confirmed) // passes even if analytics was never called
}
```

```swift
// Right — spy records calls for precise behaviour verification
final class SpyAnalytics: AnalyticsTracking {
    private(set) var trackedEvents: [(name: String, properties: [String: String])] = []

    func track(event: String, properties: [String: String]) {
        trackedEvents.append((name: event, properties: properties))
    }
}

@Test func completePurchaseTracksAnalyticsEvent() async {
    let spy = SpyAnalytics()
    let viewModel = PurchaseViewModel(
        paymentService: StubPaymentService(result: .success(.confirmed)),
        analytics: spy
    )

    await viewModel.completePurchase(itemId: "SKU-100", amount: 49_99)

    #expect(spy.trackedEvents.count == 1)
    let event = try #require(spy.trackedEvents.first)
    #expect(event.name == "purchase_completed")
    #expect(event.properties["item_id"] == "SKU-100")
}
```

### Test Double Taxonomy

| Double | Purpose | Example |
|---|---|---|
| **Stub** | Returns predetermined values. Use when the test needs deterministic input. | `StubWeatherClient(result: .success(forecast))` |
| **Spy** | Records calls/arguments for later assertion. Use when verifying side effects. | `SpyAnalytics()` — assert on `trackedEvents` after the action |
| **Fake** | In-memory implementation of a protocol. Use for integration tests without I/O. | `InMemoryBookmarkRepository()` |

Prefer the simplest double that proves the behaviour. A stub is enough when you only care about return values. Reach for a spy when the test needs to verify *that* something was called and *with what*.

## What NOT to Mock

- The system under test itself
- Simple value types and pure functions
- Standard library operations

## Anti-Pattern: Test-Only Methods in Production

Never add methods to production types that exist solely for test use.

```swift
// BAD -- destroy() only called in tests
class SessionManager {
    func destroy() {
        container.deleteAllData()
    }
}

// In tests
defer { sessionManager.destroy() }
```

Why this is wrong:
- Pollutes production API with test-only surface area
- Dangerous if accidentally called in production
- Violates separation of concerns

```swift
// GOOD -- test utility handles cleanup
// SessionManager has no destroy() at all

// In test helpers
func cleanupSession(_ manager: SessionManager, in container: ModelContainer) {
    try? container.mainContext.delete(model: SessionModel.self)
}

// In tests
defer { cleanupSession(manager, in: container) }
```

### Gate: before adding a method to a production type

1. Is this method only used by tests? If yes, stop. Put it in test utilities.
2. Does this type own this resource's lifecycle? If no, wrong type for the method.

## Anti-Pattern: Incomplete Mocks

Mock the COMPLETE data structure, not just the fields your immediate test uses. Partial mocks hide structural assumptions.

```swift
// BAD -- partial mock, missing fields downstream code uses
let mockResponse = WeatherResponse(
    temperature: 22.0,
    condition: .sunny
    // Missing: humidity, windSpeed that the summary formatter reads
)
```

```swift
// GOOD -- mirror the real structure completely
let mockResponse = WeatherResponse(
    temperature: 22.0,
    condition: .sunny,
    humidity: 0.45,
    windSpeed: 12.0
)
```

### Gate: before creating mock data

1. What fields does the real type contain? Check the struct/class definition.
2. Include ALL fields the system might consume downstream, not just the ones your test asserts on.
3. If uncertain, include every stored property with a realistic value.

## Mock Complexity Warning Signs

If any of these are true, reconsider whether you need a mock at all:

- Mock setup is longer than the test logic
- You are mocking everything to make the test compile
- Mock is missing methods or properties the real type has
- Test breaks whenever the mock changes
- Cannot explain why the mock is needed

When mocks become complex, integration tests with real components are often simpler and more valuable. Use in-memory containers, fixed dates, and injected dependencies instead of elaborate fakes.

## Gate: Before Mocking Any Dependency

Follow this sequence before introducing a mock:

1. **What side effects does the real implementation have?** List them.
2. **Does this test depend on any of those side effects?** If yes, do not mock at that level -- mock the slow or external operation underneath.
3. **Do I fully understand what this test needs?** If unsure, run the test with the real implementation first and observe what must happen.

Red flags that you are mocking wrong:
- "I'll mock this to be safe"
- "This might be slow, better mock it"
- Mocking without tracing the dependency chain
