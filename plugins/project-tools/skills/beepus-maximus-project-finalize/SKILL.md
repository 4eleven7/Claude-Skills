---
name: finalize
description: Run the post-implementation QA pipeline: lint, build, test, simplify, review, distill, and prepare changes for commit.
---

# Finalize Implementation

Post-implementation QA pipeline: lint → build → test → simplify → review → distill → commit.

Chains the steps you'd normally run manually into one automated flow. Each phase gates the next — if a phase fails, stop and report.

## Responsibility

**Owns:** Orchestrating the full QA-to-commit pipeline.
**Does NOT own:** The individual quality checks (delegates to existing tools and skills).

## Phase 1: Lint and Format

Run the project formatter and lint command on changed files, if the project defines them:

```bash
[project formatter command for changed files]
[project lint command]
```

If the formatter changes files, re-stage them. If the lint command reports errors, fix them before proceeding.

## Phase 2: Build

Build the project via the project build/test tool:

```
build_sim (with session defaults)
```

If the build fails, stop and report the error. Do not proceed to testing.

## Phase 3: Test

Run the test suite via the project build/test tool:

```
test_sim (with session defaults)
```

If tests fail, stop and report. Do not proceed to review.

For package-level changes, also run affected package tests:

```bash
cd Packages/<affected> && xcodebuild test -scheme <PackageName>PackageTests
```

## Phase 4: Simplify

Run the `code-review-4lens` skill on staged changes (`git diff --cached`) with emphasis on safe simplification.

This reviews for:
- Code reuse opportunities (existing utilities that could replace new code)
- Quality patterns (redundant state, parameter sprawl, copy-paste)
- Efficiency (unnecessary work, missed concurrency, hot-path bloat)
- Clarity (naming, complexity, standards compliance)

Stage any changes made by the simplifier.

## Phase 5: Review

Run a focused code review on the staged diff, checking for:
- Correctness bugs and logic errors
- Missing guard clauses and error handling
- Security issues (if applicable)
- Unhandled edge cases
- persistence migration requirements (if models changed)

This catches different problems than Phase 4. Always run both.

Stage any changes made during review.

## Phase 6: Session Distill (Optional)

If the session involved non-trivial work (corrections, repeated guidance, new patterns), run the `session-distill` skill to extract and route learnings.

Skip if the session was a simple, straightforward change.

## Phase 7: Commit

### Step 1: Determine Intent

Check current branch and whether a PR exists:

```bash
git branch --show-current
gh pr view 2>/dev/null
```

Ask the user how to proceed:
- **Feature branch with PR** — commit and push, or commit only
- **Feature branch without PR** — commit and push, or commit and create PR, or commit only
- **Main branch** — commit only (warn about direct commits to main)
- **Abort** — leave changes staged

### Step 2: Commit

Create the commit following the project's commit message conventions (check recent `git log` for style).

If the commit fails due to a pre-commit hook, fix the issues, re-stage all modified files, then retry with a NEW commit (never amend).

### Step 3: Push and PR (if requested)

- **Push only** — `git push`
- **Create PR** — `git push -u origin HEAD` then create PR via `gh pr create`
- **Skip** — end the workflow

## Rules

- Never stage or commit files containing secrets (`.env`, credentials, API keys). Warn if detected.
- If a non-test phase fails, stop and report. Do not skip ahead.
- Run the project lint command before committing when one exists.
- Run the project's build verification script (if one exists) before pushing.
- Do not present diffs to the user. Use `git diff` internally as needed.
- Each phase gates the next. No skipping.

## Reference

- [GitHub CLI quick reference](references/gh-cli.md) — `gh pr`, `gh run`, `gh api` syntax
