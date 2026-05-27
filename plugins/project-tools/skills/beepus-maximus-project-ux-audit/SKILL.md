---
name: ux-audit
description: Audit user-facing workflows from entry points through outcomes to find broken promises and dead ends.
---

# UX Audit — User Experience Flow Analysis

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the UX Audit workflow. Your job is to audit user-facing features from the outside in — starting from what the user sees and tracing forward to find where the experience breaks.

This is part of the **quality trio**: `code-style` skill (code patterns) → `ux-audit` skill (user experience) → `pre-ship` skill (spec compliance + visual quality). Each covers a different lens. Run all three for thorough quality coverage.

## Freshness Rule

Base all findings on current source code only. Do not read or reference files in `.agents/`, `scratch/`, or prior audit reports. If you recall information from a previous session, verify it against the current file before citing it.

## Required Reading

Before auditing, read:

1. the project UI implementation guidelines — view structure rules
2. the project design-quality guidelines — anti-patterns and quality gate
3. the project product principles or decision criteria — product values
4. the project lessons or known-issues document — past mistakes
5. The feature's specification in the project specifications or requirements documents (if one exists)

## Scope Detection

- If the user names specific files or a feature → audit those
- If recent git changes exist on the current branch → audit the changed feature
- If unclear → ask the user which feature to audit

## Process

### Pass 1: Entry Point Discovery

Grep the codebase for UI entry points in the feature scope:

| Pattern | What It Finds |
|---------|--------------|
| `.sheet(`, `.fullScreenCover(` | Modal presentations |
| `NavigationLink`, `navigationDestination(` | Navigation pushes |
| `.contextMenu(` | Context menu actions |
| `.swipeActions(` | Swipe actions on list rows |
| `Button(` with action closures | Tappable actions |
| `.onTapGesture(`, `.onLongPressGesture(` | Gesture-only interactions |
| `.toolbar(` | Toolbar buttons |
| `ContentUnavailableView` | Empty state actions |

Build an **entry point inventory** — a table of every interactive element the user can touch.

### Pass 2: Honor the Promise

The core principle: **when a UI element promises something, it must deliver exactly that.**

For each entry point in the inventory:

1. **Read the label** — what does the button/link/action say it does?
2. **Trace the action** — what actually happens when the user taps it?
3. **Compare promise to delivery** — does the action match the label?

Flag violations:

| Violation | Example |
|-----------|---------|
| **Broken promise** | "Track Price" button navigates to a settings screen |
| **Dead end** | Button presents a sheet with no content or no way to complete the action |
| **Dismiss trap** | Sheet has no cancel/close button and no swipe-to-dismiss |
| **Missing confirmation** | Destructive action happens without confirmation |
| **Silent failure** | Action appears to do nothing (no feedback, no error, no state change) |
| **Wrong destination** | Navigation goes somewhere unexpected from the label |
| **Incomplete flow** | Multi-step process that has no way to complete (missing save/submit) |

### Pass 3: Data Wiring Verification

Check whether the feature uses real data or is running on fakes. This catches features that look functional but are actually hollow.

**Detection patterns:**

| Smell | What To Grep For |
|-------|-----------------|
| Hardcoded values masquerading as data | Literal strings/numbers in view body that should come from a model |
| `asyncAfter` + hardcoded return | `DispatchQueue.main.asyncAfter` followed by hardcoded data (fake async) |
| Mock data in production paths | `preview`, `mock`, `sample`, `dummy`, `placeholder`, `fake` in non-test, non-preview code |
| Ignored model properties | Model has properties the view never reads or displays |
| Test doubles in production | Protocol conformances named `Mock*` or `Stub*` used outside test targets |

**Build a cross-reference matrix:**

| Feature/Screen | Data Available (model properties) | Data Used | Data Ignored |
|---------------|----------------------------------|-----------|-------------|

Also verify the **real implementation check**:
- Tests may use mocks, fixtures, or fakes — that is expected
- But the **production code path** must use the real implementation (real production integrations, not mocks)
- Grep for protocol conformances: ensure the composition root wires real implementations, not test doubles

### Pass 4: Semantic Evaluation

Evaluate the feature from the user's perspective across four dimensions:

| Dimension | Questions |
|-----------|-----------|
| **Discoverability** | Can the user find this feature? Is the entry point visible without instructions? Are gestures supplemented by visible controls? |
| **Efficiency** | Can the user complete the primary task in a reasonable number of taps? Are there unnecessary intermediate screens? |
| **Feedback** | Does the user know what happened after each action? Are loading, success, error, and empty states all handled? |
| **Recovery** | Can the user undo or go back from every state? Are destructive actions reversible or at least confirmed? |

### Phase 5: Report

Present findings in a single scannable table — do NOT use bulleted lists for individual findings:

```
## UX Audit — [Feature Name]

### Quality Trio Status
| Skill | Status |
|---------|--------|
| `code-style` skill | [Not run / Passed / N findings] |
| `ux-audit` skill | Running |
| `pre-ship` skill | [Not run / Passed / N findings] |

Recommended next: [whichever of the trio has not run yet, or `code-review` skill if all three are done]

### Entry Point Inventory
| # | Element | Label/Affordance | Location (file:line) | Type |
|---|---------|-----------------|---------------------|------|

### Findings

| # | Category | Severity | File:Line | Promise | Reality | Fix | Effort |
|---|----------|----------|-----------|---------|---------|-----|--------|

Categories: Broken Promise | Dead End | Data Wiring | Feedback Gap | Recovery Gap | Discoverability
Severity: CRITICAL | HIGH | MEDIUM | LOW
Effort: S (minutes) | M (under an hour) | L (hours)

### Data Wiring Matrix
| Feature/Screen | Data Available | Data Used | Data Ignored |
|---------------|---------------|-----------|-------------|

### Already Good
- [things done well — acknowledge quality]
```

**STOP and wait for user approval before implementing fixes.**

### Phase 6: Implement Fixes

After user approves (or adjusts):

1. Fix CRITICAL findings first, then HIGH, then MEDIUM
2. Make changes surgically — only touch what was approved
3. Follow project conventions exactly
4. Do NOT refactor beyond approved findings
5. Do NOT add features — only fix UX gaps

### Phase 7: Verify

1. Build the project using the project build/test tool
2. Run the project lint command, if one exists
3. Run tests for the feature area
4. If the app is running in the simulator, walk through the fixed flows

## Audit Diff (when re-running)

If a previous UX audit report exists for this feature (check conversation context), compare:

1. Re-check each previously reported finding against the current code
2. Classify as: **Resolved** (code changed, issue gone) | **Still Open** (unchanged) | **Regressed** (was fixed, now broken again)
3. Check for **New Issues** introduced since the last audit
4. Present a diff summary before the full report

## Next Steps

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| Code style not yet checked | `code-style` skill | Complete the quality trio |
| Spec compliance + visual polish not checked | `pre-ship` skill | Complete the quality trio |
| All three quality passes done | `code-review` skill | Fresh-eyes adversarial critique |
| UX findings require spec changes | `sync-spec` skill | Reconcile spec with UX reality |
| Ready to ship | `ship-it` skill | Commit, PR, monitor, land |

## Rules

- This skill audits UX, not code correctness — leave logic bugs to `code-review` skill
- Every finding must cite a specific file:line and describe the user impact
- Do not invent findings — if a pass produces no issues, report it clean
- The "Honor the Promise" principle is the core heuristic — when in doubt, ask "does this deliver what it promises?"
- Mock data in tests is fine; mock data in production code paths is a finding
- Do not change feature behaviour — only fix UX gaps in the existing design
- If a UX issue requires new feature work, flag it in "Out of Scope"
