---
name: small-change
description: Use when making a trivial or small targeted change that needs direct implementation plus the minimum verification appropriate to its risk.
---

# Small Change

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill for low-risk tweaks and small, well-scoped changes that do not need the full `implement` skill pipeline. Trivial mechanical changes take the fast path. Small behavioral changes still require context, tests where useful, and verification.

Use this for: small bug fixes, adding a missing test, wiring up an existing component, adding a field to a model (with migration awareness), implementing a single clearly-defined behaviour, or finishing a TODO left in the code.

For purely mechanical changes, use the fast path in `references/trivial-change-fast-path.md`.

For test-first mechanics on behavioral changes, use `references/tested-change.md`.

## Input

Use the user request, selected files, selected text, or current repo context as input. The requested change should be specific enough to act on without a spec.

## Process

### Step 1: Audit

Read the relevant code. Understand the current state. Check the project lessons or known-issues document for relevant gotchas.

If the change involves persistence, also read the project persistence or migration policy.

### Step 2: Test First

If the change has testable behaviour:

1. Write a failing test that captures the expected outcome
2. Run the test to confirm it fails

If the change is purely structural (renaming, moving code, adding boilerplate), skip to Step 3.

### Step 3: Implement

Make the change. Keep it surgical — fix what was asked, nothing more.

Follow project conventions:
- Read relevant system docs from the repo instructions or documentation index, if one exists
- Match existing patterns in the surrounding code
- If touching persisted models or schemas, evaluate migration needs per the project persistence or migration policy

### Step 4: Verify

Full verification, same as `implement` skill:

1. Run the test(s) — confirm they pass
2. Build the affected package, module, or target
3. Run the project lint command, if one exists
4. If persistence changed, confirm model registration in `PersistenceSchema.allModels`

### Step 5: Report

```
## Patch Applied

**Change:** <1-line summary>
**Files:** <list of changed files>
**Tests:** <tests added/modified and their status>
**Build:** ✅ / ❌
**Lint:** ✅ / ❌
```

## Scope Triage

Before auditing, assess which path this skill should use. This triage is mandatory — it keeps trivial edits fast and gives behavioral changes the right level of rigour.

### Step 0: Check the Work

Read the task description and classify:

| Signal | Right Workflow | Why |
|--------|--------------|-----|
| One file, obvious fix, no behaviour change, no tests needed | **Fast path** | Read, edit, run minimum useful verification. |
| Purely mechanical: typo, constant, comment, config, gitignore | **Fast path** | No audit or test-first overhead needed. |
| Small but has testable behaviour | **Tested path** | Audit + test-first + verify. |
| Needs a spec to understand what to build | **`implement` skill** — hand off | Feature work needs a plan and spec review. |
| Architectural decisions between approaches | **`implement` skill** — hand off | Needs competing approaches or at minimum a plan approval gate. |
| Touches 5+ files across multiple packages | **`implement` skill** — hand off | Coordination scope exceeds what this skill is designed for. |
| Needs a plan to sequence the work | **`implement` skill** — hand off | If the work has dependencies between steps, it needs a plan. |

### Handoff Format

If the triage redirects, explain *why* so the user understands the boundary:

**Redirecting up to implement skill:**
```
## Redirecting → implement skill

**Requested:** <what was asked>
**Why not small-change skill:** <specific reason — e.g., "This touches 6 files across 3 packages and needs a decision about which pattern to follow. small-change does not have a plan step.">
**What implement skill adds:** <what the user gains — e.g., "Spec review, competing approaches, plan approval gate.">

Running implement skill now.
```

Then continue with the target skill using the original request. Do not ask the user to re-invoke manually — hand off directly.

## Rules

- No subagents, no competing approaches
- No plan approval gate — but do audit existing code first
- Test first when behaviour is involved
- Full verification (build + lint + tests) is mandatory
- Scope guard is mandatory — escalate to `implement` skill if scope grows
- Update the project lessons or known-issues document if you learn something
- This skill does not update scope/todo documents unless the change completes a tracked item
