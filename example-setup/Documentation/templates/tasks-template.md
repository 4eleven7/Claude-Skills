<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust file paths and feature examples to match your domain. -->

# Tasks Template

## Purpose

Structure for breaking a feature implementation into dependency-ordered, trackable tasks. Used by the implementation command during Phase 3 (Plan) to produce consistent, actionable plans.

## When to Use

- During the implementation command Phase 3 to structure the plan
- When a feature has multiple acceptance criteria that map to distinct implementation steps
- When a spec has delivery phases that need ordered task breakdown

## Task Format

Each task follows this format:

```
- [ ] T### [Priority] [Story/Phase] Description — `path/to/file.swift`
```

**Fields:**
- `T###` — sequential task ID (T001, T002, ...)
- `[Priority]` — `[P1]` (must have), `[P2]` (should have), `[P3]` (nice to have). Omit for P1 — it is the default.
- `[Story/Phase]` — which user scenario or delivery phase this serves
- `Description` — imperative mood, specific ("add discount calculation to PricingProvider", not "implement scoring")
- `path/to/file.swift` — the primary file this task touches (aids navigation and parallel work detection)

## Template

```md
# Tasks — [Feature Name]

**Spec:** `Documentation/specifications/[spec-name].md` v[X.Y]
**Date:** [Date]
**Target sub-phase:** [sub-phase name, or "single-phase"]

## Phase 0: Setup

- [ ] T001 Read spec, system docs, and existing code for the feature area
- [ ] T002 Identify existing types, patterns, and integration points to reuse

## Phase 1: Tests

Write failing tests from acceptance criteria before any implementation.

- [ ] T003 [Criterion] Test description — `Tests/FeatureTests/FeatureClientTests.swift`
- [ ] T004 [Criterion] Test description — `Tests/FeatureTests/FeatureClientTests.swift`

## Phase 2: Foundation

Schema, models, and types that other tasks depend on. Order matters — earlier tasks unblock later ones.

- [ ] T005 [P1] [Phase] Define core types — `Packages/Feature/Sources/Feature/Models/Thing.swift`
- [ ] T006 [P1] [Phase] Add persisted model + migration — `[YourApp]/Features/Feature/FeatureModel.swift`

## Phase 3: Business Logic

Clients, providers, and services.

- [ ] T007 [P1] [Phase] Implement client — `[YourApp]/Features/Feature/FeatureClient.swift`
- [ ] T008 [P1] [Phase] Wire into CompositionRoot — `[YourApp]/Composition/CompositionRoot.swift`

## Phase 4: Views

UI implementation. Can often parallel with Phase 3 once types exist.

- [ ] T009 [P1] [Phase] Build primary view — `[YourApp]/Features/Feature/Views/FeatureView.swift`
- [ ] T010 [P2] [Phase] Add dev view — `[YourApp]/Features/Feature/FeatureDevView.swift`

## Phase 5: Polish

- [ ] T011 Verify all tests pass
- [ ] T012 Run SwiftLint, fix violations
- [ ] T013 Build full app target
- [ ] T014 Update scope/todo documents

## Dependency Notes

[Which tasks block which. Example:]
- T006 blocks T007 (client needs the model)
- T005 blocks T003 (tests need the types)
- T009 can parallel T007 once T005 is done

## Parallel Execution

[Tasks that can safely run simultaneously. Example:]
- T003 + T004 (independent tests)
- T009 + T010 (independent views, same types)
```

## Guidelines

- **Order by dependency, not by file type.** A model that unblocks three tasks comes before a standalone view.
- **Tests first.** Phase 1 is always test scaffolding from acceptance criteria.
- **One task = one verifiable outcome.** "Implement the feature" is not a task. "Add cart total calculation that returns the discounted price given applied coupons" is.
- **File paths are required.** They prevent duplicate file creation and make tasks greppable.
- **Priority defaults to P1.** Only mark P2/P3 when something is genuinely optional for the current delivery phase.
- **Keep it flat.** Do not nest tasks. If a task is too big, split it into sequential tasks with dependency notes.
- **Persistence tasks are never optional.** If the spec defines persisted models, schema + migration tasks are mandatory — reference `Documentation/system/persistence-policy.md`.

## Notes

This template is a guide for the implementation command plan output, not a standalone artifact that lives in the repo. The plan is presented to the user for approval and then executed — it does not need to be saved as a file unless the implementation spans multiple sessions.
