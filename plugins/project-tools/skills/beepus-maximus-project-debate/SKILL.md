---
name: debate
description: Use when comparing approaches, weighing alternatives, choosing between options, arguing for or against a decision, or evaluating technical, product, architecture, or process tradeoffs.
---

# Debate — Multi-Persona Structured Discussion

Spawn 2-3 agents with distinct personas to argue, rebut, and converge on a recommendation. Works for code techniques, architecture, product decisions, and opinions — not just facts.

## When to Use

- Binary or multi-way decisions ("microservices vs monolith", "combine routines and chores or split them?")
- Architecture trade-offs ("coordinator pattern vs NavigationStack-driven routing")
- Product questions ("should routine + chores be 1 feature or multiple?")
- Technique evaluation ("TDD vs test-after for UI code")
- Opinion-forming ("is this abstraction worth the complexity?")

## Arguments

`$ARGUMENTS` — The question, decision, or topic to debate.

If `$ARGUMENTS` is empty, ask the user what they want debated.

## Step 1: Frame the Debate

Analyze the topic and determine:

1. **Debate type**:

| Type | When | Positions |
|------|------|-----------|
| **Binary** | Clear A vs B choice | 2 advocates + 1 judge |
| **Multi-option** | 3+ viable approaches | 1 advocate per option (max 3) |
| **Open question** | No obvious sides | 3 perspectives exploring the space |

2. **Domain**: Code/architecture, product/UX, process/workflow, or general
3. **Persona selection**: Choose personas that bring genuinely different lenses to this specific question. Do NOT use generic "pro/con" — each persona should have a name, role, and reasoning style.

### Persona Design

Select personas that create productive tension. Each persona needs:

- **Name and role** — A concrete identity (not "Agent A")
- **Lens** — What they optimise for and why
- **Blind spot** — What they tend to underweight (forces intellectual honesty)

**Examples by domain:**

| Domain | Persona Examples |
|--------|-----------------|
| Architecture | Pragmatic Shipping Engineer (ships fast, pays debt later) vs Systems Purist (correctness first) vs Maintenance Engineer (lives with the code 2 years from now) |
| Product | Power User Advocate vs New User Champion vs Business/Revenue Strategist |
| Process | Move-Fast Pragmatist vs Quality Gate Advocate vs Team Dynamics Observer |
| Platform/API design | API Minimalist (smallest surface area) vs Discoverability Advocate (explicit, verbose) vs Platform Insider (native conventions and ecosystem fit) |

## Step 2: Opening Arguments (Parallel)

Launch all debate agents in parallel if the runtime supports it; otherwise run them sequentially with the same prompts. Each agent receives:

```
You are {PERSONA_NAME}, a {PERSONA_ROLE}.

Your lens: {WHAT_YOU_OPTIMISE_FOR}
Your known blind spot: {WHAT_YOU_UNDERWEIGHT}

DEBATE TOPIC: {TOPIC}

You are arguing for: {POSITION_OR_PERSPECTIVE}

{If the topic references code or files in the current project, include relevant
file contents or architecture context so the persona can reason concretely.}

Provide your opening argument. Structure your response EXACTLY as:

## Position
State your position in 1-2 sentences.

## Key Arguments
3-5 numbered arguments, each with:
- The claim
- Supporting evidence or reasoning
- What this enables or prevents

## Assumptions
List 2-3 assumptions your position depends on. Be honest about these.

## Risks of My Position
2-3 genuine risks or downsides of what you're advocating. Do NOT sandbag — acknowledge real weaknesses.

## What Would Change My Mind
1-2 specific conditions or evidence that would make you switch sides.

## Confidence: X%
Your honest confidence that your position is the best path forward (0-100%).
```

**Important:** Each agent should read relevant project files if the debate topic is about the current codebase. Include file paths in the prompt.

### Present Opening Arguments

After all agents return, present the opening arguments to the user:

```
## Debate: {TOPIC}

### Participants
| Persona | Role | Arguing For |
|---------|------|-------------|
| {Name} | {Role} | {Position} |
| ...     | ...  | ...         |

---

### Round 1: Opening Arguments

#### {Persona 1 Name} — {Role}
> {Position statement}

**Arguments:**
{numbered list}

**Assumptions:** {list}
**Risks acknowledged:** {list}
**Would change mind if:** {conditions}
**Confidence:** X%

---

#### {Persona 2 Name} — {Role}
{same structure}

---
```

## Step 3: Rebuttals (Sequential)

Launch a **single rebuttal round** where each persona responds to the others. Run agents in parallel if available; otherwise run them sequentially. Each receives ALL opening arguments:

```
You are {PERSONA_NAME}, a {PERSONA_ROLE}.

You argued for: {YOUR_POSITION}
Your opening argument: {YOUR_OPENING}

Here are the other arguments you must respond to:

{PERSONA_2_NAME} argued: {THEIR_OPENING}
{PERSONA_3_NAME} argued: {THEIR_OPENING}  (if 3 participants)

Now provide your rebuttal. Structure EXACTLY as:

## Strongest Opposing Point
Which single argument from your opponents is the most compelling, and why?

## Rebuttal
Address each opponent's key arguments. For each:
- Concede what is genuinely valid
- Challenge what you disagree with (with reasoning, not just assertion)
- Identify unstated assumptions in their position

## Revised Position
Has your position shifted after hearing the arguments? If so, how?
If not, what would it take?

## Updated Confidence: X%
Your confidence now, after hearing the other side(s). It is OK — and expected — for this to change.

## Agreement Areas
List specific points where you and your opponents actually agree, even if your top-level positions differ.
```

### Present Rebuttals

```
### Round 2: Rebuttals

#### {Persona 1 Name} responds
**Strongest opposing point:** {concession}
**Rebuttal:** {response to each opponent}
**Position shift:** {any movement}
**Confidence:** X% (was Y%)
**Agreement areas:** {common ground}

---
```

## Step 4: Synthesis & Verdict

After rebuttals, the **orchestrator** (you) synthesises the debate. Do NOT spawn another agent for this — you have full context.

Evaluate:

1. **Argument quality** — Which arguments were well-supported vs assertion-only?
2. **Concessions made** — What did each side genuinely concede? Concessions are high-signal.
3. **Assumption validity** — Whose assumptions are safer for this specific context?
4. **Risk asymmetry** — Which position's risks are more recoverable?
5. **Convergence** — Did positions move toward each other? Where is remaining disagreement?

### Calculate Metrics

For each persona:

| Metric | How to Calculate |
|--------|-----------------|
| **Confidence** | Use their final self-reported confidence % |
| **Argument Strength** | Rate 0-100% based on evidence quality, logical coherence, and specificity |
| **Agreement** | % of points where this persona agrees with the eventual recommendation |

Overall:
- **Consensus Level** = average of all personas' agreement with the recommendation
- **Decision Confidence** = weighted average of argument strength, factoring in concessions

## Step 5: Final Report

Present the full synthesis:

```
## Debate Result: {TOPIC}

### Summary

| Persona | Position | Confidence | Argument Strength | Agrees with Recommendation |
|---------|----------|:----------:|:-----------------:|:--------------------------:|
| {Name} ({Role}) | {Position} | X% | X% | X% |
| {Name} ({Role}) | {Position} | X% | X% | X% |
| {Name} ({Role}) | {Position} | X% | X% | X% |

### Consensus Level: X%
### Decision Confidence: X%

---

### Recommendation

**{RECOMMENDED_PATH}**

{2-3 sentence justification focusing on WHY this is the best path, not just summarising arguments}

### Key Factors

1. {Most important factor that tipped the decision}
2. {Second factor}
3. {Third factor}

### What Each Persona Argued

#### {Persona 1 Name} — {Role}
**Position:** {1 sentence}
**Strongest argument:** {their best point}
**Key concession:** {what they gave ground on}
**Final confidence:** X%

#### {Persona 2 Name} — {Role}
{same structure}

#### {Persona 3 Name} — {Role}  (if applicable)
{same structure}

### Risks to Monitor
{2-3 risks from the losing position(s) that remain valid and should be watched}

### Conditions That Would Reverse This Decision
{1-2 specific conditions from the "what would change my mind" sections that are worth tracking}
```

## Rules

- **Genuine disagreement required.** Personas must argue their positions honestly, not set up strawmen. If a persona's position is weak, that's informative — don't prop it up.
- **Concessions are the most valuable output.** What smart people concede tells you more than what they assert. Weight concessions heavily in synthesis.
- **No false balance.** If one position is clearly stronger, say so. A 90/10 split is a valid outcome. Do not artificially balance to 55/45.
- **Context matters.** The same question has different answers in different projects. Always ground arguments in the specific context (codebase, team, stage of project).
- **Confidence must move.** If no persona's confidence changes between rounds, the rebuttal round failed. Note this in the synthesis.
- **Project file access.** When the debate is about code or architecture in the current project, agents should receive relevant file contents so they can argue with specifics, not generalities.
- **Model choice.** Use the least expensive model that can reason well about the topic; use a stronger model only when the decision is high-risk or the user asks for deeper analysis.
- **No more than 2 rounds.** Opening + rebuttal is sufficient. More rounds produce diminishing returns and repetition. If positions haven't moved after 2 rounds, they won't.
- **Stay readable.** The debate transcript is the point — the user should be able to follow the conversation between personas. Use blockquotes and clear attribution.
