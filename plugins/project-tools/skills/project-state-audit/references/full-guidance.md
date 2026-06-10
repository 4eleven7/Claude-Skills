# Project State Audit

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill to answer "where are we?" and "what should we build next?" by reconciling the repository, specifications, and project documents.

**This skill is read-only. It never writes implementation code.** It updates only scope and todo documents.

For focused documentation/spec consistency audits, use `references/documentation-consistency.md`.

## Truth Hierarchy

When conflicts exist:

1. Repository code (highest)
2. Feature specifications (the project specifications or requirements documents)
3. Scope/todo documents (lowest — these are derived artifacts)

Never trust the todo file blindly. The repo is the source of truth.

## Required Reading

Before any assessment, read:

1. the project scope/status document
2. the project todo/backlog document
3. the project lessons or known-issues document
4. Feature specifications from the project specifications or requirements documents
5. Existing implementation for relevant domains

## Process

### Step 1: Assess Current State

For each feature area, classify status based on **repo evidence**:

| Status | Definition |
|--------|-----------|
| **Implemented** | Feature behaviour exists, is integrated, meets spec intent |
| **Partial** | Some implementation exists but missing behaviour, integration, or tests |
| **Not started** | No meaningful implementation (stubs/placeholders don't count) |
| **Blocked** | Cannot proceed due to missing dependency |
| **Deferred** | Intentionally not in current scope |
| **Superseded** | Replaced by different approach |
| **Needs audit** | Status uncertain, requires investigation |

### Step 2: Reconcile Discrepancies

**Sub-phase rule:** Specs with internal phases use nested checkboxes in the todo. A spec's internal phases can span multiple project phases — sub-phases tagged `[P2]` or `[deferred]` belong to later project phases.

**How to assess a multi-phase spec:**

1. Read the spec's sub-phases from the todo
2. Filter out any sub-phase tagged `[P2]` or `[deferred]` — these do not count for current-phase status
3. Of the remaining (current-phase) sub-phases:
   - **All checked** → spec is `Implemented`
   - **Some checked, some unchecked** → spec is `Partial`
   - **None checked** → spec is `Not started`
4. Never mark a multi-phase spec as `Implemented` based on code volume alone; check each sub-phase against the specification

**Example:** Notifications has two sub-phases:
```
- [x] Phase 1 (MVP): ...
- [ ] Phase 2: Advanced scheduling ...
```
Neither is tagged `[P2]`/`[deferred]`, so both are current-phase. Phase 1 is checked, Phase 2 is not → status is `Partial`.

**Example:** Onboarding has three sub-phases:
```
- [x] Phase 1: Data layer ...
- [ ] `[deferred]` Phase 2: Custom animations
- [ ] `[deferred]` Phase 3: A/B testing
```
Only Phase 1 is current-phase. It is checked → status is `Implemented` (for project Phase 1).

If code shows a feature is complete but the todo is not updated:

- For single-phase specs: mark the item complete in the todo file
- For multi-phase specs: mark only the specific sub-phases that are complete
- Update scope status accordingly
- Update counts/summaries
- Explain the correction was made based on repo evidence

If the todo says complete but code does not support it:

- Mark the item as partial or needs audit
- Document what is actually missing

### Step 2b: Check Seeds

Before recommending next work, scan the project exploration backlog and the project specification backlog for ideas with **Surfaces when:** trigger conditions that match the current work context or the feature being recommended. Surface any matching seeds in the output so they inform the recommendation.

### Step 3: Scope Challenge

Before recommending the next feature, evaluate:

- **Is this the right thing to build next?** Consider dependencies, user impact, and specification readiness.
- **Is a specification approved?** Features without approved specs need spec work first, not implementation.
- **Are there partial features that should be finished first?** Completing 80%-done work often delivers more value than starting something new.
- **Are there blockers that should be cleared?** Sometimes unblocking one thing enables several others.

Present a reasoned recommendation, not just "the next unchecked item."

### Step 4: Update Documents

Update the scope and todo files to reflect reality:

**Scope document** — strategic, not task-granular:
- What is in scope and what is implemented vs partial vs missing
- Dependency relationships and execution order
- Major risks or constraints
- What is deferred or intentionally out of scope

**Todo document** — execution-oriented:
- Dependency-ordered
- Reflects real progress
- Identifies partial work needing completion
- Clearly indicates next task
- Accurate summary counts

## Output Format

1. **What I assessed** — files, docs, specs, code areas reviewed
2. **Current state** — feature-by-feature status with evidence
3. **Discrepancies found** — todo vs code vs spec mismatches, and corrections made
4. **Recommendation** — what to build next, why this and not something else
5. **Specification readiness** — does the recommended feature have an approved spec? If not, spec work comes first.
6. **Scope/todo updates made** — what changed in the managed files

## Managed Files

- the project scope/status document
- the project todo/backlog document

## Next Steps

After completing the scope assessment, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|---|---|---|
| Recommended feature has an approved spec | `implement` skill | Spec is ready — start building |
| Spec exists but may have gaps | `spec-workflow` skill | Harden the spec before implementation |
| Spec exists but has drifted from code | `spec-workflow` skill | Reconcile before building more |
| No spec exists for the recommended feature | Write a spec first | Implementation needs a target |
| Partial feature needs finishing | `implement` skill | Complete what's started before starting new work |
| Multiple specs may be inconsistent | `project-state-audit` skill | Cross-artifact consistency check before proceeding |
| Small remaining work on a partial feature | `small-change` skill | Targeted fix with verification, no full `implement` skill cycle |
| Idea surfaced during assessment | `capture-idea` skill | Capture for later with trigger conditions |
| Multiple user-facing features competing for priority | `user-test` skill | Compare candidates through persona lenses to inform prioritisation |
| State is confusing — unclear what happened | `forensics` skill | Investigate before planning next work |

## Rules

- Never write implementation code — this skill is assessment only
- Base every classification on repo evidence, not optimism
- Prefer accurate "partial" status over fake completion
- Prefer improving document structure over preserving bad docs
- When recommending next work, consider the full picture — dependencies, spec readiness, partial features, blockers
- If the user asks to work on a specific feature, hand off to `implement` skill after confirming spec readiness
