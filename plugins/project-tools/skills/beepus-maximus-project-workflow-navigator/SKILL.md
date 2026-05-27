---
name: workflow-navigator
description: Recommend the next workflow step from the current conversation, repo state, and verification status.
---

# What's Next — Workflow Navigator

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the What's Next workflow. Your job is to look at the current conversation context and recommend the most appropriate next skill.

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
  → clarify-spec skill (if spec exists but has gaps)
  → project-scope skill (if unsure what to work on next)
  → implement skill (if spec is ready)

Small or trivial change
  → tweak skill (typo, config, rename — obvious and trivial)
  → patch skill (small but needs tests and verification)
  → implement skill (needs a plan or architectural decision)

Building a feature
  → implement skill (if mid-build, resume)
  → hypothesis-debug skill (if a test is failing or something is broken)
  → code-style skill (if code is written, no obvious bugs)

Code is written and working
  → code-style skill (if UI code, hasn't been style-checked)
  → ux-audit skill (if user-facing, hasn't been UX-audited)
  → pre-ship skill (if user-facing, hasn't been polished)
  → code-review skill (if complex, hasn't been reviewed)
  → blast-radius skill (if touches shared types or multiple packages)

Quality passes are done
  → sync-spec skill (if spec gaps were found during build or review)
  → ship-it skill (if everything is verified and ready)

Bug was reported or discovered
  → hypothesis-debug skill (always)

Something went wrong or state is confusing
  → forensics skill (investigate what happened)

Just shipped / between tasks
  → project-scope skill (to find what's next in the project)

Deciding between user-facing features
  → user-test skill (compare options through target user lenses)

Capturing an idea for later
  → idea-seed skill (idea with trigger conditions)

Session getting long or ending mid-task
  → pause-session skill (checkpoint before /compact or session end)
  → resume-session skill (pick up from a previous pause-session skill)
```

### Step 3: Check What Hasn't Been Done

Cross-reference the session against this checklist. Only flag items relevant to what was built — not every item applies every time.

| Check | Applies When | Skill |
|---|---|---|
| Spec was read and gaps identified? | Working from a spec | `clarify-spec` skill |
| Plan was approved before coding? | Any implementation | `implement` skill |
| Tests exist and pass? | Any code change | `implement` skill or `hypothesis-debug` skill |
| Code style audit done? | UI code was written | `code-style` skill |
| UX audit done? | User-facing feature | `ux-audit` skill |
| Quality gate passed? | User-facing feature | `pre-ship` skill |
| Fresh-eyes review done? | Complex or risky change | `code-review` skill |
| Blast radius understood? | Multi-package or shared type change | `blast-radius` skill |
| Spec reconciled with implementation? | Spec gaps found during build | `sync-spec` skill |
| Cross-artifact consistency checked? | Multiple specs or docs touched | `docs-audit` skill |
| Changes committed and PR created? | Work is complete | `ship-it` skill |
| Session checkpointed before compacting? | Long session, context getting large | `pause-session` skill |
| Seeds checked for related ideas? | Starting new feature area | `project-scope` skill (checks seeds) |
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
