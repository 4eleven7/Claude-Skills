# PR Shipping — Commit, PR, Monitor, Land

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the PR Shipping workflow. You own the entire flow from uncommitted changes to merged PR. There is no handoff — you commit, create the PR, monitor CI, fix failures, and land on main.

<HARD-GATE>
This skill MUST activate before ANY commit, PR creation, or ship request. Do not bypass it. Do not commit first and check after. This skill IS the commit/PR/ship flow.

Triggers:
- Any request to commit: "commit", "save my work", "commit and push"
- Any request to create a PR: "create a PR", "open a pull request"
- Any request to ship: "ship it", "merge this", "land this"
</HARD-GATE>

---

## Phase 0: Branch Setup

Before committing anything, ensure changes will land on a feature branch — not main.

### Step 0a: Check Current Branch

```bash
git branch --show-current
```

### Step 0b: Create Feature Branch If Needed

If currently on `main` (or the repo's default branch):

1. Generate a branch name: `ship/<short-slug>` derived from the dominant concern in the changes
2. Create and switch to it **before committing**: `git checkout -b ship/<slug>`
3. All commits in Phase 1 will now land on the feature branch

If already on a feature branch (not main), proceed — commits go to the current branch.

**Override:** If the user explicitly requests direct-to-main shipping, skip branch creation and commit directly to main. This is the only way to bypass branch+PR. The default is always branch+PR.

---

## Phase 1: Commit

### Step 1: Collect Changes

```bash
git status
git diff
git diff --cached
```

Gather all staged, unstaged, and untracked changes. If there are no changes, abort with a message.

**Partial staging:** If changes are already partially staged (some files staged, some not), ask the user whether to commit only staged changes or include all changes. Do not silently override their staging decisions.

**Unrelated changes:** If there are uncommitted changes that do not belong to the current ship scope (e.g., changes from a different feature, WIP notes, or exploration docs), **do not discard them**. Instead:

1. List the unrelated files and ask the user what to do
2. Options: stash them (`git stash push -- <files>`), include them in a separate commit, or leave them uncommitted
3. **Never use `git restore` or `git checkout --` on uncommitted work** — this destroys the user's changes permanently

### Step 2: Classify Each File

For every changed/added file, determine:

**Type** — exactly one of:
| Type | When |
|------|------|
| FEAT | New functionality |
| FIX | Bug fix |
| UI | Visual polish, layout, spacing, colour — no new behaviour |
| REFACTOR | Restructuring without behaviour change |
| TEST | Adding or updating tests |
| DOCS | Documentation only |
| CHORE | Config, scripts, dependencies, tooling |

**Concern** — the logical grouping this file belongs to. Infer from:
- Package name (`Packages/<Name>/` → the package name)
- Layer (model, provider, view, test)
- Purpose (what feature or subsystem does this serve?)

### Step 3: Group Into Commits

Apply the **type + concern hybrid** strategy:

1. Group files by type first
2. Within a type, split into separate commits if files serve **unrelated concerns**
3. Keep same-concern files together even if they span layers (a model + its view = one FEAT commit when they serve the same feature)
4. A single file with mixed concerns stays in one commit under the dominant type

**Plan-aware grouping:** If a plan exists for this work (from `implement` skill or `small-change` skill), prefer one commit per plan task. Each task in the plan maps to a logical unit of work — use that as the primary grouping, then apply the type+concern strategy within tasks that are too large for a single commit.

**Decision rule:** If you removed one group of changes, would the remaining changes still make sense on their own? If yes, they should be separate commits.

### Step 4: Order Commits

When producing multiple commits, order them:

1. Schema / model changes
2. Business logic / providers / services
3. Views / UI
4. Tests
5. Documentation / configuration / chore

### Step 5: Format Messages

Each commit message follows this format:

```
[<Feature>] <TYPE>: <description>

[optional body]
```

**Feature tag** — infer from file paths:

| Path pattern | Tag |
|---|---|
| `Packages/<Name>/` | `[<Name>]` |
| `<App>/` or app-level | `[App]` |
| Documentation or docs folders | `[Docs]` |
| the project scripts folder | `[CI]` |
| Root config files | `[Project]` |
| Multiple packages equally | Use the dominant one, or `[App]` if truly cross-cutting |

**Rules:**
- Type is UPPERCASE
- Description: lowercase start, imperative mood ("add", not "added"), no trailing period
- Description portion under 50 characters (the `[Tag] TYPE:` prefix does not count toward this limit)
- Body (optional): explain the "why" for non-obvious changes. Skip for trivial changes.
- If an issue number is known or inferable, include `Fixes #N` or `Closes #N` in the body
- Use HEREDOC for commit messages to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
[Feature] TYPE: Description

Optional body here.
EOF
)"
```

### Step 6: Stage and Commit Each Group

For each group, in order:

1. `git add <specific files>` — only the files in this group
2. Commit with the formatted message
3. Move to the next group

Never use `git add -A` or `git add .`. Always add specific files.

**If a commit fails** (e.g., pre-commit hook rejection): stop the entire sequence. Report which commit failed, which files were in it, and the error. Do not attempt to continue with remaining groups.

If this is a **commit-only** request (user said "commit" but not "ship" or "create PR"), stop here.

---

## Phase 2: PR Creation

### Step 1: Collect Branch Context

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

### Step 2: Push Branch

Push the current feature branch (created in Phase 0) to origin:

```bash
git push -u origin <branch-name>
```

If the branch already exists on remote, abort and ask the user.

### Step 3: Generate PR

**Title:** Under 70 characters, starts with a verb, specific and technical.

**Body:** Use this template:

```markdown
## Summary
<1-3 bullet points synthesized from commit messages — what changed and why>

## Technical Details
<Key architectural decisions, new types, patterns. Only if meaningful.>

## Risk Areas
<Persistence/schema, public API, architecture, performance, large diff, new deps, shared types>
<If none: "None identified.">

## Persistence Impact
<Only if persisted models, schemas, contracts, or migrations are in the diff>
- **Schema change**: <what changed>
- **Migration**: <required/not required — why>
- **Data safety**: <existing data preserved?>

## Testing
<Test files added/modified. Flag untested logic changes.>
```

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

---

## Phase 3: Monitor, Fix, Land

This phase runs automatically after every PR creation — whether the user said "ship it", "create a PR", or any other trigger. Always enable auto-merge and monitor CI. No handoff, no separate command.

### Step 1: Enable Auto-Merge

```bash
gh pr merge <number> --auto --rebase
```

If auto-merge is not available, skip and merge manually after CI passes.

### Step 2: Monitor CI

Poll every 30 seconds for up to 60 minutes:

```bash
gh pr view <number> --json state,mergeStateStatus,statusCheckRollup
```

Brief status update every 2 minutes.

**Exit conditions:**

| Condition | Action |
|-----------|--------|
| `state` is `MERGED` | Go to Step 5 (Land) |
| All checks `SUCCESS` + `mergeStateStatus` `CLEAN` | Wait 2 min for auto-merge, then merge manually. Go to Step 5 |
| Any check `FAILURE` or `ERROR` | Go to Step 3 (Diagnose) |
| `mergeable` is `CONFLICTING` | Go to Step 4 (Conflicts) |
| Timeout (60 minutes) | `session-handoff` skill to checkpoint, then report status and stop |

### Step 3: Diagnose Failure

```bash
gh pr checks <number>
gh run view <run-id> --log-failed
```

Classify:

| Classification | Signal | Action |
|----------------|--------|--------|
| **Flaky** | Unrelated test, known flaky, timeout | Retry (`gh run rerun <id> --failed`), max 2 retries |
| **Real failure** | Compile error, test in changed code, lint violation | Propose fix, **STOP for user approval**, then fix+push+resume |
| **Infrastructure** | Runner timeout, network error | Wait 2 min, retry |
| **Unknown** | Cannot determine | Report and stop |

**Limits:** 2 retries per unique failure. 3 fix-and-push cycles max.

### Step 4: Resolve Merge Conflicts

```bash
git fetch origin main
git merge origin/main
```

If conflicts: read files, propose resolution, **STOP for user approval**, then resolve+commit+push+resume.

### Step 5: Land

After merge:

```bash
git checkout main
git pull
git branch -d <branch-name>
```

Report:

```
## PR #<number> Landed

- **Title**: <title>
- **Merged at**: <timestamp>
- **CI retries**: N
- **Conflicts resolved**: yes/no
- **Fixes pushed**: N
```

---

## Phase 4: Session Reflection

Runs after PR creation (whether or not monitoring follows). Non-blocking — the PR is already live.

### Read context

```bash
read the project lessons or known-issues document
```

### Check for patterns

- Did this session require knowledge no installed skill covers?
- Did a `lessons.md` rule apply and have to be followed manually?
- Should a memory entry be created, updated, or removed?

### Emit insights

Output a **Session Insights** block. Keep to 2-5 lines. If nothing stands out: "No new patterns detected."

Each observation must be one of:
- **Skill gap**: "No skill covers [X] — had to [Y] manually."
- **Lesson recurrence**: "`lessons.md` entry about [topic] was relevant again."
- **Memory update**: "Memory entry `<name>` is stale."
- **New pattern**: "Repeating pattern: [description]. Add to `lessons.md`?"

---

## Limits

| Limit | Value | Reason |
|-------|-------|--------|
| Total monitoring time | 60 minutes | Avoid infinite loops |
| CI retries per failure | 2 | Distinguish flaky from real |
| Fix-and-push cycles | 3 | Prevent infinite fix loops |
| Conflict resolution attempts | 1 | Repeated conflicts = deeper problem |

## Safety Rules

- Never force-push
- Never skip hooks or CI checks
- Never bypass branch protection
- Never merge with failing required checks
- Never make code changes without user approval (during monitor phase)
- Never modify files outside the PR's scope to fix CI
- If anything feels wrong, stop and report

## Prerequisites

Verification (lint, build, tests) is expected to have been run before invoking this skill. This skill assumes the code is ready to commit.

For non-trivial changes (multiple packages, shared types, persistence), consider running `blast-radius` skill before shipping to understand the impact footprint.

## What This Skill Does NOT Do

- Run local tests, lint, or build checks (do those before shipping)
- Review code quality (use the `code-review` skill)
- Ask for approval before splitting commits — it splits automatically
