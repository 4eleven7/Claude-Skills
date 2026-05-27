---
name: tweak
description: Make trivial low-risk changes directly, then run the minimum useful verification.
---

# Tweak — Zero-Ceremony Change

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Tweak workflow. You handle trivial changes that need no plan, no spec, no subagents — just do it and verify.

Use this for: typo fixes, config changes, renaming, updating a string, adjusting a constant, fixing a comment, toggling a flag, adding a gitignore entry, or any change where the correct action is obvious and the blast radius is negligible.

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` is the requested change. Examples: "fix the typo in the auth service" or "rename `oldName` to `newName` in the auth package".

## Process

### Step 1: Do It

Read the relevant file(s), make the change. No plan, no approval gate.

### Step 2: Verify

Run the minimum verification that proves the change is safe:

| Change Type | Verification |
|-------------|-------------|
| Code change | Build the affected package, module, or target |
| Test file change | Run the affected test suite |
| Config / script change | Run the script or build to confirm no breakage |
| Documentation only | No verification needed |

```bash
# For code changes, at minimum:
[project lint command]
```

### Step 3: Report

```
## Tweak Done

- **Changed:** <file:line — what changed>
- **Verified:** <what was run to confirm>
```

One line per change. No ceremony.

## Scope Triage

Before making the change, assess whether `tweak` skill is the right tool. This triage is mandatory — it ensures the user learns the boundaries between commands and the work gets the right level of rigour.

### Step 0: Check the Work

Read the relevant file(s) and classify the change:

| Signal | Right Command | Why |
|--------|--------------|-----|
| One file, obvious fix, no behaviour change, no tests needed | **`tweak` skill** — proceed | The change is mechanical. Verification (build + lint) is sufficient. |
| Correct fix requires understanding surrounding logic | **`patch` skill** — hand off | Needs an audit step to avoid breaking something. `patch` skill reads context first. |
| Change has testable behaviour (even if small) | **`patch` skill** — hand off | `patch` skill writes a test first. Untested behaviour changes are not tweaks. |
| Touches a shared type, schema, protocol, or persisted model | **`patch` skill** — hand off | Shared contracts have dependents. `patch` skill audits and verifies more thoroughly. |
| Rename spans multiple files across packages | **`patch` skill** — hand off | Multi-file renames need verification across package boundaries. |
| Needs a spec to understand what to build | **`implement` skill** — hand off | This is feature work, not a tweak. |
| Needs an architectural decision | **`implement` skill** — hand off | This needs a plan. |

### Handoff Format

If the triage redirects, explain *why* so the user understands the boundary:

```
## Redirecting → patch skill

**Requested:** <what was asked>
**Why not tweak skill:** <specific reason — e.g., "This touches a shared persisted model with multiple dependents. patch skill will audit the impact and write a test.">
**What patch skill adds:** <what the user gains — e.g., "Audit step, test-first verification, migration check.">

Running patch skill now.
```

Then invoke `patch` skill with the original arguments. Do not ask the user to re-invoke manually — hand off directly.

## Rules

- No plan, no spec review, no competing approaches
- No subagents
- Always verify with at least a build (for code) or lint
- If the change touches tests, run them
- Scope guard is mandatory — do not let a tweak grow into an implementation
- This skill does not update scope/todo documents
