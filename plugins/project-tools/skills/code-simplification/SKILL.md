---
name: code-simplification
description: Use when working code is harder than necessary to understand, review, maintain, test, or change, and behavior must be preserved while reducing complexity.
---

# Code Simplification

## Routing

Use this after behavior works or during review when complexity is the problem. Use `code-style` for house-style drift, `strategic-refactor` for repo-wide refactor selection, `find-dead-code` for unused production code, and `test-driven-implementation` when behavior is still being built.

## Overview

Simplification is behavior-preserving refactoring for clarity. The goal is not fewer lines; the goal is less cognitive load, fewer moving parts, and a diff a reviewer can trust.

## When to Use

- A working implementation has deep nesting, unclear names, duplicated logic, or unnecessary indirection.
- Review finds complexity but not a behavior bug.
- A module grew under time pressure and now needs a cleanup pass.
- Tests are green and the next risk is maintainability.

Do not simplify code you do not understand. Do not simplify performance-critical code without measurements. Do not mix broad simplification with unrelated feature work.

## Workflow

1. **Understand the fence.** Identify what the code does, who calls it, what invariants it preserves, and which tests cover it.
2. **Pick one simplification.** Examples: guard clause, better name, extracted predicate, deleted wrapper, reduced duplication, smaller function.
3. **Check behavior preservation.** Confirm inputs, outputs, side effects, error behavior, ordering, and availability remain the same.
4. **Edit narrowly.** Change the smallest code area that makes the improvement.
5. **Verify.** Run the focused tests or build checks that cover the simplified code.
6. **Repeat only while value remains obvious.** Stop before the diff becomes a rewrite.

## Simplification Targets

| Signal | Better Shape |
|---|---|
| Three or more nested branches | Guard clauses or named predicates |
| Long function with multiple responsibilities | Small functions named by responsibility |
| Boolean flag arguments | Separate functions or options object |
| Generic names like `data`, `result`, `temp` | Domain names that explain the value |
| Wrapper that only forwards | Inline or delete if no boundary value remains |
| Repeated conditional logic | Shared predicate or small helper |
| Comments that restate code | Delete or replace with intent-focused names |

Keep comments that explain why a surprising constraint exists.

## Stop Conditions

Stop when:

- a simplification requires changing behavior;
- tests are missing and the behavior is too risky to infer;
- the code may be optimized for measured performance;
- the edit would cross ownership or architecture boundaries;
- the cleanup would exceed the requested scope.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Optimizing for line count | Optimize for comprehension and reviewability. |
| Removing an abstraction without knowing why it exists | Read callers, history, and tests first. |
| Simplifying adjacent code "while here" | Capture it separately unless it blocks the current cleanup. |
| Replacing local style with personal preference | Match the repo. |
| Refactoring without tests | Add characterization coverage or keep the change smaller. |

## Verification

- [ ] The simplified code preserves behavior.
- [ ] The diff is scoped to complexity reduction.
- [ ] Tests, build, or equivalent checks passed after the edit.
- [ ] Any skipped verification is explicit.
- [ ] The result is easier to read by a concrete criterion, not just shorter.
