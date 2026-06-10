---
name: forensics
description: Investigate what happened after confusing failures, regressions, bad merges, or unclear project state.
---

# Forensics — Post-Mortem Investigation

## Routing

Use after confusing history, regressions, failed workflows, or unclear repo state. Use `deep-investigate` for a current root-cause question, `hypothesis-debug` when a fix is authorized, and `change-summary` to summarize completed work.

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Forensics workflow. Your job is to investigate what went wrong in a workflow, feature, or session by analysing git history, project artifacts, and file system state. You diagnose — you do not fix.

## When to Use

- A feature was built but something is off and nobody knows why
- A workflow (`implement` skill, `pr-shipping` skill, etc.) produced unexpected results
- Tests pass but behaviour is wrong, or vice versa
- The codebase is in a state nobody can explain
- A session was interrupted and the aftermath is unclear
- "What happened here?" — any time the trail needs retracing

## Input

Use the user request, selected files, selected text, or current repo context as input. The input can be a feature name, a time range, a symptom, or a question.

## Process

### Phase 1: Establish the Timeline

Build a chronological picture of what happened.

```bash
# Recent commit history
git log --oneline -30

# If investigating a specific feature/area:
git log --oneline --all -- <relevant-paths>

# If investigating a time range:
git log --oneline --after="<date>" --before="<date>"

# What changed in the relevant files:
git log --oneline --stat -- <paths>
```

### Phase 2: Examine Artifacts

Check project management artifacts for state mismatches:

| Artifact | Check |
|----------|-------|
| the project todo/backlog document | Does the completion status match reality? |
| the project scope/status document | Does the scope status match the code? |
| Feature spec in the project specifications or requirements documents | Does the spec match what was built? |
| the project lessons or known-issues document | Were known issues ignored? |
| `.continue-here.md` | Is there an abandoned handoff? |
| Test files | Do tests exist? Do they test the right things? Do they pass? |

### Phase 3: Trace the Divergence

Identify where reality diverged from intent:

1. **What was supposed to happen?** — Read the spec, plan, or commit messages
2. **What actually happened?** — Read the code, run tests, check git diff
3. **When did they diverge?** — Use `git bisect` thinking: which commit introduced the problem?

```bash
# Find when a specific behaviour changed:
git log -p -- <file> | head -200

# Find when a string/pattern was introduced or removed:
git log --all -S "<search term>" --oneline

# Compare a file at two points:
git diff <commit1>..<commit2> -- <file>
```

### Phase 4: Classify the Failure

| Pattern | Signal | Common Cause |
|---------|--------|-------------|
| **Spec drift** | Code doesn't match spec | Spec not read, or updated after implementation |
| **Silent regression** | Tests pass but behaviour is wrong | Tests don't cover the affected behaviour |
| **Incomplete implementation** | Feature partially works | Session interrupted, scope underestimated |
| **Stale artifacts** | Todoproject-state-audit skill don't match code | Documents not updated after work |
| **Conflicting changes** | Two commits contradict each other | Parallel work without coordination |
| **Missing migration** | Data exists but schema moved on | Persistence policy not followed |
| **Abandoned work** | Branch exists, `.continue-here.md` present | Session ended mid-task |
| **Wrong assumption** | Code does something unexpected | Spec gap filled with a guess |

### Phase 5: Report

```
## Forensics Report — <Subject>

### Timeline
<Chronological sequence of relevant events, with commit hashes>

### What Was Supposed to Happen
<The intended outcome, from spec/plan/commit messages>

### What Actually Happened
<The actual outcome, from code/tests/observation>

### Point of Divergence
<The specific commit, decision, or event where things went wrong>
- **Commit:** <hash> — <message>
- **File:** <path:line>
- **Cause:** <what happened and why>

### Classification
<Pattern from the table above>

### Evidence
<Specific git diffs, test results, file contents that support the diagnosis>

### Recommended Fix
<What should be done — but do not do it. Hand off to the appropriate command.>

| Fix Type | Suggested Skill |
|----------|------------------|
| Bug in the code | `hypothesis-debug` skill |
| Spec needs updating | `spec-workflow` skill |
| Documents out of date | `project-state-audit` skill |
| Feature incomplete | `implement` skill or `small-change` skill |
| Tests missing | `small-change` skill to add tests |
```

## Rules

- This is a read-only investigation — never modify code, tests, or documents
- Ground every conclusion in evidence (commit hashes, file paths, test output)
- Do not speculate without evidence — if you can't prove it, say "insufficient evidence"
- Do not assign blame — focus on what happened, not who did it
- Check git history before trusting artifact state — artifacts can be stale
- If the investigation reveals multiple issues, list them all but identify the primary cause
- Keep the report factual and concise — this feeds into other skills or workflows that will do the actual fixing
