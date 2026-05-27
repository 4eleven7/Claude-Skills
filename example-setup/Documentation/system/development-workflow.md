<!-- This is an example template. Replace [YourApp] with your actual app name and adjust feature names, paths, and script references to match your project. -->

# [YourApp] Development Workflow

## Purpose

Define the canonical [YourApp] workflow for building or changing features.

[YourApp] is specification-driven and test-driven. The workflow is short on purpose:

`Specification → Implementation Plan → Tests → Feature Implementation → Verification`

If you are not sure which supporting document applies, start with `Documentation/system/documentation-index.md`.

## When to Use

- Adding a new feature
- Making a substantial change to an existing feature
- Refactoring behaviour covered by a specification

## Workflow

### 1. Write or update the specification

- Describe behaviour, business rules, edge cases, and acceptance criteria.
- Keep implementation details out of the spec.
- Get the spec to `Approved` before substantial implementation work.
- If the change affects persisted models, store lifecycle, or schema meaning, follow `Documentation/system/persistence-policy.md` and update the relevant persistence docs alongside the spec.

Read:

- `Documentation/templates/specification-template.md`
- The relevant existing spec in `Documentation/specifications/`
- `Documentation/system/documentation-index.md` when the task spans multiple areas

### 2. Create a brief implementation plan

- Audit the current code first.
- List dependencies, affected features, and integration points.
- Keep the plan short and execution-oriented.

Output:

- What will be tested first
- What production files will likely change
- What verification will prove the work is complete

### 3. Write tests first

- Convert acceptance criteria and edge cases into failing tests.
- Prefer unit tests for logic and state derivation.
- Add integration tests when persistence or multiple layers interact.
- For persisted-schema changes, add store-open and migration tests when required by `Documentation/system/persistence-policy.md`.
- Add UI tests only when they cover specified user-visible behaviour that lower layers cannot.

Read:

- `Documentation/system/testing-strategy.md`
- `Documentation/system/fixture-and-mock-data-guidelines.md` when tests, previews, or dev-views need deterministic data

### 4. Implement the feature

- Make the minimum production change required to pass the tests.
- Reuse the existing architecture where it is correct.
- Prefer concrete implementations over protocols and scaffolding.
- Keep SwiftUI state ownership explicit and local.
- If the change includes SwiftUI views, follow `Documentation/system/swiftui-view-guidelines.md`.

Read:

- `Documentation/system/system-architecture.md`
- `Documentation/templates/feature-template.md`
- `Documentation/system/swift-coding-guidelines.md`
- `Documentation/system/modern-api-guidelines.md`

### 5. Verify specification compliance

- Run the targeted tests you added or changed.
- Build the app target.
- Run lint and guardrail checks when the change is broad enough to justify them.
- Compare the final behaviour back to the spec.
- Update documentation and specs when the implementation changed the contract. Persistence-affecting changes must also update the relevant persistence docs per `Documentation/system/persistence-policy.md`.

Typical verification:

- targeted [YourApp] tests
- [YourApp] app build
- standalone SwiftFormat and SwiftLint when the surface area is broad enough
- `bash Scripts/check_all_builds.sh` for wide changes or pre-push validation

Use `Documentation/system/build-and-validation-commands.md` for the canonical commands.

## Example

For a new notifications feature:

1. Update or add the spec.
2. Audit `Notifications`, `Dashboard`, and `Settings`.
3. Write failing notification scheduling or delivery tests.
4. Implement the smallest production change that makes them pass.
5. Re-run the targeted tests, build the app, and compare behaviour to the spec.

## Notes

- When evolving an existing feature into its spec-compliant version, audit interaction patterns separately from data flow. Preserve valuable user-facing behaviour (navigation affordances, gestures, visual hierarchy) unless the spec explicitly rejects it. Focusing only on data/spec compliance risks dropping interaction patterns users already rely on.
- Dev-views are optional debug tools, not a required development stage.
- Previews are useful when they add real visual signal, but they do not replace tests. See `Documentation/system/swiftui-view-guidelines.md`.
- If a request conflicts with an approved specification, call out the conflict before implementing. Do not silently drift the contract.
- If a document conflicts with the approved specification, the specification wins.
