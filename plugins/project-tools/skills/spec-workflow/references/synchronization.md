# Sync Spec — Post-Implementation Reconciliation

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Sync Spec workflow. Your job is to reconcile a feature specification with what was actually built. Specs are the source of truth for behaviour — when implementation reveals new edge cases, changes business rules, or adds behaviour, the spec must be updated to match reality.

**This skill modifies specifications only. It never writes implementation code.**

## When to Use

- After `implement` skill completes a feature or sub-phase
- When you suspect a spec has drifted from its implementation
- When the user wants to evolve a spec with new requirements before the next implementation phase
- When `project-state-audit` skill flags a spec/code mismatch

## Required Reading

Before starting, read ALL of:

1. The target specification in the project specifications or requirements documents
2. The specification template: the project specification template, if one exists
3. the project lessons or known-issues document — for implementation learnings that may belong in the spec
4. The implemented code for the feature (models, clients, repositories, UI, tests)

## Process

### Phase 1: Identify the Spec

If the user provided a feature name, find the matching spec in the project specifications or requirements documents.

If ambiguous, list candidates and ask. Do not guess.

### Phase 2: Audit — Spec vs Reality

Read the spec and the implemented code side by side. For each spec section, classify:

| Section | Status | Meaning |
|---------|--------|---------|
| **Accurate** | Spec matches implementation | No change needed |
| **Stale** | Implementation diverged from spec | Spec needs updating |
| **Missing** | Implementation added behaviour not in spec | Spec needs new content |
| **Orphaned** | Spec describes behaviour that was not built | Spec needs removal or deferral marker |
| **Contradicted** | Spec and code disagree on a rule | Needs user decision |

Check these areas specifically:

1. **Data Model** — Do the spec's types match the actual persisted models? Fields added, removed, renamed?
2. **Behaviour** — Does the behaviour table match what the code actually does?
3. **Business Rules** — Are all enforced rules documented? Are any documented rules not enforced?
4. **Edge Cases** — Did implementation discover edge cases not in the spec?
5. **Acceptance Criteria** — Do criteria match what was actually tested?
6. **Test Cases** — Do spec test cases match real tests?
7. **Dependencies** — Did the dependency list change during implementation?
8. **Scope** — Did anything move in/out of scope during implementation?
9. **Delivery Phases** — Are phase markers accurate? Did sub-phases shift?

### Phase 3: Report

Present a structured diff to the user. Group by severity:

**Must update** — spec is factually wrong about what was built:
- Data model mismatches
- Business rule contradictions
- Missing behaviour that was implemented
- Orphaned behaviour that was never built

**Should update** — spec is incomplete but not wrong:
- New edge cases discovered during implementation
- Acceptance criteria that could be more specific
- Test cases that were added but not reflected in spec

**Consider updating** — optional improvements:
- Clarifications that would help the next implementer
- Scope boundary refinements
- Dependency updates

For each proposed change, show:
- **Section** — which spec section
- **Current text** — what the spec says now (quote it)
- **Proposed text** — what it should say
- **Reason** — why (reference the code or test that proves this)

**STOP here and wait for user approval before modifying the spec.**

### Phase 4: Apply Changes

After the user approves (or adjusts) the proposed changes:

1. Apply approved edits to the specification
2. Bump the version number (minor bump for reconciliation, e.g. 1.0 → 1.1)
3. Update **Last Updated** to today's date
4. Keep the spec's existing structure and voice — do not rewrite sections that don't need changes
5. If the spec was `Draft` and the implementation is complete and verified, ask the user if status should move to `Approved`

### Phase 5: Cross-Reference Check

After updating the spec, check for ripple effects:

1. **Dependent specs** — Do any specs that depend on this one need updating? (check Spec Dependencies)
2. **Scope document** — Does the project scope/status document need a status update?
3. **Todo document** — Does the project todo/backlog document need phase markers adjusted?
4. **Lessons** — Should any implementation learnings from the project lessons or known-issues document be promoted into the spec as formal rules?

Present any cross-reference updates needed. Apply only with user approval.

### Phase 6: Summary

Present:

1. **Spec updated** — name, old version → new version
2. **Changes made** — brief list of what changed and why
3. **Cross-reference updates** — any dependent docs updated
4. **Remaining gaps** — anything the user deferred or that needs further discussion

## Managed Files

- the target specification or requirements document (the target spec)
- the project scope/status document (if status changed)
- the project todo/backlog document (if phase markers changed)

## Red Flags — STOP

| Rationalization | Reality |
|----------------|---------|
| "The spec is close enough" | If the code disagrees, the spec is wrong. Update it. |
| "I'll just rewrite the whole spec" | Surgical updates only. Preserve the author's voice and structure. |
| "This behaviour should be in the spec even though it's not built" | Specs describe what IS, not what SHOULD BE. Aspirational content belongs in a new spec draft or a todo item. |
| "The code is wrong, not the spec" | That's an `implement` skill problem, not a `spec-workflow` skill problem. Flag it but do not change working code. |
| "I'll update the spec without showing the diff" | Every change needs user approval. Specs are product decisions. |

## Next Steps

After the spec is reconciled, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| Code is verified and ready to ship | `pr-shipping` skill | Commit, PR, monitor, land |
| Spec update revealed unbuilt behaviour | `implement` skill | Build what was discovered missing |
| Want a final quality check | `code-review` skill | Fresh-eyes pass on the complete feature |
| Aspirational behaviour worth capturing for later | `capture-idea` skill | Capture the idea with a trigger condition rather than inflating the spec |
| Unbuilt behaviour is minor/isolated | `small-change` skill | Small targeted fix without full `implement` skill cycle |

## Rules

- Never modify implementation code — this skill updates documentation only
- Never change spec intent without explicit user approval
- Show every proposed change before applying it
- Preserve the spec's existing structure and voice
- Keep specs short, concrete, and testable — do not inflate
- Do not add implementation details (protocols, view models, class hierarchies) to specs
- If the code is wrong and the spec is right, flag it as a bug — do not "fix" the spec to match broken code
- Cross-reference dependent specs but do not cascade-edit without approval
- Bump version on every update, no matter how small
