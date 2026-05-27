---
name: implement-component
description: "TDD workflow for building new SwiftUI components. Steps: understand, design decisions, tests first, implement, polish, previews, verify. Integrates swiftui-components, ios-hig-quick, and swiftui-anti-slop skills. Triggers on: build component, implement view, create screen, new component, TDD SwiftUI."
---

# Implement Component — TDD Workflow for SwiftUI Components

Use this skill to build a new SwiftUI component or screen with a structured TDD workflow that integrates relevant project skills.

## When to Use
- Building a new view, screen, or reusable component from scratch
- The user describes what they want and you need to build it right the first time
- NOT for polishing existing code (use `swiftui-anti-slop`) or reviewing (use `review-ui`)

## Required Reading
Before starting, read ALL of these:
1. the project SwiftUI view guidelines — view architecture rules
2. the project SwiftUI design-quality guidelines — quality gate
3. the project SwiftUI polish guidelines — polish techniques
4. the project colour/design-system guidelines
5. the project testing requirements — test patterns
6. the project lessons or known-issues document — past mistakes
7. `.claude/design-memory.md` (if exists) — persistent design decisions
8. The feature spec in the project specifications or requirements documents if one exists

Also invoke these skills:
- `swiftui-components` — to look up the right components for what the user wants
- `ios-hig-quick` — to make design decisions
- `swiftui-anti-slop` — to load the banlists before writing any code

## Workflow

### Step 1: Understand the Component
Parse the user's request and identify:
- What component(s) are needed (use `swiftui-components` alias system)
- Where it fits in the app (navigation context, parent screen)
- What data it displays or edits
- What states it needs (loading, empty, error, content)
- What interactions it supports

Present a brief summary: "I'll build a [component] that [does what] with [these states]. It uses [these SwiftUI components] following [these HIG patterns]."

**STOP and confirm with the user before proceeding.**

### Step 2: Design Decisions
Using `ios-hig-quick`, resolve key design questions:
- Container choice (List / Form / ScrollView / LazyVGrid)
- Navigation pattern (push / sheet / inline)
- Feedback type (haptic / visual)
- Empty state approach
- Density level

If `.claude/design-memory.md` exists, check for relevant prior decisions. Follow them unless the user explicitly overrides.

### Step 3: Write Tests First (TDD Red Phase)
Write tests BEFORE implementation:

For a VIEW component:
- Test that the component renders with sample data (preview test)
- Test key interactive behaviours if they involve logic
- Test that different states are handled (empty, error, content)

For a LOGIC component (view model, mapper, formatter):
- Test the transformations and business rules
- Test edge cases the spec identifies
- Test error handling

Use Swift Testing framework (@Test, @Suite, #expect). Follow the project testing requirements.

Build to verify tests compile but FAIL (red). If they can't fail meaningfully (pure layout), skip to Step 4 but note why.

### Step 4: Implement (TDD Green Phase)
Write the minimal implementation to make tests pass:

1. **Structure**: Follow `swiftui-view-guidelines.md`
   - Container view reads clients, owns @State
   - Rendering view takes plain values and bindings
   - Keep body pure and cheap

2. **Components**: Use the patterns from `swiftui-components` lookup
   - Correct container for the content type
   - Proper navigation pattern
   - All required states (loading, empty, error, content)

3. **Design**: Follow `swiftui-design-quality.md` and `colour-system.md`
   - Spacing scale: 4, 8, 12, 16, 24, 32
   - Typography hierarchy: weight + colour + spacing, not size alone
   - Palette colours, not inline hex
   - Semantic foreground styles (.primary, .secondary, .tertiary)

4. **Anti-Slop**: Mentally check every item from `swiftui-anti-slop` banlist as you write
   - No uniform padding
   - No Color.blue or Color(hex:)
   - No .animation(.default) without value
   - No NavigationView
   - No bare Text("No items") for empty state
   - Specific button labels
   - Realistic preview data

Build to verify tests PASS (green).

### Step 5: Polish (TDD Refactor Phase)
Apply polish from `swiftui-polish-guidelines.md`:

- [ ] `.monospacedDigit()` on dynamic numbers
- [ ] Concentric corner radii on nested rounded rects (outer = inner + padding)
- [ ] `.continuous` corner style everywhere
- [ ] Springs with `bounce: 0` for interactive state changes
- [ ] Scale on press (`0.96`) for custom tappable surfaces
- [ ] Enter/exit transitions if content appears/disappears
- [ ] `.contentTransition(.numericText())` for changing numbers
- [ ] Shadows instead of borders for depth (not dividers)
- [ ] 44pt minimum hit areas on all interactive elements
- [ ] Image outlines with `.strokeBorder(.primary.opacity(0.1), lineWidth: 1)`

Build to verify tests still PASS after polish.

### Step 6: Add Previews
Add previews for key states:
- Primary content state (with realistic data)
- Empty state
- Error state (if applicable)
- Stress test (long text, many items, edge case data)

Follow preview rules from `swiftui-view-guidelines.md`:
- Use `#Preview` syntax
- Deterministic, lightweight data
- No network, no HealthKit, no app boot

### Step 7: Final Verification
Run the complete verification:

1. **Build**: Using XcodeBuildMCP
2. **Tests**: Run the tests written in Step 3
3. **Lint**: run the project lint command, if one exists
4. **Anti-Slop Checklist**: Run the 15-item checklist from `swiftui-anti-slop`
5. **UI Implementation Checklist**: Check against the project UI implementation checklist

If any check fails, fix and re-run.

### Step 8: Summary
Present what was built:
- Files created/modified
- Components used and why
- Design decisions made
- Test coverage
- Any decisions that should be saved to design memory

If significant design decisions were made, offer to update `.claude/design-memory.md`.

## Rules
- Always write tests before implementation when behaviour is testable
- Follow project conventions exactly — do not introduce new patterns
- Use the spacing scale (4, 8, 12, 16, 24, 32) — no arbitrary values
- Use palette colours — never inline hex or Color.blue
- Every interactive element needs an accessibility label
- Keep changes surgical — only build what was asked for
- If the component requires changes to other files (models, clients), note them but confirm before touching them
- If the request conflicts with an approved spec, call it out before implementing

## Anti-Rationalization Table
| Thought | Reality |
|---|---|
| "Tests aren't needed for a view" | Test the logic. Skip layout tests if truly untestable. |
| "I'll add polish later" | Polish is part of implementation, not a separate phase. |
| "The anti-slop check is overkill" | Every banned pattern you skip becomes tech debt. |
| "I know better than the HIG" | You don't. Follow it. Override only with explicit user approval. |
| "Design memory doesn't matter for this" | Consistency requires checking every time. |
| "This is just a small component" | Small components compound into the full experience. |

## Shortest-Path Recommendations

When presenting design decisions in Step 2, close with a one-line summary:

"**Shortest path:** List with .insetGrouped, sheet for editing, ContentUnavailableView for empty, .sensoryFeedback(.selection) on toggle."

This lets the user approve all decisions at once instead of answering individually. If they disagree with one choice, they can override just that one.

Also use shortest-path in Step 1 (understand) when confirming the approach:

"**Shortest path:** I'll build this as a rendering view taking [Model] as input, inside the existing [Feature]View container. Tests will cover the state machine (empty/loading/content/error). Confirm?"

## Gotchas

- **TDD on pure views**: Pure layout views with no logic cannot meaningfully fail tests. In Step 3, if the component is purely visual (no state machine, no data transformation), note "pure layout — skipping red phase" and go straight to implementation with preview verification.
- **Design memory conflicts**: If design memory says "use .medium sheet detents" but the user asks for a full-screen creation flow, surface the conflict in Step 2. Don't silently ignore either.
- **Feature client dependencies**: If the component needs a feature client that doesn't exist yet, don't create it inside this command. Note the dependency and suggest building the client separately first.
- **Anti-slop false positives**: Some banned patterns are correct in specific contexts. `Spacer()` in a toolbar is fine. Uniform `.padding()` on grid items is fine. Apply the banlists with judgment, not blindly.
- **Preview data realism**: "Realistic preview data" doesn't mean production data. It means varied, non-round numbers with different string lengths. Use the project's `.mock` fixtures if they exist.
- **Step 5 polish order**: Apply `.monospacedDigit()` and `.contentTransition(.numericText())` BEFORE testing animations. Adding content transitions after the fact can change layout behaviour.
