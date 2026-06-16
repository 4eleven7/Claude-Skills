---
name: idea-refine
description: Use when a raw idea, feature concept, product direction, or speculative improvement needs divergent exploration, assumption testing, convergence, and a concrete next-step artifact.
---

# Idea Refine

## Routing

Use this when the user has an idea but the shape is still open. Use `interview-me` when the real intent is unclear, `design` when the output should become an approved visual or interaction direction, `user-test` when evaluating a known idea against personas, and `spec-workflow` when the direction is ready to become a specification.

## Overview

Refine an idea by deliberately widening the solution space, then narrowing it to a crisp direction. The output is not a brainstorm dump. It is a decision-ready one-pager with assumptions, scope, and what not to build.

## When to Use

- The user says "refine this idea", "ideate", "what could this become", "stress-test this concept", or similar.
- The idea is promising but vague.
- There are multiple plausible product directions and choosing too early would be lazy.
- The team needs assumptions and non-goals before writing a spec.
- A deferred idea from `capture-idea` is ready for deeper exploration.

Do not use when the user already has a concrete requirement and wants implementation. Do not use as a substitute for user research or source-backed technical validation.

## Workflow

1. **Frame the idea.** Restate it as a "How might we..." problem with target user, problem, and desired change. If any of those are missing, ask one targeted question before ideating.
2. **Generate a small option set.** Produce 4-6 meaningfully different directions. Use lenses such as simplification, inversion, audience shift, constraint removal, combination, and risk-first MVP.
3. **Attach tradeoffs.** For each direction, state what it unlocks, what it costs, and the assumption it depends on.
4. **Converge.** Recommend one direction and explain why. Do not hide behind "all are viable".
5. **Ask for reaction.** Ask the user which direction resonates and what feels wrong. If their answer changes the frame, revise the recommendation instead of defending the first one.
6. **Produce a one-pager.** Once the user confirms the direction, write the artifact below.

## Output Artifact

```markdown
# [Idea Name]

## Problem
[One sentence: who has what problem and why it matters now.]

## Recommended Direction
[The chosen direction and why.]

## Why This, Not the Others
[The key tradeoff that made this direction win.]

## Assumptions to Validate
- [ ] [Assumption] - [small validation step]

## MVP Scope
- [Included]
- [Included]

## Not Doing
- [Excluded] - [why]

## Next Step
[interview-me | user-test | spec-workflow | design | capture-idea]
```

Ask before saving the artifact. If the repo has a known idea backlog, prefer that location; otherwise ask where it should live.

## Option Quality Rules

- Options must be meaningfully different, not five names for the same idea.
- Include at least one simpler version.
- Include at least one version that challenges the user's original framing.
- Keep the set small enough to decide from.
- Make the recommendation explicit.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Listing 20 shallow ideas | Generate 4-6 strong directions with tradeoffs. |
| Treating every idea as good | Say when an idea is weak and why. |
| Skipping the target user | No user means no product judgment. |
| Producing a spec too early | First decide the direction and assumptions. |
| Ignoring existing repo constraints | Read relevant local docs/code when inside a project. |

## Verification

- [ ] The target user and problem are explicit.
- [ ] Multiple genuinely different directions were explored.
- [ ] Each direction includes tradeoffs and assumptions.
- [ ] A recommendation was made.
- [ ] The user confirmed or corrected the direction.
- [ ] The final artifact includes MVP scope and Not Doing.
