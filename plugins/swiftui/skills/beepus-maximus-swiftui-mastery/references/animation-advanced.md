# Advanced Animation

Transactions, keyframe animations, the Animatable protocol, custom transitions, and completion handlers. For strategic animation planning, see `animation-strategy.md`. For polish values and patterns, see `polish-and-animation.md`.

## Transactions

The underlying mechanism for all SwiftUI animations. `withAnimation` is shorthand for `withTransaction`.

```swift
// These are equivalent
withAnimation(.spring(duration: 0.3, bounce: 0)) { flag.toggle() }

var transaction = Transaction(animation: .spring(duration: 0.3, bounce: 0))
withTransaction(transaction) { flag.toggle() }
```

### Animation Precedence

**Implicit animations override explicit animations** — the modifier closer to the view wins:

```swift
Button("Tap") {
    withAnimation(.linear) { flag.toggle() }  // explicit
}
.animation(.spring(duration: 0.3, bounce: 0), value: flag)  // implicit — wins
```

### Disabling Animations

```swift
// Prevent ancestors from animating this subtree
content
    .transaction { $0.disablesAnimations = true }

// Remove animation entirely
content
    .transaction { $0.animation = nil }
```

### Custom Transaction Keys (iOS 17+)

Pass metadata through the animation system:

```swift
struct ChangeSourceKey: TransactionKey {
    static let defaultValue: String = "unknown"
}

extension Transaction {
    var changeSource: String {
        get { self[ChangeSourceKey.self] }
        set { self[ChangeSourceKey.self] = newValue }
    }
}

// Set source
var transaction = Transaction(animation: .spring(duration: 0.3, bounce: 0))
transaction.changeSource = "server"
withTransaction(transaction) { items = newItems }

// Read in view tree — different animation per source
.transaction { t in
    t.animation = t.changeSource == "server" ? .smooth : .spring(duration: 0.3, bounce: 0)
}
```

## Selective Animation

### Multiple Animation Modifiers

Scope animations to specific properties by placing multiple `.animation` modifiers:

```swift
Rectangle()
    .frame(width: isExpanded ? 200 : 100, height: 50)
    .animation(.spring(duration: 0.3, bounce: 0), value: isExpanded)  // animate size
    .foregroundStyle(isExpanded ? .blue : .red)
    .animation(nil, value: isExpanded)  // don't animate colour
```

### iOS 17+ Scoped Animation

```swift
Rectangle()
    .foregroundStyle(isExpanded ? .blue : .red)  // not animated
    .animation(.spring(duration: 0.3, bounce: 0)) {
        $0.frame(width: isExpanded ? 200 : 100, height: 50)  // animated
    }
```

## Custom Transitions

### iOS 17+ Transition Protocol (Preferred)

```swift
struct BlurTransition: Transition {
    var radius: CGFloat

    func body(content: Content, phase: TransitionPhase) -> some View {
        content
            .blur(radius: phase.isIdentity ? 0 : radius)
            .opacity(phase.isIdentity ? 1 : 0)
    }
}

// Usage
if showContent {
    ContentView()
        .transition(BlurTransition(radius: 10))
}
```

`TransitionPhase` has three cases: `.willAppear`, `.identity`, `.didDisappear`. Use `phase.isIdentity` for the resting state.

### Pre-iOS 17 (AnyTransition.modifier)

```swift
struct BlurModifier: ViewModifier {
    var radius: CGFloat
    func body(content: Content) -> some View {
        content.blur(radius: radius)
    }
}

extension AnyTransition {
    static func blur(radius: CGFloat) -> AnyTransition {
        .modifier(
            active: BlurModifier(radius: radius),
            identity: BlurModifier(radius: 0)
        )
    }
}
```

### Critical: Transition Placement

```swift
// GOOD — animation OUTSIDE the conditional
VStack {
    if showDetail {
        DetailView()
            .transition(.scale.combined(with: .opacity))
    }
}
.animation(.spring(duration: 0.3, bounce: 0), value: showDetail)

// BAD — animation INSIDE the conditional (removed with the view on exit!)
if showDetail {
    DetailView()
        .transition(.slide)
        .animation(.spring(duration: 0.3, bounce: 0), value: showDetail)  // won't work on removal
}
```

### Identity and Transitions

View identity changes trigger transitions, not property animations:

```swift
// Triggers TRANSITION — different branches = different view identity
if isExpanded { ExpandedView() } else { CompactView() }

// Triggers PROPERTY ANIMATION — same view, different properties
content
    .frame(width: isExpanded ? 200 : 100)
    .animation(.spring(duration: 0.3, bounce: 0), value: isExpanded)
```

## The Animatable Protocol

Enables custom property interpolation during animation.

### Basic Implementation

```swift
struct ShakeModifier: ViewModifier, Animatable {
    var shakeCount: Double

    var animatableData: Double {
        get { shakeCount }
        set { shakeCount = newValue }
    }

    func body(content: Content) -> some View {
        content.offset(x: sin(shakeCount * .pi * 2) * 10)
    }
}

// Usage
Button("Shake") { shakeCount += 3 }
    .modifier(ShakeModifier(shakeCount: shakeCount))
    .animation(.spring(duration: 0.3, bounce: 0), value: shakeCount)
```

**Silent failure warning:** If you forget `animatableData`, the modifier uses `EmptyAnimatableData` and the animation jumps to the final value with no interpolation.

### Multiple Properties with AnimatablePair

```swift
struct DualModifier: ViewModifier, Animatable {
    var scale: CGFloat
    var rotation: Double

    var animatableData: AnimatablePair<CGFloat, Double> {
        get { AnimatablePair(scale, rotation) }
        set {
            scale = newValue.first
            rotation = newValue.second
        }
    }

    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .rotationEffect(.degrees(rotation))
    }
}
```

For 3+ properties, nest `AnimatablePair`:

```swift
var animatableData: AnimatablePair<AnimatablePair<CGFloat, CGFloat>, Double> {
    get { AnimatablePair(AnimatablePair(x, y), rotation) }
    set {
        x = newValue.first.first
        y = newValue.first.second
        rotation = newValue.second
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

## Keyframe Animations (iOS 17+)

Precise timing control with exact values at specific times. Tracks run **in parallel**, each animating one property.

### Basic Usage

```swift
struct BounceValues {
    var scale: CGFloat = 1.0
    var verticalOffset: CGFloat = 0
}

Button("Bounce") { trigger += 1 }
    .keyframeAnimator(
        initialValue: BounceValues(),
        trigger: trigger
    ) { content, value in
        content
            .scaleEffect(value.scale)
            .offset(y: value.verticalOffset)
    } keyframes: { _ in
        KeyframeTrack(\.scale) {
            SpringKeyframe(1.2, duration: 0.15)
            SpringKeyframe(0.9, duration: 0.1)
            SpringKeyframe(1.0, duration: 0.15)
        }
        KeyframeTrack(\.verticalOffset) {
            LinearKeyframe(-20, duration: 0.15)
            LinearKeyframe(0, duration: 0.25)
        }
    }
```

### Keyframe Types

| Type | Behaviour |
|------|-----------|
| `CubicKeyframe` | Smooth interpolation |
| `LinearKeyframe` | Straight-line interpolation |
| `SpringKeyframe` | Spring physics |
| `MoveKeyframe` | Instant jump (no interpolation) |

### KeyframeTimeline (for Testing)

Query animation values at specific times without a view:

```swift
let timeline = KeyframeTimeline(initialValue: BounceValues()) {
    KeyframeTrack(\.scale) {
        CubicKeyframe(1.2, duration: 0.25)
        CubicKeyframe(1.0, duration: 0.25)
    }
}
let midpoint = timeline.value(time: 0.25)
```

## Animation Completion Handlers (iOS 17+)

### One-Shot Completion

```swift
Button("Expand") {
    withAnimation(.spring(duration: 0.3, bounce: 0)) {
        isExpanded.toggle()
    } completion: {
        showNextStep = true
    }
}
```

### Repeating Completion (fires on every trigger)

```swift
// GOOD — .transaction(value:) fires completion on every change
Circle()
    .scaleEffect(bounceCount % 2 == 0 ? 1.0 : 1.2)
    .transaction(value: bounceCount) { transaction in
        transaction.animation = .spring(duration: 0.3, bounce: 0)
        transaction.addAnimationCompletion {
            message = "Bounce \(bounceCount) complete"
        }
    }

// BAD — without value:, completion only fires ONCE ever
.transaction { transaction in
    transaction.addAnimationCompletion {
        completionCount += 1  // only fires once
    }
}
```

## Spatial Transitions

### matchedGeometryEffect — Multi-ID Pattern

When morphing between compact and expanded states, match multiple sub-elements independently for richer transitions. Each element (artwork, title, controls) gets its own ID so they interpolate independently rather than morphing as one blob:

```swift
@Namespace private var namespace

// Compact state
HStack(spacing: 12) {
    thumbnail
        .matchedGeometryEffect(id: "artwork", in: namespace)
    Text(title)
        .matchedGeometryEffect(id: "title", in: namespace)
    Spacer()
    playButton
        .matchedGeometryEffect(id: "play", in: namespace)
}

// Expanded state
VStack(spacing: 24) {
    artwork
        .matchedGeometryEffect(id: "artwork", in: namespace)
    Text(title)
        .matchedGeometryEffect(id: "title", in: namespace)
    controls
        .matchedGeometryEffect(id: "play", in: namespace)
}
```

Key principles:
- **Match the outermost container first** — the container's frame interpolation creates the morph; sub-elements refine it
- **Use `isSource: true`** on the currently visible state when both states exist simultaneously (e.g., overlay)
- **Keep both states in the same parent** — the `@Namespace` must be owned by a common ancestor
- **Separate IDs for independent elements** — don't lump everything into one ID

### Zoom Navigation Transition (iOS 18+)

For collection-to-detail navigation, use `.matchedTransitionSource` and `.navigationTransition(.zoom)`:

```swift
NavigationStack {
    ScrollView {
        LazyVGrid(columns: columns) {
            ForEach(items) { item in
                NavigationLink(value: item) {
                    ItemThumbnail(item: item)
                        .matchedTransitionSource(id: item.id, in: namespace)
                }
            }
        }
    }
    .navigationDestination(for: Item.self) { item in
        ItemDetail(item: item)
            .navigationTransition(.zoom(sourceID: item.id, in: namespace))
    }
}
```

This respects Reduce Motion automatically — it cross-fades instead of zooming when enabled.

### geometryGroup()

Isolates layout animation propagation. When a parent's layout changes (e.g., frame resize), child views receive interpolated layout values during the animation. `geometryGroup()` prevents this — the children see the final layout immediately and animate their own properties independently:

```swift
VStack {
    content
        .frame(width: isExpanded ? 300 : 150)
        .animation(.spring(duration: 0.3, bounce: 0), value: isExpanded)

    // Without geometryGroup(), this child's position animates
    // as a side effect of the parent's frame change.
    // With it, it snaps to position and handles its own animation.
    childContent
        .geometryGroup()
        .opacity(isExpanded ? 1 : 0)
        .animation(.spring(duration: 0.3, bounce: 0), value: isExpanded)
}
```

Use `geometryGroup()` when:
- Parent layout changes cause unwanted sliding/stretching in children
- Children have their own independent animations that shouldn't inherit parent motion
- A container animates its size but children should snap to their new positions

## TimelineView (Continuous Animations)

For animations that run continuously (clocks, progress rings, ambient effects), use `TimelineView` instead of timers:

```swift
TimelineView(.animation) { timeline in
    let elapsed = timeline.date.timeIntervalSince(startDate)

    Canvas { context, size in
        let angle = Angle.degrees(elapsed * 60) // 1 revolution per 6 seconds
        context.rotate(by: angle)
        context.draw(Image(systemName: "rays"), at: CGPoint(x: size.width / 2, y: size.height / 2))
    }
}
```

Timeline schedules:
- `.animation` — every frame (60/120Hz), for smooth continuous motion
- `.periodic(from:by:)` — fixed interval, for clocks or polling
- `.everyMinute` — once per minute, for time displays

**Performance:** `TimelineView(.animation)` redraws every frame. Keep the body lightweight — prefer `Canvas` over complex view hierarchies for continuous animations.

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Manual `DispatchQueue.asyncAfter` sequencing | Fragile timing, breaks on slow devices | Use `PhaseAnimator` or keyframes |
| `.animation(.default)` without `value:` | Animates all state changes | Always `.animation(_:value:)` |
| Inline blur/opacity instead of `.transition()` | Won't animate on view removal | Use proper `Transition` type |
| Missing `animatableData` on Animatable type | Silent failure, jumps to end | Implement `animatableData` explicitly |
| Animation inside `if` conditional | Removed with view on exit | Place animation outside conditional |
| `linear` timing for interactive UI | Feels robotic, can't retarget | Use `.spring(duration:bounce:)` |
