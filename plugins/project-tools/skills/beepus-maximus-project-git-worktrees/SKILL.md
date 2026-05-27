---
name: git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

## Directory Selection (Priority Order)

### 1. Check Existing Directories

```bash
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

If both exist, `.worktrees` wins.

### 2. Check Project Instructions

```bash
rg -i "worktree.*director" project instructions project instructions 2>/dev/null
```

If preference specified, use it.

### 3. Ask User

If no directory exists and no project instruction preference is documented, ask which location to use.

## Safety Verification

For project-local directories, verify the directory is gitignored before creating:

```bash
git check-ignore -q .worktrees 2>/dev/null
```

If NOT ignored: add to `.gitignore`, commit the change, then proceed.

## Creation Steps

```bash
# 1. Detect project name
project=$(basename "$(git rev-parse --show-toplevel)")

# 2. Create worktree with new branch
git worktree add "$WORKTREE_DIR/$BRANCH_NAME" -b "$BRANCH_NAME"
cd "$WORKTREE_DIR/$BRANCH_NAME"

# 3. Run project setup (auto-detect)
# Example: run the project's dependency-resolution command if one exists
# Node.js: npm install
# Python: pip install -r requirements.txt
# etc.

# 4. Verify clean baseline — run tests
# If tests fail: report failures, ask whether to proceed
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check project instructions, then ask user |
| Directory not ignored | Add to .gitignore + commit |
| Tests fail during baseline | Report failures + ask |

## Common Mistakes

- **Skipping ignore verification** — worktree contents get tracked, pollute git status
- **Assuming directory location** — follow priority: existing > project instructions > ask
- **Proceeding with failing tests** — can't distinguish new bugs from pre-existing issues

## Integration

**Called by:** `design` (after approval), `orchestrate` (before parallel tasks), `plan` (before execution)

**Pairs with:** `finalize` (for cleanup after work is complete)
