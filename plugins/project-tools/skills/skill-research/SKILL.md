---
name: skill-research
description: Use when researching a technology or external skill to create, update, or improve reusable agent skills from verified sources.
---

# Skill Research

## Routing

Use to research verified sources before creating or updating reusable skills. Use `project-skill-audit` for catalog-level merge/remove/rename decisions and `writing-skills` for skill authoring mechanics.

Research a technology or external skill, extract verified patterns, and create or improve a reusable skill.

For auditing an existing external skill, use `references/external-skill-audit.md`.

## Input

Use the topic, URL, local file path, or external skill named by the user. If the topic is ambiguous, ask to clarify before searching.

## Process

### 1. Discover Sources

Search for:
- `<topic> official documentation`
- `<topic> getting started guide`
- `<topic> API reference`
- `<topic> GitHub repository`

**Source priority:**
1. Official docs (docs.*, *.dev, *.io)
2. Official GitHub repos (README, /docs)
3. Official blogs/announcements

Select 3-5 high-quality URLs. If nothing credible is found, ask the user for a URL.

### 2. Extract Content

From each source, extract only:
- Installation / setup
- Core concepts and mental model
- Key API / functions / types
- Common patterns and examples
- Version info and constraints

Skip: navigation, ads, comments, unrelated sidebars.

### 3. Generate Skill

Create a SKILL.md with:

```markdown
---
name: <topic-kebab-case>
description: <one-line description of when to use this skill>
---

# <Topic>

## When to Use
[Clear trigger conditions]

## Core Concepts
[Mental model — how this technology thinks]

## Key API
[Most important functions/types with signatures and brief descriptions]

## Common Patterns
[2-3 code examples showing typical usage]

## Gotchas
[Things that trip people up]

## References
[Source URLs with scrape date]
```

### 4. Save

Save to the runtime's installed skills directory as `<topic>/SKILL.md`.

Warn before overwriting an existing skill.

### 5. Confirm

Report what was created:
- Skill name
- Sources used (count and quality)
- Save location
- When it will trigger

## Rules

- Never hallucinate documentation — only use content from fetched sources
- Never invent APIs that weren't found in docs
- If discovery fails, ask the user for a URL rather than guessing
- Keep SKILL.md under 300 lines — link to references/ for detail
- Record source URLs and scrape date for staleness tracking
