---
name: pre-ship
description: Run a final quality gate across spec compliance, UX, visual polish, and verification before release.
---

# Pre-Ship — Quality Gate

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Pre-Ship workflow. Your job is to audit and improve a feature's quality across three dimensions: spec compliance, user experience, and visual quality. This is the gate between "it works" and "it's ready."

This is part of the **quality trio**: `code-style` skill (code patterns) → `ux-audit` skill (user experience) → `pre-ship` skill (spec compliance + visual quality). Each covers a different lens. Run all three for thorough quality coverage.

## Required Reading

Before any audit, read ALL of these:

1. The feature's specification in the project specifications or requirements documents (if one exists)
2. the project design-quality guidelines — anti-patterns and quality gate
3. the project UI polish guidelines — polish techniques
4. the project UI implementation checklist — merge-readiness checklist
5. the project UI implementation guidelines — view structure rules
6. the project design-system documentation — palette and colour usage
7. the project lessons or known-issues document — past mistakes to avoid

Also invoke relevant supporting skills if they apply (e.g. `ios-ui`, `hig`, `swiftui-performance`, `ux-flow-audit`).

## Scope Detection

Determine what to audit from context:

- If the user names specific files or a feature → audit those
- If recent git changes exist on the current branch → audit the changed feature
- If unclear → ask the user which feature to polish

## Process

### Pass 1: Spec Compliance

If a specification exists for this feature, verify the implementation matches:

- Walk through each acceptance criterion — is it met?
- Walk through each constraint — is it respected?
- Are there behaviours the spec requires that are missing?
- Are there behaviours present that the spec does not describe?

**Classify findings:**
- **Spec violation** — behaviour contradicts or is missing from spec (must fix)
- **Spec ambiguity** — behaviour exists but spec is unclear (flag for user)

If spec violations are found, present them before proceeding to UX/UI passes. Spec compliance comes first.

### Pass 2: UX Flow Audit

Map the user journey through the feature, then audit:

**Flow Map**
1. **Entry points** — how does the user get here?
2. **Happy path** — ideal flow start to finish
3. **Decision points** — where does the user make choices?
4. **Exit points** — how does the user leave? Can they always go back?
5. **Error/edge paths** — what happens when things go wrong?

**Honor the Promise** — for every interactive element (button, link, swipe action), check: does the action match what the label promises? A "Track Price" button must track a price, not navigate to settings. Flag any broken promises as Critical UX findings.

**Data Wiring** — spot-check that user-facing data is real, not hardcoded or mock. Grep for `asyncAfter` + hardcoded values, `mock`/`placeholder`/`dummy` in production paths, and model properties the view ignores. Also verify the composition root wires real implementations (not test doubles) for production code paths — tests may use mocks, but production must not.

**UX Categories**

| Category | What to check |
|----------|--------------|
| **Flow Completeness** | Clear purpose per screen, no dead ends, no dismiss traps, back navigation preserves state |
| **State Coverage** | Loading, empty, error, success, and partial states all handled |
| **Feedback** | Immediate visual feedback on actions, confirmation on destructive actions, progress on long operations |
| **Discoverability** | Primary actions prominent, interactive elements look tappable, gestures are not the only path |
| **Navigation** | User knows where they are, logical hierarchy, appropriate sheet vs push usage |
| **Accessibility** | Assistive technology navigates the full flow, user font scaling does not break layouts, target-platform touch/click target sizes, colour not the only signal |
| **Data & Input** | Inline validation, correct input types, input focus dismisses appropriately |
| **Promise Delivery** | Every affordance delivers on its label — no broken promises, dead ends, or silent failures |
| **Data Integrity** | User-facing data comes from real sources, not hardcoded values or mock implementations |

### Pass 3: Code Style Audit

Delegate to `code-style` skill for the UI visual audit. That skill is the single source of truth for AI tell detection, house style enforcement, and UI quality patterns (spacing, typography, colour, structure, naming, access control, presentation purity, interaction states).

Run `code-style` skill on the same file scope. Incorporate its findings into the unified report below under the "Critical UI" and "Polish UI" sections.

### Phase 4: Report

Present a single unified report:

```
## Pre-Ship Audit — [Feature Name]

### Quality Trio Status
| Skill | Status |
|---------|--------|
| `code-style` skill | [Not run / Passed / N findings] |
| `ux-audit` skill | [Not run / Passed / N findings] |
| `pre-ship` skill | Running |

Recommended next: [whichever of the trio has not run yet, or `code-review` skill if all three are done]

### Flow Map
[Entry] -> [Screen A] -> [Decision] -> [Screen B] -> [Completion]
                                     \-> [Error Path] -> [Recovery]

### Findings

#### Spec Violations (must fix)
- [finding with file:line, spec criterion reference, user impact]

#### Critical UX (blocks or confuses users)
- [finding with file:line, user impact]

#### Critical UI (breaks quality gate)

| Before | After | Why |
| --- | --- | --- |
| [current code/behaviour at file:line] | [proposed fix] | [brief reasoning] |

#### Quality UX (reduces friction)
- [finding with file:line, user impact]

#### Quality UI (improves feel)

| Before | After | Why |
| --- | --- | --- |
| [current code/behaviour at file:line] | [proposed fix] | [brief reasoning] |

#### Already Good
- [things done well — acknowledge quality]

### Proposed Changes
1. [change] — [severity] — [files affected] — [user impact]
2. ...

### Out of Scope (noted for later)
- [things spotted but not part of this polish pass]
```

**Severity guide:**
- **Spec violation** — must fix before shipping
- **Critical** — significantly harms usability or breaks quality gate
- **Polish** — improves feel, not blocking

**STOP here and wait for user approval before implementing.**

### Phase 5: Implement Fixes

After user approves (or adjusts) the plan:

1. Fix spec violations first, then critical issues, then polish items
2. Make changes surgically — only touch what was approved
3. Follow project conventions exactly (design tokens, semantic styles, UI guidelines)
4. Do NOT refactor unrelated code
5. Do NOT add comments, docstrings, or type annotations to unchanged code
6. Do NOT change feature behaviour beyond what was approved
7. If a fix requires new UI states (empty, error, loading), implement them completely

### Phase 6: Verify

1. Build the project using the project build/test tool
2. Run the project lint command, if one exists
3. Run tests for the feature area
4. Walk through the flow to verify changes work end-to-end
5. If the app can be run visually, capture visual evidence at key points when appropriate

Present a summary:

1. **What changed** — list of changes with severity addressed
2. **What improved** — before/after for key UX and UI items
3. **Remaining items** — anything deferred to a future pass
4. **Verification evidence** — build passed, lint passed, tests passed (show output)

## Rules

- This skill improves quality. It never adds features or changes specified behaviour.
- Spec compliance is checked first. UX and UI polish come after.
- Never change behaviour — only improve how existing behaviour works, looks, and feels.
- If a finding conflicts with an approved spec, flag it but do not change it.
- If a UX issue requires new feature work, flag it in "Out of Scope" — do not implement it.
- Prefer the project's existing patterns over introducing new ones.
- Small, high-impact changes over large sweeping rewrites.
- Every change must pass the UI implementation checklist.
- Every change must have a clear justification (spec violation, user impact, or quality gate).
- When in doubt about a design decision, cite the relevant platform or product design guidelines.

## Next Steps

After polish fixes are applied, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| Code style not yet checked | `code-style` skill | Complete the quality trio |
| UX not yet audited | `ux-audit` skill | Complete the quality trio |
| Haven't done an adversarial review yet | `code-review` skill | Fresh-eyes critique catches what polish misses |
| Spec gaps were found during polish | `sync-spec` skill | Reconcile the spec with reality |
| All quality gates passed | `ship-it` skill | Commit, PR, monitor, land |
| Polish fix is minor and isolated | `patch` skill | Quick targeted fix with verification |
| Spotted an idea for later improvement | `idea-seed` skill | Capture for when this area is revisited |

## Tool Boundaries

This skill is surgical. It does not:

- Refactor architecture or module structure
- Migrate to different libraries or patterns
- Add features not in the specification
- Rewrite UI from scratch (unless critically broken)
- Touch code outside the audited feature scope
