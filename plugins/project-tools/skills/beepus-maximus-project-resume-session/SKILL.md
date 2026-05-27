---
name: resume-session
description: Resume work from a saved handoff by validating state, reloading context, and continuing the workflow.
---

# Resume — Continue From Handoff

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Resume workflow. Your job is to read `.continue-here.md`, restore context, and continue the paused work.

## Process

### Step 1: Read the Handoff

```bash
cat .continue-here.md
```

If the file does not exist, tell the user there is no paused session to resume and suggest `workflow-navigator` skill or `project-scope` skill instead.

### Step 2: Verify State

Confirm the handoff is still valid:

1. **Branch** — Are we on the branch listed in the handoff? If not, ask before switching.
2. **Files** — Do the key files mentioned still exist and match expectations?
3. **Tests** — Run any tests mentioned to confirm current state matches the handoff.

```bash
git branch --show-current
git status
```

If the branch or files have diverged significantly from what the handoff describes, warn the user before proceeding.

### Step 3: Reload Context

Read the files listed in the "Context to Reload" section of the handoff. This restores the knowledge needed to continue.

### Step 4: Present the Resumption Plan

```
## Resuming Session

**Goal:** <from handoff>
**Active workflow:** <command and phase>
**Branch:** <current branch>

### Already Done
- <completed items from handoff>

### Picking Up From
<The specific next step from "Remaining Work">

### Key Decisions (Carried Forward)
- <decisions from handoff that affect remaining work>

Ready to continue. Proceeding with: <next step description>
```

### Step 5: Continue Work

Resume the active workflow from where it left off. Follow the same skill's process — if the handoff says "`implement` Phase 4", continue with Phase 4 of the `implement` skill.

### Step 6: Clean Up

After the resumed work reaches a natural checkpoint (task complete, phase complete, or user pauses again):

- If work is complete: delete `.continue-here.md`
- If pausing again: `pause-session` skill will overwrite it

## Rules

- Always verify the branch before doing any work
- Re-read key files rather than trusting the handoff's descriptions of their contents — files may have changed
- Honour decisions recorded in the handoff unless the user overrides them
- If the handoff references a plan, re-read and follow the plan
- If the handoff is stale (files deleted, branch force-pushed, significant changes), warn the user rather than blindly proceeding
- Do not delete `.continue-here.md` until work reaches a natural completion point
