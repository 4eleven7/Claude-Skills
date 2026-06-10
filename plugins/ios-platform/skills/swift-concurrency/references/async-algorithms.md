# AsyncAlgorithms

The `swift-async-algorithms` package provides operators for `AsyncSequence` that mirror familiar reactive patterns. Import with `import AsyncAlgorithms`.

> Debounce with Combine migration is covered in `migration-patterns.md`. This file covers the full operator set.

## When to reach for AsyncAlgorithms

Use AsyncAlgorithms when you need to **compose, time-gate, or merge** multiple async sequences. If you only need a single stream with map/filter, stick to stdlib `AsyncSequence` operators.

## Operator Quick Reference

| Combine | AsyncAlgorithms | Notes |
|---------|----------------|-------|
| `debounce(for:)` | `.debounce(for:)` | Emits after silence window. See `migration-patterns.md` for full example. |
| `throttle(for:latest:)` | `.throttle(for:latest:)` | Rate-limits emissions. `latest: true` (default) emits most recent. |
| `merge(with:)` | `merge(_:_:)` | Free function. Merges 2-3 sequences of same element type. |
| `combineLatest(_:)` | `combineLatest(_:_:)` | Free function. Emits tuple on any input change. |
| `zip(_:)` | `zip(_:_:)` | Free function. Pairs elements 1:1. |
| `removeDuplicates()` | `.removeDuplicates()` | Skips consecutive equal elements. |
| `prepend(_:)` | `chain(_:_:)` | Free function. Concatenates sequences. |
| `collect(.byCount(n))` | `.chunks(ofCount:)` | Groups elements into fixed-size arrays. |
| `collect(.byTime(...))` | `.chunked(by: .repeating(every:))` | Time-windowed batching. |
| `buffer(size:)` | `.buffer(policy:)` | Bounded buffer with back-pressure. |

## Operators in Detail

### debounce

Emits only after the source is silent for the given duration.

```swift
for await query in searchTerms.debounce(for: .milliseconds(300)) {
    await performSearch(query)
}
```

Gotcha: The clock defaults to `ContinuousClock`. Use `.debounce(for: .milliseconds(300), clock: SuspendingClock())` if you need suspension-aware timing (rare).

### throttle

Rate-limits by emitting at most once per interval.

```swift
// Emit the latest sensor reading every second
for await reading in sensor.readings.throttle(for: .seconds(1), latest: true) {
    updateUI(reading)
}
```

- `latest: true` -- emits the most recent value in each window (default).
- `latest: false` -- emits the first value in each window.

### merge

Interleaves elements from multiple sequences. Completes when all inputs complete.

```swift
for await event in merge(localEvents, remoteEvents) {
    handle(event)
}
```

Supports 2 or 3 inputs. For more, nest: `merge(merge(a, b), merge(c, d))`.

### combineLatest

Emits a tuple of the latest values whenever any input produces a new element. Does not emit until every input has produced at least one value.

```swift
for await (user, prefs) in combineLatest(userStream, prefsStream) {
    updateProfile(user, prefs)
}
```

Gotcha: High-frequency inputs cause combinatorial explosion. Throttle or debounce inputs first if needed.

### zip

Pairs elements 1:1 from two sequences. Waits for both sides before emitting.

```swift
for await (request, response) in zip(requests, responses) {
    validate(request, response)
}
```

Completes when either input completes.

### chain

Concatenates sequences end-to-end. The second starts only after the first finishes.

```swift
for await item in chain(cachedItems, networkItems) {
    process(item)
}
```

### removeDuplicates

Skips consecutive equal elements (requires `Equatable`). Use the closure variant for custom comparison.

```swift
for await status in connectionStatus.removeDuplicates() {
    updateBadge(status)
}

// Custom comparison
for await model in models.removeDuplicates(by: { $0.id == $1.id }) {
    render(model)
}
```

### chunks

Groups elements into arrays by count, time, or both.

```swift
// Fixed-size batches
for await batch in events.chunks(ofCount: 50) {
    try await upload(batch)
}

// Time-windowed batches
for await batch in events.chunked(by: .repeating(every: .seconds(5))) {
    try await flush(batch)
}
```

## AsyncChannel

A multi-producer, single-consumer channel. Unlike `AsyncStream`, the sender suspends until the receiver consumes the element (back-pressure by default).

```swift
let channel = AsyncChannel<WorkItem>()

// Producer
Task {
    await channel.send(item)  // suspends until consumed
}

// Consumer
for await item in channel {
    process(item)
}

// Signal completion
channel.finish()
```

**When to use over AsyncStream:**
- You need back-pressure (producer waits for consumer).
- Multiple producers feed a single consumer.

**When to stick with AsyncStream:**
- Fire-and-forget production (no back-pressure needed).
- Bridging callback/delegate APIs.
- Need buffering policies (newest/oldest).

## Cancellation

All AsyncAlgorithms operators propagate cancellation through `Task.isCancelled`. When a `for await` loop's task is cancelled, the upstream sequence terminates cooperatively.

## Testing

Operators are deterministic given deterministic input. Feed a plain `AsyncStream` or array `.async` in tests:

```swift
@Test func deduplication() async {
    let input = [1, 1, 2, 2, 3].async
    var results = [Int]()
    for await value in input.removeDuplicates() {
        results.append(value)
    }
    #expect(results == [1, 2, 3])
}
```

For time-dependent operators (debounce, throttle), inject a test clock or use `AsyncStream` with controlled yields.
