# Ownership Modifiers (Swift 6.2+)

Explicit parameter ownership for performance optimisation and noncopyable type support.

## Quick Reference

| Modifier | Ownership | Copies | Use Case |
|---|---|---|---|
| (default) | Compiler chooses | Implicit | Most cases |
| `borrowing` | Caller keeps | Explicit `copy` only | Read-only, large types |
| `consuming` | Caller transfers | None needed | Final use, factories |
| `inout` | Caller keeps, mutable | None | Modify in place |

**Default:** The compiler picks the convention — usually equivalent to `borrowing` for value types, but this is an implementation detail. Do not rely on it.

## When to Use

Use explicit ownership when:
- Large value types are passed read-only (avoid copies)
- Working with noncopyable types (`~Copyable`) — **required**, not optional
- ARC retain/release traffic is visible in profiling
- Factory methods that consume builder objects

Skip explicit ownership when:
- Simple types (Int, Bool, small structs)
- Compiler optimisation is sufficient (most cases)
- Readability matters more than micro-optimisation
- You haven't profiled

## Patterns

### Read-Only Large Struct

```swift
struct LargeBuffer {
    var data: [UInt8]  // Could be megabytes
}

// Explicit borrow — no copy
func process(_ buffer: borrowing LargeBuffer) -> Int {
    buffer.data.count
}
```

### Consuming Factory

```swift
struct Builder {
    var config: Configuration

    // Consumes self — builder invalid after call
    consuming func build() -> Product {
        Product(config: config)
    }
}

let builder = Builder(config: .default)
let product = builder.build()
// builder is now invalid — compiler error if used
```

### Explicit Copy in Borrowing Context

With `borrowing`, copies must be explicit:

```swift
func store(_ value: borrowing LargeValue) {
    // ERROR: Cannot implicitly copy borrowing parameter
    // self.cached = value

    // Explicit copy required
    self.cached = copy value
}
```

### Consume Operator

Transfer ownership explicitly:

```swift
let data = loadLargeData()
process(consume data)
// data is now invalid — compiler prevents use
```

### Reducing ARC Traffic

```swift
class ExpensiveObject { /* ... */ }

// Borrowing: no retain/release
func inspect(_ obj: borrowing ExpensiveObject) -> String {
    obj.description
}
```

## Common Mistakes

### Over-Optimising Small Types

```swift
// WRONG: Unnecessary — Int is trivially copyable
func add(_ a: borrowing Int, _ b: borrowing Int) -> Int { a + b }

// RIGHT: Let compiler optimise
func add(_ a: Int, _ b: Int) -> Int { a + b }
```

### Consuming When Borrowing Suffices

```swift
// WRONG: Consumes unnecessarily — caller loses access
func validate(_ data: consuming Data) -> Bool { data.count > 0 }

// RIGHT: Borrow for read-only
func validate(_ data: borrowing Data) -> Bool { data.count > 0 }
```

---

## Noncopyable Types (~Copyable)

For `~Copyable` types, ownership modifiers are **required** on all methods:

```swift
struct FileHandle: ~Copyable {
    private let fd: Int32

    borrowing func read(count: Int) -> Data {
        var buffer = [UInt8](repeating: 0, count: count)
        _ = Darwin.read(fd, &buffer, count)
        return Data(buffer)
    }

    consuming func close() {
        Darwin.close(fd)
    }

    deinit { Darwin.close(fd) }
}
```

### Limitations

Know these constraints before adopting `~Copyable`:

| Limitation | Impact | Workaround |
|---|---|---|
| Can't store in Array, Dictionary, Set | Collections require `Copyable` | Use `Optional<T>` wrapper or manage manually |
| Can't use with most generics | `<T>` implicitly means `<T: Copyable>` | Use `<T: ~Copyable>` (requires library support) |
| Protocol conformance restricted | Most protocols require `Copyable` | Use `~Copyable` protocol definitions |
| Can't capture in closures by default | Closures copy captured values | Use `borrowing` closure parameters |
| No existential support | `any ~Copyable` doesn't work | Use generics instead |

### Common Compiler Errors

```swift
// "Cannot implicitly copy a borrowing parameter"
// Fix: Add explicit `copy` or change to consuming
func store(_ v: borrowing LargeValue) {
    self.cached = copy v
}

// "Noncopyable type cannot be used with generic"
// Fix: Constrain generic to ~Copyable
func use<T: ~Copyable>(_ value: borrowing T) { }

// "Missing 'consuming' or 'borrowing' modifier"
// Fix: ~Copyable types require explicit ownership on all methods
struct Token: ~Copyable {
    borrowing func peek() -> String { /* ... */ }
    consuming func redeem() { /* ... */ }
}
```

### When NOT to Use ~Copyable

- If you need collection storage (arrays, dictionaries)
- If you need to work with existing generic APIs
- If the type needs broad protocol conformance
- Prefer `consuming func` on regular types as a lighter alternative for "use once" semantics
