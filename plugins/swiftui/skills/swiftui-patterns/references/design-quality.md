# Design Quality

Quality gate for SwiftUI. Prevents generic, template-like output.

## AI Tells (Anti-Patterns)

These patterns mark code as generic. Avoid them.

### Layout
- Uniform `.padding()` everywhere — vary by semantic level: section > group > element
- `Spacer()` as only spacing tool — use stack `spacing:` parameters
- Centre-aligning everything — leading alignment for body content
- Identical spacing between all elements regardless of grouping
- Generic `ScrollView { VStack }` when `List` or `Form` is the right container
- Every section wrapped in the same `RoundedRectangle` card — vary visual weight
- `ZStack` overlay for every visual effect — use `.background`, `.overlay` modifiers
- Wrapping every element in its own `VStack` when the parent stack already provides layout

### Colour
- `Color(hex:)` scattered through views — use named assets or semantic extensions
- `Color.blue` / `.accentColor` as universal interactive colour
- `.opacity(0.5)` as universal "make it secondary" — use `.secondary`, `.tertiary`
- Full-saturation colours (`#FF0000`) instead of calibrated tones
- Hardcoded colours without dark mode consideration — use semantic colours
- Identical tint on every icon regardless of meaning

### Typography
- `.font(.system(size: 14))` instead of semantic styles (`.body`, `.headline`)
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
- `NavigationLink(destination:)` instead of `navigationDestination(for:)`
- One-off `CardView` wrappers per screen — define shared card styling

## Spacing Vocabulary

Permitted values: **4, 8, 12, 16, 24, 32**.

Rules:
- Section gaps > group gaps > element gaps
- Headers get more space above than below (asymmetric spacing signals hierarchy)
- Related elements cluster tighter than unrelated ones
- Stack `spacing:` for uniform child spacing; explicit padding for asymmetric cases
- Zero spacing is valid — tight clustering signals strong relationship

```swift
// GOOD — intentional spacing hierarchy
VStack(spacing: 0) {
    header
        .padding(.bottom, 8)

    VStack(spacing: 12) {  // element spacing
        ForEach(items) { item in Row(item: item) }
    }
    .padding(.bottom, 24)  // section gap

    actionButtons
}

// BAD — uniform padding everywhere
VStack {
    header.padding()
    ForEach(items) { item in Row(item: item).padding() }
    actionButtons.padding()
}
```

## Colour Palette Discipline

- Max one accent colour per screen context
- Semantic indicator colours (positive / caution / negative) defined in shared extensions, not inline
- Use `.primary`, `.secondary`, `.tertiary` for text hierarchy
- Prefer `.tint()` over hardcoded colour on interactive elements
- Background fills: use `.background` materials or system grouped backgrounds, not custom greys
- Use `bold()` instead of `fontWeight(.bold)` — lets the system choose correct weight for context
- Avoid UIKit colours (`UIColor`) in SwiftUI — use SwiftUI `Color` or asset catalogue
- Avoid `.caption2` — it is extremely small. Even `.caption` should be used carefully.

## Typography Hierarchy

Build hierarchy with weight + colour + spacing, not size alone:

```swift
// Primary label
Text(title)
    .font(.headline)
    .foregroundStyle(.primary)

// Secondary label
Text(subtitle)
    .font(.subheadline)
    .foregroundStyle(.secondary)

// Metadata / timestamp
Text(date, format: .relative(presentation: .named))
    .font(.caption)
    .foregroundStyle(.tertiary)
```

Use Dynamic Type sizes only (`.body`, `.headline`, `.caption`, `.footnote`). Only use `fontWeight()` for weights other than bold when there is an important reason.

## Visual Density by Context

| Context | Density | Guidance |
|---------|---------|----------|
| List rows | Compact (44-60pt) | Tight padding, single-line preferred, information-dense |
| Detail screens | Breathe | Generous section spacing, room around key metrics |
| Modals / sheets | Focused | Less peripheral decoration, clear primary action |
| Empty states | Composed | `ContentUnavailableView` with icon + description + action |
| Onboarding / hero | Open | Large spacing, visual weight on headline |

## Content Quality

- **No filler copy:** avoid "Elevate", "Seamless", "Unleash", "Next-Gen", "Empower", "Revolutionise"
- **Preview data:** realistic, varied values — not round numbers or sequential IDs
- **Error messages:** direct and specific, not "Oops!" or "Something went wrong"
- **Empty states:** explain what the user can do, not just what is missing
- **Button labels:** specific verbs ("Add Supplement", "Start Workout") not generic ("Submit", "Continue")

## Standard System Styling

- Use `ContentUnavailableView` for empty or missing data, not custom views
- `ContentUnavailableView.search` for empty search results (includes search term automatically)
- Prefer `Label` over `HStack` for icon + text
- Use system hierarchical styles (`.secondary`, `.tertiary`) over manual opacity
- Wrap `Slider` in `LabeledContent` inside `Form`
- `RoundedRectangle` defaults to `.continuous` — no need to specify explicitly
- Prefer `TextField(axis: .vertical)` with `lineLimit(5...)` over `TextEditor`
- `#Preview` for previews, not `PreviewProvider`
- `TabView(selection:)` with enum binding, not integer or string

## Design Review Checklist

- [ ] Colours use semantic names or shared palette, not inline hex
- [ ] Spacing varies intentionally between semantic levels
- [ ] All interactive states covered (loading, empty, error, pressed)
- [ ] Typography hierarchy uses weight and colour, not just size
- [ ] No uniform padding/spacing across all elements
- [ ] Dark mode considered (no hardcoded light-only colours)
- [ ] Preview data is realistic and varied
- [ ] Content copy is specific and avoids filler language
- [ ] Visual density matches context
- [ ] `ContentUnavailableView` used for empty states

## The AI Slop Test

**If you showed this screen to an iOS developer and said "AI made this," would they believe you immediately?** If yes, that's the problem.

### SwiftUI AI Tells

These patterns instantly mark a screen as AI-generated:

- **Every view wrapped in `NavigationStack` with `.navigationTitle`** — not every screen needs navigation chrome
- **Gratuitous `RoundedRectangle(cornerRadius: 12)` on everything** — cards for content that doesn't need containment
- **Default blue accent everywhere** — no brand colour, no personality
- **`.shadow(radius: 10)` on every card** — uniform depth with no hierarchy
- **Same SF Symbol choices everyone uses** — `star.fill`, `gear`, `person.circle` without thought
- **`List` for everything** — even non-list content like dashboards, detail screens, summaries
- **Overly symmetric layouts** — identical cards in a grid, each with icon + title + subtitle
- **No spacing variation** — same `.padding()` on every element
- **"Welcome back!" greeting** — filler that adds nothing
- **Generic colour palette** — blue + grey + white, no personality or brand alignment
- **Every section in a `GroupBox`** — visual noise without hierarchy
- **`.tint(.blue)` as only accent** — indicates no design thought

### The Fix

Distinctive interfaces have:
- **One clear focal point** per screen — not everything competing for attention
- **Brand-aligned colour** — even one non-blue accent colour transforms a screen
- **Spacing hierarchy** — tight grouping for related elements, generous gaps between sections
- **Selective containment** — cards only where content is genuinely distinct and tappable
- **Typography personality** — weight and colour variations, not just size changes
- **Intentional asymmetry** — leading alignment for body, varied section structures

## Design Intensity

Sometimes a screen is too safe (generic, timid, forgettable). Sometimes it's too loud (competing elements, visual noise, overwhelming). Use this framework to calibrate.

### Making It Bolder

When a screen feels generic or forgettable:

**Typography amplification:**
- Increase the scale jump between heading and body (`.title` vs `.caption`, not `.headline` vs `.subheadline`)
- Use weight contrast: `.bold` headings with `.regular` body, not `.semibold` everywhere
- Consider `.largeTitle` for hero moments — it exists for a reason

**Colour commitment:**
- Pick ONE accent colour and commit to it — don't spread 5 colours thinly
- Use the 60/30/10 rule: 60% neutral, 30% secondary, 10% accent
- Tint backgrounds subtly — `.background(.accent.opacity(0.05))` adds warmth without noise

**Spatial drama:**
- Increase section spacing (32-48pt between major sections)
- Tighten element spacing within groups (4-8pt)
- The contrast between tight and generous creates visual rhythm

**Visual weight hierarchy:**
- Make the primary action visually dominant (`.borderedProminent`, larger, more colour)
- Make secondary actions recede (`.plain`, `.borderless`, smaller)
- Let one element own the screen

### Making It Quieter

When a screen feels overwhelming or visually noisy:

**Reduce saturation:**
- Shift from full saturation to 70-85%
- Use `.secondary` and `.tertiary` text styles more
- Let neutrals do more work — colour as accent (10%), not dominant (60%)

**Reduce visual weight:**
- Decrease font weights (`.bold` → `.semibold`, `.semibold` → `.medium`)
- Increase whitespace — let content breathe
- Remove borders, shadows, and effects that don't serve hierarchy

**Simplify:**
- Remove decorative elements that don't guide the eye
- Reduce the number of distinct visual elements
- Flatten hierarchy — fewer nested containers
- Remove `GroupBox` unless grouping truly aids comprehension

**Refine motion:**
- Shorten animation distances (12pt → 8pt offsets)
- Reduce stagger groups (3 groups max)
- Remove decorative animations that don't serve feedback or orientation

### The Balance Test

A well-calibrated screen:
- Has ONE element that clearly dominates (the primary content or action)
- Uses 2-3 levels of visual weight (primary, secondary, tertiary)
- Has spacing rhythm (tight groups separated by generous gaps)
- Feels intentional, not decorated
- Would not be immediately identified as AI-generated
