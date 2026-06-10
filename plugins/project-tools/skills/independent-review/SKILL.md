---
name: independent-review
description: Use when asking an independent reviewer or external review tool to audit recent changes, then validate each finding before acting.
---

# Independent Review

## Routing

Use for a second opinion from an independent reviewer or external review tool. Use `code-review` for the primary local review, `evaluate-findings` to validate external findings, and `post-implementation-qa` for the full final quality gate.

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Send recent changes to an independent reviewer or external review tool. Validate every finding against the current source before presenting or acting on it.

If using an external review tool, first check that the tool is available in the current environment. If unavailable, use another independent reviewer or fall back to the local `code-review` workflow and say that no external reviewer was available.

## When to Use

- After completing a feature or fix, before committing
- As a second opinion alongside `code-review` skill
- When you want a different model's perspective on your changes

## Process

### Step 1: Determine Review Scope

Check the current state to decide which review mode to use:

```bash
git status --short
git log --oneline -5
```

Choose the appropriate mode:
- **Uncommitted changes exist** → `--uncommitted`
- **No uncommitted changes, reviewing current branch** → `--base main` (or the appropriate base branch)
- **Reviewing a specific commit** → `--commit <SHA>`

### Step 2: Prepare Context

Write a concise summary of what changed and why. This becomes the custom review prompt. Reference the feature spec or task if applicable.

### Step 3: Run the External Review

Use the independent reviewer available in the current runtime. Pass the chosen scope from Step 1 and the summary from Step 2. Ask for bugs, security issues, performance problems, logic errors, missing tests, and risky design decisions with file and line references.

Do not invent an external tool. If no independent reviewer is available, run the local `code-review` workflow instead and state that the external-review step was unavailable.

### Step 4: Validate Every Finding

External review tools operate with limited context. They do not know the project's architecture, specifications, or design decisions unless you provide that context. They can invent critical issues that are misunderstandings.

For each finding the reviewer returns, you MUST:

1. **Check the actual source code** — confirm the issue exists, not a hallucination or misread
2. **Check project docs** — read repo instructions, relevant specs, architecture docs, design docs, and workflow docs to see if the finding conflicts with intentional design
3. **Assess significance** — "Is this a real bug, or is the reviewer misunderstanding context?" and "Even if real, is this meaningful or trivial/stylistic noise?"
4. **Classify** each finding:
   - **Confirmed** — real issue, verified against source code
   - **Dismissed** — misunderstanding of project intent or architecture
   - **Trivial** — technically correct but not worth acting on

### Step 5: Present Results

Use the `evaluate-findings` skill (if available) to structure the validated findings. Present:

```
## External Review Results

### Confirmed Findings
- [finding with file:line] — [why it's legitimate] — [severity: bug/security/performance/logic]

### Dismissed Findings
- [finding] — [why it was dismissed: misunderstood architecture/spec/intent]

### Trivial Findings
- [finding] — [why it's not worth acting on]

### Reviewer Gave All-Clear
[State this if all findings failed validation or the reviewer found nothing]
```

### Step 6: Ask for Direction

> "Want me to address any of the confirmed findings?"

## Rules

- Never present external-review findings verbatim without validation — always verify against source
- Use the `evaluate-findings` skill for structured assessment when there are 3+ findings
- If no external review tool is available, tell the user and use the local alternatives (`code-review` skill, `code-style` skill)
- This is a read-only audit — do not fix anything without user approval
