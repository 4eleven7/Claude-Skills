---
name: interview-me
description: Use when an ask, idea, feature, plan, or product direction is underspecified and the user wants guided questions, multiple-choice tradeoffs, recommended defaults, or collaborative scope shaping before specs or implementation.
---

# Interview Me

## Routing

Use this before `idea-refine`, `spec-workflow`, `design`, or `implement` when intent is still unclear. Use `idea-refine` when the user wants divergent concept exploration. Use `strategy-audit` when a concrete strategy already exists and needs stress-testing. Use `user-test` when the main question is how personas would react.

## Overview

Interview the user into a clearer decision. This is not a passive survey and not an interrogation. Ask short questions with 2-3 concrete choices, recommend the option you would pick, and revise the frame when the user's answers reveal a better direction.

The goal is a confirmed intent statement: what to build, for whom, why, what success means, what is out of scope, and what useful adjacent inclusion might strengthen the work.

## When to Use

- The request is missing user, outcome, success criteria, constraints, or non-goals.
- The user asks to be interviewed, grilled, guided, or helped to decide.
- The user has a vague idea but does not need a full ideation pass yet.
- The answer depends on tradeoffs the user has not chosen.
- You are about to guess.

Do not use when the request is already precise, mechanical, or time-sensitive enough that questioning would be waste.

## Workflow

### Step 1: State the Current Read

Start with one sentence and a confidence level:

```markdown
Current read: [what I think you want].
Confidence: [low | medium | high] - missing [specific missing pieces].
```

If confidence is high, ask whether to skip the interview and proceed. If confidence is low or medium, continue.

### Step 2: Ask One Multiple-Choice Question

Ask one question at a time. Use 2-3 choices. Mark the recommended choice first unless there is no defensible recommendation.

```markdown
**Question:** [focused question]

**A. [Recommended choice]** - [tradeoff]
**B. [choice]** - [tradeoff]
**C. [choice]** - [tradeoff]

My lean: [A/B/C] because [one sentence].
```

The user can still answer in free text. Treat free-text answers as higher signal than the options.

### Step 3: Interpret the Answer

After each answer, update the frame before asking the next question:

```markdown
That changes my read: because you chose [X], I would change [old assumption] to [new assumption].
```

When useful, propose an adjacent inclusion:

```markdown
Given that, [W] may be worth including because it builds on [Y]. I would include it only if [constraint].
```

Do not stack many suggestions. One pivot or inclusion per turn is enough.

### Step 4: Challenge Polite Agreement

If the user repeatedly accepts your recommended options without refinement, check for anchoring:

```markdown
Quick anchor check: if I had not recommended [A], would you still have picked it, or are you accepting my framing?
```

Use this earlier when the choice is high-impact.

### Step 5: Restate and Confirm

When the answers converge, restate the intent with origin labels:

```markdown
Here is what I think we landed on:

- Outcome: [line] (from your answer)
- User: [line] (from your answer)
- Success: [line] (from your answer)
- Constraint: [line] (my recommendation, you accepted)
- Include: [line] (my suggestion, you confirmed)
- Out of scope: [line] (inferred from tradeoff, confirm)

Confirm / refine / reject?
```

Do not proceed to a spec or implementation until the user explicitly confirms or the task is low-risk and the remaining assumptions are clearly stated.

## Question Design

Good questions force a tradeoff:

| Weak | Better |
|---|---|
| "What do you want?" | "Should this optimize for speed of first version, long-term flexibility, or polish?" |
| "Who is it for?" | "Is the first user you, your team, or an external customer?" |
| "What features?" | "Is the MVP a narrow tool that solves one painful workflow, or a broader surface that proves the product direction?" |

Avoid asking more than one question per turn unless the user explicitly asks for a batch.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Asking open-ended questions only | Offer 2-3 concrete choices with tradeoffs. |
| Making the user do all product thinking | Give a lean and explain it. |
| Letting your lean become the user's intent | Run anchor checks and label origin in the restate. |
| Asking a long questionnaire | One question per turn. Adapt based on the answer. |
| Never suggesting adjacent value | When an answer reveals a natural inclusion, propose it with a constraint. |
| Jumping to spec | Confirm intent first. |

## Verification

- [ ] The first turn stated current read and confidence.
- [ ] Questions were asked one at a time.
- [ ] Questions used 2-3 concrete options with tradeoffs.
- [ ] The agent gave a recommendation when it had enough context.
- [ ] At least one frame update, pivot, or inclusion was proposed when the user's answer justified it.
- [ ] Anchoring was checked when the user accepted recommendations without pushback.
- [ ] The final restate separated user answers from agent proposals.
- [ ] The user confirmed, refined, or rejected the restate before downstream work began.
