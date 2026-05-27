---
name: swift-testing
description: Writes, reviews, and improves Swift Testing code using modern APIs, TDD workflow, fixture philosophy, and best practices.
---

## Responsibility

**Owns:** Swift Testing framework usage, test philosophy, fixture and mock data guidelines, TDD workflow, XCTest migration for unit/integration tests.

**Does NOT own:** UI testing / XCUITest, test execution / CI pipelines, performance profiling.

## Core Instructions

- Target Swift 6.2 or later, using modern Swift concurrency.
- All new unit and integration tests should use Swift Testing. XCTest is only for UI tests.
- Swift Testing does NOT support UI tests -- XCTest / XCUITest must be used there.
- Never test SwiftUI views directly -- test view models or extracted business logic instead. `@Observable` view models are directly testable without protocol wrappers.
- Use a consistent project structure, with test folder layout mirroring production code features.

## Core Principles

1. **TDD workflow drives implementation.** Extract behaviours from the spec, write failing tests first, implement the minimum production code, refactor while green, verify the whole change.
2. **Deterministic data over randomness.** Use fixed dates, explicit calendars/locales/time zones, and fixed UUIDs when identity, ordering, or boundary logic matters.
3. **Struct-based suites.** Prefer structs over classes for test suites. Use `init()` instead of `setUp()`. Only add `@Suite` when you need a display name or traits.
4. **Named fixtures for scenario meaning.** Use descriptive names that convey the scenario, not vague `sample1`, `sample2`. Make synthetic data obviously synthetic.
5. **Place fixtures close to tests.** Keep fixtures alongside the tests that use them unless there is real shared reuse across multiple files.
6. **Extract shared helpers only at 2+ callers.** Do not build shared fixture infrastructure for one caller. Extract only when the shared helper stays simpler than repeating the literals.
7. **Prefer explicit literals.** Use builders only when raw literals become noisy. Keep the values that drive assertions explicit and visible in the test.
8. **Swift Testing evolves faster than docs.** Expect 3-4 Swift releases per year, each introducing new testing features. Treat the user's installed toolchain as authoritative; Apple's documentation may lag behind.
9. **Never use `!` in `#expect`.** Write `#expect(value == false)` not `#expect(!value)` -- negation defeats macro expansion and produces unhelpful failure messages.
10. **Parallel by default.** Every test must be written to execute in any order at any time. Use `.serialized` only on parameterised tests when truly needed.

## Test Layer Matrix

| Layer | Use it for | Framework |
|---|---|---|
| Unit tests | business rules, state machines, data transformations, errors | Swift Testing |
| Integration tests | persistence, cross-layer behaviour, migration verification | Swift Testing |
| UI tests | critical user-visible flows only | XCTest / XCUITest |

Dev-views and previews are useful debug aids. They are not a formal test layer — but previews are a valuable development tool when used deliberately (see below).

## Previews as a Development Tool

Previews are not tests, but they catch visual bugs that tests cannot: truncation, overflow, missing states, and layout breakage under extreme data. Use them as a fast feedback loop during implementation.

### When to add previews

- Any view that displays user-generated or variable-length content
- Any view with multiple visual states (empty, loading, error, populated)
- Any reusable component that will appear in different contexts

### What makes a preview useful

1. **Vary the data, not just the chrome.** Multiple previews with different data reveal layout problems. One preview with default data proves nothing.
2. **Include edge cases.** Long text, empty strings, missing optionals, large counts, single items, zero items.
3. **Test both colour schemes.** At minimum: one light, one dark.
4. **Use `.previewLayout(.sizeThatFits)` for components.** Full-device previews waste space for small views.

### Example: edge-case preview set

```swift
#Preview("Standard") {
    MetricCard(title: "Steps", value: "8,432", unit: "steps")
}

#Preview("Long value") {
    MetricCard(title: "Heart Rate Variability", value: "142.7", unit: "ms")
}

#Preview("Empty value") {
    MetricCard(title: "Steps", value: "--", unit: "steps")
}

#Preview("Dark mode") {
    MetricCard(title: "Steps", value: "8,432", unit: "steps")
        .preferredColorScheme(.dark)
}
```

### What previews do NOT replace

- Automated tests for logic, state transitions, and data flow
- XCUITest for interaction sequences
- Real-device testing for performance and haptics

## TDD Workflow

### 1. Extract behaviours from the spec
Turn the spec into a short list of behaviours: happy paths, business rules, error cases, integration points.

### 2. Write failing tests first
Preferred order:
1. Unit tests for logic and state derivation
2. Integration tests for persistence or cross-layer behaviour
3. UI tests only when they cover critical user-visible behaviour

### 3. Implement the minimum production code
Make the tests pass with the smallest production change that satisfies the spec.

### 4. Refactor while tests stay green
Keep the test suite targeted and deterministic.

### 5. Verify the whole change
Run the specific tests you touched, then build the app, then run broader checks if the change is wide enough.

## Test Generation Heuristics

For a given function, aim to generate:

- Happy path tests
- Boundary tests
- Invalid input tests
- Concurrency tests (if appropriate)

Good tests follow FIRST: Fast, Isolated, Repeatable, Self-verifying, Timely.

## Fixture Rules Quick Reference

- Prefer deterministic data over generated randomness
- Use fixed dates when date logic matters (`Date(timeIntervalSince1970:)`, not `Date()`)
- Set explicit calendars, locales, and time zones when boundary logic matters
- Use fixed UUIDs when identity or ordering matters (`UUID(uuidString:)`, not `UUID()`)
- Keep fixtures as small as possible while still proving the behaviour
- Prefer explicit literals when they make the assertion clearer
- Use builders only when raw literals become noisy
- Use in-memory persistence for integration tests unless the test specifically needs something narrower
- Make synthetic data obviously synthetic; do not hide important defaults
- Use named fixtures for scenario meaning (`breakfastHighProtein`), not vague names (`sample1`)
- Extract shared fixtures only when multiple tests need the same scenario AND the shared helper stays simpler than repeating the literals

## Output Format

If asked for a review, organise findings by file. For each issue:

1. State the file and relevant line(s).
2. Name the rule being violated.
3. Show a brief before/after code fix.

Skip files with no issues. End with a prioritised summary of the most impactful changes.

If asked to write or improve tests, make the changes directly instead of returning a findings report.

### Example review output

#### UserTests.swift

**Line 5: Use struct, not class, for test suites.**

```swift
// Before
class UserTests: XCTestCase {

// After
struct UserTests {
```

**Line 12: Use `#expect` instead of `XCTAssertEqual`.**

```swift
// Before
XCTAssertEqual(user.name, "Taylor")

// After
#expect(user.name == "Taylor")
```

**Line 30: Use `#require` for preconditions, not force-unwrap.**

```swift
// Before
#expect(users.isEmpty == false)
let first = users.first!

// After
let first = try #require(users.first)
```

#### Summary

1. **Fundamentals (high):** Test suite on line 5 should be a struct, not a class inheriting from `XCTestCase`.
2. **Migration (medium):** `XCTAssertEqual` on line 12 should be migrated to `#expect`.
3. **Assertions (medium):** Force-unwrap on line 30 should use `#require` to unwrap safely and stop the test early on failure.

## Migration Testing Contract

Migration tests are integration tests against real on-disk stores, not fresh in-memory happy-path checks.

Required pattern: create old-schema store, seed old rows, reopen through real persistence, assert current-model contents survive. Guard tests must verify latest schema matches the migration-plan tail, adjacent versions are covered, and historical schemas use frozen snapshots.

See `references/testing-strategy.md` for full details.

## References

- `references/core-patterns.md` -- @Test, @Suite, #expect, #require, parameterised tests, struct-based suites, test organisation, tags, new features (raw identifiers, exit tests, attachments, test scopes).
- `references/async-testing.md` -- confirmation() for callbacks, @MainActor tests, async/await patterns, timeout control, serialisation, mocking networking, actor interface testing, task cancellation testing.
- `references/xctest-migration.md` -- XCTest to Swift Testing assertion mappings, conversion steps, floating-point tolerance.
- `references/fixture-philosophy.md` -- determinism rules, preview data, test fixtures, deterministic mocks, dev-view data, reuse threshold.
- `references/testing-strategy.md` -- TDD workflow, test layer matrix, migration testing, guard tests, backfill vs runtime repair, in-memory persistence.
- `references/mocking-patterns.md` -- protocol-based mocking for networking, dependency injection for tests, in-memory containers, hidden dependency removal, spy pattern for interaction verification, test double taxonomy (stub/spy/fake).
- `references/snapshot-testing.md` -- swift-snapshot-testing visual regression, device matrix parameterisation, named references, inline snapshots for text/JSON.
