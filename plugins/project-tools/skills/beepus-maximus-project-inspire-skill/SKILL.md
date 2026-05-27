---
name: inspire-skill
description: Use when evaluating an external skill to find inspiration for improving our own skills. Triggers on "inspire skill", "audit this skill", "evaluate skill", "compare skill", "skill gap analysis", "what can we learn from this skill", or when the user provides a skill URL or file path for assessment.
---

# Inspire Skill

Evaluate an external skill, find its strengths and weaknesses, and compare it against the existing skill setup to identify gaps, improvements, and inspiration.

## Usage

```
`project-skill-audit <url-or-path>`
```

The argument is a URL to a skill file (GitHub raw URL, gist, etc.) or a local file path.

## Process

### 1. Acquire the Skill

- **URL provided:** Fetch the content using WebFetch or WebSearch. For GitHub URLs, convert to raw content URL first.
- **File path provided:** Read the file directly.
- **Neither:** Ask the user for a URL or path.

If the content cannot be retrieved, report the failure and stop.

### 2. Classify

Determine the skill's domain. Assign exactly one primary category:

| Category | Description |
|---|---|
| `language` | Language features, syntax, standard library, idioms |
| `ui` | UI layout, state, navigation, interaction, design |
| `framework` | Framework APIs, integration patterns, diagnostics |
| `tooling` | Build, test, debug, profile, CI/CD, release workflow |
| `project-workflow` | Planning, review, debugging workflow, git, session mgmt |
| `design-quality` | UI polish, HIG, accessibility, UX writing |
| `other` | Web, mobile, marketing, product, or uncategorised topics |

### 3. Audit the External Skill

Evaluate across these dimensions. Score each 1-5 (1=poor, 5=excellent):

| Dimension | What to assess |
|---|---|
| **Correctness** | Are the APIs, patterns, and recommendations accurate? Any outdated or wrong advice? |
| **Specificity** | Does it give concrete guidance, or vague platitudes? Are there code examples? |
| **Actionability** | Can an agent follow this and produce correct code without guessing? |
| **Completeness** | Does it cover the key scenarios, edge cases, and common mistakes? |
| **Conciseness** | Is it tight, or bloated with filler? Token-efficient? |
| **Anti-slop** | Does it avoid generic AI patterns (excessive caveats, redundant structure, obvious advice)? |

For each dimension, note specific strengths or weaknesses with line references.

Flag any advice that is **actively harmful** (wrong API usage, deprecated patterns, security issues).

### 4. Compare Against Existing Skills

Based on the category from Step 2, identify the matching existing skill(s).

**For language, UI, platform, or framework categories:**
- Read the matching installed skill(s)
- Compare coverage: what does the external skill cover that ours doesn't?
- Compare depth: where is the external skill more specific or actionable?
- Compare correctness: where does either get it wrong?

**For project-workflow categories:**
- Read the matching project workflow skill(s)
- Also check project commands for overlap
- Compare: does the external skill enforce better discipline? Catch more failure modes?

**If no matching skill exists:** Note this as a gap. Assess whether the topic warrants a new skill.

### 5. Present Findings

#### Audit Summary Table

```
| Dimension     | Score | Notes                              |
|---------------|-------|------------------------------------|
| Correctness   | X/5   | ...                                |
| Specificity   | X/5   | ...                                |
| Actionability | X/5   | ...                                |
| Completeness  | X/5   | ...                                |
| Conciseness   | X/5   | ...                                |
| Anti-slop     | X/5   | ...                                |
| **Overall**   | X/5   | ...                                |
```

#### Comparison Verdict

Present as a three-column table:

```
| Area                    | External Skill          | Our Skill(s)            |
|-------------------------|-------------------------|-------------------------|
| [specific topic]        | [what it does well/bad] | [what we do well/bad]   |
```

#### Recommendations

Categorize findings into:

1. **Adopt** — Things the external skill does better that we should incorporate. Be specific: which skill to update, what to add.
2. **Ignore** — Things the external skill does that add no value (generic advice, wrong patterns, bloat).
3. **Gap** — Topics neither skill covers well. Worth investigating.
4. **Conflict** — Where the external skill contradicts our approach. State which is correct and why.

### 6. Ask Before Acting

Present the findings and wait for the user to decide:
- Which recommendations to adopt
- Whether to update existing skills or create new ones
- Whether any recommendations should be discarded

Do NOT modify any skills without explicit approval.

## Rules

- Never adopt advice without verifying it against current Apple documentation
- Prefer updating existing skills over creating new ones
- Prioritise correctness and efficiency over comprehensiveness
- If the external skill is mostly filler with one good insight, extract just the insight
- Score honestly — a score of 3 is average, not bad. Reserve 5 for genuinely excellent work
- If the external skill covers a topic we have no skill for, assess whether the topic is worth a dedicated skill or belongs as a section in an existing one
