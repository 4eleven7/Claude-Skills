# Synchronization Framework

`import Synchronization` — low-level synchronization primitives introduced in Swift 6.0 / iOS 18+.

## When to Use

| Need | Use |
|------|-----|
| Shared mutable state, async context | `actor` |
| Quick synchronous state protection | `Mutex<T>` |
| High-frequency primitive operations (counters, flags) | `Atomic<T>` |
| Wrapping non-Sendable state as Sendable | `Mutex<T>` |
| Legacy interop needing unfair lock semantics | `OSAllocatedUnfairLock` |

**Default to actors.** Reach for Mutex only when synchronous access is required or actor overhead is measurable.

## Mutex

Generic `Mutex<T>` protects any value with a mutual exclusion lock.

```swift
import Synchronization

let counter = Mutex(0)

// withLock provides inout access, auto-unlocks on exit
counter.withLock { value in
    value += 1
}

let current = counter.withLock { $0 }
```

**Key properties:**
- **Unconditionally `Sendable`** regardless of whether `T` is `Sendable`
- **No recursive locking** — re-locking on same thread deadlocks
- **Safe in async functions** — `withLock` has no suspension points, so lock/unlock stays on one thread
- **Auto-unlock** — guaranteed even if the closure throws

### Common Patterns

**Thread-safe wrapper for non-Sendable state:**

```swift
final class SafeService: Sendable {
    private let state = Mutex(NonSendableState())

    func update() {
        state.withLock { $0.mutate() }
    }
}
```

**Protected dictionary / cache:**

```swift
final class Cache<Key: Hashable, Value>: Sendable {
    private let storage = Mutex([Key: Value]())

    func value(for key: Key) -> Value? {
        storage.withLock { $0[key] }
    }

    func set(_ value: Value, for key: Key) {
        storage.withLock { $0[key] = value }
    }
}
```

### Rules

1. **Keep `withLock` closures short.** No I/O, no network calls, no heavy computation inside the lock.
2. **Never nest locks.** Holding one Mutex while acquiring another risks deadlock.
3. **Never hold across `await`.** The closure is synchronous by design — this is enforced by the compiler.
4. **Prefer actors for complex state.** If the critical section grows beyond a few lines or needs async work, switch to an actor.

## Atomic

Low-level atomic operations on primitive types. Every operation completes as an indivisible unit.

```swift
import Synchronization

let requestCount = Atomic(0)

// Increment
requestCount.wrappingAdd(1, ordering: .relaxed)

// Load
let total = requestCount.load(ordering: .acquiring)

// Compare-and-swap
let (exchanged, original) = requestCount.compareExchange(
    expected: 0,
    desired: 1,
    ordering: .acquiringAndReleasing
)
```

### Memory Ordering

| Ordering | When to Use |
|----------|-------------|
| `.relaxed` | Atomicity only — counters, stats where order doesn't matter |
| `.acquiring` | Load before accessing data the store published |
| `.releasing` | Store after preparing data for another thread to read |
| `.acquiringAndReleasing` | Both directions — typical for compare-and-swap |
| `.sequentiallyConsistent` | All threads must agree on total order — rarely needed |

**Start with `.relaxed` or `.acquiringAndReleasing`.** Only use `.sequentiallyConsistent` if you have a specific ordering requirement.

### Rules

1. **Primitives only.** Use for `Int`, `Bool`, `UInt8`, etc. For complex state, use Mutex.
2. **Understand orderings.** Wrong ordering = subtle, unreproducible bugs. When in doubt, use `.acquiringAndReleasing`.
3. **Don't over-reach.** If you need to atomically update two values, use Mutex instead.

## Mutex vs Alternatives

| Feature | `Mutex<T>` | `Atomic<T>` | `actor` | `OSAllocatedUnfairLock` |
|---------|-----------|-------------|---------|------------------------|
| Synchronous | Yes | Yes | No (async) | Yes |
| Sendable | Always | Yes | Isolated | Yes |
| Deadlock-safe | No | N/A | Yes | No |
| Protects complex state | Yes | No (primitives) | Yes | Yes |
| Swift-native API | Yes | Yes | Yes | ObjC bridge |
| Available | iOS 18+ | iOS 18+ | iOS 13+ | iOS 16+ |

## Anti-Patterns

**Over-using Mutex when an actor is cleaner:**

```swift
// Smell: Mutex with many methods and complex state
final class DataManager: Sendable {
    private let state = Mutex(ComplexState())
    func load() { state.withLock { ... } }
    func save() { state.withLock { ... } }
    func transform() { state.withLock { ... } }
}

// Better: actor isolates naturally
actor DataManager {
    private var state = ComplexState()
    func load() { ... }
    func save() async { ... }
    func transform() { ... }
}
```

**Nesting Mutex locks (deadlock risk):**

```swift
// DEADLOCK: nested lock acquisition
let a = Mutex(0)
let b = Mutex(0)

a.withLock { aVal in
    b.withLock { bVal in  // If another thread locks b then a → deadlock
        aVal += bVal
    }
}

// Fix: single Mutex protecting both values, or actor
let state = Mutex((a: 0, b: 0))
state.withLock { s in s.a += s.b }
```

**Using Atomic for non-primitive coordination:**

```swift
// Wrong: two atomics that should be updated together
let count = Atomic(0)
let total = Atomic(0.0)

// These are independently atomic but NOT jointly atomic
count.wrappingAdd(1, ordering: .relaxed)
total.wrappingAdd(value, ordering: .relaxed)
// Another thread can see updated count but stale total

// Fix: Mutex protecting a struct
let stats = Mutex((count: 0, total: 0.0))
stats.withLock { s in
    s.count += 1
    s.total += value
}
```
