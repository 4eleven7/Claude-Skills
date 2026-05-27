---
name: idea-seed
description: Capture early product, design, or technical ideas in a lightweight backlog without derailing current work.
---

# Plant Seed — Capture Forward-Looking Ideas

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Plant Seed workflow. Your job is to capture an idea with enough context that it surfaces at the right time — when related work begins.

Seeds live in the project exploration backlog (design/UX ideas) or the project specification backlog (features needing specs). This skill routes the idea to the right file and tags it for future discovery.

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` — The idea. Can be a single sentence or a detailed description.

## Process

### Step 1: Understand the Idea

If `$ARGUMENTS` is vague or one-line, ask 2-3 targeted questions to flesh it out:

1. **What is it?** — Core concept in one sentence
2. **Why does it matter?** — What problem does it solve or what value does it add?
3. **When should it surface?** — What related feature or milestone would make this relevant?

If the idea is already detailed, skip the questions.

### Step 2: Classify

| Type | Destination | Signal |
|------|------------|--------|
| UI interaction, micro-detail, visual concept, UX pattern | `things-to-explore.md` | Design or interaction idea |
| Feature concept, new tracking domain, integration | `things-to-specify.md` | Needs a specification |
| Enhancement to existing feature | `things-to-explore.md` under the feature's section | Builds on what exists |

### Step 3: Add Trigger Conditions

Every seed must have a `**Surfaces when:**` line that describes when this idea becomes relevant. This is what `project-scope` skill and `workflow-navigator` skill use to surface seeds at the right time.

Examples:
- `**Surfaces when:** starting analytics engine work`
- `**Surfaces when:** building onboarding flow`
- `**Surfaces when:** doing UI polish pass on dashboard`
- `**Surfaces when:** implementing background sync`

### Step 4: Persona Review

Before writing the seed, run a quick persona review to validate resonance.

1. Read ALL persona files from the project's persona directory (e.g., the project persona documents). Skip any template files. If no persona directory exists, skip this step and note it.
2. For each persona, evaluate the idea across: **Interesting**, **Viral**, **ROI**, **Engaging** (each 0-100%)
3. Compute composite scores and a single overall average
4. Write a **Persona verdict** — a maximum 3-sentence summary that captures: who this resonates with most, the composite score, and the key risk or opportunity. This is the only output from the review that gets saved.

This review runs automatically — do not ask the user whether to run it.

### Step 5: Write the Seed

Append to the appropriate file using this format:

```markdown
### <Idea Title>

<Description — what it is, how it works, key details>

**Why it matters:** <The value proposition in 1-2 sentences>

**Persona verdict:** <3-sentence max summary from Step 4>

**Surfaces when:** <trigger condition for when this should be revisited>
```

For ideas that build on existing sections, add under the relevant heading rather than creating a new top-level section.

### Step 6: Confirm

```
## Seed Planted

**Idea:** <title>
**Filed in:** <file path>
**Surfaces when:** <trigger>
**Persona composite:** <X%>

This will be surfaced by `project-scope` skill and `workflow-navigator` skill when related work begins.
```

## Integration with Other Commands

Seeds are passive — they do not trigger anything on their own. Other skills surface them:

- **`project-scope` skill** — When recommending next work, scan seeds for matching trigger conditions
- **`workflow-navigator` skill** — When suggesting next steps, check if any seeds match the current work context
- **`implement` skill** — During Phase 1 (Spec Review), check if seeds exist that relate to the feature being built
- **`user-test` skill** — For a deeper evaluation beyond the auto-review, run the full user test with detailed scoring table

## Rules

- Never create a new file for a seed — append to the existing todo files
- Always include a trigger condition — seeds without triggers are just noise
- Keep seeds concise — enough detail to understand the idea, not a full specification
- If the idea is already in the file, update it rather than duplicating
- Seeds are not tasks — they do not go in `current-todo.md`
- If the idea is ready to be specified now (not deferred), suggest writing a spec instead of planting a seed
