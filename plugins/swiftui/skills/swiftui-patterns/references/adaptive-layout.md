# Adaptive Layout

Container-responsive design — adapt to available space, never to device model or orientation.

## Decision Tree

| Need | Use | Why |
|---|---|---|
| Show variant A or B based on available space | `ViewThatFits` | Automatically picks the first variant that fits; no measurement code needed |
| Switch layout type with animation (e.g., HStack ↔ VStack) | `AnyLayout` | Animated transition between layout types preserving identity |
| Read a single geometry value (width, height, safe area) | `onGeometryChange` | Lightweight, runs off main thread, replaces most GeometryReader uses |
| Size a view relative to its container | `containerRelativeFrame` | No measurement needed — declarative fractional/count-based sizing |
| Full custom layout algorithm | `Layout` protocol | When none of the above can express the layout |
| Measure children before rendering (last resort) | `GeometryReader` | Use only when you need to read size AND immediately use it in the same view tree |

## ViewThatFits

Picks the first child that fits the available space. Order matters — put the preferred (largest) variant first.

```swift
ViewThatFits {
    // Preferred: horizontal layout
    HStack {
        Image(systemName: "star.fill")
        Text("Favourites")
        Spacer()
        Text("\(count)")
    }

    // Fallback: compact layout
    VStack {
        Image(systemName: "star.fill")
        Text("\(count)")
    }
}
```

**Rules:**
- Put preferred (wider) variant first
- Each variant must be a complete, self-contained view
- SwiftUI measures without rendering — only the fitting variant is displayed
- Works on both axes; restrict with `.horizontal` or `.vertical` parameter

## AnyLayout

Animated switching between layout types while preserving view identity:

```swift
let layout = isCompact ? AnyLayout(VStackLayout(spacing: 12)) : AnyLayout(HStackLayout(spacing: 16))

layout {
    MetricCard(title: "Steps", value: steps)
    MetricCard(title: "Distance", value: distance)
    MetricCard(title: "Calories", value: calories)
}
.animation(.spring, value: isCompact)
```

Use `horizontalSizeClass` or `onGeometryChange` to drive the `isCompact` flag — not device model checks.

## onGeometryChange

Lightweight geometry reading that runs off the main thread (iOS 18+):

```swift
@State private var containerWidth: CGFloat = 0

VStack { content }
    .onGeometryChange(for: CGFloat.self) { proxy in
        proxy.size.width
    } action: { width in
        containerWidth = width
    }
```

Replaces most `GeometryReader` uses. Prefer this for:
- Responsive column counts
- Threshold-based layout decisions
- Proportional sizing that `containerRelativeFrame` can't express

## containerRelativeFrame

Size views as a fraction of their container without measurement:

```swift
Image("hero")
    .containerRelativeFrame(.horizontal) { width, _ in
        width * 0.8  // 80% of container width
    }

// Grid-like sizing: 3 columns with 16pt spacing
Text("Cell")
    .containerRelativeFrame(.horizontal, count: 3, spacing: 16)
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| `UIScreen.main.bounds` | Ignores multitasking, iPad split view, free-form windows | `containerRelativeFrame` or `onGeometryChange` |
| `UIDevice.current.orientation` | Stale, not available in extensions, doesn't reflect actual layout | `horizontalSizeClass` or `onGeometryChange` |
| `if UIDevice.current.userInterfaceIdiom == .pad` | iPad apps can run at iPhone-sized widths in slide-over | Size class or `ViewThatFits` |
| Unconstrained `GeometryReader` at top level | Greedily expands, pushes siblings out of frame | Use `onGeometryChange` or `.frame()` to constrain |
| Hardcoded breakpoints (e.g., `if width > 768`) | Fragile across device generations | Use `ViewThatFits` or size classes |

## Size Class Truth Table

| Scenario | Horizontal | Vertical |
|---|---|---|
| iPhone portrait | `.compact` | `.regular` |
| iPhone landscape | `.compact` (most) / `.regular` (Plus/Max) | `.compact` |
| iPad full screen | `.regular` | `.regular` |
| iPad 1/3 split | `.compact` | `.regular` |
| iPad 1/2 split | `.compact` or `.regular` (depends on device) | `.regular` |
| iPad 2/3 split | `.regular` | `.regular` |
| iOS 26 free-form window | Varies by window size | Varies by window size |

**iOS 26 free-form windows:** Apps may run at arbitrary sizes. Remove `UIRequiresFullScreen` and test at a range of widths. Add menu bar commands for windowed workflows.
