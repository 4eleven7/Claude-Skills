# Memory Management in Swift Concurrency

## Core Rule

Tasks and async sequences can silently extend object lifetimes. Every `Task {}` or `for await` loop that captures `self` is a potential retain cycle or leaked resource.

## Retain Cycles in Tasks

### Unstructured Task capturing self

```swift
@MainActor
class ViewModel {
    var items: [Item] = []

    func startPolling() {
        // BUG: self captured strongly. Task keeps self alive until cancelled.
        Task {
            while !Task.isCancelled {
                self.items = try await fetchItems()
                try await Task.sleep(for: .seconds(30))
            }
        }
    }
}
```

This is not a classic retain cycle (Task does not own ViewModel), but the Task's closure holds a strong reference to `self`, preventing deallocation until the Task completes or is cancelled.

### Fix: capture weak self

```swift
func startPolling() {
    pollingTask = Task { [weak self] in
        while !Task.isCancelled {
            guard let self else { return }
            self.items = try await fetchItems()
            try await Task.sleep(for: .seconds(30))
        }
    }
}

deinit {
    pollingTask?.cancel()
}
```

### When weak self is required vs unnecessary

| Scenario | Capture | Why |
|----------|---------|-----|
| Long-lived `Task {}` (polling, observing) | `[weak self]` | Task outlives the natural lifetime of the owner |
| Short-lived `Task {}` (one-shot fetch) | Strong `self` OK | Task completes quickly, reference is temporary |
| `.task { }` SwiftUI modifier | Strong `self` OK | SwiftUI cancels on disappear automatically |
| `Task.detached` | `[weak self]` almost always | Detached tasks have no structured parent |
| `async let` / task group child | Strong OK | Structured -- parent scope bounds lifetime |
| Stored closure on self that spawns Task | `[weak self]` | Classic cycle: self -> closure -> Task -> self |

**Decision rule:** If you store the `Task` handle as a property, you almost certainly need `[weak self]` in the closure and `cancel()` in `deinit`.

## Async Sequence Retention

A `for await` loop keeps its iterator alive. If the iterator holds resources (file handles, network connections, observation tokens), those stay alive until the loop exits.

### Problem: observation that never ends

```swift
@MainActor
class Coordinator {
    func observe(_ store: Store) {
        // BUG: This Task + for-await keeps both Coordinator and Store alive.
        Task {
            for await state in store.states {
                self.handle(state)
            }
        }
    }
}
```

### Fix: weak self + stored task handle

```swift
@MainActor
class Coordinator {
    private var observationTask: Task<Void, Never>?

    func observe(_ store: Store) {
        observationTask = Task { [weak self] in
            for await state in store.states {
                guard let self else { return }
                self.handle(state)
            }
        }
    }

    deinit {
        observationTask?.cancel()
    }
}
```

### AsyncStream continuation leak

If you store a continuation on `self` and the stream's consumer task also captures `self`, you have a cycle:

```swift
// BUG: self -> continuation -> stream -> Task -> self
class EventBus {
    private var continuation: AsyncStream<Event>.Continuation?

    var events: AsyncStream<Event> {
        AsyncStream { continuation in
            self.continuation = continuation  // self retains continuation
        }
    }

    func startListening() {
        Task {
            for await event in self.events {  // Task retains self
                process(event)
            }
        }
    }
}
```

Fix: break the cycle by using `[weak self]` in the Task, or by not storing the continuation on `self` (use `makeStream(of:)` and pass the continuation to the producer separately).

### Preferred: AsyncStream.makeStream(of:)

`makeStream(of:)` returns both the stream and continuation as a tuple, avoiding the need to store the continuation on `self`:

```swift
class EventBus {
    func startListening() -> AsyncStream<Event> {
        let (stream, continuation) = AsyncStream.makeStream(of: Event.self)

        // Hand continuation to the producer (not stored on self)
        someExternalSource.onEvent = { event in
            continuation.yield(event)
        }
        continuation.onTermination = { _ in
            // Clean up external source
        }

        return stream
    }
}
```

This eliminates the self -> continuation -> stream -> Task -> self cycle entirely.

## Task Handle Lifecycle

### Always cancel stored tasks on teardown

```swift
@MainActor
class Service {
    private var syncTask: Task<Void, Never>?
    private var watchTask: Task<Void, Never>?

    func start() {
        syncTask = Task { [weak self] in /* ... */ }
        watchTask = Task { [weak self] in /* ... */ }
    }

    func stop() {
        syncTask?.cancel()
        watchTask?.cancel()
    }

    deinit {
        syncTask?.cancel()
        watchTask?.cancel()
    }
}
```

### SwiftUI: prefer .task modifier

`.task { }` automatically cancels when the view disappears. No manual handle management needed.

```swift
struct ItemListView: View {
    @State private var items: [Item] = []

    var body: some View {
        List(items) { item in ItemRow(item: item) }
            .task { items = try? await fetchItems() ?? [] }
    }
}
```

For keyed reloading: `.task(id: selectedID) { ... }` cancels and restarts when the ID changes.

## isolated deinit

Covered in `actors-and-isolation.md`. Key memory rule: use `isolated deinit` when cleanup must access actor-protected state. Without it, accessing `@MainActor` properties in `deinit` is a concurrency violation.

## Actors and Reference Cycles

Actors are reference types. The same retain-cycle rules apply as classes:

```swift
// BUG: actor -> handler closure -> actor
actor DataManager {
    var onChange: (() -> Void)?

    func setup() {
        onChange = {
            self.refresh()  // strong capture of actor
        }
    }
}

// Fix: [weak self]
func setup() {
    onChange = { [weak self] in
        self?.refresh()
    }
}
```

## @Observable + Task Interaction

`@Observable` objects are reference types. When a SwiftUI view spawns a `.task` that captures the model, the model stays alive for the task's duration. This is usually fine because `.task` cancels on disappear. But manual `Task {}` in an `@Observable` class follows the same rules as any class:

```swift
@Observable
@MainActor
class SearchModel {
    var query = ""
    var results: [Result] = []
    private var searchTask: Task<Void, Never>?

    func search() {
        searchTask?.cancel()
        searchTask = Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(300))
            guard let self, !Task.isCancelled else { return }
            self.results = try await performSearch(self.query)
        }
    }

    deinit {
        searchTask?.cancel()
    }
}
```

Without `[weak self]`, navigating away while a search is in-flight keeps the model alive until the task completes.

## withTaskGroup Child Task Captures

Child tasks in a task group are structured and bounded by the group scope. Strong `self` capture is safe because the group completes before the enclosing function returns:

```swift
// Safe: child tasks are bounded by the group
func loadAll() async {
    await withTaskGroup(of: Item.self) { group in
        for id in ids {
            group.addTask { await self.load(id) }  // Strong OK
        }
        for await item in group { items.append(item) }
    }
}
```

The risk arises when the **enclosing function** is called from an unstructured Task that captures self:

```swift
// Dangerous: unstructured Task keeps self alive through the entire group
Task {
    await self.loadAll()  // self retained until all children complete
}
```

Fix: use `[weak self]` in the outer unstructured Task, not in the group children.

## Diagnostic Checklist

When reviewing for memory issues in concurrent code:

1. **Every `Task {}` stored as a property** -- does it use `[weak self]`? Is it cancelled in `deinit`?
2. **Every `for await` loop** -- does it capture `self` strongly? Will the sequence ever finish?
3. **Every `AsyncStream.Continuation` stored on self** -- is the consumer also capturing self?
4. **Every `Task.detached`** -- uses `[weak self]`?
5. **Actor with closure properties** -- closures that capture the actor create cycles.
6. **`withTaskCancellationHandler`** -- the `onCancel` closure runs immediately on cancellation; ensure it does not extend lifetimes.
