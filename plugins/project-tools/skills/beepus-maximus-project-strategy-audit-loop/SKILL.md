---
name: strategy-audit-loop
description: Use when proposing, reviewing, or choosing a strategy, plan, architecture, implementation approach, migration, rollout, or when asked about confidence, loopholes, failure modes, edge cases, residual risk, or whether a strategy is sound.
---

# Strategy Audit Loop

Stress-test a strategy before presenting it as reliable.

## Trigger Boundary

Use this for strategy, plan, architecture, confidence, loophole, edge-case, and failure-mode language. Also treat obvious misspellings such as "startegy" as "strategy".

This is a skill, not a global policy. If the user wants this behaviour for every answer regardless of topic, the core rule belongs in project or global instructions.

## Core Rule

Do not claim 100% confidence unless the claim is tightly scoped, all required facts are verified, and no material assumptions remain unresolved.

In most strategy work, state what is known, what is assumed, what remains uncertain, and what evidence would close the gap.

## Audit Loop

Before finalizing a strategy:

1. State the strategy in one paragraph.
2. List the assumptions it depends on.
3. Identify material loopholes, failure modes, edge cases, hidden dependencies, stale facts, unclear ownership, migration risks, reversibility problems, and verification gaps discoverable from the available context.
4. For each material issue, either fix the strategy, verify the fact, add a guardrail, add a validation step, or mark it as an explicit residual risk.
5. Re-run the audit against the revised strategy.
6. Stop when another pass finds no material unresolved issue, or when progress is blocked by missing information.

Do not loop indefinitely. If repeated passes find only the same blocked unknowns, stop, name the blocker, and ask for the missing fact or decision.

## Confidence Standard

Use precise confidence language:

| Level | Meaning |
|---|---|
| Factually verified | Supported by direct evidence from read files, executed commands, official docs, tests, or current external sources. |
| High | Material assumptions are verified or safely bounded; remaining risks are low impact or reversible. |
| Medium | Plausible, but depends on assumptions, incomplete context, or unverified integration behaviour. |
| Low | Unresolved correctness, safety, performance, migration, or ownership risk remains. |

Coherence is not evidence. A strategy can sound tidy and still be wrong.

## Required Output Shape

When the user asks for a strategy or confidence check, answer with:

```markdown
## Strategy
[Revised strategy]

## Loopholes Closed
- [Issue] -> [Fix/evidence]

## Residual Risks
- [Risk] -> [Why it remains / how to close it]

## Confidence
[Factually verified / High / Medium / Low] - [short reason]
```

If no loopholes are found, say that explicitly and name the evidence checked.

## Hard Stops

Stop and ask for missing information when:

- A material assumption cannot be verified from available context or acceptable sources.
- The strategy depends on a business constraint, user preference, credential, environment, or production fact that is unavailable.
- Fixing the issue would require an architectural change, new pattern, or scope expansion the user did not ask for.

## Bluntness

If the strategy is fragile, say so directly. Explain the failure mode and the smallest concrete fix.
