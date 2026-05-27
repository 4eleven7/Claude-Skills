---
name: hypothesis-debug
description: Debug and fix a bug end-to-end using reproduction, hypotheses, evidence, a minimal fix, regression coverage, and verification.
---

# Hypothesis Debug

Use this skill when the task is to **debug and fix** a bug, failing test, regression, crash, or unexpected behaviour.

This skill owns the full loop: reproduce -> diagnose -> fix -> prove -> verify. For diagnosis-only work where no edits should be made, use `deep-investigate`.

## Boundary

**Use `hypothesis-debug` when:**
- The user expects the bug to be fixed in this session.
- A failing test, crash, build failure, or behaviour bug needs a root-cause fix.
- The cause is not obvious after a quick read.
- The fix should include proof and verification.

**Use `deep-investigate` instead when:**
- The user asks only for root cause, forensics, or an investigation report.
- The failure is broad, intermittent, or poorly scoped and needs diagnosis before edits.
- You need read-only parallel investigation, hidden mutation audit, or causal-chain analysis before deciding whether to change code.

**Use a platform-specific debugging skill as supporting context when:**
- The bug depends on a platform debugger, runtime diagnostics, profiler, simulator, device logs, or framework-specific behaviour.

## Context

Before changing code, read only the context that exists and applies:

- Project instructions and workflow docs.
- Testing requirements, if the project documents them.
- Relevant specifications or acceptance criteria, if the bug is behavioural.
- Past lessons, known gotchas, or issue history, if the project keeps them.
- The failing test, stack trace, logs, or user-provided reproduction.

Do not invent required files. If a repository does not have a docs/specs/lessons convention, proceed from code, tests, and user evidence.

## Phase 1: Reproduce And Triage

Gather facts before forming opinions.

1. **Reproduce** the failure with the smallest available command, test, script, UI path, or log-backed scenario.
2. **Record expected vs actual behaviour.**
3. **Identify scope:** affected module, layer, files, inputs, outputs, and recent changes.
4. **Classify the track:**

| Signal | Track |
|---|---|
| Single-file typo, obvious compiler error, clear assertion | Quick-track |
| Failing test with direct assertion and obvious code path | Quick-track |
| Multi-file, timing-dependent, data-dependent, or intermittent | Deep-track |
| State corruption, persistence mismatch, hidden mutation, or stale cache | Deep-track |
| "It used to work" without an obvious change | Deep-track |

Quick-track still needs a hypothesis and proof. It just does not need a large investigation journal.

## Phase 2: Hypotheses

For quick-track bugs, write one falsifiable hypothesis.

For deep-track bugs, create a hypothesis journal before investigating:

```markdown
## Hypothesis Journal

### Facts
- Observed:
- Expected:
- Reproduction:
- Recent changes:

### Hypotheses
| # | Hypothesis | Confirmed If | Refuted If | Status |
|---|---|---|---|---|
| 1 |  |  |  | TESTING |
| 2 |  |  |  | PENDING |

### Investigation Log
- [action] -> [result]
```

Rules:
- Deep-track debugging needs at least two hypotheses before investigating.
- Each hypothesis must name the evidence that would confirm or refute it.
- Prioritize the most likely hypothesis, but do not tunnel-vision.
- Update the journal after each investigation step.

## Phase 3: Investigate

Use the smallest check that can confirm or eliminate the current hypothesis:

| Need | Action |
|---|---|
| Recent regression | Inspect recent commits or diffs for relevant files. |
| Ownership or intent | Inspect blame/history and surrounding comments/docs. |
| Call path | Trace callers from entry point to failure. |
| Data flow | Trace input -> transformation -> storage/cache -> output. |
| Similar working behaviour | Compare against a working analogue in the same codebase. |
| Hidden mutation | Audit observers, lifecycle callbacks, background tasks, caches, scheduled work, property wrappers, and persistence hooks. |
| Timing or async failure | Replace arbitrary sleeps with condition-based waits where practical. |
| Environment dependency | Check configuration, dependencies, runtime environment, and test setup. |

If independent hypotheses can be investigated in parallel by available agents, do that read-only. Sub-investigations must not edit files, stage files, or commit.

If all hypotheses are eliminated, generate new hypotheses from the evidence. After three investigation rounds without progress, stop and report the blocker instead of guessing.

## Phase 4: Fix

Once the cause is confirmed:

1. Write or identify a proof that fails for the bug. Prefer a regression test. If a test is impractical, use the smallest command, assertion, log, or reproduction that proves the failure.
2. Run the proof and confirm it fails for the right reason.
3. Implement the smallest root-cause fix.
4. Remove temporary instrumentation.
5. Run the proof again and confirm it passes.
6. Run the affected test/build/lint checks required by the project.

Do not refactor unrelated code. Do not keep speculative cleanup inside a bug fix.

## Phase 5: Related-Issue Scan

After the fix, search for the same failure pattern elsewhere:

1. Name the root-cause pattern.
2. Search for similar code structures or data paths.
3. Report related instances with file references.
4. Do not fix separate bugs without user approval.

## Output

```markdown
## Debug Report

### Root Cause
[What failed and why.]

### Evidence
- Reproduction:
- Confirmed hypothesis:
- Proof before fix:
- Proof after fix:

### Fix
- Files changed:
- Regression coverage:
- Verification:

### Related Issues
- [None / file:line findings]

### Follow-Up
- [Spec/docs/lessons/backlog updates if warranted]
```

## Hard Rules

- Never guess-edit. Write the hypothesis first.
- Fix the root cause, not the symptom.
- Prefer a regression test before the fix; if impossible, state the proof used instead.
- Do not claim the bug is fixed until the proof passes.
- Keep the fix scoped to the bug.
- Record durable lessons only when the project has a place for them.
