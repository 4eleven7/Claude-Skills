---
name: strategy-audit
description: Use when proposing, reviewing, or choosing a strategy, plan, architecture, migration, rollout, or confidence claim.
---

# Strategy Audit

## Routing

Use to stress-test an approach, migration, rollout, architecture choice, or confidence claim. Use `debate` to compare competing options, `plan` to persist a chosen plan, and `implement` after the strategy is settled.

Stress-test and repair a strategy until it is factually reliable, or until the exact blocker is exposed.

## Trigger Boundary

Use this for strategy, plan, architecture, confidence, loophole, edge-case, and failure-mode language. Also treat obvious misspellings such as "startegy" as "strategy".

This is a skill, not a global policy. If the user wants this behaviour for every answer regardless of topic, the core rule belongs in project or global instructions.

## Core Rule

Do not claim 100% confidence unless the claim is tightly scoped, all required facts are verified, and no material assumptions remain unresolved.

In most strategy work, state what is known, what is assumed, what remains uncertain, and what evidence would close the gap.

This is a confidence-seeking repair loop, not a reporting template. The question it repeatedly asks is:

> Am I factually 100% confident in this strategy as scoped?

If the answer is no, find the loopholes, failure modes, edge cases, hidden dependencies, stale facts, unclear ownership, reversibility problems, and verification gaps that prevent factual confidence. Then propose or apply proper fixes and run the loop again against the revised strategy.

If a material issue can be fixed, verified, guarded, tested, documented, or otherwise resolved with the tools and authority available in the current task, do that work before answering. Do not stop at "here are the risks" unless the issue is genuinely blocked.

"100% confidence is impossible" is not an acceptable shortcut. First tighten the scope to the claim that can be verified, eliminate or verify assumptions, and keep looping. Only stop below factual 100% confidence when a specific missing fact, permission, environment, credential, owner, or user decision blocks progress.

## Audit Loop

Before finalizing a strategy, run this loop:

1. State the strategy in one paragraph.
2. Ask: "Am I factually 100% confident this strategy is correct and complete for its stated scope?"
3. If yes, list the evidence that makes it factually verified.
4. If no, list every material reason confidence is below 100%: assumptions, loopholes, failure modes, edge cases, hidden dependencies, stale facts, unclear ownership, migration risks, reversibility problems, and verification gaps discoverable from the available context.
5. For each material issue, take the smallest concrete resolving action available:
   - revise the strategy;
   - read the relevant source of truth;
   - run the relevant command, test, lint, build, query, or current-source check;
   - add a guardrail, validation step, rollout constraint, owner, rollback path, or monitoring check;
   - make the required implementation or documentation change when the user's request authorizes that scope.
6. Record the proper fix, the evidence, or the remaining blocker for each issue.
7. Re-run the confidence question against the revised strategy and repeat the loop.
8. Stop only when the answer is factually 100% confident for the stated scope, or when the remaining issue is blocked by missing information, missing authority, unavailable credentials/environment, or scope expansion that needs user approval.

Do not loop indefinitely. If repeated passes find only the same blocked unknowns, stop, name the blocker, and ask for the missing fact or decision.

Do not treat "mark it as a residual risk" as resolution when direct action is available. Residual risk is only valid after attempted resolution is impossible, disproportionate to the request, or outside the user's authorized scope. A strategy with residual material risk is not factually 100% confident.

## Progress Standard

Each pass after the first must change at least one of these:

- the strategy;
- the implementation;
- the documentation/spec;
- the verification evidence;
- the guardrails or rollout plan;
- the explicit blocker list.

If a pass changes none of those, the loop has stalled. Stop and report the blocker instead of restating the same audit.

## Rationalization Traps

Do not use these excuses:

- **"High confidence is enough"** — The target is factual 100% confidence for the stated scope. If the loop cannot reach it, state the blocker.
- **"I found risks, so the audit is done"** — Finding risks is the start. Resolve them, revise the strategy, verify facts, or identify the blocker.
- **"The user only asked for a strategy"** — This skill triggers before presenting strategy. Run the loop first, then present the repaired strategy.
- **"This would take too long"** — Narrow the claim, use the smallest verification step, and continue. Stop only on a real blocker or disproportionate scope.
- **"Residual risk is acceptable"** — It is acceptable only when explicitly blocked or outside authorized scope, and then confidence must be below factual 100%.
- **"One pass found issues, so I can answer"** — Re-run the confidence question after fixes. A single pass is valid only if it reaches factual 100% confidence or exposes a blocker.
- **"I can assert the fix is enough"** — Evidence is required: read files, executed commands, tests, official docs, current sources, or clearly bounded reasoning tied to verified facts.

## Mini Pressure Test

If checking whether this skill is working, use this scenario:

> "Are you 100% confident in the migration plan?"

A compliant response must:

1. Restate the scoped migration plan.
2. Ask whether factual 100% confidence is justified.
3. Find concrete blockers to confidence, not generic caveats.
4. Fix, verify, guard, or narrow each blocker.
5. Repeat until factual 100% confidence is supported by evidence, or until a named blocker remains.
6. Avoid claiming factual 100% confidence when any material residual risk remains.

A non-compliant response lists risks once, says "mostly confident," recommends next steps without doing available verification, or treats residual risk as closure.

## Confidence Standard

Use precise confidence language:

| Level | Meaning |
|---|---|
| Factually 100% confident | Fully constrained to the stated scope, with every material assumption verified or eliminated by direct evidence from read files, executed commands, official docs, tests, or current external sources. |
| High | Material assumptions are verified or safely bounded; remaining risks are low impact or reversible. |
| Medium | Plausible, but depends on assumptions, incomplete context, or unverified integration behaviour. |
| Low | Unresolved correctness, safety, performance, migration, or ownership risk remains. |

Coherence is not evidence. A strategy can sound tidy and still be wrong.

High confidence is not the target state of this skill. If the user asked for 100% confidence and the loop only reaches High, say exactly why factual 100% confidence is blocked.

## Required Output Shape

When the user asks for a strategy or confidence check, answer with:

```markdown
## Strategy
[Revised strategy]

## Loopholes Closed
- [Issue] -> [Action taken / fix / evidence]

## Residual Risks
- [Risk] -> [Why it remains / how to close it]

## Confidence
[Factually 100% confident / High / Medium / Low] - [short reason]
```

If no loopholes are found, say that explicitly and name the evidence checked.

If you changed files, commands, tests, rollout steps, or ownership assignments during the loop, include them under `Loopholes Closed`. If you are blocked before reaching factual 100% confidence, replace `Loopholes Closed` with `Blocked On` and name the specific missing fact, permission, environment, or user decision.

## Hard Stops

Stop and ask for missing information when:

- A material assumption cannot be verified from available context or acceptable sources.
- The strategy depends on a business constraint, user preference, credential, environment, or production fact that is unavailable.
- Fixing the issue would require an architectural change, new pattern, or scope expansion the user did not ask for.

## Bluntness

If the strategy is fragile, say so directly. Explain the failure mode and the smallest concrete fix.
