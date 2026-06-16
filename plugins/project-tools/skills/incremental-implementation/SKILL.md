---
name: incremental-implementation
description: Use when implementing multi-file changes, large tasks, risky edits, or approved plans that need careful slicing, verification after each slice, and rollback-friendly progress.
---

# Incremental Implementation

## Routing

Use this skill for careful execution. Use `implement` for the broader approved-spec workflow, `test-driven-implementation` when independent behavioral tests must drive the change, `hypothesis-debug` when something is already failing, and `pr-shipping` when the work is ready to commit, push, or open a PR.

## Overview

Build one working slice at a time. Large unverified edits are fragile: when they fail, the failure surface is too wide to debug cheaply. Incremental implementation keeps every step small enough to understand, test, and revert.

## When to Use

- The change touches more than one file or module.
- A task feels too large to implement confidently in one pass.
- A plan has multiple acceptance criteria or dependencies.
- The change crosses UI, persistence, networking, build, or public contract boundaries.
- You are tempted to write a broad refactor before proving behavior.

Do not use for one-line edits, typo fixes, or mechanical file moves where normal verification is enough.

## Workflow

1. **Define the next slice.** Pick the smallest complete behavior or structural step. State what is in scope and what is explicitly out of scope.
2. **Read only the needed context.** Inspect the files, tests, docs, and call sites needed for that slice. Do not wander into unrelated cleanup.
3. **Add or identify proof.** Write a focused test first when behavior changes. For non-testable scaffolding, name the build, lint, or review evidence that proves it.
4. **Make the minimal edit.** Prefer the obvious implementation. Do not add abstractions for future slices unless the current slice needs them.
5. **Verify immediately.** Run the smallest meaningful check. If it fails, fix the slice before moving on.
6. **Review the diff.** Confirm the slice still does one thing, has no unrelated churn, and leaves the repo in a working state.
7. **Repeat.** Move to the next slice only after the current one is verified.

## Slicing Patterns

| Pattern | Use When | Shape |
|---|---|---|
| Vertical slice | User-visible behavior crosses layers | One end-to-end path with minimal UI/data/support |
| Risk-first slice | One unknown can invalidate the plan | Prove the risky integration or API first |
| Contract-first slice | Multiple callers depend on the same boundary | Define types/protocols/schema before consumers |
| Scaffold slice | Safe structure is needed before behavior | Add inert plumbing behind existing behavior |

## Stop Conditions

Stop and re-plan when:

- the slice cannot be described in one sentence;
- verification requires unrelated work;
- the change reveals a spec or architecture gap;
- a dependency, migration, permission, or destructive operation appears;
- failures repeat after a targeted fix and a different approach.

## Common Mistakes

| Mistake | Fix |
|---|---|
| "I'll test at the end" | Test while the failure surface is still small. |
| Mixing refactor and behavior | Split cleanup from behavior unless the cleanup is required for the slice. |
| Letting a slice grow | Stop, commit or checkpoint, then define the next slice. |
| Creating future-proof abstractions | Add the abstraction when the second or third real use proves it. |
| Touching nearby mess | Capture it with `capture-idea` or leave it alone. |

## Verification

- [ ] Each slice had a clear scope.
- [ ] Behavior-changing slices had focused tests or an explicit reason tests were not applicable.
- [ ] Verification ran after each meaningful edit.
- [ ] The final diff contains no unrelated cleanup.
- [ ] Remaining work, skipped checks, or blockers are explicit.
