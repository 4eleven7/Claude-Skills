# Polish and Animation

Details that compound into a great experience. Every pattern here includes specific values — use them.

## Typography Polish

### Tabular Numbers

Dynamic numbers (counters, timers, prices, dashboards) need `.monospacedDigit()` to prevent layout shift:

```swift
Text("\(count)")
    .monospacedDigit()

Text(duration, format: .time(pattern: .minuteSecond))
    .monospacedDigit()
```

| Use `.monospacedDigit()` | Skip it |
|--------------------------|---------|
| Counters, timers, prices that update | Static display numbers |
| Table columns with numbers | Phone numbers, postcodes |
| Animated number transitions | Version numbers (v2.1.0) |
| Scoreboards, dashboards | Decorative large numbers |

### Content Transitions for Changing Text

Smooth digit interpolation when numbers change:

```swift
Text("\(score)")
    .monospacedDigit()
    .contentTransition(.numericText())
    .animation(.snappy, value: score)
```

### Multiline Heading Alignment

Center multiline headings to avoid visual orphans. Never center body copy.

```swift
Text("Welcome to Your Health Dashboard")
    .font(.title)
    .multilineTextAlignment(.center)
```

## Surfaces

### Concentric Corner Radii

When nesting rounded elements, the outer radius MUST equal the inner radius plus the padding:

```
outerRadius = innerRadius + padding
```

```swift
// GOOD — concentric radii
private let innerRadius: CGFloat = 12
private let padding: CGFloat = 8
private let outerRadius: CGFloat = 20  // 12 + 8

VStack {
    content
        .clipShape(RoundedRectangle(cornerRadius: innerRadius, style: .continuous))
}
.padding(padding)
.clipShape(RoundedRectangle(cornerRadius: outerRadius, style: .continuous))

// BAD — same radius on both, looks wrong
VStack {
    content.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
}
.padding(8)
.clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
```

When padding exceeds ~24pt, treat layers as separate surfaces and choose radii independently. Always use `.continuous` style for the smooth superellipse curves Apple uses throughout iOS.

### Optical Alignment

When geometric centering looks off, align optically.

**Buttons with text + icon** — icon-side padding = text-side padding - 2pt:

```swift
HStack(spacing: 8) {
    Text("Continue")
    Image(systemName: "arrow.right")
}
.padding(.leading, 16)
.padding(.trailing, 14)  // 2pt less on icon side
```

**Asymmetric icons** — nudge with offset:

```swift
Image(systemName: "play.fill")
    .offset(x: 1.5)  // optical correction for play triangle
```

### Shadows Instead of Borders

Cards and containers needing depth should use layered shadows, not borders:

```swift
extension View {
    func cardShadow() -> some View {
        self
            .shadow(color: .black.opacity(0.06), radius: 0, x: 0, y: 0)   // ring
            .shadow(color: .black.opacity(0.06), radius: 1, x: 0, y: 1)   // lift
            .shadow(color: .black.opacity(0.04), radius: 2, x: 0, y: 2)   // ambient
    }
}
```

| Use shadows | Use borders |
|-------------|-------------|
| Cards, containers with depth | Dividers between list items |
| Buttons with bordered styles | Table/grid cell boundaries |
| Elevated elements (sheets, popovers) | Form input outlines (accessibility) |
| Elements on varied backgrounds | Hairline separators in dense UI |

### Image Outlines

Subtle inset border for consistent depth. Use `.strokeBorder` (not `.stroke`) so the line is inset:

```swift
Image("photo")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    .overlay(
        RoundedRectangle(cornerRadius: 8, style: .continuous)
            .strokeBorder(.primary.opacity(0.1), lineWidth: 1)
    )
```

### Minimum Hit Area

Interactive elements must have at least 44x44pt hit area:

```swift
Button(action: close) {
    Image(systemName: "xmark")
        .font(.caption)
        .frame(minWidth: 44, minHeight: 44)
        .contentShape(.rect)
}
```

## Animation

### Interruptible Animations (Springs)

The single most important animation principle: springs are interruptible and retargetable.

```swift
// Default to this for interactive state changes
withAnimation(.spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}

// As a modifier
content
    .scaleEffect(isActive ? 1.0 : 0.96)
    .animation(.spring(duration: 0.3, bounce: 0), value: isActive)
```

**Rule:** `bounce: 0` for UI controls. Reserve non-zero bounce for playful, non-critical elements only. Never use `linear` or `easeIn` for interactive animations — they cannot retarget.

### Enter Animations: Split and Stagger

Break content into semantic chunks and stagger each individually. ~100ms (0.1s) delay between groups:

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

Key values:
- **Stagger delay:** ~100ms between groups
- **Enter effect:** combine `opacity`, `offset(y: 12)`, and `blur(radius: 4)`
- **Duration:** 0.4s spring
- For titles, consider splitting into words with ~80ms stagger

### Exit Animations: Keep Them Subtle

Exits should be softer and faster than enters. The user's focus is moving forward.

```swift
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

Key values:
- **Exit duration:** 0.15s (vs 0.3-0.4s enter)
- **Exit offset:** 8pt (vs 12pt enter)
- Keep directional movement to indicate where the element went

### Contextual Icon Animations

**SF Symbol Effects (preferred):**

```swift
Image(systemName: isPlaying ? "pause.fill" : "play.fill")
    .contentTransition(.symbolEffect(.replace))
```

**Manual cross-fade with scale** (custom icons or more control):

```swift
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

Exact values — do not deviate:
- `scaleEffect`: `0.25` to `1` (never 0.5 or 0.6)
- `opacity`: `0` to `1`
- `blur`: `4` to `0`
- Spring: `duration: 0.3, bounce: 0`

### Scale on Press

Always use `0.96`. Never below `0.95`.

```swift
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(duration: 0.15, bounce: 0), value: configuration.isPressed)
    }
}

// For buttons where motion would be distracting
struct StaticButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.7 : 1.0)
    }
}
```

### Skip Animation on Appear

Don't animate elements into their default state on first render:

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

### Phase Animations

For staged sequences that play once (not interactive):

```swift
PhaseAnimator([false, true], trigger: triggerValue) { phase in
    content
        .opacity(phase ? 1 : 0)
        .offset(y: phase ? 0 : 20)
} animation: { _ in
    .spring(duration: 0.4, bounce: 0)
}
```

### Chaining Animations

Use `withAnimation` completion, not delays:

```swift
Button("Animate") {
    withAnimation {
        scale = 2
    } completion: {
        withAnimation {
            scale = 1
        }
    }
}
```

### @Animatable Macro (iOS 26+)

Prefer `@Animatable` over manual `animatableData`:

```swift
@Animatable
struct PulseShape: Shape {
    var progress: Double
    @AnimatableIgnored var shouldPulse: Bool

    func path(in rect: CGRect) -> Path { /* ... */ }
}
```

## Gesture Continuity

The touch-to-motion connection is what makes iOS feel alive. These patterns transform rigid state machines into fluid physical interfaces.

### Velocity-Based Dismissal

When building custom drag-to-dismiss (drawers, cards, toasts), dismiss based on flick velocity, not just distance threshold. A quick flick should dismiss even if the drag distance is small.

```swift
private func onDragEnded(translation: CGFloat, startTime: Date) {
    let elapsed = Date().timeIntervalSince(startTime)
    let velocity = abs(translation) / elapsed

    let shouldDismiss = abs(translation) >= distanceThreshold || velocity > 500 // pts/sec

    if shouldDismiss {
        dismiss()
    } else {
        snapBack()
    }
}
```

Key values:
- **Velocity threshold:** ~500 pts/sec (adjust per element size)
- **Distance threshold:** ~30% of element height (fallback for slow drags)
- Always check velocity first — a quick flick at 20% distance should still dismiss

### Rubber Banding at Drag Boundaries

When a user drags past a boundary, the element should resist with increasing friction — not stop dead or clip. This is how iOS scroll views feel at their edges.

```swift
/// Rubber-band clamp: diminishing returns past the boundary.
/// - offset: current drag distance past the boundary
/// - max: the boundary distance (e.g. view height)
/// - coefficient: resistance (0.55 matches UIScrollView)
func rubberBandClamp(_ offset: CGFloat, max: CGFloat, coefficient: CGFloat = 0.55) -> CGFloat {
    let clamped = abs(offset)
    return (1 - (1 / (clamped * coefficient / max + 1))) * max * (offset < 0 ? -1 : 1)
}

// Usage in drag gesture
.gesture(
    DragGesture()
        .onChanged { value in
            let raw = value.translation.height
            if raw > 0 {
                // Past bottom boundary — apply rubber band
                offset = rubberBandClamp(raw, max: viewHeight)
            } else {
                offset = raw
            }
        }
)
```

### Velocity-Aware Snap Points

When an element can rest at multiple positions (half-sheet, full-sheet, dismissed), use velocity to determine which snap point to target — not just nearest position.

```swift
private func nearestSnapPoint(
    currentOffset: CGFloat,
    velocity: CGFloat,
    snapPoints: [CGFloat]
) -> CGFloat {
    // Project where the element would land given current velocity
    let projectedLanding = currentOffset + velocity * 0.15 // damped projection

    return snapPoints.min(by: {
        abs($0 - projectedLanding) < abs($1 - projectedLanding)
    }) ?? snapPoints[0]
}

// Usage
.onEnded { value in
    let target = nearestSnapPoint(
        currentOffset: offset,
        velocity: value.velocity.height,
        snapPoints: [0, halfHeight, fullHeight]
    )
    withAnimation(.spring(duration: 0.3, bounce: 0)) {
        offset = target
    }
}
```

### Projected Landing Position

Use `predictedEndTranslation` to anticipate where the user's gesture is heading:

```swift
.onEnded { value in
    let projected = value.predictedEndTranslation.height

    // Dismiss if projected landing passes threshold
    if projected > dismissThreshold {
        withAnimation(.spring(duration: 0.3, bounce: 0)) { dismiss() }
    } else {
        withAnimation(.spring(duration: 0.3, bounce: 0)) { offset = 0 }
    }
}
```

### @GestureState for Transient Drag State

`@GestureState` automatically resets to its initial value when the gesture ends, using the spring from the transaction. This eliminates manual reset logic:

```swift
@GestureState private var dragOffset: CGFloat = 0

var body: some View {
    content
        .offset(y: dragOffset)
        .gesture(
            DragGesture()
                .updating($dragOffset) { value, state, transaction in
                    state = value.translation.height
                    transaction.animation = .spring(duration: 0.3, bounce: 0)
                }
        )
    // When finger lifts, dragOffset resets to 0 with the spring.
    // If the user grabs again mid-settle, the spring redirects smoothly.
}
```

### Scroll-Drag Conflict Resolution

When a draggable element lives inside a ScrollView, use `minimumDistance` and gesture priority to prevent conflicts:

```swift
ScrollView {
    content
        .gesture(
            DragGesture(minimumDistance: 10, coordinateSpace: .local)
                .onChanged { ... }
                .onEnded { ... }
        )
}
// DragGesture with minimumDistance > 0 lets ScrollView win for small movements.
// For vertical drags inside horizontal scrolls (or vice versa), filter by angle:
.onChanged { value in
    let angle = atan2(abs(value.translation.height), abs(value.translation.width))
    guard angle > .pi / 4 else { return } // only respond to mostly-vertical drags
}
```

## Content Motion

Making content changes feel physical rather than digital.

### Scroll Transitions

Apply effects based on scroll position — elements fade, scale, or rotate as they scroll into/out of view:

```swift
ScrollView {
    LazyVStack(spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
                .scrollTransition { content, phase in
                    content
                        .opacity(phase.isIdentity ? 1 : 0.3)
                        .scaleEffect(phase.isIdentity ? 1 : 0.9)
                        .blur(radius: phase.isIdentity ? 0 : 2)
                }
        }
    }
}
```

`phase` is `.topLeading`, `.identity`, or `.bottomTrailing`. Use `.isIdentity` for the fully-visible state.

### Visual Effect (Position-Aware)

Apply transforms based on the view's position in a coordinate space. Unlike `scrollTransition`, this gives you continuous position values:

```swift
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemCard(item: item)
                .visualEffect { content, proxy in
                    let frame = proxy.frame(in: .scrollView)
                    let distance = abs(frame.midY - proxy.size.height / 2)
                    return content
                        .scaleEffect(max(0.85, 1 - distance / 1000))
                        .opacity(max(0.5, 1 - distance / 500))
                }
        }
    }
}
```

### Text Renderer (iOS 18+)

Animate individual characters or words for rich text transitions:

```swift
struct WaveTextRenderer: TextRenderer {
    var elapsedTime: TimeInterval
    var animatableData: Double {
        get { elapsedTime }
        set { elapsedTime = newValue }
    }

    func draw(layout: Text.Layout, in context: inout GraphicsContext) {
        for run in layout.flattenedRuns {
            for (index, slice) in run.enumerated() {
                var copy = context
                let yOffset = sin(elapsedTime * 3 + Double(index) * 0.3) * 4
                copy.translateBy(x: 0, y: yOffset)
                copy.draw(slice)
            }
        }
    }
}
```

## Performance

### Animate Only What Changes

Never use `.animation(.default)` without a `value:` — it animates every state change:

```swift
// GOOD
content.animation(.spring(duration: 0.3, bounce: 0), value: isVisible)

// BAD
content.animation(.default)  // broad, unpredictable
```

### `.drawingGroup()` — Sparingly

Flattens hierarchy into a Metal-backed layer. Only add when you observe rendering stutter:

```swift
ComplexAnimatedView()
    .drawingGroup()  // costs GPU memory — don't add preemptively
```

### `.compositingGroup()` for Shadow/Blur Stacking

Renders subtree as one unit before applying effects:

```swift
VStack {
    ForEach(items) { item in
        ItemCard(item: item)
    }
}
.compositingGroup()
.shadow(color: .black.opacity(0.1), radius: 8, y: 4)
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Same corner radius on parent and child | `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust with `.offset()` |
| Hard borders between cards | Layered `.shadow()` with transparency |
| Jarring enter/exit animations | Split, stagger, exits subtle |
| Numbers cause layout shift | `.monospacedDigit()` |
| `.animation(.default)` without value | Always `.animation(_:value:)` |
| Bouncy springs on controls | `bounce: 0` |
| Tiny hit areas | `.frame(minWidth: 44, minHeight: 44).contentShape(.rect)` |
| Scale-on-press below 0.95 | Always `0.96` |

## Pre-Ship Polish Checklist

Final pass before marking a feature as done. Polish is the last step — don't polish work that isn't functionally complete.

### Visual Alignment & Spacing
- [ ] Spacing uses the scale (4, 8, 12, 16, 24, 32) — no arbitrary values
- [ ] Section gaps > group gaps > element gaps
- [ ] Nested rounded elements use concentric radii
- [ ] All `RoundedRectangle` uses `.continuous` style
- [ ] Leading alignment for body content (not centred)
- [ ] Consistent alignment within list rows

### Typography
- [ ] Hierarchy uses weight + colour + spacing, not just size
- [ ] Same text roles styled identically throughout
- [ ] Dynamic numbers use `.monospacedDigit()`
- [ ] No `.caption2` (too small — use `.caption` minimum)
- [ ] Body text uses `.body` or `.subheadline` (never smaller)

### Colour & Contrast
- [ ] Colours use semantic names or shared palette
- [ ] Dark mode renders correctly (no hardcoded light-only colours)
- [ ] Text meets WCAG contrast ratios in both modes
- [ ] Accent colour used consistently
- [ ] `.primary`, `.secondary`, `.tertiary` for text hierarchy

### Interaction States
Every interactive element must have:
- [ ] Default state (resting)
- [ ] Pressed state (scale 0.96 or opacity 0.7)
- [ ] Disabled state (visually distinct, `.disabled(true)`)
- [ ] Loading state (for async actions)
- [ ] Error state (with recovery path)
- [ ] Success state (appropriate feedback level)

### Micro-interactions
- [ ] Button press feedback (scale or opacity)
- [ ] Haptic feedback on significant actions
- [ ] Symbol effects for state changes
- [ ] Content transitions for changing text/numbers
- [ ] Staggered entrance for feature screens (2-3 groups)
- [ ] Exit animations shorter than enter

### Content Quality
- [ ] No filler copy ("Elevate", "Seamless", "Oops!")
- [ ] Error messages explain problem + next step
- [ ] Empty states use `ContentUnavailableView` with action
- [ ] Button labels use specific verbs
- [ ] Consistent terminology (same things called same names)

### Accessibility
- [ ] `Button` over `onTapGesture` for tappable elements
- [ ] 44pt minimum hit areas
- [ ] `@ScaledMetric` for custom values
- [ ] VoiceOver labels describe actions, not icons
- [ ] Tested at Dynamic Type `.accessibility5`
- [ ] Reduced motion respected

### Performance
- [ ] No formatters, sorting, or filtering in `body`
- [ ] `LazyVStack` for long lists
- [ ] `.animation(_:value:)` — never without `value:`
- [ ] No `AnyView` in list rows
- [ ] Preview loads without delay

### Code Cleanliness
- [ ] No `print()` or debug logging
- [ ] No commented-out code
- [ ] No `// TODO` without a linked issue
- [ ] File < 300 lines (split if larger)
- [ ] Preview data is realistic and varied
