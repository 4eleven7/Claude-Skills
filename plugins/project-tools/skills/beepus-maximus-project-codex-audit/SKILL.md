---
name: codex-audit
description: Use Codex or another independent reviewer to audit recent changes, then validate each finding before acting.
---

# Codex Audit — Independent Code Review via OpenAI Codex

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Send recent changes to OpenAI Codex CLI for an independent audit. Claude validates every finding before presenting it.

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

### Step 3: Run the Codex Review

```bash
# For uncommitted changes:
codex exec review --uncommitted \
  -m gpt-5.4 \
  -c 'model_reasoning_effort="xhigh"' \
  "Review for bugs, security issues, performance problems, logic errors, and style concerns. Be specific about file names and line numbers. Context: <SUMMARY>"

# For branch diff against main:
codex exec review --base main \
  -m gpt-5.4 \
  -c 'model_reasoning_effort="xhigh"' \
  "Review for bugs, security issues, performance problems, logic errors, and style concerns. Be specific about file names and line numbers. Context: <SUMMARY>"

# For a specific commit:
codex exec review --commit <SHA> \
  -m gpt-5.4 \
  -c 'model_reasoning_effort="xhigh"' \
  "Review for bugs, security issues, performance problems, logic errors, and style concerns. Be specific about file names and line numbers. Context: <SUMMARY>"
```

Replace `<SUMMARY>` with the context from Step 2.

### Step 4: Validate Every Finding

Codex operates with limited context. It does not know the project's architecture, specifications, or design decisions. It will often invent critical issues that are misunderstandings.

For each finding Codex returns, you MUST:

1. **Check the actual source code** — confirm the issue exists, not a hallucination or misread
2. **Check project docs** — read the project instructions, relevant specs in the project specifications or requirements documents, and `the project system/design docs` docs to see if the finding conflicts with intentional design
3. **Assess significance** — "Is this a real bug, or is Codex misunderstanding context?" and "Even if real, is this meaningful or trivial/stylistic noise?"
4. **Classify** each finding:
   - **Confirmed** — real issue, verified against source code
   - **Dismissed** — misunderstanding of project intent or architecture
   - **Trivial** — technically correct but not worth acting on

### Step 5: Present Results

Use the `evaluate-findings` skill (if available) to structure the validated findings. Present:

```
## Codex Audit Results

### Confirmed Findings
- [finding with file:line] — [why it's legitimate] — [severity: bug/security/performance/logic]

### Dismissed Findings
- [finding] — [why it was dismissed: misunderstood architecture/spec/intent]

### Trivial Findings
- [finding] — [why it's not worth acting on]

### Codex Gave All-Clear
[State this if all findings failed validation or Codex found nothing]
```

### Step 6: Ask for Direction

> "Want me to address any of the confirmed findings?"

## Rules

- Never present Codex findings verbatim without validation — always verify against source
- Use the `evaluate-findings` skill for structured assessment when there are 3+ findings
- If Codex is not installed, tell the user and suggest `npm install -g @openai/codex` or alternative review options (`code-review` skill, `code-style` skill)
- This is a read-only audit — do not fix anything without user approval
