# SwiftUI Visual Review

## Purpose

Two-pass visual review of SwiftUI code. Pass 1 catches critical issues. Pass 2 evaluates aesthetic quality. **Report-only — does not modify code unless explicitly asked.**

This is different from implementation or UX hardening workflows. This skill is a lightweight review gate.

## Required Reading

Before reviewing, read these files:
1. the project SwiftUI design-quality guidelines
2. the project SwiftUI polish guidelines
3. the project colour/design-system guidelines
4. the project UI implementation checklist
5. Design-memory file located via `swiftui-patterns/references/design-memory.md` — for project design decisions

Also read `swiftui-patterns/references/design-quality-banlists/swiftui-patterns.md` for the design-quality banlists.

## Scope Detection

- If the user names specific files or views → review those
- If no target is named → check recent git changes for modified SwiftUI views and review those
- If neither yields clear targets → ask the user what to review

To detect changed views when no argument is given:
```bash
git diff --name-only HEAD~3 -- '*.swift' | head -20
```
Filter to files that contain `View` conformances or `body` properties.

## Severity Tiers

Every finding gets a severity tier. Use these to prioritise the report and guide the user on what to fix first.

| Tier | Label | Meaning | Action |
|------|-------|---------|--------|
| 1 | `[CRITICAL]` | Blocks merge. Accessibility failure, broken states, structural error. | Must fix before merge |
| 2 | `[HIGH]` | Significant UX degradation. Touch target violations, missing feedback, HIG non-compliance. | Should fix before merge |
| 3 | `[MEDIUM]` | Anti-slop violations and design quality issues. Generic patterns, wrong spacing, palette drift. | Fix if time permits, or follow-up PR |
| 4 | `[LOW]` | Polish opportunities. Concentric radii, content transitions, animation refinement. | Nice to have |

When multiple findings exist at the same tier, order them by impact within the tier.

---

## Review Flow: 8-Category Progression

Follow this order when reviewing. Each category builds on the previous — start with what to remove, then what to clarify, and work toward refinement.

1. **Less, But Better** — Does every element earn its place? Is there a single focal point per screen? Cap at 3-4 type treatments. Remove controls that don't serve the core task.
2. **Self-Evident** — Is the hierarchy clear through size, weight, and contrast? Does whitespace group related elements? Is progressive disclosure used for dense information?
3. **Honest** — Do colours tell the truth (semantic, not decorative)? Is contrast WCAG AA? Do loading states show real progress?
4. **Invisible** — Are animations spring-based and unobtrusive? Are materials system-provided? Do content transitions use `.contentTransition`?
5. **Systematic** — Is spacing on the 4pt grid? Are corner radii consistent per component type? Are colours named by role, not hue?
6. **Thorough** — Reduce motion fallback? 44pt touch targets? Safe areas respected? Materials matched to contrast needs?
7. **Enduring** — System text styles (not fixed sizes)? System back-swipe preserved? Zoom transitions for collection→detail?
8. **Refined** — scrollTransition effects? PhaseAnimator for multi-step sequences? Multi-detent sheets? matchedGeometryEffect for contextual transitions?

Categories 1-3 map to Pass 1 (Critical). Categories 4-8 map to Pass 2 (Polish). Use this progression to ensure the review is systematic rather than ad-hoc.

---

## Pass 1: Critical Review (Correctness)

Check for issues that would block merge or break the user experience. Findings here are `[CRITICAL]` or `[HIGH]`.

### Accessibility
- All interactive elements have accessibility labels
- Touch targets meet 44pt minimum
- Dynamic Type does not break layout
- Colour is not the only way to convey information
- VoiceOver order makes sense

### HIG Compliance
- Navigation pattern matches content type (invoke `platform-hig` skill)
- Correct container for content (List / Form / ScrollView)
- Tab bar follows rules (max 5, nouns not verbs)
- Sheet vs push used correctly
- Confirmation on destructive actions

### State Coverage
- Loading state exists and shows feedback
- Empty state uses ContentUnavailableView with action
- Error state is specific and actionable (not "Oops!")
- All states reachable (no dead-code states)

### Structure
- No NavigationView (must be NavigationStack)
- No NavigationLink(destination:) (must use navigationDestination)
- No AnyView
- No .animation(.default) without value parameter
- No broad observation in repeated views
- body is pure and cheap

Format each finding as: `[CRITICAL]` or `[HIGH]` `file:line — description`

---

## Pass 2: Aesthetic Review (Polish)

Evaluate visual quality and design coherence. Findings here are `[MEDIUM]` or `[LOW]`.

### Anti-Slop Check
Run every item from the `swiftui-patterns` design-quality banlist banlist against the code. Flag violations.

### Design Quality (from swiftui-design-quality.md)
- Spacing varies by semantic level
- Typography hierarchy uses weight + colour, not just size
- Colour uses palette, not inline hex
- Visual density matches context
- Cards and sections have varied visual weight

### Polish (from swiftui-polish-guidelines.md)
- Concentric corner radii on nested rounded rects
- .monospacedDigit() on dynamic numbers
- Shadows instead of borders for depth
- Springs with bounce: 0 for controls
- Scale on press (0.96) where appropriate
- Content transitions on changing text/numbers
- Enter/exit animations appropriate

### Emotional Design Check
- Does the screen have an identifiable peak moment — the one thing the user cares about most? Is it visually rewarded?
- Does the screen end well — does it guide to a next step, or just fall off?
- Are negative moments (errors, empty states, loading) softened with helpful microcopy or progressive feedback?

### Design Memory Consistency
If a design-memory file exists, check that the code follows previously established design decisions. Note any drift.

Format each finding as: `[MEDIUM]` or `[LOW]` `file:line — description — suggested fix`

## Pass 3: Heuristics Scorecard (Optional)

Only include this pass if the user explicitly asks for a deeper review, or if the scope is a full screen/feature (not a single component).

Score each of Nielsen's 10 usability heuristics 0-4 based on what you observed in the code:

| # | Heuristic | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | ? | |
| 2 | Match System / Real World | ? | |
| 3 | User Control and Freedom | ? | |
| 4 | Consistency and Standards | ? | |
| 5 | Error Prevention | ? | |
| 6 | Recognition Rather Than Recall | ? | |
| 7 | Flexibility and Efficiency | ? | |
| 8 | Aesthetic and Minimalist Design | ? | |
| 9 | Error Recovery | ? | |
| 10 | Help and Documentation | ? | |
| **Total** | | **??/40** | |

**Rating bands**: 32-40 Excellent, 24-31 Good, 16-23 Needs Work, 0-15 Critical.

Score honestly. A 4 means genuinely excellent. Most real screens score 24-32.

## WTF-Likelihood Heuristic

Only display this if the user asks to implement fixes after the review:
- +15% per file that needs changes in unrelated areas
- +10% per structural change (container swap, navigation change)
- +5% per visual-only change (spacing, colour, animation)
- At 30%: warn the user that changes are getting broad
- At 50%: STOP and suggest splitting into smaller PRs

## Report Format

Output the review in this exact format:

```
## UI Review — [Feature/View Name]

### Pass 1: Critical
- [CRITICAL] path/file.swift:42 — Missing accessibility label on tappable HStack
- [HIGH] path/file.swift:87 — No empty state — shows blank screen when no data

#### Pass 1 Verdict: PASS / NEEDS FIXES

### Pass 2: Polish
- [MEDIUM] path/file.swift:15 — Uniform .padding() everywhere — vary by semantic level
- [MEDIUM] path/file.swift:33 — .opacity(0.5) as "secondary" — use .secondary foreground style
- [LOW] path/file.swift:28 — Dynamic counter missing .monospacedDigit()
- [LOW] path/file.swift:55 — Nested rounded rects with matching radii — should be concentric

#### Design Memory Consistency: N/A or CONSISTENT / DRIFT DETECTED

### Summary
| Tier | Count | Action |
|------|-------|--------|
| CRITICAL | N | Must fix before merge |
| HIGH | N | Should fix before merge |
| MEDIUM | N | Fix if time permits |
| LOW | N | Nice to have |

**Overall: MERGE-READY / NEEDS WORK / BLOCKED**

### Pass 3: Heuristics (if requested)
| # | Heuristic | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | ? | |
| ... | ... | ... | ... |
| **Total** | | **??/40** | |
```

## Rules

- **STOP after the report.** Do not implement changes unless the user explicitly asks.
- If the user asks to implement: switch to the owning implementation workflow, or implement only the specific items the user approves, following the WTF-likelihood heuristic.
- Never modify code without explicit permission.
- Be specific: always include file:line references.
- Be honest: acknowledge what is done well, not just problems.
- Prioritize findings: critical > anti-slop > polish.
- If a finding conflicts with an approved spec, note it but do not flag as critical.
- Keep the report concise — no paragraphs, just findings with references.

## Shortest-Path Recommendations

At the end of every report, add a one-line recommendation:

- If MERGE-READY: "**Shortest path:** Ship it. Optional polish items can be addressed in a follow-up."
- If NEEDS WORK with few critical issues: "**Shortest path:** Fix the N critical items, skip polish for now, re-review."
- If BLOCKED with many issues: "**Shortest path:** Fix [the single most impactful issue] first, then re-review. The rest may resolve as a side effect."

This lets the user know the minimum viable next action without reading the full report.

## Gotchas

- **False positives on spacing**: Not all uniform padding is wrong. A row of identically-styled cards in a grid SHOULD have uniform padding. Flag only when semantic levels differ but spacing doesn't.
- **Anti-slop in test/preview code**: The banlists apply to production code. Preview code may legitimately use `Color.blue` or hardcoded values for quick iteration. Don't flag preview-only code.
- **Design memory drift vs intentional override**: If the code diverges from design memory, it might be intentional (the user changed direction). Flag it as "DRIFT DETECTED" but don't auto-classify it as a bug.
- **File:line references on computed properties**: When a violation is in a computed property or ViewBuilder, the line number may point to the property declaration, not the specific violation. Be precise about which line within the property body.
- **Large review scope**: If the user asks to review 10+ files, the context window gets expensive. Suggest reviewing one feature at a time rather than the whole app.
