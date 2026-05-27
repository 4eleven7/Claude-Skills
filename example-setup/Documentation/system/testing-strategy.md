<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust service/client names to match your domain. -->

# Testing Strategy

## Purpose

Define how [YourApp] uses tests to implement specifications with TDD.

Tests exist to prove behaviour from the spec, not to pad coverage.

## When to Use

- Implementing a new feature
- Changing behaviour in an existing feature
- Fixing a logic or persistence bug
- Verifying service or connector integration

## Workflow

### 1. Extract behaviours from the spec

Turn the spec into a short list of behaviours:

- happy paths
- business rules
- error cases
- integration points

### 2. Write failing tests first

Preferred order:

1. unit tests for logic and state derivation
2. integration tests for persistence or cross-layer behaviour
3. UI tests only when they cover critical user-visible behaviour

### 3. Implement the minimum production code

Make the tests pass with the smallest production change that satisfies the spec.

### 4. Refactor while tests stay green

Keep the test suite targeted and deterministic.

### 5. Verify the whole change

Run the specific tests you touched, then build the app, then run broader checks if the change is wide enough.

## Example

For a timeline change:

- unit tests for sorting, state transitions, or presentation mapping
- integration tests for provider interaction
- UI test only if the user-visible paging or navigation behaviour changed

## Notes

### Test layers

| Layer | Use it for | Framework |
|---|---|---|
| Unit tests | business rules, state machines, data transformations, errors | Swift Testing |
| Integration tests | persistence, DataService interaction, multi-layer behaviour | Swift Testing |
| UI tests | critical user-visible flows only | XCTest / XCUITest |

Dev-views and previews are useful debug aids. They are not a formal test layer.
For SwiftUI view structure, lifecycle, and preview rules, see `Documentation/system/swiftui-view-guidelines.md`.
For deterministic fixtures, mock data, and dev-view seed data, see `Documentation/system/fixture-and-mock-data-guidelines.md`.

### [YourApp] app test structure

- [YourApp] app tests live under `[YourApp]/[YourApp]Tests/`
- UI tests live under `[YourApp]/[YourApp]UITests/`
- App tests use `@testable import [YourApp]`

> Adjust these paths to match your project's actual test target layout.

### Determinism rules

- use fixed dates in assertions
- set explicit calendars and time zones when date boundaries matter
- use fixed UUID fixtures when ordering or deduping matters
- prefer in-memory persistence for integration tests

### Persistence test setup

For [YourApp] app tests, prefer `AppContainer(inMemory: true)` unless the test genuinely needs a narrower raw `ModelContainer`.

For persisted-schema changes, `Documentation/system/persistence-policy.md` is the bar:

- prove the current store still opens
- add migration tests for the relevant prior schema versions
- verify critical entities, identifiers, relationships, defaults, and derived values survive the version step

For SwiftData migration mechanics and guardrail rules, also follow `Documentation/system/swiftdata-migrations.md`.

### SwiftData migration tests

Migration tests are integration tests against real on-disk stores, not fresh in-memory happy-path checks.

Required pattern:

1. create a store using the old `VersionedSchema`
2. seed representative old rows
3. reopen through the real `AppContainer`
4. assert current-model contents and invariants after migration

Required assertions:

- changed rows migrated correctly
- untouched rows still survive the version step
- required defaults and backfills are present
- identifiers, uniqueness, and relationships still mean the same thing

Guard tests are also required for migration work:

- latest schema matches the migration-plan tail
- adjacent schema versions are fully covered by migration stages
- historical schemas use frozen snapshots for changed models instead of live mutable current model types

### Backfill vs runtime repair

Use migration/backfill logic when stored data must change shape or meaning to remain valid.

Use runtime repair only for derived or recoverable data, and only when:

- the store already opens safely
- the repair is idempotent
- user-visible meaning is not wrong before the repair runs

Do not use runtime repair as a substitute for required SwiftData migration work.

### DataService tests

For feature tests touching canonical health data:

- use an in-memory `DataServiceClient`
- use test connectors or manual-entry paths
- never depend on real framework data sources (e.g. HealthKit) in app tests

### Commands

Use `Documentation/system/build-and-validation-commands.md` for the canonical test, build, lint, and full-validation commands.
