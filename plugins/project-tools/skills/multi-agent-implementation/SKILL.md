---
name: multi-agent-implementation
description: Use when executing an implementation plan with multiple mostly independent tasks that can be delegated and reviewed in parallel.
---

# Multi-Agent Implementation

## Routing
Use only when implementation tasks are mostly independent and can be delegated in parallel. Use `implement` for one coherent task, `test-driven-implementation` when the main need is independent behavioural test authorship before implementation, `strategy-audit` when delegation itself is risky, and `code-review` or `pre-ship` for final quality checks.

Dispatch fresh agents per task. Two-stage review (spec compliance, then code quality) catches issues early.

This skill is about task concurrency and review between delegated tasks. It does not replace strict red-green implementation from independently authored tests.

## When to Use

You have:
- An implementation plan with defined tasks
- Tasks that are mostly independent
- Want to stay in the same session

If tasks are tightly coupled, execute sequentially yourself instead.

## Per-Task Workflow

```
1. Dispatch implementer agent
2. Implementer asks questions? → Answer with full context
3. Implementer implements, tests, commits, self-reviews
4. Dispatch spec reviewer agent
5. Spec passes? No → implementer fixes → re-review
6. Dispatch code quality reviewer agent
7. Quality passes? No → implementer fixes → re-review
8. Mark task complete
```

After all tasks: dispatch a final reviewer across the full implementation.

Use the least expensive model that can handle the role. If the runtime exposes named model tiers, map them to this intent:

| Complexity | Examples | Model |
|---|---|---|
| Mechanical | Isolated functions, clear specs, 1-2 files | small/fast |
| Integration | Multi-file changes, pattern matching, debugging | standard |
| Architecture | Design decisions, complex reviews | strongest available |

## Handling Implementer Status

| Status | Action |
|---|---|
| **DONE** | Proceed to spec review |
| **DONE_WITH_CONCERNS** | Read concerns. If about correctness/scope, address first. If observations, note and proceed. |
| **NEEDS_CONTEXT** | Provide missing context, re-dispatch |
| **BLOCKED** | See troubleshooting below |

### BLOCKED Troubleshooting

1. **Context problem** → Provide context, re-dispatch
2. **Needs more reasoning** → Re-dispatch with more capable model
3. **Task too large** → Break into smaller pieces
4. **Plan wrong** → Escalate to user

Never force retry without changing something.

## Prompt Templates

### Implementer

```
You are implementing Task N: [task name]

## Task Description
[FULL TEXT of task — paste it, don't make the agent read a file]

## Context
[Where this fits in the system, dependencies, architecture decisions]

## Before You Begin
If anything is unclear about requirements, approach, dependencies, or assumptions — ask before starting.

## Your Job
1. Implement exactly what the task specifies
2. Write tests (TDD: failing test first, then implementation)
3. Verify: build succeeds, tests pass
4. Commit your work
5. Self-review: completeness, quality, discipline, testing
6. Report back with status

## Report Format
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- What you implemented
- What you tested and results
- Files changed
- Self-review findings
- Issues or concerns
```

### Spec Reviewer

```
You are reviewing whether the implementation matches the specification.

## What Was Requested
[FULL TEXT of task requirements]

## What Implementer Claims
[From implementer's report]

## Critical: Do Not Trust the Report
Read the actual code. Compare to requirements line by line.

Check for:
- Missing requirements
- Extra/unneeded work
- Misinterpretations of the spec

## Report
- PASS: Everything matches spec after code inspection
- FAIL: [List what's missing/extra/wrong with file:line references]
```

### Code Quality Reviewer

```
You are reviewing code quality for Task N.

## What Was Built
[From implementer's report]

## Review Criteria
- Each file has one clear responsibility
- Well-defined interfaces between units
- Testable independently
- Follows existing project patterns
- No unnecessary complexity
- Tests cover behaviour, not implementation details

## Report
- **Strengths:** [What's good]
- **Issues:** [Critical / Important / Minor, with file:line]
- **Assessment:** PASS | NEEDS_FIXES
```

## Rules

- Never dispatch multiple implementers in parallel (merge conflicts)
- Never skip reviews (spec OR quality)
- Never proceed with unfixed issues
- Always provide full task text to agents (don't make them read files)
- If a reviewer finds issues, the same implementer fixes them, then re-review
- If an agent fails, dispatch a fix agent with specific instructions — don't fix manually unless the runtime has no agent support
