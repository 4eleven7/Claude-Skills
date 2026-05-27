---
name: user-test
description: Evaluate a feature, idea, spec, or design through target personas and produce a product verdict.
---

# User Test — Synthetic User Evaluation

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the User Test workflow. Your job is to evaluate a feature, idea, spec, or design decision through the eyes of your project's target personas — producing structured verdicts that inform whether to build, how to prioritise, and what to watch out for.

## When to Use

- After `idea-seed` skill — quick gut-check on whether an idea resonates before it sits in the backlog
- Before `implement` skill — validate that a feature will land with real users before investing build time
- During `project-scope` skill — prioritise the backlog through persona lenses when multiple features compete
- On demand — evaluate any idea, spec section, or design question against user archetypes

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` — One of:
- A feature idea or concept (plain text description)
- A file path to a spec, seed, or todo section to evaluate
- A question ("should we build X?" / "which is more important, X or Y?")

If `$ARGUMENTS` is empty, ask what the user wants evaluated.

## Required Reading

Before every review, read ALL persona files from the project's persona directory (e.g., the project persona documents). If no persona directory exists, skip persona evaluation and note this in the output.

Load every persona file in the directory. Do not hardcode persona names — the set may grow. Skip any template files.

## Process

### Step 1: Frame the Evaluation

Determine what is being evaluated:

| Input | How to Frame |
|-------|-------------|
| Plain text idea | Evaluate the concept as described |
| File path to a spec | Read the spec, evaluate the feature it describes |
| File path to a todo/seed section | Read the section, evaluate the idea |
| Comparison ("X vs Y") | Evaluate both, compare verdicts |
| Backlog prioritisation | Read the referenced file, evaluate each item, rank |

If the input is vague, ask one clarifying question — no more.

### Step 2: Inhabit Each Persona

For each persona, adopt their perspective fully. Consider:

1. **First reaction** — What would they think when they first hear about this feature? Excited, confused, indifferent?
2. **Daily use** — Would they use this daily, weekly, rarely, or never?
3. **Pain it solves** — Does this address something they currently struggle with?
4. **Red flag check** — Does anything about this feature trigger their distrust or exit signals?
5. **Share factor** — Would they tell someone about this or screenshot it?
6. **Would they pay for it?** — Does this move them toward (or keep them on) a paid tier?

Stay in character. Use the persona's vocabulary and decision style. A discipline-chaser biohacker evaluates differently than a gentle starter.

### Step 3: Score

Rate each idea from each persona's perspective across four dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| **Interesting** | "I want this" — does the persona care about this feature? |
| **Viral** | "I'd share this" — would the persona tell others, screenshot, or post about it? |
| **ROI** | "Worth building" — value delivered relative to likely build effort (from the persona's perspective, not engineering effort) |
| **Engaging** | "I'd use this often" — does this create a daily/weekly habit loop? |

Score as a percentage (0-100%). Be honest — not everything scores high for every persona, and that's informative.

### Step 4: Synthesise

After scoring all personas:

1. **Compute averages** — Average each dimension across personas, then average dimensions for a composite score
2. **Identify consensus** — Where do all personas agree? (Universal appeal or universal indifference)
3. **Identify divergence** — Where do personas disagree sharply? (Niche appeal — which niche?)
4. **Surface risks** — Did any persona's red flags fire? What would make this feature feel wrong to them?
5. **Rank** — If evaluating multiple items, rank by composite score

### Step 5: Report

#### Single Idea Evaluation

```
## User Test: <Idea Title>

### Verdicts

| Persona | Interesting | Viral | ROI | Engaging | Avg | Would Use? |
|---------|:-:|:-:|:-:|:-:|:-:|---|
| <Name> (<Archetype>) | X% | X% | X% | X% | X% | <1-line in-character verdict> |
| ... | ... | ... | ... | ... | ... | ... |
| **Composite** | **X%** | **X%** | **X%** | **X%** | **X%** | |

### Consensus
<Where all personas agree — what's universally appealing or universally weak>

### Divergence
<Where personas split — who loves it, who doesn't care, and why>

### Risks
<Red flags fired, potential pitfalls, who this might alienate>

### Recommendation
<Build / Defer / Rethink — with reasoning>
```

#### Ranked Comparison (Multiple Ideas)

```
## User Test: <Topic>

| # | Idea | Composite | Pitch | Build Signal |
|---|------|:-:|---|---|
| 1 | <Name> | X% | <1-2 sentence pitch> | <Build / Defer / Rethink> |
| ... | ... | ... | ... | ... |

### Top Pick: <Name>
<Why this won — 2-3 sentences>

### Surprising Findings
<What scored differently than expected — 1-2 insights>
```

## Auto-Trigger Integration

This skill can be suggested or auto-triggered by other workflow commands:

- **`idea-seed` skill** — Runs a lightweight persona review automatically and embeds a 3-sentence verdict in the seed. `user-test` skill can still be run separately for the full detailed report.
- **`project-scope` skill** — When recommending next work from competing options, suggest: "Run `user-test` skill to compare these candidates through persona lenses?"
- **`implement` skill Phase 1** — During the Premise Challenge, suggest: "Run `user-test` skill to validate this feature resonates before investing build time?"
- **`workflow-navigator` skill** — When the user is between tasks and considering what to build, suggest `user-test` skill if the decision involves user-facing features

The trigger is a suggestion, not a gate. The user can skip it. But for user-facing features, the recommendation should be clear: "This is user-facing — consider `user-test` skill before building."

## Rules

- Always read ALL persona files fresh — never rely on cached knowledge of personas
- Stay in character for each persona — use their vocabulary, not yours
- Be honest in scoring — a feature that only resonates with 1 of 4 personas is still useful information (it tells you who it's for)
- Never inflate scores to be encouraging — the value is in honest signal
- If a feature scores below 50% composite, say so clearly and explain why
- Scores are relative to the persona, not absolute — 60% from a hard-to-impress persona may mean more than 80% from an enthusiastic one
- If the user has custom personas, use those — the template personas are starting points, not the only set
- Keep the output concise — verdicts and synthesis, not essays
- Do not recommend building something just because it scored high — also consider engineering cost, dependencies, and strategic fit (but note those as separate concerns from persona resonance)

## Persona Management

Personas live in the project persona folder. The skill reads whatever is there.

- To add a persona: create a new file following `persona-template.md`
- To modify a persona: edit the existing file
- To remove a persona: delete the file
- Personas are versioned with the repo — they evolve as understanding of users deepens

## Next Steps

After a persona review, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|---|---|---|
| High-scoring idea that's just a seed | `idea-seed` skill (if not already planted) | Capture it properly with trigger conditions |
| High-scoring idea with enough detail for a spec | Write a spec | Move from idea to specifiable feature |
| Feature validated, spec exists | `implement` skill | Confidence to invest build time |
| Feature scored poorly — needs rethinking | Revisit the concept | Persona feedback should inform redesign |
| Comparing backlog items for prioritisation | `project-scope` skill | Feed persona rankings into scope decisions |
| Idea surfaced a UX concern | `clarify-spec` skill | Resolve the concern before building |
