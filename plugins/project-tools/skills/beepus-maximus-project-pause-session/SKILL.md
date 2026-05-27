---
name: pause-session
description: Create a durable handoff that lets a later session resume the current work safely.
---

# Pause — Session Handoff

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Pause workflow. Your job is to capture the current session's state into a handoff file so work can resume after `/compact` or in a new session.

This skill creates `.continue-here.md` at the repo root. That file is the single source of truth for resuming.

## When to Use

- Before running `/compact` to preserve context through compression
- When ending a session mid-task
- When context is getting large and you want to checkpoint progress
- When the context monitor hook suggests it

## Process

### Step 1: Status Pulse

Before writing anything, answer these questions concisely to capture the session's momentum:

1. **Hypothesis tested** — What approach or assumption was being validated?
2. **Exact changes made** — What files were created, modified, deleted? What functions/types changed?
3. **Before/after** — What was broken or missing before? What works now?
4. **What improved** — Concrete wins (tests passing, build fixed, feature working)
5. **What didn't improve** — Things attempted that failed or were abandoned
6. **Current blocker** — What's stopping further progress right now? (Or "none — clean stopping point")
7. **Next action** — The single most important next step

### Step 2: Self-Audit

Pause and question your own work honestly:

1. **What is true?** — List claims supported by evidence (test output, build success, git diff). Cite the evidence.
2. **What is assumption?** — List things you believe but haven't verified (e.g., "this handles edge case X" without a test for it)
3. **What could be wrong?** — What's the highest-risk area in the work done? What would break first?
4. **Anything to flag?** — Spec gaps discovered, unexpected behaviour, lessons worth recording

Present findings as an Evidence vs Assumptions table:

| Claim | Type | Evidence/Source | Confidence |
|-------|------|-----------------|------------|
| [specific claim] | Evidence / Assumption | [test output, file:line, git diff, or "untested"] | High / Med / Low |

If the self-audit reveals real issues, note them in "Remaining Work" rather than silently ignoring them.

### Step 3: Assess Session State

Review the current conversation and determine:

1. **What was the goal?** — The original user request or task
2. **What command/workflow is active?** — Which skill is running (e.g., `implement` skill Phase 4, `hypothesis-debug` skill Phase 3)
3. **What has been done?** — Files created, modified, tests written, decisions made
4. **What remains?** — Specific next steps, in dependency order
5. **What decisions were made?** — Architectural choices, spec interpretations, user approvals
6. **What was discovered?** — Spec gaps, bugs found, lessons learned, blockers hit
7. **What branch are we on?** — Current git branch and commit state

### Step 4: Collect Evidence

```bash
git branch --show-current
git status
git log --oneline -5
```

### Step 5: Write the Handoff File

Create `.continue-here.md` at the repo root:

```markdown
# Continue Here

**Created:** <timestamp>
**Branch:** <current branch>
**Active workflow:** <command and phase, e.g., "implement skill Phase 4 — Push Notifications">

## Goal
<1-2 sentences: what the user asked for>

## Status Pulse
| Question | Answer |
|----------|--------|
| Hypothesis tested | <from Step 1> |
| Changes made | <files and types touched> |
| What improved | <concrete wins> |
| What didn't | <failed attempts> |
| Current blocker | <or "clean stop"> |
| Next action | <single next step> |

## Evidence vs Assumptions
| Claim | Type | Evidence/Source | Confidence |
|-------|------|-----------------|------------|
| <from Step 2 self-audit> | | | |

## Current State
<What phase of work we're in, what's working, what's not>

## Completed
- <Specific things done, with file paths>
- <Tests written and their status>
- <Commits made>

## Decisions Made
- <Architectural choices with reasoning>
- <User approvals received>
- <Spec interpretations adopted>

## Remaining Work
1. <Next immediate step — be specific>
2. <Subsequent steps in order>
3. <Final verification steps>

## Discovered During Session
- <Spec gaps found>
- <Bugs encountered>
- <Lessons worth recording>

## Patterns Discovered
- <Codebase patterns, conventions, or helpers discovered during this session>
- <Architecture insights that would help a fresh session>
- <Test patterns or fixture approaches that worked well>

## Context to Reload
- <Key files to re-read to regain context>
- <Relevant spec sections>
- <Test files to check>

## Resume With
`resume-session` skill — or manually: read this file, then continue from "Remaining Work" step 1.
```

### Step 6: Confirm

Report to the user:

```
## Session Paused

Handoff saved to `.continue-here.md`.

**State:** <1-line summary>
**Next step:** <what resume-session skill will pick up>

To continue: `resume-session` skill (after compaction or in a new session)
```

## Rules

- Always include enough detail that a fresh context can pick up without re-reading the entire conversation
- Include file paths, not just descriptions — "modified the auth client file" is better than "updated auth"
- Include the branch name — resuming on the wrong branch is a common failure
- If a plan was approved, summarise it — don't just say "the plan"
- If tests exist, note whether they pass or fail
- Overwrite any existing `.continue-here.md` — there is only one active handoff
- Do not commit `.continue-here.md` — it's a local working file
- Keep the file under 100 lines — this is a checkpoint, not a novel
