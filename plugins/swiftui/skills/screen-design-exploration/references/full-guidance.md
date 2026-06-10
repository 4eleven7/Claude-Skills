# Screen Design Exploration

You are running an interactive design exploration workflow. Your job is to help the user explore multiple design directions for a SwiftUI screen, collect feedback, and synthesize a polished final view.

This workflow is about EXPLORATION, not implementation. The output is one polished SwiftUI view, not a full feature.

---

## Phase 0: The 0.5-Second Test

Before designing anything, answer ONE question:

> **What does the user SEE in the first half-second — before they read a single word?**

This is not about content. It's about the SHAPE of the screen. What dominates?

- A **ring** at 40% of screen height? → Fitness dashboard
- A **gradient card** with bold text? → Music/travel/content
- A **large number** floating in space? → Finance/health metric
- A **grid of thumbnails**? → Photo/recipe/shopping collection
- A **clean form** with generous space? → Settings/profile

If your answer is "a List with rows of text" → STOP. That's a spreadsheet, not an app. Go back and find the visual shape.

Write the 0.5-second answer as a comment at the top of every variant:

```swift
// 0.5s: Four warm gradient cards stacked on black — a cookbook
```

This single sentence anchors every decision that follows. If the code you write doesn't produce that shape, something went wrong. Include the 0.5-second answer in the design brief under `"half_second_shape"`.

---

## Phase 0.5: Preflight

Before anything else, do all of the following:

1. **Load design memory.** Use `swiftui-patterns/references/design-memory.md` to locate any existing design-memory file. If one exists, read it in full. Apply stored decisions (density preferences, colour choices, interaction conventions) as constraints on all variants you generate. If a stored decision conflicts with something the user requests during the interview, surface the conflict and ask which to keep.

2. **Read project design docs.** Read all of these:
   - the project SwiftUI design-quality guidelines
   - the project SwiftUI polish guidelines
   - the project colour/design-system guidelines
   - the project SwiftUI view guidelines
   - the project lessons or known-issues document

3. **Detect scope.** From the user's initial message, determine:
   - Is this a new screen or a redesign of an existing one?
   - If existing: locate the current SwiftUI view file(s) and read them.
   - If new: identify where the file will eventually live based on the feature structure.

4. **Load feature spec.** If the screen belongs to a feature with a specification in the project specifications or requirements documents, read it. The spec constrains what data the screen must display and what interactions it must support. Do not design against the spec.

5. **Report preflight results.** Tell the user:
   - Whether design memory was found and what constraints it sets.
   - Whether this is a new screen or redesign.
   - Whether a feature spec was found and what it requires of this screen.
   - Any constraints detected (e.g., "the spec requires this screen to show X, Y, Z").

Then proceed to Phase 1.

---

## Emotional Design Lens (applies across all phases)

Apply this lens across ALL phases — it is not a separate step but a filter on every design decision.

### Peak-End Rule

Users compress an entire experience into two moments: the **peak** (most intense/emotional) and the **end** (final impression). Design both deliberately.

**During the interview (Phase 1):** Ask yourself — what is this screen's peak moment? Is it completing a core task, hitting a milestone, seeing a personalised insight, or finding what they need?

**During variant generation (Phase 3):** Every variant should have an identifiable peak moment and a considered ending. Even information-heavy screens have a moment the user cares about most — make that moment feel rewarding.

**During review (Phase 7):** Check that the final design has:
- A clear peak — the one "holy dang" moment (micro-animation, celebratory feedback, encouraging copy, personalised insight)
- A considered ending — the screen doesn't just "fall off" (summary, progress affirmation, gentle nudge to continue)
- Reduced negative peaks — wait states, error states, and long forms transformed with helpful microcopy and progressive feedback

### Emotional Feedback Loops

When users take actions, give emotional feedback, not just functional feedback:
- Task completed → encouragement with personality, not just a checkmark
- Mistake → gentle correction that teaches, not just a red indicator
- Milestone → celebration proportional to the achievement (haptic + visual + copy)
- Progress → momentum visualisation (streaks, levels, completion bars with motion)

Apply this when designing interaction states in Variants D (Interaction Model) and E (Brand Expression) especially.

---

## Phase 1: Interview

Ask exactly 5 questions, **one at a time**. Wait for the user's answer before asking the next question. If the user says "skip interview" or provides all context inline in their initial message, extract answers from what they provided and skip to Phase 2 — do not force questions they already answered.

Adapt the questions based on preflight findings. If you loaded design memory that already answers a question, state the stored decision and ask if it still applies instead of asking from scratch.

### Question 1 — Scope
"What screen or component are we designing? What data does it display and what actions does it support?"

If preflight already identified the screen and spec, summarise what you found and ask the user to confirm or adjust.

### Question 2 — Pain Points & Inspiration
"What's wrong with the current design?" (skip if new screen)
"What apps inspire the feel you want? Pick from these or name your own:"
- Apple Health
- Things 3
- Linear
- Notion
- Custom: ___

### Question 3 — Style Direction
"Pick the position on each axis that fits your vision:"
- Clinical ←→ Warm
- Dense ←→ Breathing
- Minimal ←→ Rich
- Playful ←→ Serious

"On a density scale of 1 (very spacious) to 5 (very compact), where should this screen land?"

### Question 4 — Constraints
- "Does this need iPad support?"
- "Accessibility priority level? (standard / high / maximum)"
- "Any Dynamic Type range constraints?"
- "How important is dark mode parity? (must-ship / nice-to-have)"

### Question 5 — Context
"Where does this screen sit in the app's navigation? What screen comes before it and after it? Is it a root tab view, a pushed detail, a sheet, or something else?"

---

## Phase 2: Design Brief

After collecting all answers, create a structured brief in the project's agent metadata directory. Prefer `.agents/design-brief.json`; if the project already uses another hidden agent metadata directory, use that existing directory instead.

```json
{
  "screen": "name of screen",
  "type": "new | redesign",
  "feature": "feature name if applicable",
  "spec": "path to spec or null",
  "existing_file": "path to existing view or null",
  "data_requirements": ["what the screen must display"],
  "interaction_requirements": ["what actions it must support"],
  "pain_points": ["current issues, if redesign"],
  "inspiration": ["app names"],
  "style": {
    "clinical_warm": "value from -2 to 2",
    "dense_breathing": "value from -2 to 2",
    "minimal_rich": "value from -2 to 2",
    "playful_serious": "value from -2 to 2",
    "density": "1-5"
  },
  "constraints": {
    "ipad": true,
    "accessibility_priority": "standard | high | maximum",
    "dynamic_type_range": "default | constrained",
    "dark_mode_parity": "must-ship | nice-to-have"
  },
  "navigation_context": {
    "position": "root | pushed | sheet | tab",
    "before": "screen name or null",
    "after": "screen name or null"
  },
  "half_second_shape": "the 0.5-second visual shape answer from Phase 0",
  "design_memory_constraints": ["any constraints from design-memory.md"],
  "emotional_design": {
    "peak_moment": "what is this screen's most emotionally significant moment",
    "ending": "how does the user leave this screen — what's the last impression",
    "negative_peaks": ["wait states, error states, or friction points to transform"]
  }
}
```

Tell the user the brief has been saved and summarise it in one paragraph. Then proceed to Phase 3.

---

## Phase 3: Generate 5 Variants

Generate 5 SwiftUI view variants in a single temporary file at the feature's location. Use the naming convention `{ScreenName}DesignExploration.swift`. If no feature location is clear, place it at a `DesignExploration/` directory near the relevant feature code.

Each variant must:
- Compile and render in SwiftUI Preview
- Use the project's colour system, not ad-hoc colours
- Use the project's spacing scale (4, 8, 12, 16, 24, 32 pt)
- Follow all conventions from `swiftui-view-guidelines.md`
- Include realistic preview data (no round numbers, no sequential IDs, no placeholder text)
- Handle at minimum: content state and empty state
- Pass the anti-slop checklist (see Review Checklist below)

Before writing each variant, mentally run through:
1. The component-selection guidance in `swiftui-patterns` — pick the right container and components for this variant's approach.
2. The `platform-hig` skill — validate navigation pattern, feedback type, and container choice.
3. The `swiftui-patterns` design-quality banlist banlist — ensure no banned patterns appear.

### Variant A — Information Hierarchy

Explore how information is prioritised on the screen. Try:
- Different visual weight distributions (hero metric vs uniform density)
- Progressive disclosure (summary first, details on demand)
- Different emphasis strategies (size, weight, colour, spacing combinations)

One-line summary for the user: what hierarchy strategy this variant uses.

### Variant B — Layout Model

Try a fundamentally different container and grouping strategy. Try:
- `List` vs `ScrollView` + `LazyVGrid` vs `Form` vs custom `Layout`
- Different section grouping strategies (by type, by time, by priority)
- Different visual separation methods (sections, dividers, spacing, cards)

One-line summary: what container and grouping strategy this variant uses.

### Variant C — Density Contrast

Build the OPPOSITE density of what the user requested. If they said "breathing" (density 1-2), build compact (density 4-5). If they said "dense" (density 4-5), build spacious (density 1-2). If they said moderate (3), build both extremes and pick the more interesting one.

The purpose is to show tradeoffs the user might not have considered. More density means more information at a glance; more breathing room means easier scanning and a calmer feel.

One-line summary: what density tradeoff this variant demonstrates.

### Variant D — Interaction Model

Try different interaction patterns for the same data:
- Inline editing vs sheet-based editing
- Swipe actions vs explicit buttons
- Expandable sections vs drill-down navigation
- Bottom sheet vs full navigation push
- Direct manipulation vs explicit save

One-line summary: what interaction pattern this variant explores.

### Variant E — Brand Expression

Push the visual personality further than the other variants. Try:
- Bolder use of the colour palette (feature-specific accent, tinted surfaces)
- Distinctive empty states (illustration-like, not just icon + text)
- Custom transitions or micro-interactions
- Feature-specific visual identity that still lives within the app's design system

One-line summary: what visual personality element this variant pushes.

### After generating all variants

Structure the file so each variant is a separate `struct` with its own `#Preview`:

```swift
// MARK: - Variant A: Information Hierarchy
struct {ScreenName}VariantA: View { ... }
#Preview("{ScreenName} — Variant A: Information Hierarchy") { ... }

// MARK: - Variant B: Layout Model
struct {ScreenName}VariantB: View { ... }
#Preview("{ScreenName} — Variant B: Layout Model") { ... }

// ... and so on for C, D, E
```

---

## Phase 4: Present

1. **Build the project** using XcodeBuildMCP to verify all variants compile.
2. If the build fails, fix compilation errors immediately. Every variant must compile.
3. **Take simulator screenshots** of each variant using XcodeBuildMCP if the app can be run. If screenshots are not feasible (e.g., the view requires navigation context that isn't wired up), tell the user to check Xcode Previews instead.
4. **Present all 5 variants** to the user with this format:

```
## Design Variants

**Variant A — Information Hierarchy**
[screenshot if available]
[one-line description of what this variant explores]

**Variant B — Layout Model**
[screenshot if available]
[one-line description]

**Variant C — Density Contrast**
[screenshot if available]
[one-line description]

**Variant D — Interaction Model**
[screenshot if available]
[one-line description]

**Variant E — Brand Expression**
[screenshot if available]
[one-line description]

Which variant(s) do you like? You can pick one, multiple, or specific elements from different variants.
```

---

## Phase 5: Collect Feedback

Ask the user:

1. "Which variant(s) do you like? (can pick multiple, e.g. 'A and parts of D')"
2. "What specific elements do you want to keep from each?"
3. "What would you change?"
4. "Are there elements from different variants you want to combine?"

Wait for all answers before proceeding. If the user gives partial feedback (e.g., "I like A"), ask targeted follow-up questions about what specifically works and what they would change.

---

## Phase 6: Synthesize

Based on feedback:

- **Single variant picked cleanly** (e.g., "A is perfect" or "A with minor tweaks"): Refine that variant based on the user's specific feedback. Apply changes, rebuild, and present the refined version.

- **Elements from multiple variants** (e.g., "A's hierarchy with D's interaction model"): Create **Variant F** that combines the specified elements. Build it, verify it compiles, and present it to the user.

- **Major changes requested**: If the user wants something substantially different from all 5 variants, create a new variant incorporating their direction. Treat this as another exploration round.

**Support multiple synthesis passes.** If the user says "closer, but change X", refine again. Continue until the user says they are satisfied or explicitly moves to post-implementation-qa.

After each synthesis pass:
1. Build to verify compilation.
2. Present the updated variant.
3. Ask: "Is this the direction? Or would you like further adjustments?"

---

## Phase 7: Finalize

Once the user approves a final design:

1. **Move the final view** from the temporary exploration file to the proper feature location. Name it according to project conventions (e.g., `{ScreenName}View.swift`). Remove the variant suffix — this is now the real view.

2. **Clean up temporary files.** Delete:
   - `{ScreenName}DesignExploration.swift` (the multi-variant file)
   - the generated `design-brief.json`

3. **Run the anti-slop checklist** on the final code (see Review Checklist below). Fix any violations before declaring done.

4. **Build and lint.**
   - Build the project using XcodeBuildMCP.
   - Run the project lint command, if one exists
   - Fix any issues.

5. **Update design memory.** If actionable design decisions were made during this session (density preference, interaction pattern choice, colour decisions, component preferences), update the located design-memory file following the write protocol in `swiftui-patterns` reference `references/design-memory.md`:
   - Append new decisions with a datestamp.
   - Do not overwrite existing entries.
   - If a new decision conflicts with an existing one, ask the user which to keep.
   - If no design-memory file exists, offer to create one. Do not force creation.

6. **Generate a commit message summary.** Produce a brief summary of design decisions suitable for a commit message. Format: `[Feature] UI: one-line description of what was designed and key decisions`. Do not commit — just present the summary for the user to use when they are ready.

---

## Review Checklist (Anti-Slop Gate)

Run this on every variant and on the final output. Every item must pass.

1. No uniform `.padding()` — spacing varies by semantic level
2. No `Color(hex:)` or `Color.blue` — palette colours or semantic styles only
3. No `.font(.system(size:))` — semantic text styles only
4. Typography hierarchy uses weight + colour + spacing, not size alone
5. All states handled: at minimum content and empty; loading and error if the screen loads data
6. Empty states use `ContentUnavailableView` with icon + description + action
7. Tappable surfaces have press feedback (ButtonStyle or `.sensoryFeedback`)
8. Dynamic numbers use `.monospacedDigit()`
9. No `.animation(.default)` without `value:` — all animations scoped
10. Springs use `bounce: 0` for UI controls
11. No `NavigationView` — `NavigationStack` only
12. No `AnyView` — `@ViewBuilder` or concrete types
13. Button labels are specific verbs, not "Submit" or "Continue"
14. Preview data uses realistic, varied values (no round numbers, no sequential IDs)
15. Dark mode works — no hardcoded light-only colours
16. Leading alignment for body content, not centre-aligned everything
17. No identical spacing between semantically different groups
18. No `Spacer()` as primary spacing tool — use stack `spacing:` and padding

---

## Abort Handling

At ANY phase, if the user says "cancel", "stop", "abort", or "nevermind":

1. **Confirm:** "Cancel the design exploration? Any temporary files will be cleaned up."
2. **If confirmed:**
   - Delete `{ScreenName}DesignExploration.swift` if it exists.
   - Delete the generated `design-brief.json` if it exists.
   - Do NOT delete any files that existed before this session started.
   - Report: "Design exploration cancelled. All temporary files cleaned up."
3. **If not confirmed:** Resume from wherever the user left off.

---

## Rules

- Every variant must compile and render in preview. If it does not compile, fix it before presenting.
- Every variant must use the project's colour system. No ad-hoc colours.
- Every variant must pass the anti-slop checklist. No exceptions.
- Never generate placeholder content. Use realistic preview data with domain-appropriate values.
- If the user provides context inline with their initial message, adapt. Extract answers and skip redundant interview questions.
- If the user cancels at any phase, clean up immediately.
- Do not touch files outside the exploration scope. This command creates one view, not a full feature.
- Do not make architecture decisions (services, models, persistence). This is visual exploration only.
- If design memory conflicts with user requests, surface the conflict — do not silently override either direction.
- If the feature spec constrains the screen's data or interactions, respect those constraints in all variants. Flag if a variant would require spec changes.

## Shortest-Path Recommendations

When presenting variants and collecting feedback, close multi-decision moments with a one-line recommendation:

- After Phase 4 (present): "**Shortest path:** Variant A's hierarchy with List container, .medium sheet for editing, compact density."
- After Phase 5 (feedback): If the user liked elements from multiple variants, recommend the simplest combination: "**Shortest path:** Start from A, swap in D's swipe actions, keep A's density."
- After Phase 6 (synthesis): If further refinement is possible, recommend the most impactful single change: "**Shortest path:** This is ready. The highest-impact optional improvement would be adding the staggered entrance animation from E."

This reduces conversational round-trips by letting the user approve a recommendation with a single "yes."

## Gotchas

- **Variant compilation**: All 5 variants in one file can hit Swift type-checker limits. If the build is slow or fails with "expression too complex," split into separate files per variant.
- **Preview data dependencies**: Variants need realistic data but should not depend on the full model layer. Use inline structs or fixture data, not actual SwiftData models.
- **Colour system imports**: The project palette may be defined in a specific module. If the exploration file is outside that module, import it or define temporary local tokens for exploration only.
- **Design brief cleanup**: If a session is interrupted, `design-brief.json` and the exploration file may be orphaned. The next session should check for and clean up stale exploration files.
- **Scope creep during synthesis**: Users often request "just one more thing" during synthesis that expands beyond the screen's scope. If the request requires model changes, new navigation, or data layer work, flag it as out of scope for screen-design-exploration and suggest `/swiftui-patterns` for the full build.
- **Screenshot limitations**: XcodeBuildMCP screenshots require the app to be running with the right navigation state. If the exploration view isn't wired into navigation, screenshots won't work — fall back to "check Xcode Previews."
