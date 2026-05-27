<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name. -->

# SwiftUI Design Quality

## Purpose

Quality gate for AI-generated SwiftUI. Prevents generic, template-like output.

This document complements the existing SwiftUI docs:

- **view-guidelines** = how to structure views (architecture)
- **polish-guidelines** = how to execute specific techniques (recipes)
- **design-quality** (this doc) = what to avoid and what standards to hit (quality gate)

## SwiftUI Anti-Patterns (AI Tells)

These patterns mark AI-generated code as generic. Avoid them.

### Layout

- Uniform `.padding()` everywhere — vary by semantic level: section > group > element
- `Spacer()` as only spacing tool — use stack `spacing:` parameters
- Centre-aligning everything — use leading alignment for body content
- Identical spacing between all elements regardless of semantic grouping
- Generic `ScrollView { VStack }` when `List` or `Form` is the right container
- Every section wrapped in the same `RoundedRectangle` card — vary visual weight

### Colour

- Inline `Color(hex:)` scattered through views — use named assets or semantic extensions
- `Color.blue` / `.accentColor` as universal interactive colour
- `.opacity(0.5)` as universal "make it secondary" — use `.secondary`, `.tertiary` hierarchy
- Full-saturation colours (`#FF0000`) instead of calibrated tones
- Missing dark mode consideration — hardcoded colours instead of semantic
- Identical tint on every icon regardless of meaning

### Typography

- Explicit `.font(.system(size: 14))` instead of semantic styles (`.body`, `.headline`)
- Hierarchy through size alone — use weight, colour, and spacing together
- `.bold()` on everything — use `.fontWeight(.medium)` or `.semibold` for subtlety
- Every label in `.caption` — differentiate metadata, timestamps, and labels
- Monolithic font weight across a whole card or section

### Interaction States

- No press feedback on custom tappable surfaces
- Missing loading states — jumping from empty to content
- Missing error states — happy path only
- Bare `Text("No items")` instead of `ContentUnavailableView`
- No swipe actions or context menus where the domain warrants them
- Disabled controls with no visual distinction from enabled ones

### Structure

- `ZStack` overlay for every visual effect — use `.background`, `.overlay` modifiers
- One-off `CardView` wrappers per screen — define shared card styling
- `NavigationLink(destination:)` instead of `navigationDestination(for:)`
- Wrapping every element in its own `VStack` when the parent stack already provides layout

## Design Constraints

### Spacing Vocabulary

Use a consistent spacing scale. Permitted values: **4, 8, 12, 16, 24, 32**.

Rules:

- Section gaps > group gaps > element gaps
- Headers get more space above than below (asymmetric spacing signals hierarchy)
- Related elements cluster tighter than unrelated ones
- Use stack `spacing:` for uniform child spacing; use explicit padding for asymmetric cases
- Zero spacing is valid — tight clustering signals strong relationship

### Colour Palette Discipline

- Max one accent colour per screen context
- Semantic indicator colours (positive / caution / negative) defined in shared extensions, not inline
- Use SwiftUI semantic colours (`.primary`, `.secondary`, `.tertiary`) for text hierarchy
- Prefer `.tint()` over hardcoded colour on interactive elements
- Background fills: use `.background` materials or system grouped backgrounds, not custom greys

### Typography Hierarchy

Build hierarchy with weight + colour + spacing, not size alone.

- Use Dynamic Type sizes only (`.body`, `.headline`, `.caption`, `.footnote`, etc.)
- Primary label: `.primary` colour, `.semibold` or `.medium` weight
- Secondary label: `.secondary` colour, `.regular` weight
- Metadata / timestamp: `.tertiary` colour, `.caption` or `.footnote` size
- Cross-reference `swiftui-polish-guidelines.md` for tabular numbers and content transitions

### Visual Density by Context

| Context | Density | Guidance |
|---|---|---|
| List rows | Compact (44-60pt) | Tight padding, single-line preferred, information-dense |
| Detail screens | Breathe | Generous section spacing, room around key metrics |
| Modals / sheets | Focused | Less peripheral decoration, clear primary action |
| Empty states | Composed | `ContentUnavailableView` with icon + description + action |
| Onboarding / hero | Open | Large spacing, visual weight on headline and illustration |

## Content Quality

- No filler copy: avoid "Elevate", "Seamless", "Unleash", "Next-Gen", "Empower", "Revolutionise"
- Preview data should use realistic, varied values — not round numbers or sequential IDs
- Error messages: direct and specific, not "Oops!" or "Something went wrong"
- Empty state descriptions: explain what the user can do, not just what is missing
- Button labels: use specific verbs ("Add Supplement", "Start Workout") not generic ("Submit", "Continue")

## Review Checklist (Design Quality)

Use alongside the checklists in `ui-implementation-checklist.md` and `swiftui-polish-guidelines.md`.

- [ ] Colours use semantic names or shared palette, not inline hex
- [ ] Spacing varies intentionally between semantic levels
- [ ] All interactive states covered (loading, empty, error, pressed)
- [ ] Typography hierarchy uses weight and colour, not just size
- [ ] No uniform padding/spacing across all elements
- [ ] Dark mode considered (no hardcoded light-only colours)
- [ ] Preview data is realistic and varied
- [ ] Content copy is specific and avoids filler language
- [ ] Visual density matches context (compact lists, breathing detail screens)

## AI-Agent Instructions

When generating SwiftUI in [YourApp], follow these rules to avoid generic output:

- Vary spacing intentionally — section gaps wider than group gaps wider than element gaps.
- Use the spacing scale (4, 8, 12, 16, 24, 32) and choose values by semantic level, not by default.
- Build typography hierarchy with weight + colour + spacing, not font size alone.
- Use semantic colours (`.primary`, `.secondary`, `.tertiary`) and `.tint()` — never scatter `Color(hex:)`.
- Provide all interaction states: loading, empty, error, content, pressed.
- Use `ContentUnavailableView` for empty states, not bare `Text`.
- Match visual density to context: compact rows, breathing detail screens, focused sheets.
- Write specific button labels and error messages — no filler copy.
- Use realistic, varied preview data.
- Before submitting SwiftUI work, check against the Review Checklist above.
- For polish techniques (animations, shadows, hit areas), see `swiftui-polish-guidelines.md`.
- For view architecture (body purity, state ownership, extraction), see `swiftui-view-guidelines.md`.
