# InlineArray and Span (Swift 6.2+)

## InlineArray

Fixed-size array with inline storage. No heap allocation, no reference counting, no copy-on-write.

```swift
@frozen struct InlineArray<let count: Int, Element> where Element: ~Copyable
```

### Initialization

```swift
let a: InlineArray<4, Int> = [1, 2, 4, 8]
let b: InlineArray<_, Int> = [1, 2, 4, 8]  // count inferred as 4
let c: InlineArray = [1, 2, 4, 8]           // both inferred → InlineArray<4, Int>
```

### Key Characteristics

- Fixed size at compile time — cannot append or remove
- Inline storage (stack or directly within parent type)
- No heap allocation, no reference counting
- Eager copy on assignment (no CoW)
- No runtime exclusivity checks
- Uses Swift value generics (`let count: Int`)

### Memory Layout

```swift
MemoryLayout<InlineArray<0, UInt16>>.size       // 0
MemoryLayout<InlineArray<0, UInt16>>.stride     // 1
MemoryLayout<InlineArray<0, UInt16>>.alignment  // 1

MemoryLayout<InlineArray<3, UInt16>>.size       // 6 (2 bytes × 3)
MemoryLayout<InlineArray<3, UInt16>>.stride     // 6
MemoryLayout<InlineArray<3, UInt16>>.alignment  // 2 (same as UInt16)
```

### Usage

```swift
var array: InlineArray<3, Int> = [1, 2, 3]
array[0] = 4                    // Mutate in place
array.count                     // 3
array.isEmpty                   // false
for element in array { }        // Iteration
for i in array.indices { }      // Index-based

// Copy is eager (not CoW)
var copy = array
copy[0] = 99
// array[0] is still 4
```

### When to Use

- Performance-critical code paths where heap allocation matters
- Fixed-size collections that never resize
- Embedded systems or low-level code
- Data stored directly within other value types

### When NOT to Use

- Collections that need to grow or shrink
- Collections frequently copied (eager copy = expensive)
- When Array's dynamic sizing is needed
- General application code (premature optimisation)

---

## Span Family

Safe abstractions for accessing contiguous memory without unsafe pointers.

| Type | Access | Use |
|---|---|---|
| `Span<Element>` | Read-only elements | Safe iteration, processing |
| `MutableSpan<Element>` | Mutable elements | In-place modification |
| `RawSpan` | Read-only bytes | Binary parsing |
| `MutableRawSpan` | Mutable bytes | Binary writing |
| `OutputSpan` | Write-only | Initializing new collections |
| `UTF8Span` | Read-only UTF-8 | Unicode processing |

### Getting a Span

```swift
let array = [1, 2, 3, 4]
let span = array.span              // Span<Int>

var mutable = [1, 2, 3]
let ms = mutable.mutableSpan       // MutableSpan<Int>

let data = Data([0, 1, 2, 3])
let dataSpan = data.span           // Span<UInt8>
```

### Safe Usage

```swift
func sum(_ array: [Int]) -> Int {
    let span = array.span
    var result = 0
    for i in 0..<span.count {
        result += span[i]
    }
    return result
}
```

### Safety Constraints (Compile-Time Enforced)

**1. Cannot escape scope:**
```swift
func getSpan() -> Span<UInt8> {
    let array: [UInt8] = [0, 1, 2]
    return array.span  // ERROR: depends on local variable
}
```

**2. Cannot be captured in closures:**
```swift
let span = array.span
let closure = { span.count }  // ERROR: cannot capture span
```

**3. Cannot access after modifying source:**
```swift
var array = [1, 2, 3]
let span = array.span
array.append(4)
// span[0]  // ERROR: source modified after span creation
```

### RawSpan Example

```swift
extension RawSpan {
    mutating func readByte() -> UInt8? {
        guard !isEmpty else { return nil }
        let value = unsafeLoadUnaligned(as: UInt8.self)
        self = self._extracting(droppingFirst: 1)
        return value
    }
}
```

### Performance: Span vs Unsafe Pointers

Same runtime performance, but with compile-time safety:
- Prevents use-after-free
- Prevents overlapping modification
- No manual memory management
- No undefined behaviour from misuse

### When to Use Span

- Processing large data with minimal overhead
- High-performance algorithms needing direct memory access
- Binary parsing and serialization
- Replacing UnsafeBufferPointer in safe code
- API boundaries where you want to accept any contiguous container
