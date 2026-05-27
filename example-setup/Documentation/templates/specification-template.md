<!-- EXAMPLE TEMPLATE: Replace [YourApp] and [Author Name] with your project-specific values. -->

# Specification Template

## Purpose

Provide a practical structure for writing [YourApp] feature specifications.

A specification defines behaviour. It does not define repositories, protocols, view models, or class hierarchies.

## When to Use

- Creating a new feature specification
- Replacing an outdated spec before implementation
- Updating an approved feature contract

## Workflow

1. Describe the user-visible problem and why the feature exists.
2. Define the data and rules in concrete terms.
3. Write behaviour, edge cases, and acceptance criteria.
4. Turn acceptance criteria into explicit test cases.
5. Mark the spec `Approved` before substantial implementation work.

## Template

Copy this structure for a new specification. Keep the required sections. Add optional sections only when the feature needs them.

```md
# [Feature Name]

**Version:** 1.0
**Status:** Draft
**Last Updated:** [Day] [Date] [Month] [Year]
**Author:** [Author Name]
**Spec Dependencies:** [Relevant specs or "None"]

> [Short tagline]

---

## Purpose

[Why the feature exists and why it matters.]

---

## Scope

### In Scope

- [Behaviour this spec covers]

### Out of Scope

- [Things intentionally excluded]

---

## User Scenarios

### Scenario 1: [Name]

**As a** [user]
**I want to** [action]
**So that** [benefit]

**Example:**
> [Concrete example]

---

## Glossary

| Term | Definition |
|---|---|
| [Term] | [Meaning in this spec] |

---

## Dependencies

- [Other specs, services, or feature contracts this depends on]

---

## Data Model

Use Swift for important types.

```swift
struct Thing {
    let id: UUID
    let createdAt: Date
}
```

If the feature reads or writes canonical health data, describe that separately.

---

## Behaviour

| Action | Expected Behaviour | Errors |
|---|---|---|
| [Action] | [What happens] | [Possible failure] |

### State Transitions

[Include only if the feature has meaningful state.]

### System Behaviour

[Include only if lifecycle, background work, permissions, or system events matter.]

---

## Business Rules

| Rule | Description |
|---|---|
| [Rule] | [Constraint] |

---

## Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| [Edge case] | [Expected result] |

---

## Acceptance Criteria

Each criterion uses Given/When/Then format for testability:

- [ ] **Given** [precondition], **when** [action], **then** [observable outcome]
- [ ] **Given** [precondition], **when** [action], **then** [observable outcome]
- [ ] Tests covering the specified behaviour pass
- [ ] Build passes with zero warnings

---

## Test Cases

### Critical Paths

| Test | Input | Expected Output |
|---|---|---|
| [Test] | [Input] | [Expected output] |

### Error Conditions

| Test | Trigger | Expected Error |
|---|---|---|
| [Test] | [Trigger] | [Error] |
```

### Optional Sections

Add these only when the feature needs them:

- `Constraints`
- `Timeline Events`
- `Non-Functional Requirements`
- `Delivery Phases`

## Spec Quality Gate

Before marking a spec `Approved`, verify:

- [ ] Every user scenario has at least one acceptance criterion
- [ ] Every acceptance criterion uses Given/When/Then with a concrete observable outcome
- [ ] Every behaviour table row has an expected result and error column filled
- [ ] Edge cases section is non-empty
- [ ] Data model types are defined with Swift syntax (not prose descriptions)
- [ ] Dependencies list matches `current-scope.md` status — unimplemented dependencies are flagged
- [ ] No "TBD", placeholder text, or empty sections remain
- [ ] Business rules do not contradict each other
- [ ] Glossary covers all domain terms introduced in the spec
- [ ] Spec does not prescribe implementation (no protocols, view models, or class hierarchies)

This gate is validated by `/implement` Phase 1 and `/clarify`. Failing items should be resolved before substantial implementation work begins.

## Notes

Do not put these in the spec:

- repository method signatures
- client APIs
- protocol hierarchies
- dependency-injection plans
- speculative future architecture

Good specs are short, concrete, and testable. If the spec cannot be turned into tests, it is too vague.
