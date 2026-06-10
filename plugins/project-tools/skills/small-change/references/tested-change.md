# Test-Driven Development

If you didn't watch the test fail, you don't know if it tests the right thing.

## The Cycle

### RED — Write a failing test

- One behaviour per test
- Clear name describing what should happen
- Real code, not mocks (unless unavoidable)

```swift
@Test func rejectsEmptyEmail() async throws {
    let result = validator.validate(email: "")
    #expect(result == .invalid("Email required"))
}
```

### Verify RED — Watch it fail

**Mandatory. Never skip.**

- Test fails (not compiler errors — a real assertion failure)
- Failure message matches what you expect
- Fails because the feature is missing, not because of typos

### GREEN — Write minimal code to pass

Just enough to make the test pass. Nothing more.

```swift
func validate(email: String) -> ValidationResult {
    guard !email.trimmingCharacters(in: .whitespaces).isEmpty else {
        return .invalid("Email required")
    }
    return .valid
}
```

### Verify GREEN — Watch it pass

**Mandatory.**

- The new test passes
- All existing tests still pass
- Build is clean

### REFACTOR — Clean up

Only after green:

- Remove duplication
- Improve names
- Extract helpers

Keep all tests green. Don't add behaviour during refactor.

## When to Use

**Always:** New features, bug fixes, behaviour changes, refactoring

**Exceptions:** Throwaway prototypes, pure configuration, generated code. Ask if unsure.

## Good Tests

| Quality | Good | Bad |
|---|---|---|
| Focused | Tests one thing | Tests multiple things ("and" in name = split it) |
| Named | Describes behaviour | `test1`, `testHelper` |
| Shows intent | Demonstrates the API you wish existed | Tests implementation details |
| Minimal setup | Only what's needed | 50 lines of setup for 1 assertion |

## Anti-Patterns

**Testing mock behaviour instead of real behaviour:**
```swift
// BAD — asserts on mock
#expect(mockService.didCallFetch == true)

// GOOD — asserts on outcome
#expect(viewModel.items.count == 3)
```

**Test-only methods in production code:**
```swift
// BAD — destroy() only called in tests
class Session { func destroy() { ... } }

// GOOD — test utility outside production target
func cleanupSession(_ session: Session) { ... }
```

**Mocking without understanding:**
If mock setup is >50% of the test, the code is too coupled. Fix the design, not the test.

**Incomplete mocks:**
Mirror the real API shape. Missing fields cause false positives.

## Language And Test-Framework Specifics

- Use the project's preferred test framework for new tests
- Use `@Test` with traits for parameterised tests: `@Test(arguments: [...])`
- For async: `@Test func ... async throws`
- For persistence: use in-memory `ModelContainer` in tests
- Follow the project's testing strategy documentation if available
- Follow the project's fixture and mock data guidelines if available

## Verification Checklist

Before claiming done:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass (not just new ones)
- [ ] Build is clean
- [ ] Edge cases and error paths covered

## When Stuck

| Problem | Fix |
|---|---|
| Don't know how to test it | Write the assertion first — the API you wish existed |
| Test is too complicated | The design is too complicated. Simplify the interface. |
| Must mock everything | Code is too coupled. Use dependency injection. |
| Setup is huge | Extract test helpers. Simplify the design. |
