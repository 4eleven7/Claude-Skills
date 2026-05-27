---
name: weird-findings
description: Use when documenting surprising behaviour, gotchas, non-obvious mechanisms, quirks, confusing code paths, or discoveries future maintainers would otherwise rediscover.
---

# Weird Findings

Document non-obvious behaviors, quirks, and gotchas discovered in the codebase so future readers (human or agent) don't waste time re-discovering them. Routes findings to the right place: inline comments for code-level quirks, lessons.md for project-level gotchas, or dedicated documentation for systemic patterns.

## Responsibility

**Owns:** Identifying, verifying, and documenting non-obvious behaviors with clear explanations.
**Does NOT own:** Fixing the quirks (documents them as-is unless the user asks for a fix).

## What Qualifies as a Weird Finding

A finding is "weird" if a competent developer reading the code for the first time would either:
- **Misunderstand** what the code does
- **Be surprised** by the behavior
- **Waste time** figuring out why it works this way
- **Accidentally break it** by making a "reasonable" change

Examples:

| Category | Example |
|----------|---------|
| **Framework gotcha** | persistence `@Query` silently re-fetches when an unrelated model in the same container changes |
| **Order dependency** | View modifier chain must be in a specific order or layout breaks silently |
| **Implicit contract** | Function returns nil to signal "skip" rather than "error" — callers must distinguish |
| **Counter-intuitive default** | `URLSession` retries idempotent requests by default — our POST endpoint is not idempotent |
| **Hidden coupling** | Deleting enum case X breaks migration Y because the raw value is persisted |
| **Platform inconsistency** | `DateFormatter` behaves differently on device vs simulator for certain locales |
| **Workaround** | Code deliberately does something ugly to work around a framework bug (with radar/feedback number) |

**Not weird findings:** standard patterns, well-documented API behavior, things explained by reading the doc comment above them, personal style preferences.

## Step 1: Verify the Finding

Before documenting, confirm the behavior is real and not a misunderstanding:

1. **Read surrounding context** — check if there's already a comment explaining it
2. **Check git blame** — was this intentional? Is there a commit message explaining why?
3. **Search for related issues** — check lessons.md, project instructions, and memory for prior documentation
4. **Test if possible** — reproduce the behavior to confirm it's not stale

If the finding is already documented somewhere, skip it. If the existing documentation is incomplete, improve it instead of adding a duplicate.

## Step 2: Classify and Route

| Route | When | Format |
|-------|------|--------|
| **Inline comment** | Code-level quirk tied to specific lines. A future editor of *this code* needs to know. | `// QUIRK: ...` comment above the relevant line |
| **lessons.md** | Project-level gotcha that burned time. Applies broadly, not tied to one line. | Entry in the project lessons or known-issues document |
| **Dedicated doc section** | Systemic pattern affecting multiple files/features. Too big for a comment. | Section in the relevant project documentation |
| **Memory** | External tool/API quirk not tied to project code. Useful across projects. | Auto-memory entry |

## Step 3: Write the Documentation

### Inline Comments

Use this format for code-level findings:

```swift
// QUIRK: [one-line summary of the surprising behavior]
// [Why it works this way — the root cause or constraint]
// [What breaks if you change this — the consequence of ignoring it]
```

Rules for inline comments:
- Place directly above the surprising code, not at the end of the line
- Start with `// QUIRK:` so they're grep-able
- Keep to 1-3 lines. If it needs more, it belongs in a doc.
- Never add comments that just restate what the code does. Explain *why it's surprising*.
- Match the file's existing comment style and indentation

Example:

```swift
// QUIRK: This must be called BEFORE setting the modelContainer on the view.
// persistence silently ignores schema configuration changes after the container
// is attached, leading to missing indexes with no error or warning.
let schema = Schema(versionedSchema: CurrentSchema.self)
```

### lessons.md Entries

Follow the existing format in the project lessons or known-issues document. Lead with what's surprising, then explain the mechanism:

```markdown
### [Short title of the gotcha]
- **What happens:** [the surprising behavior]
- **Why:** [root cause or framework constraint]
- **What to do instead:** [the correct approach]
```

### Dedicated Documentation

For systemic patterns, add a subsection to the relevant project documentation. Use a `## Gotchas` or `## Non-Obvious Behavior` section if one exists, or create one at the end of the doc.

## Step 4: Present Findings

Show findings to the user before writing:

```
| # | Finding | Route | Location |
|---|---------|-------|----------|
| 1 | Persistence query re-fetches on unrelated model changes | Inline | data view file |
| 2 | Scheduler silently drops if called before container ready | lessons.md | New entry |
| 3 | Migration depends on enum raw value stability | Inline | migration plan file |
```

Ask: **Apply all**, **Select which to apply**, or **Skip**.

## Passive Mode

This skill can also operate passively during other work. When investigating, debugging, or reviewing code and you encounter something that meets the "weird finding" criteria:

1. Note it mentally
2. After completing the primary task, mention it: "I noticed a quirk worth documenting: [brief description]. Want me to document it?"
3. If the user agrees, run through the steps above

Do not interrupt the primary task to document findings. Collect them and offer at the end.

## Rules

- Verify before documenting. A "weird finding" that's actually a misunderstanding is worse than no documentation.
- Never document obvious things. If the API docs clearly explain the behavior, it's not weird.
- Keep comments surgical. One quirk per comment. Don't write essays in source files.
- Prefer the narrowest route. Inline comment > lessons entry > dedicated doc section. Only escalate scope when the finding genuinely affects multiple areas.
- Respect existing style. Match the tone and format of existing comments and docs in the file.
- Include the "what breaks" consequence. A quirk without its consequence is trivia. A quirk with its consequence is a guardrail.
