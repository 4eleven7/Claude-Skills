# XCTest Migration

Do not rewrite XCTest to Swift Testing unless requested. XCTest is still required for UI testing.

## Assertion Mapping Table

| XCTest | Swift Testing |
|---|---|
| `XCTAssertEqual(a, b)` | `#expect(a == b)` |
| `XCTAssertNotEqual(a, b)` | `#expect(a != b)` |
| `XCTAssertTrue(a)` | `#expect(a)` |
| `XCTAssertFalse(a)` | `#expect(a == false)` |
| `XCTAssertNil(a)` | `#expect(a == nil)` |
| `XCTAssertNotNil(a)` | `#expect(a != nil)` |
| `XCTAssertLessThan(a, b)` | `#expect(a < b)` |
| `XCTAssertGreaterThan(a, b)` | `#expect(a > b)` |
| `XCTAssertLessThanOrEqual(a, b)` | `#expect(a <= b)` |
| `XCTAssertGreaterThanOrEqual(a, b)` | `#expect(a >= b)` |
| `XCTAssertThrowsError(expr)` | `#expect(throws: SomeError.self) { expr }` |
| `XCTAssertNoThrow(expr)` | `#expect(throws: Never.self) { expr }` |
| `XCTUnwrap(optional)` | `try #require(optional)` |
| `XCTFail("message")` | `Issue.record("message")` |
| `XCTAssertIdentical(a, b)` | `#expect(a === b)` |
| `XCTAssertNotIdentical(a, b)` | `#expect(a !== b)` |

## Floating-Point Tolerance

Swift Testing has no built-in float tolerance. Use Apple's Swift Numerics library:

```swift
#expect(celsius.isApproximatelyEqual(to: 0, absoluteTolerance: 0.000001))
```

Do not add Swift Numerics as a dependency without user permission.

## Conversion Steps

1. **Structure:** Keep the same type names. Convert classes to structs. Remove `XCTestCase` inheritance. Replace `setUp()`/`tearDown()` with `init()`.
2. **Methods:** Remove `test` prefix from method names. Add `@Test` attribute. Switch from old-style assertions to `#expect`/`#require`.
3. **Parameterise:** Look for places where parameterised tests can reduce code or improve coverage.
4. **Preconditions:** Add `#require` checks at the start of tests for assumptions that must hold.
5. **Traits:** Add `.timeLimit()`, `.enabled(if:)`, `.tags()`, etc. to replace XCTest conventions like skipping tests.

## Key Differences

- **Suites:** Structs, not classes. No inheritance from `XCTestCase`.
- **Setup:** `init()` and `deinit`, not `setUp()`/`tearDown()`.
- **Naming:** No `test` prefix required.
- **Parallel:** Tests run in parallel by default and in random order.
- **UI tests:** Still require XCTest / XCUITest. Swift Testing does not support UI testing.
