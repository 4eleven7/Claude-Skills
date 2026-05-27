---
name: code-style
description: Audit and fix non-mechanical code style issues that formatters and linters usually miss.
---

# Code Style — Enforce House Style

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Code Style workflow. Your job is to catch and fix style violations that automated tools miss and that Claude tends to get wrong by default.

Formatters and linters handle mechanical formatting. This skill handles the patterns where AI-generated code drifts from the project's house style — the things that make code look generated rather than authored.

This is part of the **quality trio**: `code-style` skill (code patterns) → `ux-audit` skill (user experience) → `pre-ship` skill (spec compliance + visual quality). Each covers a different lens. Run all three for thorough quality coverage.

## Required Reading

Before auditing, read:

1. the project coding guidelines
2. the project design-quality guidelines
3. the project UI guidelines
4. the project UI polish guidelines
5. the project design-system documentation

## Scope Detection

- If the user names specific files → audit those
- If recent git changes exist on the current branch → audit changed files only
- If unclear → ask

Read every file in scope before producing findings.

## What This Skill Checks

These are patterns that Claude gets wrong by default. Automated linters do not catch them.

### 1. Spacing and Layout

| AI Tell | House Style |
|---------|-------------|
| Uniform `.padding()` on everything | Vary by semantic level: section (24-32) > group (12-16) > element (4-8) |
| `Spacer()` as primary spacing tool | Use stack `spacing:` parameter for uniform child spacing |
| Centre-aligned body content | Leading alignment for content text; centre only for headings and empty states |
| Identical spacing between all elements | Related elements cluster tighter than unrelated ones |
| Generic `ScrollView { VStack }` | Use `List` or `Form` when they are the right container |
| Every section in the same card style | Vary visual weight — not everything needs a `RoundedRectangle` |

### 2. Typography

| AI Tell | House Style |
|---------|-------------|
| `.font(.system(size: 14))` | Semantic styles only: `.body`, `.headline`, `.caption`, `.footnote` |
| Hierarchy through size alone | Weight + colour + spacing together |
| `.bold()` on everything | `.fontWeight(.medium)` or `.semibold` for subtlety |
| Every label in `.caption` | Differentiate metadata, timestamps, and labels |
| Missing `.monospacedDigit()` on dynamic numbers | Always apply to counters, timers, prices, table columns |
| Explicit text sizes for width stability | Use hidden placeholder technique (see design-quality doc) |

### 3. Colour

| AI Tell | House Style |
|---------|-------------|
| Inline one-off colours | Named palette tokens or semantic colour helpers |
| `Color.blue` / `.accentColor` everywhere | `.tint()` on interactive elements; one accent per screen |
| `.opacity(0.5)` as "make it secondary" | `.secondary`, `.tertiary` semantic hierarchy |
| Full-saturation raw colours | Calibrated design-system tones |
| Hardcoded light-only colours | Semantic colours or asset catalogue with dark mode variants |
| Same tint on every icon | Vary by meaning |

### 4. Structure

| AI Tell | House Style |
|---------|-------------|
| `ZStack` overlay for every visual effect | `.background` / `.overlay` modifiers |
| One-off `CardView` per screen | Shared card styling or no wrapper |
| `NavigationLink(destination:)` | `navigationDestination(for:)` |
| Wrapping every element in its own `VStack` | Let parent stack provide layout |
| `AnyView` | Avoid unless API boundary leaves no alternative |
| `ObservableObject` / `@Published` | `@Observable` |
| Force unwraps in production code | Nil-coalescing or guard |

### 5. Naming

| AI Tell | House Style |
|---------|-------------|
| `data`, `info`, `item`, `manager`, `handler`, `helper` | Specific domain names: `session`, `entry`, `provider`, `scheduler` |
| `handleXTapped`, `onXPressed` | `xTapped`, `didSelectX`, or just the action verb |
| `isXEnabled`, `shouldShowX` everywhere | Only where the boolean genuinely answers is/has/should |
| View names that duplicate parent: `HabitDetailHabitRow` | `HabitRow` if unambiguous in context |
| Trailing closure parameter named `action` or `handler` | Name it by what it does: `onComplete`, `onDismiss` |

### 6. Access Control

| AI Tell | House Style |
|---------|-------------|
| Everything `internal` by default | Default properties and helpers to `private` |
| `public` in feature code | `internal` for feature code; `public` only in package APIs |
| Missing `@MainActor` on clients and view models | Mark feature clients and view models `@MainActor` explicitly |

### 7. View Body Purity

| AI Tell | House Style |
|---------|-------------|
| `DateFormatter()` in body or computed property | Shared formatter helper outside the view |
| Sorting/filtering/grouping in body | Precompute in client or helper |
| `UUID()` or `Date()` in body | Stable values from the model layer |
| `Task { }` started in body | `.task` modifier or user action |
| Business logic inline | Push to client/provider/helper |

### 8. Interaction States

| AI Tell | House Style |
|---------|-------------|
| No loading state | Show progress or skeleton |
| No empty state | `ContentUnavailableView` with icon + description + action |
| No error state | Specific error message with recovery action |
| Bare `Text("No items")` | `ContentUnavailableView` |
| No press feedback on custom tappable surfaces | Scale-on-press (`0.96`) or opacity feedback |

## Output Format

Present findings in a table, grouped by category:

```
## Code Style Audit — [Scope]

### Quality Trio Status
| Skill | Status |
|---------|--------|
| `code-style` skill | Running |
| `ux-audit` skill | [Not run / Passed / N findings] |
| `pre-ship` skill | [Not run / Passed / N findings] |

Recommended next: [whichever of the trio has not run yet, or `code-review` skill if all three are done]

### Findings

| # | Category | File:Line | Current | Fix | Why | Effort |
|---|----------|-----------|---------|-----|-----|--------|
| 1 | Spacing  | ExampleView:42 | Uniform padding on all children | Smaller spacing for elements, larger spacing for sections | Uniform padding is an AI tell | S |

Effort: S (minutes) | M (under an hour) | L (hours)
```

### Summary
- N findings across N files
- Categories: spacing (N), typography (N), colour (N), ...

**STOP and wait for user approval before implementing fixes.**

## Implementation

After user approves:

1. Fix findings in file order to avoid line-number drift
2. Make changes surgically — one finding at a time
3. Do NOT refactor beyond approved findings
4. Do NOT add comments or annotations to unchanged code
5. Do NOT change behaviour — style only

## Verification

After fixes:

1. Run the project formatter, if one exists
2. Run the project lint command, if one exists
3. Build the affected target
4. Confirm no warnings introduced

## Next Steps

After style fixes are applied, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| UX not yet audited | `ux-audit` skill | Complete the quality trio |
| Spec compliance + visual polish not checked | `pre-ship` skill | Complete the quality trio |
| Want a deeper correctness check | `code-review` skill | Fresh-eyes adversarial critique |
| All three quality passes done | `ship-it` skill | Commit, PR, monitor, land |
| Style fix is a trivial one-liner | `tweak` skill | Zero-ceremony change with lint verification |

## Rules

- This skill fixes style, never behaviour
- Every finding must cite a specific rule from the house style docs
- If a pattern is consistent with the existing codebase (even if it violates a rule), flag it but note the existing precedent
- Do not impose personal preferences — only enforce documented rules
- When a finding is ambiguous, explain both options and let the user decide
