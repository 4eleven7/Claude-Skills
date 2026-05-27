# Structured Concurrency

## async let vs task groups

Use `async let` for a fixed number of independent operations returning different types:

```swift
async let news = fetchNews()
async let weather = fetchWeather()
let (n, w) = try await (news, weather)
```

Use task groups for a dynamic number of operations of the same type.

## Task groups over loops

Unstructured tasks in a loop are almost always wrong:

```swift
// WRONG: No cancellation propagation, no error collection, leaked tasks.
for url in urls {
    Task { try await fetch(url) }
}

// RIGHT: Structured, cancellable, collects results.
let results = try await withThrowingTaskGroup(of: Data.self) { group in
    for url in urls {
        group.addTask { try await fetch(url) }
    }
    var collected = [Data]()
    for try await result in group {
        collected.append(result)
    }
    return collected
}
```

## Discarding task groups (Swift 5.9+)

When child tasks don't return meaningful results, use `withDiscardingTaskGroup` to avoid accumulating unused values:

```swift
await withDiscardingTaskGroup { group in
    for connection in connections {
        group.addTask { await connection.sendHeartbeat() }
    }
}
```

## Limiting concurrency

Task groups launch all children eagerly. Limit concurrency manually when needed:

```swift
try await withThrowingTaskGroup(of: Data.self) { group in
    let maxConcurrent = 4
    var iterator = urls.makeIterator()

    for _ in 0..<maxConcurrent {
        guard let url = iterator.next() else { break }
        group.addTask { try await fetch(url) }
    }

    for try await result in group {
        process(result)
        if let url = iterator.next() {
            group.addTask { try await fetch(url) }
        }
    }
}
```

## Error handling with partial results

When one child throws, the group cancels all remaining children. To collect partial results, catch inside each child:

```swift
await withTaskGroup(of: (URL, Result<Data, Error>).self) { group in
    for url in urls {
        group.addTask {
            do { return (url, .success(try await fetch(url))) }
            catch { return (url, .failure(error)) }
        }
    }
    for await (url, result) in group {
        switch result {
        case .success(let data): handle(data)
        case .failure(let error): log(error, for: url)
        }
    }
}
```

## Task {} -- when it is a code smell

`Task {}` to bridge sync to async is sometimes necessary, but watch for:

- **Inside `onAppear()`**: Use `.task()` modifier instead -- it cancels on disappear automatically.
- **Wrapping a function that could itself be async**: Make the caller async instead.
- **Ignoring errors from throwing tasks**: The error is silently lost. Handle errors inside the closure.
- **Task.detached**: Rarely correct. Usually means the author wanted background execution but should use `@concurrent` or a task group. Only use when you specifically need to shed actor isolation and priority.

## Task.immediate (Swift 6.2)

Starts running immediately on the current executor up to the first suspension point. Still an unstructured task after that.

```swift
Task.immediate {
    // runs synchronously until first await
    setupState()
    await fetchData()
}
```

Task groups also gained `addImmediateTask()` for the same behavior with child tasks.

## Task naming (Swift 6.2)

Tasks and task group children can carry names for debugging:

```swift
let task = Task(name: "FetchUser") { try await loadUser() }
group.addTask(name: "Image-\(id)") { try await loadImage(id) }
```

Names are debugging aids, not correctness features.

## Unbounded task spawning

Spawning tasks in a tight loop without structure exhausts memory and can starve the cooperative thread pool:

```swift
// WRONG: Creates thousands of tasks simultaneously. Each task allocates
// stack space (~16KB). 10,000 items = ~160MB of task overhead.
for item in items {
    Task { await process(item) }
}

// RIGHT: Use a task group with concurrency limiting.
try await withThrowingTaskGroup(of: Void.self) { group in
    let maxConcurrent = ProcessInfo.processInfo.activeProcessorCount
    var iterator = items.makeIterator()

    for _ in 0..<maxConcurrent {
        guard let item = iterator.next() else { break }
        group.addTask { try await process(item) }
    }

    for try await _ in group {
        if let item = iterator.next() {
            group.addTask { try await process(item) }
        }
    }
}
```

**Symptoms:** memory spikes, Jetsam kills, UI freezes (thread pool saturated).
**Detection:** Instruments Swift Concurrency template — "Alive Tasks" growing unbounded.
