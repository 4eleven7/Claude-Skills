---
name: evaluate-findings
description: Use when evaluating external feedback, code review comments, AI review output, dead-code reports, or suspected false positives. Classifies findings by evidence and confidence without applying fixes.
---

# Evaluate Findings

Confidence-based framework for evaluating external feedback. Spawn a Devil's Advocate agent to challenge non-trivial claims. Triage and classify findings — do not apply fixes.

## Responsibility

**Owns:** Classifying findings by confidence, verifying claims against actual code, spawning adversarial verification.
**Does NOT own:** Applying fixes (returns classified results for the caller to act on).

## Step 1: Assess Each Finding

For each finding:

1. **Read the referenced code** at the mentioned location — include the full function or logical block, not just the flagged line
2. **Verify the claim** against the actual code — does the issue genuinely exist?
3. **Assign confidence**:

| Level | Criteria | Verdict |
|-------|----------|---------|
| **High** (>80%) | Clear bug, missing check, obvious improvement, style violation matching project conventions | Accept |
| **Medium** (50-80%) | Likely valid but involves judgment calls or unclear project intent | Accept with caveats |
| **Low** (<50%) | Subjective preference, requires domain knowledge, might break things, reviewer may be wrong | Skip |

## Step 2: Devil's Advocate

### Spawn Condition

Spawn when there are **3 or more findings scored Medium or higher** that involve non-trivial claims — API behavior, correctness arguments, performance assertions, or anything not verifiable by reading the code alone.

**Skip** when all findings are clear-cut (typos, missing nil checks, style issues) or total count is 1-2 trivial items.

### Agent Instructions

Launch a single agent. Provide the challenge-worthy findings with file locations, claims, and initial verdicts. Instruct it to try to prove each finding wrong, or confirm it with evidence.

Research approach by claim type:

| Claim Type | Approach |
|------------|----------|
| API deprecated/changed | Check official API documentation via xcdocs skill, or WebSearch |
| Method doesn't exist / wrong signature | Grep codebase, check Apple docs |
| Code causes specific bug | Write minimal reproduction or trace the code path |
| Best practice claim | Check Apple documentation or WWDC sessions |
| persistence/persistence claim | Check the project persistence or migration policy and migration docs |

**Budget:** max 2 research actions per finding.

### Agent Verdicts

Per finding:
- **Confirmed** — found evidence supporting the claim (with source)
- **Disputed** — found counter-evidence (with source and explanation)
- **Inconclusive** — no definitive evidence either way

## Step 3: Reconciliation

Merge agent results with initial assessment:

- **Confirmed**: verdict stands, confidence may increase
- **Disputed**: if originally Accepted → downgrade to Skip or flag with both perspectives. Never silently override — show the disagreement.
- **Inconclusive**: verdict stands, note the uncertainty

Findings not investigated by the agent keep their original assessment.

## Step 4: Format Output

| File | Issue | Confidence | Verdict | Investigated |
|------|-------|------------|---------|--------------|

Where Investigated shows:
- *(empty)* — not investigated
- **Confirmed** (source) — supporting evidence found
- **Disputed: [reason]** — counter-evidence found

For disputed findings, add a callout below the table showing both perspectives.

## Rules

- Never auto-dismiss findings about security defaults, permission escalation, or fail-open behavior — even if the plan specifies different behavior. Plans can have incorrect security assumptions.
- If a finding references code that no longer exists, skip it and note that.
- If two findings conflict, skip both and document the conflict.
- For each finding, clarify whether the issue was introduced by the current changeset or is pre-existing.
- Pre-existing issues in earlier commits on the same feature branch are in-scope — the entire branch is one unit of work.
- The caller determines what to do with the evaluated findings. This skill only triages.
