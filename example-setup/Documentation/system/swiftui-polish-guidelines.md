# SwiftUI Polish Guidelines

Details that make interfaces feel better, adapted for SwiftUI and iOS.

Based on [Jakub Krehel's article](https://jakub.kr/writing/details-that-make-interfaces-feel-better), translated from web/CSS into native SwiftUI idioms.

Great interfaces rarely come from a single thing. It's usually a collection of small details that compound into a great experience. Apply these principles when building or reviewing SwiftUI code.

## Quick Reference

| Category | When to Use |
| --- | --- |
| [Typography](#typography) | Tabular numbers, text alignment, truncation |
| [Surfaces](#surfaces) | Concentric corner radii, optical alignment, shadows, image outlines |
| [Animation](#animation) | Decision framework, interruptible springs, enter/exit transitions, icon animations, press feedback, reduced motion, gesture physics |
| [Performance](#performance) | Animation specificity, drawing groups |

---

## Typography

### Tabular Numbers

When numbers update dynamically (counters, timers, progress values), use `.monospacedDigit()` to make all digits equal width. This prevents layout shift as values change.

```swift
// Good — digits won't cause layout shift
Text("\(count)")
    .monospacedDigit()

// Good — timer display
Text(duration, format: .time(pattern: .minuteSecond))
    .monospacedDigit()
```

#### When to Use

| Use `.monospacedDigit()` | Skip it |
| --- | --- |
| Counters and timers | Static display numbers |
| Prices that update | Decorative large numbers |
| Table columns with numbers | Phone numbers, postcodes |
| Animated number transitions | Version numbers (v2.1.0) |
| Scoreboards, dashboards | |

### Text Alignment on Multiline Headings

SwiftUI doesn't have CSS `text-wrap: balance`, but you can prevent orphaned single-word lines on headings by centering multiline text:

```swift
// Good — centered alignment avoids visual orphans on headings
Text("Welcome to Your Health Dashboard")
    .font(.title)
    .multilineTextAlignment(.center)
```

For body text, `.leading` alignment is almost always correct. Don't center body copy.

### Content Transitions for Changing Text

When text content changes dynamically, use `.contentTransition(.numericText())` for numbers to get smooth digit interpolation:

```swift
Text("\(score)")
    .monospacedDigit()
    .contentTransition(.numericText())
    .animation(.snappy, value: score)
```

---

## Surfaces

### Concentric Corner Radii

When nesting rounded elements, the outer radius must equal the inner radius plus the padding between them:

```
outerRadius = innerRadius + padding
```

Mismatched corner radii on nested elements is one of the most common things that makes interfaces feel off.

```swift
// Good — concentric radii
private let innerRadius: CGFloat = 12
private let padding: CGFloat = 8
private let outerRadius: CGFloat = 12 + 8 // 20

var body: some View {
    // Outer surface
    VStack {
        // Inner surface
        content
            .clipShape(RoundedRectangle(cornerRadius: innerRadius, style: .continuous))
    }
    .padding(padding)
    .clipShape(RoundedRectangle(cornerRadius: outerRadius, style: .continuous))
}
```

```swift
// Bad — same radius on both
VStack {
    content
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
}
.padding(8)
.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
```

When padding exceeds ~24pt, treat the layers as separate surfaces and choose each radius independently.

Always use `.continuous` corner style — it produces the smooth superellipse curves Apple uses throughout iOS (sometimes called "squircle" corners).

### Optical Alignment

When geometric centering looks off, align optically instead.

#### Buttons with Text + Icon

Use slightly less padding on the icon side. A reliable rule of thumb: icon-side padding = text-side padding - 2pt.

```swift
// Good — optically balanced
HStack(spacing: 8) {
    Text("Continue")
    Image(systemName: "arrow.right")
}
.padding(.leading, 16)
.padding(.trailing, 14) // 2pt less on icon side
```

#### Asymmetric Icons

Some SF Symbols or custom icons have uneven visual weight. Nudge them:

```swift
// Play triangle needs a small rightward shift
Image(systemName: "play.fill")
    .offset(x: 1.5) // optical correction
```

#### Chevron Disclosure Rows

When a row has a leading icon and trailing chevron, the chevron's geometric center often looks too far right. A small negative trailing padding can help:

```swift
HStack {
    Image(systemName: "heart.fill")
    Text("Favourites")
    Spacer()
    Image(systemName: "chevron.right")
        .font(.caption)
        .foregroundStyle(.tertiary)
}
```

### Shadows Instead of Borders

For cards and containers that need depth, prefer `.shadow()` over `border`/`stroke`. Shadows adapt to any background through transparency; solid borders don't.

**Do not apply this to dividers** or borders whose purpose is layout separation. Those should stay as borders or `Divider()`.

```swift
// Good — layered shadows for depth
extension View {
    func cardShadow() -> some View {
        self
            .shadow(color: .black.opacity(0.06), radius: 0, x: 0, y: 0)   // ring
            .shadow(color: .black.opacity(0.06), radius: 1, x: 0, y: 1)   // lift
            .shadow(color: .black.opacity(0.04), radius: 2, x: 0, y: 2)   // ambient
    }
}

// Usage
RoundedRectangle(cornerRadius: 12, style: .continuous)
    .fill(.background)
    .cardShadow()
```

```swift
// Bad — hard border that clashes on non-white backgrounds
RoundedRectangle(cornerRadius: 12, style: .continuous)
    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
```

#### When to Use Shadows vs Borders

| Use shadows | Use borders |
| --- | --- |
| Cards, containers with depth | Dividers between list items |
| Buttons with bordered styles | Table/grid cell boundaries |
| Elevated elements (sheets, popovers) | Form input outlines (accessibility) |
| Elements on varied backgrounds | Hairline separators in dense UI |

### Image Outlines

Add a subtle inset border to images for consistent depth:

```swift
// Good — subtle outline that adapts to colour scheme
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    .overlay(
        RoundedRectangle(cornerRadius: 8, style: .continuous)
            .strokeBorder(.primary.opacity(0.1), lineWidth: 1)
    )
```

Use `.strokeBorder` (not `.stroke`) so the line is inset and doesn't add to the layout size. Using `.primary.opacity(0.1)` automatically adapts between light and dark mode.

### Minimum Hit Area

Interactive elements should have at least 44x44pt hit area (Apple HIG). If the visible element is smaller, expand it:

```swift
// Good — small visual element with proper hit area
Button(action: close) {
    Image(systemName: "xmark")
        .font(.caption)
        .frame(minWidth: 44, minHeight: 44)
        .contentShape(.rect)
}

// Also good — use contentShape to extend tappable area
Button(action: toggle) {
    Circle()
        .frame(width: 20, height: 20)
}
.frame(width: 44, height: 44)
.contentShape(.rect)
```

Never let hit areas of adjacent interactive elements overlap.

---

## Animation

### Animation Decision Framework

Before adding any animation, answer these questions in order.

#### 1. Should This Animate at All?

How often will users see this animation?

| Frequency | Decision |
| --- | --- |
| 100+/day (keyboard shortcuts, frequent toggles, command palette) | No animation. Ever. |
| Tens/day (list navigation, tab switches, toolbar actions) | Remove or drastically reduce |
| Occasional (sheets, drawers, toasts, confirmations) | Standard animation |
| Rare/first-time (onboarding, celebrations, achievement unlocks) | Can add delight |

If the action is triggered by a keyboard shortcut or hardware button, never animate it.

#### 2. What Is the Purpose?

Every animation must answer "why does this animate?" Valid purposes:

- **Spatial consistency** — element enters and exits from the same direction
- **State indication** — showing a state change (toggle, loading, success)
- **Feedback** — confirming the interface heard the user (press scale, haptic pairing)
- **Preventing jarring changes** — elements appearing/disappearing without transition feel broken
- **Explanation** — showing how a feature works (onboarding, tutorials)

If the purpose is just "it looks cool" and the user will see it often, don't animate.

#### 3. What Timing Curve?

| Situation | SwiftUI Timing |
| --- | --- |
| Element entering or appearing | `.spring(duration: 0.3, bounce: 0)` or `.easeOut` — starts fast, feels responsive |
| Element moving/morphing on screen | `.spring(duration: 0.3, bounce: 0)` — natural acceleration/deceleration |
| Element exiting or dismissing | `.easeOut(duration: 0.15)` — fast, don't fight for attention |
| Constant motion (progress, marquee) | `.linear` |
| Default for interactive state changes | `.spring(duration: 0.3, bounce: 0)` |

**Never use `.easeIn` for UI animations.** It starts slow, which makes the interface feel sluggish. A sheet with `.easeIn` at 300ms *feels* slower than `.easeOut` at the same duration because `.easeIn` delays the initial movement — the exact moment the user is watching most closely.

#### 4. How Long?

| Element | Duration |
| --- | --- |
| Button press feedback (scale) | 100–160ms |
| Small popovers, tooltips, menus | 125–200ms |
| Dropdowns, pickers, segmented controls | 150–250ms |
| Sheets, drawers, full-screen covers | 200–400ms |
| Onboarding, marketing, celebrations | Can be longer |

**Rule: UI animations should stay under 300ms.** A 180ms sheet feels more responsive than a 400ms one.

#### Perceived Performance

Speed in animation directly affects how users perceive your app's performance:

- A faster-spinning `ProgressView` makes loading feel faster (same load time, different perception)
- A 200ms sheet animation feels more responsive than a 400ms one
- Instant transitions after the first in a sequence (skip delay + skip animation) make the whole flow feel faster

The perception of speed matters as much as actual speed. `.easeOut` at 200ms *feels* faster than `.easeIn` at 200ms because the user sees immediate movement.

#### Asymmetric Enter/Exit Timing

Enter animations can be deliberate. Exit animations should always be snappy. The user's focus is already moving to the next thing — don't fight for attention.

```swift
.transition(
    .asymmetric(
        insertion: .opacity
            .combined(with: .offset(y: 12))
            .animation(.spring(duration: 0.3, bounce: 0)),
        removal: .opacity
            .combined(with: .offset(y: -8))
            .animation(.easeOut(duration: 0.15))
    )
)
```

For deliberate actions (hold-to-delete, long-press confirmations), the *action phase* is slow while the *system response* is fast. This applies broadly: slow where the user is deciding, fast where the system is responding.

#### Debugging Animations

- Use **Debug > Slow Animations** in the Simulator (or `⌘T`) to play animations at reduced speed
- Things to check in slow motion:
  - Does the easing feel right, or does it start/stop abruptly?
  - Are multiple animated properties (opacity, offset, scale) in sync?
  - Does the animation start from a visible initial state (not `scale(0)`)?
  - Is the `transform-origin` / anchor point correct?
- Review animations with fresh eyes the next day — you notice imperfections you missed during development

### Never Animate from Scale Zero

Nothing in the real world disappears and reappears completely. Elements animating from `scaleEffect(0)` look like they materialise from nothing.

Start from `0.9` or higher, combined with opacity. Even a barely-visible initial scale makes the entrance feel more natural.

```swift
// Bad — appears from nothing
content
    .scaleEffect(isPresented ? 1.0 : 0)

// Good — starts from a visible shape
content
    .scaleEffect(isPresented ? 1.0 : 0.9)
    .opacity(isPresented ? 1.0 : 0)
```

This applies to all scale animations: sheets, cards, popovers, custom overlays. The icon animation rule (start from `0.25`) is the exception — icons are small enough that a lower starting scale still reads as "present."

### Respect Reduced Motion

Animations can cause motion sickness. When the user enables Reduce Motion, use fewer and gentler animations — not zero. Keep opacity and colour transitions that aid comprehension. Remove movement and position changes.

```swift
struct MotionAwareTransition: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isPresented = false

    var body: some View {
        content
            .opacity(isPresented ? 1 : 0)
            .offset(y: reduceMotion ? 0 : (isPresented ? 0 : 12))
            .animation(
                reduceMotion
                    ? .easeOut(duration: 0.15)
                    : .spring(duration: 0.3, bounce: 0),
                value: isPresented
            )
    }
}
```

| With motion | With Reduce Motion |
| --- | --- |
| Offset + opacity + blur entrance | Opacity-only cross-fade |
| Spring-based drag interactions | Snap to final position |
| Staggered list entrance | All items appear together |
| Scale-on-press button feedback | Opacity-on-press feedback |

Check `accessibilityReduceMotion` in any view that uses offset, scale, or position animations. Opacity and colour transitions can remain.

### Interruptible Animations (Use Springs)

SwiftUI spring animations are interruptible and retargetable by default. When the user changes intent mid-animation, a spring smoothly redirects toward the new value. This is the single most important animation principle.

```swift
// Good — interruptible spring (SwiftUI default since iOS 17)
withAnimation(.spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}

// Good — applied as a modifier
content
    .scaleEffect(isActive ? 1.0 : 0.96)
    .animation(.spring(duration: 0.3, bounce: 0), value: isActive)
```

```swift
// Bad — linear/easeIn animations can't retarget
withAnimation(.linear(duration: 0.3)) {
    isExpanded.toggle()
}

// Bad — broad .animation without value: triggers on every state change
content
    .animation(.default) // animates everything, unpredictable
```

**Rule:** Default to `.spring(duration: 0.3, bounce: 0)` for interactive state changes. Use `bounce: 0` for UI elements — bouncy animations on controls feel toy-like. Reserve non-zero bounce for playful, non-critical elements only.

### Enter Animations: Split and Stagger

Don't animate a single container. Break content into semantic chunks and stagger each individually.

```swift
struct StaggeredEntrance: View {
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 16) {
            sectionContent("Welcome", delay: 0)
            sectionContent("A description of the page.", delay: 0.1)
            sectionContent("Get Started", delay: 0.2)
        }
        .onAppear { appeared = true }
    }

    private func sectionContent(_ text: String, delay: Double) -> some View {
        Text(text)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)
            .blur(radius: appeared ? 0 : 4)
            .animation(
                .spring(duration: 0.4, bounce: 0).delay(delay),
                value: appeared
            )
    }
}
```

Key points:
- 30–80ms delay between items, ~100ms between semantic groups
- Combine `opacity`, `offset`, and `blur` for the enter effect
- For titles, consider splitting into individual words with ~50ms stagger
- Never block interaction while stagger animations are playing — the user should be able to tap immediately
- Long delays (>100ms between items) make the interface feel slow rather than polished

### Exit Animations: Keep Them Subtle

Exit animations should be softer and faster than enter animations. The user's focus is moving to the next thing — don't fight for attention.

```swift
// Good — subtle exit
content
    .transition(
        .asymmetric(
            insertion: .opacity
                .combined(with: .offset(y: 12))
                .combined(with: .blur(radius: 4)),
            removal: .opacity
                .combined(with: .offset(y: -8))
                .animation(.easeIn(duration: 0.15))
        )
    )
```

```swift
// Bad — dramatic exit that steals focus
content
    .transition(.scale(scale: 0.5).combined(with: .opacity))
```

Key points:
- Use a small fixed offset (8-12pt) instead of full height
- Exit duration should be shorter than enter (0.15s vs 0.3s)
- Keep directional movement to indicate where the element went
- Don't remove exit animations entirely — subtle motion preserves context

### Contextual Icon Animations

When icons swap on state change (play/pause, like/unlike), use SwiftUI's built-in symbol effects or manual transitions:

#### SF Symbol Effects (Preferred)

```swift
// Best — built-in symbol animation
Image(systemName: isPlaying ? "pause.fill" : "play.fill")
    .contentTransition(.symbolEffect(.replace))
```

#### Manual Cross-Fade with Scale

When you need custom icons or more control:

```swift
// Manual icon swap with cross-fade
ZStack {
    Image(systemName: "heart")
        .opacity(isFavourite ? 0 : 1)
        .scaleEffect(isFavourite ? 0.25 : 1)
        .blur(radius: isFavourite ? 4 : 0)

    Image(systemName: "heart.fill")
        .opacity(isFavourite ? 1 : 0)
        .scaleEffect(isFavourite ? 1 : 0.25)
        .blur(radius: isFavourite ? 0 : 4)
}
.animation(.spring(duration: 0.3, bounce: 0), value: isFavourite)
```

Exact values for contextual icon animations — do not deviate:
- `scaleEffect`: `0.25` → `1` (never use `0.5` or `0.6`)
- `opacity`: `0` → `1`
- `blur`: `4` → `0`
- Spring: `duration: 0.3, bounce: 0`

### Scale on Press

A subtle scale-down on press gives buttons tactile feedback. Always use `0.96`. Never use a value smaller than `0.95` — anything below feels exaggerated.

```swift
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(duration: 0.15, bounce: 0), value: configuration.isPressed)
    }
}

// Usage
Button("Tap me") { }
    .buttonStyle(ScaleButtonStyle())
```

For buttons where motion would be distracting, don't apply the style. Consider making a variant:

```swift
struct StaticButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.7 : 1.0)
    }
}
```

### Skip Animation on Appear

Don't animate elements into their default state on first render. Only animate on subsequent state changes.

```swift
struct ContentView: View {
    @State private var hasAppeared = false
    @State private var isActive = false

    var body: some View {
        content
            .scaleEffect(isActive ? 1.1 : 1.0)
            .animation(hasAppeared ? .spring(duration: 0.3, bounce: 0) : .none, value: isActive)
            .onAppear { hasAppeared = true }
    }
}
```

Works well for: icon swaps, toggles, segmented controls — anything with a default state on appearance.

Don't apply this to intentional entrance animations (staggered page heroes, loading transitions).

### Phase Animations for Multi-Step Sequences

For staged sequences that should play once (not interactive), use `PhaseAnimator`:

```swift
PhaseAnimator([false, true], trigger: triggerValue) { phase in
    content
        .opacity(phase ? 1 : 0)
        .offset(y: phase ? 0 : 20)
} animation: { _ in
    .spring(duration: 0.4, bounce: 0)
}
```

### Gesture Physics

#### Momentum-Based Dismissal

Don't require dragging past a fixed distance threshold. Calculate velocity: if the user flicks quickly, dismiss regardless of distance. A quick flick should be enough.

```swift
// In a DragGesture .onEnded handler
let velocity = abs(value.translation.height) / max(0.001, Date().timeIntervalSince(dragStartTime))

if abs(value.translation.height) >= dismissThreshold || velocity > 800 {
    dismiss()
}
```

#### Damping at Boundaries

When a user drags past a natural boundary (e.g., pulling a sheet beyond its resting point), apply increasing friction rather than a hard stop. Things in real life don't suddenly stop — they slow down first.

```swift
// Rubber-band effect: the further past the boundary, the less the element moves
private func dampedOffset(_ excess: CGFloat) -> CGFloat {
    let limit: CGFloat = 120
    return limit * (1 - exp(-excess / limit))
}
```

This is how Apple's own sheets, scroll views, and pull-to-refresh behave. A hard stop at the boundary feels like hitting an invisible wall.

#### Spring Animations for Gestures

Use springs with non-zero bounce (0.1–0.3) for gesture-driven animations. Unlike UI controls (where `bounce: 0` is correct), gestures benefit from slight overshoot because the user has imparted physical momentum.

```swift
// Snap back after drag release
withAnimation(.spring(duration: 0.4, bounce: 0.2)) {
    offset = .zero
}
```

Keep bounce subtle. Values above 0.3 feel toy-like.

---

## Performance

### Animate Only What Changes

Never apply a broad `.animation()` without a `value:` parameter. Always specify what triggers the animation.

```swift
// Good — explicit trigger
content
    .opacity(isVisible ? 1 : 0)
    .animation(.spring(duration: 0.3, bounce: 0), value: isVisible)

// Good — scoped withAnimation
withAnimation(.spring(duration: 0.3, bounce: 0)) {
    isVisible.toggle()
}
```

```swift
// Bad — animates every state change
content
    .opacity(isVisible ? 1 : 0)
    .animation(.default)
```

### Use `.drawingGroup()` Sparingly

`.drawingGroup()` flattens a view hierarchy into a single Metal-backed layer — the SwiftUI equivalent of GPU compositing. It helps when you have complex overlapping content that animates (many shadows, blurs, gradients).

```swift
// Good — complex animated content benefits from GPU compositing
ComplexAnimatedView()
    .drawingGroup()
```

Only add `.drawingGroup()` when you notice rendering stutter. Each drawing group costs GPU memory. Don't add it preemptively.

### Prefer `.compositingGroup()` for Shadow/Blur Stacking

When multiple shadows or blurs in a hierarchy compound unexpectedly, `.compositingGroup()` renders the subtree as one unit before applying effects:

```swift
VStack {
    ForEach(items) { item in
        ItemCard(item: item)
    }
}
.compositingGroup()
.shadow(color: .black.opacity(0.1), radius: 8, y: 4)
```

---

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Same corner radius on parent and child | Calculate `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust optically with `.offset()` or fix the symbol |
| Hard borders between cards | Use layered `.shadow()` with transparency |
| Jarring enter/exit animations | Split, stagger, and keep exits subtle |
| Numbers cause layout shift | Apply `.monospacedDigit()` |
| `.animation(.default)` without value | Always use `.animation(_:value:)` or scoped `withAnimation` |
| Bouncy springs on UI controls | Use `bounce: 0` for controls |
| Tiny hit areas on small controls | Expand with `.frame(minWidth: 44, minHeight: 44).contentShape(.rect)` |
| Scale-on-press below 0.95 | Always use `0.96`, never below `0.95` |
| `scaleEffect(0)` as initial state | Start from `0.9` or higher, combined with opacity |
| No Reduce Motion support | Check `accessibilityReduceMotion`, replace motion with opacity |
| Hard stop at drag boundary | Apply rubber-band damping with exponential decay |
| Dismiss only on distance threshold | Also check velocity — a quick flick should dismiss |
| Long stagger delays (>100ms/item) | Keep 30–80ms between items; never block interaction |

## Review Checklist

- [ ] Nested rounded elements use concentric corner radii with `.continuous` style
- [ ] Icons are optically centered, not just geometrically
- [ ] Shadows used instead of borders for depth (not for dividers)
- [ ] Enter animations are split and staggered (~100ms between groups)
- [ ] Exit animations are subtle and shorter than enter animations
- [ ] Dynamic numbers use `.monospacedDigit()`
- [ ] Headings use `.multilineTextAlignment(.center)` where appropriate
- [ ] Images have subtle `.strokeBorder` overlays
- [ ] Buttons use scale-on-press (`0.96`) where appropriate
- [ ] No broad `.animation(.default)` — always scoped with `value:` or `withAnimation`
- [ ] Interactive elements have at least 44x44pt hit area
- [ ] Springs use `bounce: 0` for UI controls
- [ ] `.drawingGroup()` only where stutter is observed, not preemptively
- [ ] No `scaleEffect(0)` — start from `0.9` or higher with opacity
- [ ] Reduce Motion respected — offset/scale animations replaced with opacity when `accessibilityReduceMotion` is true
- [ ] Drag gestures use velocity-based dismissal, not just distance thresholds
- [ ] Drag boundaries use rubber-band damping, not hard stops
- [ ] Stagger delays are 30–80ms per item, interaction is never blocked
