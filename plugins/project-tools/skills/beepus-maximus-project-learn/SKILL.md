---
name: learn
description: Research a technology from the web and generate a reusable skill from what's found. Use when creating skills for unfamiliar libraries, frameworks, or tools.
---

# Learn and Create Skills

Research a technology using web search, extract key patterns, and generate a skill for future use.

## Usage

```
`learn <topic>`
```

If the topic is ambiguous, ask to clarify before searching.

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
