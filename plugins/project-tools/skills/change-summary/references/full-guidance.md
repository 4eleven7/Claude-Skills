# Change Summary

Generate a structured post-work audit that captures the full story of a change: why it was made, what was done, whether it worked, and how to reverse it. Produces a report the user (or a future session) can use to understand or undo the work.

For user-facing release notes or change-summary output, use `references/release-notes.md`.

## Responsibility

**Owns:** Gathering evidence from the session and git state, producing a structured audit report.
**Does NOT own:** Deciding whether the changes are correct (that's review). Does not commit, push, or modify code.

## Step 1: Gather Evidence

Collect from three sources in parallel:

### Session Context

Scan the conversation for:
- The original problem statement or request
- Any root cause analysis performed
- Hypotheses tested and their outcomes
- Verification steps run and their results
- Known issues flagged but not addressed

### Git State

```bash
# What changed
git diff main...HEAD --stat
git diff main...HEAD

# Commit history on this branch
git log main..HEAD --oneline

# Any uncommitted work
git status
git diff
git diff --cached
```

### Build and Test State

Run verification to capture current state:
- Build status (via the project build/test tool or shell)
- Test results for affected areas
- Lint status if relevant

## Step 2: Classify the Change

Determine the change type:

| Type | Signal |
|------|--------|
| Bug fix | Started from a failure, crash, or unexpected behavior |
| Feature | Started from a requirement or spec |
| Refactor | Behavior unchanged, structure improved |
| Configuration | Build settings, dependencies, CI, tooling |
| Investigation | Mostly diagnostic, may include speculative changes |

## Step 3: Build the Report

Present the audit in this exact structure:

```
# Change Audit

## Problem
[One paragraph: what was wrong or what was requested. Include the original error message, test failure, or user request verbatim if available.]

## Root Cause
[What was actually causing the problem. If no root cause was identified (e.g., feature work), state "N/A — feature implementation" or "N/A — refactor".]

## What Was Implemented
[Bulleted list of every change, grouped by file or module. Be specific — name functions, types, and fields that were added/modified/removed.]

### Files Changed
[List every file with a one-line description of what changed in it.]

## Evidence vs Assumptions

Separate what is proven from what is believed. This is especially important for bug fixes and investigations.

| Claim | Type | Evidence/Source | Confidence |
|-------|------|-----------------|------------|
| [e.g., "Bug was caused by retain cycle in X"] | Evidence | [test output, crash log, git bisect] | High |
| [e.g., "Fix handles all edge cases"] | Assumption | [only tested happy path] | Med |
| [e.g., "No other callers affected"] | Assumption | [grep showed no other call sites, but dynamic dispatch possible] | Low |

Rules for this table:
- Every claim in "Root Cause" and "What Was Implemented" should have a row
- "Evidence" requires a concrete source: test output, build log, git diff, file:line reference
- "Assumption" means you believe it but haven't proven it — flag these for the user
- Confidence is about the claim, not the change: High = proven, Med = likely but unverified, Low = guess

## Verification
[What was run to verify the changes work. Include actual command output or test results — not just "tests pass" but which tests, how many, any warnings.]

| Check | Result | Command |
|-------|--------|---------|
| Build | ✅ / ❌ | [command] |
| Tests | ✅ / ❌ (N passed, M failed) | [command] |
| Lint | ✅ / ❌ | [command] |

## Unresolved Issues
[Anything known to be incomplete, deferred, or risky. If nothing, state "None identified."]

- [ ] [issue description — why it was deferred]

## To Undo These Changes

### If not yet committed:
\`\`\`bash
git checkout -- .
# or selectively:
git checkout -- <file1> <file2>
\`\`\`

### If committed but not pushed:
\`\`\`bash
git reset --soft HEAD~N  # where N = number of commits to undo
# Review staged changes, then:
git restore --staged .
git checkout -- .
\`\`\`

### If pushed:
\`\`\`bash
git revert <commit-sha>  # for each commit, oldest first
# or revert a range:
git revert main..HEAD --no-commit
git commit -m "Revert: [description]"
\`\`\`

### Specific rollback commands for this session:
[Generate the exact commands needed based on the actual commits and branch state. Include commit SHAs.]
```

## Step 4: Offer Next Steps

After presenting the report, ask:

> "Want me to save this audit, commit it, or take any action on the unresolved issues?"

Options:
- **Save** — write to `docs/superpowers/audits/YYYY-MM-DD-<topic>-audit.md`
- **Commit** — invoke post-implementation-qa or commit workflow
- **Address unresolved** — pick up deferred issues
- **Undo** — execute the rollback commands (with user confirmation)

## Rules

- Always use actual git state and build output — never guess or summarize from memory alone.
- Include exact commit SHAs in the undo section.
- If the session involved multiple unrelated changes, produce separate audit sections for each.
- The report is a snapshot. State what is true *now*, not what was true mid-session.
- Do not editorialize. Report facts. "Tests pass" or "tests fail" — not "the fix looks good."
