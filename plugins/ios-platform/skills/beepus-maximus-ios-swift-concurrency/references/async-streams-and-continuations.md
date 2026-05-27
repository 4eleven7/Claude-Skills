# Async Streams and Continuations

## AsyncStream: prefer makeStream(of:) factory

```swift
// OLD: Closure-based, awkward to store the continuation.
var continuation: AsyncStream<Event>.Continuation?
let stream = AsyncStream<Event> { cont in
    continuation = cont
}

// NEW: Clean, no closure capture needed.
let (stream, continuation) = AsyncStream.makeStream(of: Event.self)
```

Also works with `AsyncThrowingStream.makeStream(of:throwing:)`.

## Continuation lifecycle

A continuation must be finished exactly once:
- Finishing zero times: the consumer's `for await` loop hangs indefinitely.
- Finishing twice: programmer error (AsyncStream tolerates it; CheckedContinuation traps).

Always finish in cleanup paths:

```swift
let (stream, continuation) = AsyncStream.makeStream(of: Event.self)

let monitor = NetworkMonitor()
monitor.onEvent = { event in continuation.yield(event) }
monitor.onComplete = { continuation.finish() }

continuation.onTermination = { _ in
    monitor.stop()
}
```

## Buffering and back pressure

`AsyncStream` defaults to unlimited buffer. For high-throughput producers, specify a policy:

```swift
let (stream, continuation) = AsyncStream.makeStream(
    of: SensorReading.self,
    bufferingPolicy: .bufferingNewest(100)
)
```

- `.bufferingNewest(n)` -- keeps most recent `n`, drops older.
- `.bufferingOldest(n)` -- keeps first `n`, drops newer.
- `.unbounded` -- default; only use when consumer keeps up.

## for await and cancellation

A `for await` loop stops automatically when the task is cancelled or the stream finishes. Code after the loop still runs, so handle cleanup there.

## Checked continuations

`withCheckedContinuation` / `withCheckedThrowingContinuation` wrap callback-based APIs. The critical rule: **resume exactly once on every code path.**

- Resuming zero times: caller hangs forever.
- Resuming twice: runtime crash.

```swift
func loadUser(id: String) async throws -> User {
    try await withCheckedThrowingContinuation { continuation in
        api.fetchUser(id: id) { result in
            continuation.resume(with: result)
        }
    }
}
```

Default to checked variants everywhere. Only consider `withUnsafe` variants after profiling proves a bottleneck.

## Wrapping delegate-based APIs

Delegates delivering multiple values map to `AsyncStream`. Single-shot delegates use `withCheckedContinuation`.

```swift
// Multi-value delegate pattern
let (stream, continuation) = AsyncStream.makeStream(of: Location.self)
locationManager.onUpdate = { loc in continuation.yield(loc) }
continuation.onTermination = { _ in locationManager.stopUpdating() }
```

This supports a single consumer. For multiple consumers, broadcast through an `@Observable` class.

## withTaskCancellationHandler

Bridges Swift cancellation to APIs with their own cancel mechanism. The `onCancel` closure fires immediately and may run on any thread.

```swift
func observe() async throws -> [Change] {
    let operation = CKQueryOperation(query: query)
    return try await withTaskCancellationHandler {
        try await performOperation(operation)
    } onCancel: {
        operation.cancel()
    }
}
```

## Common failure: unbounded AsyncStream buffer

A high-throughput producer with default `.unbounded` policy causes unbounded memory growth. Always specify a buffering policy for streams fed by external events (sensors, network, timers).
