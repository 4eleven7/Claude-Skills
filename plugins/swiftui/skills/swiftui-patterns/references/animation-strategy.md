# Animation Strategy

Strategic guide for planning purposeful animation across a feature. For specific animation values and implementation patterns, see `polish-and-animation.md`.

## Animation Frequency Gate

Before deciding *how* to animate, decide *whether* to animate based on how often the user sees it:

| Frequency | Decision |
|---|---|
| 100+ times/day (keyboard shortcuts, command palette, rapid toggles) | No animation. Ever. Instant state change only. |
| Tens of times/day (hover effects, list navigation, tab switches) | Minimal — fast spring or instant with haptic only |
| Occasional (modals, sheets, toasts, drawer open) | Standard animation |
| Rare/first-time (onboarding, achievements, feedback forms) | Can add delight |

The more frequently an action fires, the more animation makes it feel slow. A command palette that animates open 200 times a day trains the user to resent it.

## When to Animate

Animation should solve a problem, not decorate. Every animation must have a reason from this list:

### Feedback

User acted, the UI acknowledged. Without feedback, users wonder "did that work?"

- Button press: scale (0.96) or highlight
- Save action: checkmark symbol effect
- Delete: item slides out with `.transition(.slide)`
- Toggle: state change with `.spring(duration: 0.3, bounce: 0)`

### Orientation

Something moved, help the user track where it went.

- Sheet presentation: slide from bottom
- Navigation push: slide from trailing edge
- Tab switch: cross-fade content (not slide)
- Expand/collapse: height transition with `.clipShape()` and spring

### Continuity

Data changed, smooth the transition so users don't lose context.

- Number update: `.contentTransition(.numericText())`
- List reorder: `withAnimation { list.move() }`
- State change: cross-fade with `.transition(.opacity)`
- Chart update: animate data points to new positions

### Attention

Something important appeared, draw the eye.

- New badge: `.symbolEffect(.bounce)` once
- Error state: `sensoryFeedback(.error)` + red tint animation
- Notification: slide in from top with auto-dismiss
- Call to action: subtle pulse (use sparingly)

### Delight

The moment warrants celebration.

- Achievement: confetti or `.symbolEffect(.bounce.up)`
- First-time completion: staggered entrance for success content
- Streak milestone: haptic + scale pulse

**If an animation doesn't serve one of these purposes, remove it.**

## Animation Layers

Plan animation in layers of priority. Implement from top to bottom, stop when the experience feels right.

### Layer 1: State Transitions (Required)

Every state change must be smooth. These are non-negotiable.

```swift
// Show/hide
content
    .opacity(isVisible ? 1 : 0)
    .animation(.spring(duration: 0.3, bounce: 0), value: isVisible)

// List mutations
withAnimation(.spring(duration: 0.3, bounce: 0)) {
    items.remove(at: index)
}

// Loading → content
if isLoading {
    ProgressView()
        .transition(.opacity)
} else {
    ContentView()
        .transition(.opacity)
}
```

### Layer 2: Interactive Feedback (Expected)

Users expect the UI to respond to their touch.

```swift
// Scale-on-press for custom buttons
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(duration: 0.15, bounce: 0), value: configuration.isPressed)
    }
}

// Symbol effects for state changes
Image(systemName: isFavourite ? "heart.fill" : "heart")
    .contentTransition(.symbolEffect(.replace))
    .sensoryFeedback(.impact(flexibility: .soft), trigger: isFavourite)
```

### Layer 3: Entrance Choreography (Polished)

First impressions. Stagger content in semantic groups.

```swift
// Stagger by semantic group, not individual elements
VStack(spacing: 16) {
    header
        .enterAnimation(delay: 0)

    mainContent
        .enterAnimation(delay: 0.1)

    actions
        .enterAnimation(delay: 0.2)
}

// Helper
extension View {
    func enterAnimation(delay: Double) -> some View {
        modifier(StaggeredEntrance(delay: delay))
    }
}
```

Timing reference:

| Element type | Delay from previous |
|---|---|
| Hero/header | 0 (first) |
| Body content | 100ms |
| Secondary content | 100ms |
| Actions/buttons | 100ms |
| Individual words in a title | 60-80ms |

### Layer 4: Delight Moments (Selective)

Reserve for meaningful moments. One per screen maximum.

```swift
// Success celebration
.symbolEffect(.bounce.up.byLayer, value: didComplete)
.sensoryFeedback(.success, trigger: didComplete)

// Milestone
PhaseAnimator([false, true], trigger: milestone) { phase in
    content
        .scaleEffect(phase ? 1.05 : 1.0)
} animation: { _ in
    .spring(duration: 0.3, bounce: 0.3) // bounce OK for celebration
}
```

## Timing Reference

| Purpose | Duration | Easing |
|---|---|---|
| Press feedback | 0.1-0.15s | `.spring(duration: 0.15, bounce: 0)` |
| State toggle | 0.2-0.3s | `.spring(duration: 0.3, bounce: 0)` |
| Show/hide content | 0.3s | `.spring(duration: 0.3, bounce: 0)` |
| Entrance animation | 0.4s | `.spring(duration: 0.4, bounce: 0)` |
| Sheet/modal presentation | System default | Don't override |
| Navigation transition | System default | Don't override |
| Exit animation | 0.15s | `.easeIn(duration: 0.15)` |
| Celebration | 0.3-0.5s | `.spring(duration: 0.3, bounce: 0.3)` |

**Exit animations are always faster than entrances** -- approximately 60% of enter duration.

**Asymmetric timing principle:** Slow where the user is deciding, fast where the system is responding. A hold-to-delete confirmation should fill slowly (2s linear) to give the user time to reconsider, but snap back instantly on release (0.15s easeIn). Press actions that require deliberation are slow; system acknowledgements are always fast.

## Planning Checklist

Before implementing animations for a feature, answer these:

1. **What's the hero moment?** Pick ONE animation that defines the screen's personality. Everything else is supporting.
2. **What state transitions exist?** List every show/hide, loading/loaded, expand/collapse. Each needs smooth animation.
3. **What needs feedback?** Every user action needs acknowledgement. Map actions to feedback type (haptic, visual, both).
4. **What entrance order makes sense?** Header, content, actions. Group semantically, not per-element.
5. **Is there a delight opportunity?** Success states, milestones, first-time experiences. One per screen, maximum.

## Specific Timing Rules

Rules that are easy to get wrong. Reference these when fine-tuning animation values.

### List/Grid Item Staggering

When animating individual items in a list or grid (not semantic groups), stagger by 30-50ms per item. Cap the total stagger at ~300ms so later items don't feel delayed.

```swift
ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
    ItemRow(item: item)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 8)
        .animation(
            .spring(duration: 0.35, bounce: 0)
                .delay(Double(min(index, 8)) * 0.04),
            value: appeared
        )
}
```

This is different from Layer 3 entrance choreography (which staggers semantic groups at 100ms). Per-item stagger is for flat lists where every item has equal weight.

### Opacity Threshold

Fading elements should not linger below opacity 0.2. Either fade fully to 0 or remain visible. Elements stuck at low opacity look like rendering bugs, not intentional design.

### Modal/Sheet Source Animation

When presenting a sheet or modal triggered by a specific element, animate from the trigger's location when possible. This provides spatial context — the user understands where the content came from.

Use `matchedGeometryEffect` or `.matchedTransitionSource` (iOS 18+) for hero transitions between a card and its detail view. For sheets, the system slide-up is usually correct — don't fight it.

### Pressed-State Layout Stability

Scale-on-press (0.96) must not shift surrounding layout. Always apply scale via `.scaleEffect()` which transforms within the existing frame, never via `.frame()` changes or padding adjustments.

```swift
// Correct — layout stable
.scaleEffect(isPressed ? 0.96 : 1.0)

// Wrong — shifts siblings
.padding(isPressed ? 2 : 0)
```

---

## Anti-Patterns

| Pattern | Problem | Fix |
|---|---|---|
| Everything animates on appear | Overwhelming, no hierarchy | Stagger 2-3 groups maximum |
| Bounce springs on controls | Feels unserious, dated | `bounce: 0` for all UI controls |
| Same animation everywhere | Nothing feels special | Reserve dramatic animation for hero moments |
| Animation blocks interaction | User is waiting, not watching | Keep animations under 0.5s for functional UI |
| Animating without `value:` | Unpredictable, animates everything | Always `.animation(_:value:)` |
| Custom navigation transitions | Fight the system, feel wrong | Use system defaults for navigation |
| Animation on every list row | Performance death, visual noise | Animate list mutations, not individual rows |
| Delay-based choreography | Fragile, breaks with slow devices | Use `PhaseAnimator` or spring completion |

## Spring Interruptibility

The single most important reason Apple made springs the default animation type in iOS 17.

### Why Springs Can Be Interrupted

Easing curves (`.easeInOut`, `.linear`) compute position as a pure function of elapsed time. At any moment, the velocity is predetermined by the curve. Interrupting forces a restart from t=0, causing a velocity discontinuity — visible as a jank/jump.

Springs compute position as a function of (target, currentVelocity, currentPosition). Changing the target mid-flight preserves the current velocity. No jump — the spring smoothly curves toward the new target.

```swift
// Easing: position = f(time) — interruption restarts the clock
// Spring: position = f(target, velocity, position) — interruption redirects

// This is why any gesture completion animation should use a spring:
.onEnded { _ in
    withAnimation(.spring(duration: 0.3, bounce: 0)) {
        offset = 0
    }
    // If the user grabs the element again mid-settle,
    // the spring redirects smoothly with no velocity discontinuity.
}
```

### @GestureState + Spring Transaction

The cleanest pattern for interruptible gesture animations. `@GestureState` resets automatically when the gesture ends, and the transaction's spring applies to both the drag and the reset:

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
    // Finger lifts → dragOffset resets to 0 with the spring.
    // User grabs again mid-settle → spring redirects, no jank.
}
```

**Rule:** Every animation that follows a gesture must use a spring. This is non-negotiable for native iOS feel.

## Accessibility

```swift
// Always respect reduced motion
@Environment(\.accessibilityReduceMotion) private var reduceMotion

// Use for conditional animation
.animation(reduceMotion ? .none : .spring(duration: 0.3, bounce: 0), value: isActive)

// Or use transaction
withAnimation(reduceMotion ? .none : .spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}
```

Non-negotiable rules:

- `sensoryFeedback` still fires with reduced motion (haptics are not visual motion)
- Replace motion with instant state changes, not removal of feedback
- `.contentTransition(.numericText())` is fine -- it's a cross-fade, not motion
- Symbol effects respect reduced motion automatically

## Animation Design Spec Format

For non-trivial animations (custom transitions, gesture-driven, multi-step), plan before implementing. Use this structured format.

### Step 1: Understand Context

Before choosing an animation technique, answer:
1. What user action triggers this animation?
2. How frequently will this trigger? (Use the Frequency Gate above)
3. What information does the animation convey?
4. Does it need to be interruptible (user might change intent mid-animation)?
5. What should happen with Reduce Motion enabled?

### Step 2: Present Options

For complex animations, present 2-3 approaches as structured option cards:

```
**Option A: [Name]**
- Approach: [Brief description]
- Technique: [SwiftUI API — withAnimation, matchedGeometryEffect, PhaseAnimator, KeyframeAnimator, etc.]
- Character: [How it feels — snappy, fluid, playful, subtle]
- Complexity: [Low / Medium / High]
- iOS floor: [Minimum iOS version required]
- Reduce Motion fallback: [What happens with Reduce Motion on]
```

### Step 3: Compile Animation Spec

Once an approach is chosen, document it before writing code:

```
**Animation Spec: [Feature Name]**

Trigger: [User action that starts the animation]

| Property | From | To | Curve | Duration |
|---|---|---|---|---|
| opacity | 0 | 1 | easeOut | 0.2s |
| offset.y | 12 | 0 | spring(duration: 0.35, bounce: 0) | — |
| scale | 0.95 | 1.0 | spring(duration: 0.3, bounce: 0.1) | — |

Gesture binding: [If gesture-driven, describe the gesture to progress mapping]
Interruption: [What happens if the user acts mid-animation]
Reduce Motion: [Crossfade / Instant / Simplified version]
Haptic: [None / .impact(.light) / .selection / custom]
Sound: [None / system sound reference]
```

### Spring Parameters Quick Reference

| Preset | Use Case | Equivalent |
|---|---|---|
| `.smooth` | UI controls, toggles, state changes | `spring(duration: 0.5, bounce: 0)` |
| `.snappy` | Navigation, quick feedback | `spring(duration: 0.35, bounce: 0)` |
| `.bouncy` | Playful, non-critical elements | `spring(duration: 0.5, bounce: 0.3)` |
| Custom precise | Cards, sheets, modals | `spring(duration: 0.3, bounce: 0)` |
| Custom subtle | Micro-interactions | `spring(duration: 0.15, bounce: 0)` |

**Rule:** `bounce: 0` for all UI controls. Bounce > 0 only for decorative or playful elements.

### Reduce Motion Fallback Patterns

Every animation must have a Reduce Motion alternative:

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

// Pattern 1: Crossfade instead of slide
.transition(reduceMotion ? .opacity : .move(edge: .bottom).combined(with: .opacity))

// Pattern 2: Skip animation entirely
withAnimation(reduceMotion ? nil : .spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}

// Pattern 3: Simplified animation (shorter, no bounce)
.animation(
    reduceMotion
        ? .easeOut(duration: 0.15)
        : .spring(duration: 0.35, bounce: 0.1),
    value: isExpanded
)
```
