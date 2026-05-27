---
name: deep-investigate
description: Diagnose a specific root cause without applying fixes. Use for read-only investigation, causal-chain analysis, and evidence-backed reports.
---

# Deep Investigate

Use this skill to find a **specific root cause** and produce an evidence-backed investigation report. This skill is read-only by default.

For end-to-end bug fixing, use `hypothesis-debug`.

## Responsibility

**Owns:**
- Root-cause analysis.
- Reproduction and evidence gathering.
- Hypothesis generation and testing.
- Causal-chain tracing.
- Hidden mutation and side-effect audits.
- Investigation reports with confidence and proof steps.

**Does NOT own:**
- Applying fixes.
- Refactoring.
- Staging, committing, or shipping changes.
- Editing tests except when the user explicitly asks for an experimental proof.

## Step 1: Characterize

Build a bug packet:

- Symptom.
- Expected behaviour.
- Actual behaviour.
- Reproduction steps, if known.
- Environment and configuration, if relevant.
- Scope of impact.
- Evidence already available.
- What is not yet proven.

Classify the problem:

| Signal | Type |
|---|---|
| Stack trace or crash | Runtime error |
| Test assertion failure | Test failure |
| Build or compiler error | Build/type error |
| Slow execution, high resource use, leak, hang | Performance/resource issue |
| Wrong output with no exception | Behaviour bug |
| State changes unexpectedly | State or persistence bug |
| Intermittent failure | Timing, concurrency, or environment issue |

Establish the smallest reproduction or state why reproduction is unavailable.

## Step 2: Isolate

Narrow from "something is wrong" to "the problem is probably here."

Use the evidence that fits the failure:

- Read the full throwing/failing function and its callers.
- Read the test and the system under test.
- Inspect recent changes around the failure.
- Trace data from input to observed output.
- Trace state ownership and competing writers.
- Check configuration, dependency, environment, and test setup.

When the bug manifests deep in the stack, trace backward:

1. Observe the symptom.
2. Find the immediate bad state or failing operation.
3. Read the caller and its inputs.
4. Continue until the first unintended side effect or wrong assumption.
5. Identify the correct layer to fix later.

## Step 3: Hidden Side-Effect Audit

Treat non-explicit writes and background behaviour as suspicious until proven irrelevant.

Audit sources such as:

- Observers and subscriptions.
- Lifecycle callbacks.
- Background jobs and scheduled work.
- Caches and memoized state.
- Persistence hooks and migrations.
- Property wrappers or reactive state containers.
- Async streams, timers, queues, and task cancellation.
- Notification/event handlers.

For each suspect, ask:

- Is this side effect intentional?
- Can it race with another writer?
- Does it update the canonical source of truth?
- Does another layer assume different ownership?

## Step 4: Pattern Analysis

Find a working analogue in the same codebase when possible.

Compare working vs broken:

- Inputs and defaults.
- Ordering.
- Threading or async boundaries.
- Configuration.
- Dependencies.
- Error handling.
- Ownership of state.
- Test setup.

Small differences are evidence. Do not dismiss them until checked.

## Step 5: Hypothesize

Generate two to four falsifiable hypotheses:

```markdown
| # | Hypothesis | Confirmed If | Refuted If | Verdict |
|---|---|---|---|---|
| 1 |  |  |  | testing |
| 2 |  |  |  | pending |
```

If hypotheses are independent and the runtime supports agents, investigate them in parallel. Parallel investigations are read-only and must report evidence, missing evidence, smallest proof step, and confidence.

## Step 6: Test Hypotheses

Use minimal, targeted checks:

- Search for usage or patterns.
- Read surrounding code.
- Inspect recent changes.
- Run the smallest relevant test or reproduction.
- Add temporary logging only if needed and remove it afterward.
- Check dependency or environment assumptions.

Record each result as confirmed, refuted, or inconclusive.

For async or timing-sensitive failures, prefer condition-based waiting over arbitrary sleeps. Wait for the real condition, not a guessed duration.

If all hypotheses fail, summarize what was learned and loop once. After two full failed cycles, report the blocker instead of guessing.

## Step 7: Causal Chain

When a cause is identified, describe:

- Expected behaviour.
- Violated invariant.
- First divergence.
- Immediate failure.
- Canonical owner of the affected state.
- Competing owners or side effects.
- Evidence that rules out major alternatives.

## Report

```markdown
## Investigation Report

### Problem
[One-line description.]

### Root Cause
[Confirmed cause, or "unresolved" with best current hypothesis.]

### Causal Chain
- Expected:
- Invariant:
- First divergence:
- Immediate failure:
- Correct layer to fix:

### Evidence
- [Evidence with file/command/test references.]

### Hypotheses Tested
| Hypothesis | Verdict | Evidence |
|---|---|---|

### Confidence
[High / Medium / Low] - [why]

### Fastest Proof Step
[Smallest check that would increase confidence or verify a future fix.]

### Suggested Fix Direction
[What to change later, without applying it now.]
```

## Hard Rules

- Stay read-only unless explicitly asked to fix.
- Do not present a plausible story as confirmed evidence.
- Do not stop at the symptom; trace to the first divergence.
- State unresolved assumptions plainly.
- If blocked, name the missing evidence or access needed.
