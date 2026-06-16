---
name: doubt-driven-development
description: Use when a non-trivial implementation decision, hypothesis, safety claim, migration, or architecture choice needs adversarial review before it becomes code or shipping guidance.
---

# Doubt-Driven Development

## Routing

Use this for hypothesis implementation and high-stakes decision pressure-testing. Use `strategy-audit` for full strategy confidence checks, `independent-review` for external review of completed changes, `code-review` for finished diffs, and `hypothesis-debug` for already-observed bugs.

## Overview

A coherent hypothesis is not evidence. Before implementing or shipping a non-trivial claim, isolate the claim, try to disprove it, and only proceed after the failure modes are handled or explicitly blocked.

## When to Use

- The implementation depends on an assumption the compiler or tests do not prove.
- A choice affects persistence, permissions, money, security, privacy, public APIs, migrations, or irreversible data.
- You are about to say "this is safe", "this scales", "this cannot happen", or "this matches the spec".
- You are working in unfamiliar code and the apparent fix seems too easy.
- A plan is based on a hypothesis that needs implementation.

Do not use for mechanical edits, formatting, renames, or unambiguous user-directed changes with low blast radius.

## Workflow

1. **State the claim.** Write the implementation hypothesis in two or three lines.
2. **Name the contract.** Define what must remain true: inputs, outputs, invariants, owners, persistence rules, user-visible behavior, and rollback requirements.
3. **Extract the artifact.** Use the smallest reviewable unit: a proposed diff, function, protocol, schema change, or decision paragraph. Keep your reasoning separate.
4. **Attack the artifact.** Review it as if the author is overconfident. Look for hidden assumptions, edge cases, invalid states, missing owners, stale facts, concurrency problems, and verification gaps.
5. **Reconcile findings.** Classify each issue as valid/actionable, valid tradeoff, contract gap, or noise. Fix actionable issues before proceeding.
6. **Re-run or stop.** Repeat only if the artifact changed materially. Stop when remaining issues are low-impact, explicitly accepted, or blocked by missing information.

## Adversarial Prompt

Use this when asking a subagent, another model, or a fresh local pass to review the artifact:

```text
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident.

Look for unstated assumptions, edge cases, hidden coupling, invalid states,
contract violations, stale facts, missing verification, and failure modes.

Do not validate. Do not summarize. Return concrete issues only, or state that
you cannot find any after review.

CONTRACT:
[paste contract]

ARTIFACT:
[paste artifact]
```

Do not include your preferred answer in the prompt. That biases the review.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reviewing the whole project | Extract the smallest artifact that carries the claim. |
| Asking "does this look good?" | Ask what is wrong with it. |
| Treating reviewer output as truth | Validate every finding against source code and the contract. |
| Marking risks without action | Fix, guard, test, narrow, or name the blocker. |
| Looping forever | Stop after material issues are resolved or the same blocker repeats. |

## Verification

- [ ] The claim and contract are explicit.
- [ ] The artifact is small enough to review accurately.
- [ ] At least one adversarial pass was performed.
- [ ] Every material issue was fixed, guarded, tested, narrowed, or named as blocked.
- [ ] The final answer states remaining assumptions and confidence level.
