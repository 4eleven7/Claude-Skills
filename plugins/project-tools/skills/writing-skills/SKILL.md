---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Routing

Use for authoring and verifying skill files. Use `project-skill-audit` for catalog structure decisions and `skill-research` for source-backed technical content.

## Overview

Skills are reusable reference guides for proven techniques, patterns, or tools. They help future agents find and apply effective approaches.

**Core principle:** Test-driven — if you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

## When to Create

**Create when:**
- Technique wasn't intuitively obvious
- You'd reference this again across projects
- Pattern applies broadly (not project-specific)

**Don't create for:**
- One-off solutions
- Standard practices well-documented elsewhere
- Project-specific conventions (put in project instructions)
- Mechanical constraints enforceable with regex/validation

## Skill Types

- **Technique** — Concrete method with steps (condition-based-waiting, root-cause-tracing)
- **Pattern** — Way of thinking about problems (flatten-with-flags)
- **Reference** — API docs, syntax guides, tool documentation

## Directory Structure

```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    references/           # Heavy reference, API docs (optional)
    supporting-file.*     # Scripts, templates (optional)
```

## SKILL.md Structure

```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---
```

**Frontmatter rules:**
- Only `name` and `description` fields (max 1024 chars total)
- Name: letters, numbers, hyphens only
- Description: third-person, starts with "Use when...", describes ONLY triggering conditions

**Body sections:** Overview, When to Use, Core Pattern, Quick Reference, Implementation, Common Mistakes

## Description = When to Use, NOT What It Does

The description should ONLY describe triggering conditions. Never summarize the skill's workflow.

**Why:** When a description summarizes workflow, an agent may follow the description instead of reading the full skill. Descriptions that summarize workflow create a shortcut an agent will take.

```yaml
# BAD: Summarizes workflow
description: Use when executing plans - dispatches agent per task with code review between tasks

# GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks in the current session
```

## Keyword Coverage (CSO)

Use words an agent would search for:
- Error messages: "Hook timed out", "race condition"
- Symptoms: "flaky", "hanging", "zombie"
- Synonyms: "timeout/hang/freeze", "cleanup/teardown"
- Tools: actual commands, library names

## Token Efficiency

Skills load into context. Every token counts.

- Move heavy reference to separate files
- Use cross-references instead of repeating other skills
- One excellent example beats many mediocre ones
- Keep inline code patterns under 50 lines

## RED-GREEN-REFACTOR for Skills

### RED: Baseline Test
Run pressure scenario with agent WITHOUT the skill. Document:
- What choices did the agent make?
- What rationalizations did it use?

### GREEN: Write Minimal Skill
Address those specific rationalizations. Run same scenarios WITH skill — agent should now comply.

### REFACTOR: Close Loopholes
Agent found new rationalization? Add explicit counter. Re-test until bulletproof.

## Bulletproofing Discipline Skills

For skills that enforce rules (like TDD):

1. **Close every loophole explicitly** — don't just state the rule, forbid specific workarounds
2. **Build rationalization table** — capture every excuse agents make during testing
3. **Create red flags list** — make it easy for agents to self-check
4. **Address "spirit vs letter" arguments** early

## Checklist

- [ ] Baseline test: run scenario WITHOUT skill, document failures
- [ ] Name uses only letters/numbers/hyphens
- [ ] YAML frontmatter with name + description (max 1024 chars)
- [ ] Description starts with "Use when..." (no workflow summary)
- [ ] Keywords throughout for search
- [ ] Clear overview with core principle
- [ ] Addresses specific baseline failures
- [ ] One excellent code example
- [ ] Verified: run scenario WITH skill, agent complies
- [ ] Loopholes closed, rationalization table built
- [ ] Committed to git
