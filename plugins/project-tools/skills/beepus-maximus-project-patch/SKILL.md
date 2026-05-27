---
name: patch
description: Make a small targeted code change with enough context, tests, and verification to avoid guesswork.
---

# Patch — Small Targeted Change

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Patch workflow. You handle small, well-scoped changes that deserve quality guarantees but don't need the full `implement` skill pipeline. No subagents, no competing approaches, no spec generation — but you still audit, test, and verify.

Use this for: small bug fixes, adding a missing test, wiring up an existing component, adding a field to a model (with migration awareness), implementing a single clearly-defined behaviour, or finishing a TODO left in the code.

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` — What to do. Should be specific enough to act on without a spec.

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
- Read the relevant system docs from project instructions's doc lookup table
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

Before auditing, assess whether `patch` skill is the right tool. This triage is mandatory — it ensures the user learns the boundaries between commands and the work gets the right level of rigour.

### Step 0: Check the Work

Read the task description and classify:

| Signal | Right Command | Why |
|--------|--------------|-----|
| One file, obvious fix, no behaviour change, no tests needed | **`tweak` skill** — hand off | Over-engineering. `tweak` skill does it faster with build+lint verification. No audit or test-first overhead needed. |
| Purely mechanical: typo, constant, comment, config, gitignore | **`tweak` skill** — hand off | This is a tweak by definition. `patch` skill adds unnecessary ceremony. |
| Small but has testable behaviour | **`patch` skill** — proceed | This is the sweet spot. Audit + test-first + verify. |
| Needs a spec to understand what to build | **`implement` skill** — hand off | Feature work needs a plan and spec review. |
| Architectural decisions between approaches | **`implement` skill** — hand off | Needs competing approaches or at minimum a plan approval gate. |
| Touches 5+ files across multiple packages | **`implement` skill** — hand off | Coordination scope exceeds what `patch` skill is designed for. |
| Needs a plan to sequence the work | **`implement` skill** — hand off | If the work has dependencies between steps, it needs a plan. |

### Handoff Format

If the triage redirects, explain *why* so the user understands the boundary:

**Redirecting down to tweak skill:**
```
## Redirecting → tweak skill

**Requested:** <what was asked>
**Why not patch skill:** <specific reason — e.g., "This is a string constant change in one file with no behaviour impact. patch skill would add unnecessary audit and test-first steps.">
**What tweak skill skips:** <what's not needed — e.g., "Audit, test-first, lessons check. Build + lint is sufficient.">

Running tweak skill now.
```

**Redirecting up to implement skill:**
```
## Redirecting → implement skill

**Requested:** <what was asked>
**Why not patch skill:** <specific reason — e.g., "This touches 6 files across 3 packages and needs a decision about which pattern to follow. patch skill doesn't have a plan step.">
**What implement skill adds:** <what the user gains — e.g., "Spec review, competing approaches, plan approval gate.">

Running implement skill now.
```

Then invoke the target command with the original arguments. Do not ask the user to re-invoke manually — hand off directly.

## Rules

- No subagents, no competing approaches
- No plan approval gate — but do audit existing code first
- Test first when behaviour is involved
- Full verification (build + lint + tests) is mandatory
- Scope guard is mandatory — escalate to `implement` skill if scope grows
- Update the project lessons or known-issues document if you learn something
- This skill does not update scope/todo documents unless the change completes a tracked item
