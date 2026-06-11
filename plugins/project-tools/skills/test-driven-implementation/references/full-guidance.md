# Test-Driven Implementation

## Core Principle

Tests written by the same agent that designed the implementation tend to test the plan, not the requirement. This workflow separates plan review, test authorship, and implementation so tests are derived from the approved specification and public interface, not from implementation internals.

Use the smallest version of this workflow that preserves that separation. Do not turn it into ceremony for low-risk work.

## Required Discovery

Before starting, locate and read:

1. The approved feature specification or requirements document.
2. The project's workflow documentation, if it exists.
3. The project's testing strategy, test conventions, fixture guidance, or existing nearby tests.
4. The project's build, test, lint, and verification commands from repo docs, scripts, manifests, or CI.
5. The project instructions that map task areas to relevant architecture, persistence, UI, or platform docs.

If any required convention is missing, infer from nearby tests and project manifests only when the inference is low-risk. Otherwise ask where tests should live or which command proves the change.

## Process

### Phase 1: Spec Review

Read the specification fully. Identify the current feature, phase, or sub-scope being implemented.

Produce a build brief:

1. Target scope: feature, phase, or sub-phase.
2. Core behaviour: 3-5 bullets.
3. Acceptance criteria: concrete behaviours to prove.
4. Constraints: architecture, privacy, performance, migration, data, UI, or platform boundaries.
5. Persistence implications: schemas, migrations, storage, data retention, or data integrity concerns.
6. Integration points: existing modules, services, commands, APIs, or UI surfaces touched.
7. Spec gaps: ambiguity, contradiction, missing acceptance criteria, or untestable wording.

Validate against the project's spec template or quality gate if one exists.

If the spec has blocking or risky gaps, stop and ask targeted questions. Do not write tests from guesses.

### Phase 2: Existing Code Audit

Audit the current implementation area before planning:

- What code already exists?
- What is partial, missing, or wrong?
- What existing patterns should be reused?
- What public types, protocols, functions, commands, endpoints, or UI entry points are relevant?
- What test helpers, fixtures, mocks, or integration-test patterns already exist?

Produce an existing interface inventory. This inventory is part of the contract the independent test author receives.

### Phase 3: Implementation Plan

Draft a short implementation plan and stop for user approval before code changes.

The plan must include:

1. Current state: what exists and what is missing.
2. Tasks: dependency-ordered, with likely files or modules.
3. Public interface sketch: types, functions, protocols, endpoints, commands, UI hooks, or other observable contracts the tests can target.
4. Test strategy: which acceptance criteria become behavioural tests.
5. Verification: exact commands to run, or the missing command that must be clarified.

Keep internal design detail out of the test-author packet unless it is part of the public contract.

### Phase 4: Independent Plan Review

After user approval, obtain an independent review of the plan when the runtime supports agents or an external reviewer.

The reviewer receives the specification, the implementation plan, and the existing code audit. The reviewer is not an assistant to the plan. It must find gaps.

Prompt:

```text
You are an independent reviewer. Your job is to find gaps, risks, and blind spots in an implementation plan by comparing it against the specification.

You have no loyalty to the plan. Your loyalty is to the specification, project constraints, and code quality.

## Specification
[full relevant specification]

## Proposed Plan
[approved implementation plan]

## Existing Code Audit
[audit summary and interface inventory]

Evaluate:
1. Coverage: does the plan address every acceptance criterion?
2. Edge cases: what specified or implied edge cases are missing?
3. Architectural fit: does the plan reuse existing project patterns?
4. Over-engineering: what is more complex than required?
5. Under-engineering: what will break under realistic use?
6. Interface sketch: are the proposed public contracts sufficient, unnecessary, or wrong?
7. Risk: what is most likely to fail?

Report:
- Verdict: APPROVE or REVISE
- Missing coverage
- Edge case gaps
- Architectural concerns
- Interface sketch feedback
- Top risk
- Recommendations
```

If the reviewer returns REVISE, update the plan and get approval for material scope changes before proceeding. Repeat until approved or the user explicitly overrides.

If no independent reviewer is available, do a manual adversarial pass and label it as a fallback. Do not pretend it has the same independence.

### Phase 5: Independent Test Authoring

The independent test author receives the specification and public interface only. It must not receive the implementation plan's private task breakdown or internal design decisions.

Prompt:

```text
You are an independent test author. Your job is to write behavioural tests that verify the feature meets its specification. Test what the system should do, not how the implementation plans to do it.

You have not seen the implementation plan. You only know the specification, project test conventions, and the public interface available for testing.

## Specification
[full relevant specification: acceptance criteria, constraints, edge cases]

## Public Interface
[existing interface inventory plus approved public interface sketch]

## Project Test Conventions
[discovered test framework, test path, fixture style, naming conventions, async/time rules, persistence test rules, and commands]

Your job:
1. Write behavioural tests for every testable acceptance criterion.
2. Cover specified and strongly implied edge cases.
3. Cover error and failure paths the spec requires.
4. Use existing project test helpers and fixtures.
5. Add minimal compile stubs only when the public interface does not exist yet, and mark them clearly.
6. Do not write production implementation code.
7. Do not test internal implementation details.
8. Do not add tests for behaviour the spec does not require.

Report:
- Tests written: count and files
- Acceptance criteria covered
- Stubs created
- Gaps that could not be tested and why
```

After test authoring:

1. Build or type-check the test target.
2. Fix test compilation problems that are test bugs or missing declared stubs.
3. Run the new tests before implementation and confirm they fail for the expected behavioural reason.
4. If a test passes before implementation, remove or rewrite it unless it proves existing behaviour that the current scope intentionally reuses.
5. Present the test inventory before implementing.

### Phase 6: Implement Until Green

Implement the approved plan against the independent tests.

Rules:

- Work through the approved tasks in order.
- Make the minimum production change that turns the current failing tests green.
- Run targeted tests after each logical change.
- Do not change independent tests to make implementation easier.
- If a test appears wrong, prove why from the spec or project conventions, then report and fix the test as a test bug.
- If the implementation reveals a spec gap, stop and ask. Do not silently reinterpret the spec.
- Do not add untested feature behaviour beyond the approved scope.
- Do not refactor unrelated code.

Track progress as tests move from red to green.

### Phase 7: Verification

After targeted tests pass:

1. Re-read the specification.
2. Walk every acceptance criterion and cite the test, code path, or manual evidence proving it.
3. Run the relevant targeted tests.
4. Run the broader affected test suite when the change touches shared contracts, persistence, data integrity, or cross-cutting behaviour.
5. Build the affected target or project.
6. Run the project lint or formatting check if one exists.
7. Verify documentation, scope, todo, or backlog updates required by the project workflow.

Do not claim completion without command evidence or an explicit blocker.

### Phase 8: Wrap Up

Report:

1. What was built.
2. Spec compliance: pass/fail by acceptance criterion.
3. Test coverage: tests written by the independent author and what they prove.
4. Files changed.
5. Verification commands and results.
6. Follow-up items: deferred scope, spec gaps, test gaps, or polish.
7. Test-quality reflection: did independent tests catch anything the implementation plan would likely have missed?

Recommend the next workflow based on the result: `code-review`, `pre-ship`, `blast-radius`, `spec-workflow`, `post-implementation-qa`, or `pr-shipping`.

## Fallback When Agents Are Unavailable

If the runtime cannot dispatch independent agents, preserve separation as much as possible:

1. Write a test-author packet containing only the spec, public interface, and test conventions.
2. Put the implementation plan out of the packet.
3. Perform a fresh manual pass from the packet as if you had not authored the plan.
4. Record that this was manual separation, not independent review.
5. Be stricter in red validation: every new behavioural test must fail before implementation unless it intentionally documents existing behaviour.

This fallback is weaker. Say so.

## Red Flags

| Rationalization | Reality |
|---|---|
| "Normal implement already writes tests first." | This skill is about independent behavioural tests, not just test order. |
| "The test author needs the whole plan." | Then tests will mirror the plan. Give public contracts, not internals. |
| "This test is inconvenient, so I'll adjust it." | If it matches the spec, fix implementation. If it does not, prove the test bug. |
| "One passing test before implementation is fine." | It is usually a vacuous or pre-existing-behaviour test. Investigate before continuing. |
| "The reviewer is being pedantic." | The reviewer is there to catch plan blind spots. Address the substance or get user override. |
| "I'll add a bit more while I am here." | Extra untested behaviour is scope creep. Capture it separately. |

## Completion Criteria

The workflow is complete only when:

- independent or fallback-separated tests exist for the approved behavioural scope;
- those tests were observed red before production implementation, except documented pre-existing behaviour;
- tests pass after implementation;
- build and lint checks pass or blockers are explicit;
- spec compliance is checked criterion by criterion;
- project status documents are updated when the project workflow requires it.
