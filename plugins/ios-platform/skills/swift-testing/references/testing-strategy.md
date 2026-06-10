# Testing Strategy

Tests exist to prove behaviour from the spec, not to pad coverage.

## When to Use TDD

- Implementing a new feature
- Changing behaviour in an existing feature
- Fixing a logic or persistence bug
- Verifying integration points

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

- Do not keep it as "reference"
- Do not "adapt" it while writing tests
- Do not look at it
- Delete means delete

Implement fresh from tests. Period.

## TDD Workflow

### 1. Extract behaviours from the spec

Turn the spec into a short list of behaviours: happy paths, business rules, error cases, integration points.

### 2. Write failing tests first

Preferred order:
1. Unit tests for logic and state derivation
2. Integration tests for persistence or cross-layer behaviour
3. UI tests only when they cover critical user-visible behaviour

### 3. Verify RED -- watch it fail

**Mandatory. Never skip.**

Run the test and confirm all three:
- Test **fails** (not errors -- a compiler error or crash is not a valid RED)
- Failure message is the one you expect
- Fails because the feature is missing, not because of a typo or setup bug

Test passes immediately? You are testing existing behaviour. Fix or delete the test.

Test errors instead of failing? Fix the error, re-run until it fails correctly.

### 4. Implement the minimum production code

Make the tests pass with the smallest production change that satisfies the spec. Do not add features, refactor other code, or "improve" beyond the test.

### 5. Refactor while tests stay green

Keep the test suite targeted and deterministic.

### 6. Verify the whole change

Run the specific tests you touched, then build the app, then run broader checks if the change is wide enough.

## Test Layer Matrix

| Layer | Use it for | Framework |
|---|---|---|
| Unit tests | business rules, state machines, data transformations, errors | Swift Testing |
| Integration tests | persistence, cross-layer behaviour, migration verification | Swift Testing |
| UI tests | critical user-visible flows only | XCTest / XCUITest |

Dev-views and previews are useful debug aids. They are not a formal test layer.

## Test Generation Heuristics

For a given function, aim to generate:
- Happy path tests
- Boundary tests
- Invalid input tests
- Concurrency tests (if appropriate)

## Determinism Rules

- Use fixed dates in assertions
- Set explicit calendars and time zones when date boundaries matter
- Use fixed UUID fixtures when ordering or deduping matters
- Prefer in-memory persistence for integration tests

## Migration Testing

Migration tests are integration tests against real on-disk stores, not fresh in-memory happy-path checks.

### Required pattern

1. Create a store using the old `VersionedSchema`
2. Seed representative old rows
3. Reopen through the real persistence container
4. Assert current-model contents and invariants after migration

### Required assertions

- Changed rows migrated correctly
- Untouched rows still survive the version step
- Required defaults and backfills are present
- Identifiers, uniqueness, and relationships still mean the same thing

### Guard tests for migration

- Latest schema matches the migration-plan tail
- Adjacent schema versions are fully covered by migration stages
- Historical schemas use frozen snapshots for changed models instead of live mutable current model types

## Backfill vs Runtime Repair

Use migration/backfill logic when stored data must change shape or meaning to remain valid.

Use runtime repair only for derived or recoverable data, and only when:
- The store already opens safely
- The repair is idempotent
- User-visible meaning is not wrong before the repair runs

Do not use runtime repair as a substitute for required migration work.

## In-Memory Persistence

Prefer in-memory persistence containers for integration tests unless the test genuinely needs a narrower raw container or is specifically testing on-disk migration.

## Testing SwiftUI Views

Never test views directly -- they use `@State` and behave unpredictably. Test view models or extracted business logic instead. `@Observable` view models are directly testable without protocol wrappers.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after answer "what does this do?" Tests-first answer "what should this do?" |
| "Already manually tested" | Ad-hoc is not systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You will adapt it. That is testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to the test. Hard to test means hard to use. |
| "TDD will slow me down" | TDD is faster than debugging. Pragmatic means test-first. |
| "Manual test faster" | Manual does not prove edge cases. You will re-test every change. |
| "Existing code has no tests" | You are improving it. Add tests for the code you touch. |

## Red Flags -- Stop and Start Over

If any of these are true, delete the production code and restart with TDD:

1. Code written before test
2. Test written after implementation
3. Test passes immediately on first run
4. Cannot explain why the test failed
5. Tests deferred to "later"
6. Rationalising "just this once"
7. "I already manually tested it"
8. "Tests after achieve the same purpose"
9. "It's about spirit not ritual"
10. "Keep as reference" or "adapt existing code"
11. "Already spent X hours, deleting is wasteful"
12. "TDD is dogmatic, I'm being pragmatic"
13. "This is different because..."

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the wished-for API. Write the assertion first. Ask for help. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify the design. |

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output clean (no errors, no warnings)
- [ ] Tests use real code (mocks only when unavoidable)
- [ ] Edge cases and errors covered

Cannot check all boxes? TDD was skipped. Start over.
