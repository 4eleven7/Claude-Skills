---
name: next-step-router
description: Use when deciding which workflow or skill should run next based on conversation state, repo state, and verification status.
---

# Next Step Router

## Routing

Use only to choose the next workflow. Do not perform the selected work inside this skill. Use `project-state-audit` instead when repository state needs deep reconciliation before choosing.

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill to look at the current conversation context and recommend the most appropriate next skill.

This skill never does work itself. It reads the room and points you in the right direction.

## Process

### Step 1: Read the Conversation State

Assess what has happened in this session so far. Look for signals:

| Signal | Meaning |
|---|---|
| A spec was discussed or read | Spec-related workflow is active |
| Code was written or modified | Implementation happened |
| Tests were run (pass or fail) | Build/verify cycle is active |
| A bug or error was encountered | Debugging is needed |
| A review or audit was performed | Quality pass happened |
| Commits were made | Shipping phase |
| Nothing happened yet | Session is starting |

### Step 2: Identify Where You Are in the Workflow

Map the session state to a position in the workflow pipeline:

```
Thinking about a feature
  → `interview-me` (if intent, user, success, constraints, or non-goals are unclear)
  → `idea-refine` (if the raw idea needs divergent options before a spec)
  → `spec-workflow` (if spec exists but has gaps)
  → `project-state-audit` (if unsure what to work on next)
  → `source-driven-development` (if framework, SDK, or dependency correctness depends on current docs)
  → `doubt-driven-development` (if the implementation depends on a non-trivial hypothesis or safety claim)
  → `test-driven-implementation` (if spec is ready and behaviour is high-risk, persistence-heavy, or complex)
  → `incremental-implementation` (if the implementation is multi-file or should be sliced carefully)
  → `implement` (if spec is ready)

Small or trivial change
  → `small-change` (typo, config, rename — obvious and trivial)
  → `small-change` (small but needs tests and verification)
  → `implement` (needs a plan or architectural decision)

Building a feature
  → `test-driven-implementation` (if starting risky logic, persistence, complex rules, or strict TDD)
  → `implement` (if mid-build, resume)
  → `hypothesis-debug` (if a test is failing or something is broken)
  → `code-style` (if code is written, no obvious bugs)

Code is written and working
  → `code-style` (if UI code, hasn't been style-checked)
  → `code-simplification` (if code works but is unnecessarily complex)
  → `ux-audit` (if user-facing, hasn't been UX-audited)
  → `pre-ship` (if user-facing, hasn't been polished)
  → `code-review` (if complex, hasn't been reviewed)
  → `blast-radius` (if touches shared types or multiple packages)

Quality passes are done
  → `spec-workflow` (if spec gaps were found during build or review)
  → `pr-shipping` (if everything is verified and ready)

Bug was reported or discovered
  → `hypothesis-debug` (always)

Something went wrong or state is confusing
  → `forensics` (investigate what happened)

Just shipped / between tasks
  → `project-state-audit` (to find what's next in the project)

Deciding between user-facing features
  → `idea-refine` (if the options are still rough concepts)
  → `user-test` (compare options through target user lenses)

Capturing an idea for later
  → `capture-idea` (idea with trigger conditions)

Session getting long or ending mid-task
  → `session-handoff` (checkpoint before /compact or session end)
  → `session-handoff` (pick up from a previous checkpoint)
```

### Step 3: Check What Hasn't Been Done

Cross-reference the session against this checklist. Only flag items relevant to what was built — not every item applies every time.

| Check | Applies When | Skill |
|---|---|---|
| Spec was read and gaps identified? | Working from a spec | `spec-workflow` skill |
| Plan was approved before coding? | Any implementation | `implement` skill |
| Independent behavioural tests needed? | Risky logic, persistence, complex rules, strict TDD | `test-driven-implementation` skill |
| Tests exist and pass? | Any code change | `implement` skill, `test-driven-implementation` skill, or `hypothesis-debug` skill |
| Code style audit done? | UI code was written | `code-style` skill |
| UX audit done? | User-facing feature | `ux-audit` skill |
| Quality gate passed? | User-facing feature | `pre-ship` skill |
| Fresh-eyes review done? | Complex or risky change | `code-review` skill |
| Blast radius understood? | Multi-package or shared type change | `blast-radius` skill |
| Spec reconciled with implementation? | Spec gaps found during build | `spec-workflow` skill |
| Cross-artifact consistency checked? | Multiple specs or docs touched | `project-state-audit` skill |
| Changes committed and PR created? | Work is complete | `pr-shipping` skill |
| Session checkpointed before compacting? | Long session, context getting large | `session-handoff` skill |
| Seeds checked for related ideas? | Starting new feature area | `project-state-audit` skill (checks seeds) |
| Persona validation done? | User-facing feature about to be built | `user-test` skill |

### Step 4: Recommend

Present a concise recommendation:

```
## What's Next

**Current state:** [1-line summary of where the session is]

**Recommended:** `skill-name` — [why this is the right next step]

**Also consider:**
- `skill-name` — [if this secondary concern applies]
```

If multiple skills are equally valid, list them in recommended order with a brief reason for each. Do not list more than 3 options.

If the session is clean (nothing has happened), ask what the user wants to work on.

## Rules

- Never do work — only recommend
- Base recommendations on actual session context, not generic advice
- If a skill already ran this session and produced a clear next step, echo that recommendation
- Do not recommend skills that already completed successfully this session (unless re-running makes sense, e.g., `code-review` skill after fixes)
- Keep the output to 3-5 lines — this is a signpost, not a planning document
