<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust domain-specific references to match your app. -->

# Code Review Standard

## Purpose

Define the review bar for [YourApp] changes.

A review is not a summary of the diff. It is a search for defects, regressions, architectural violations, missing tests, and unnecessary complexity.

## Reviewer Priorities

Review in this order:

1. Correctness and behavioural regressions
2. Data integrity, persistence safety, and architecture violations
3. Performance and update-frequency risk
4. Test coverage and verification gaps
5. Code clarity and maintainability

## What Reviewers Should Check

### Correctness

- Does the implementation match the approved spec or requested behaviour?
- Are edge cases and failure paths handled?
- Did the change accidentally alter an existing interaction pattern?

### Architecture

- Does the change violate feature boundaries?
- Did a feature import another feature's types?
- Did anyone create a new production `ModelContainer`?
- Did service-layer work stay behind the appropriate client (e.g. `AnalyticsClient`)?
- If persisted models changed, did the author follow `Documentation/system/persistence-policy.md` for versioning, migration, reset constraints, tests, and doc/spec updates?

### Performance

- Is new work happening in hot paths?
- Are SwiftUI views doing expensive work in `body`?
- Did the change broaden observation or invalidation scope unnecessarily?
- Did the author introduce avoidable repeated filtering, sorting, formatting, or recomputation?

### Testing

- Are the right layers tested?
- Are tests deterministic?
- Is the change relying on previews or dev-views instead of real verification?

## Definition Of Done

A change is not done until:

- the behaviour matches the spec or agreed request
- targeted tests pass when behaviour matters
- the build passes when the touched surface justifies it
- lint and guardrail checks are clean when the change is broad enough
- warnings are resolved
- documentation or specs are updated if the contract changed
- known risks and untested areas are disclosed

## Author Expectations

Authors should make review easy:

- keep diffs surgical
- avoid speculative abstractions
- call out tradeoffs and risks explicitly
- mention any missing verification instead of hoping nobody notices

## Related Docs

- `Documentation/system/git-and-review-workflow.md`
- `Documentation/system/swiftui-view-guidelines.md`
- `Documentation/system/testing-strategy.md`
