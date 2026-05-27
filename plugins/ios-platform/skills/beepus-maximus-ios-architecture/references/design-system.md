# Design System

A four-layer design system as a Core module: tokens, components, animations, and haptics.

## Layer 1: Design Tokens (Static Enums)

Tokens are static enum properties. No instances, no allocation, no runtime lookups.

### Colour System

```swift
public enum AppColors {
    // Surface hierarchy (z-axis layering)
    public static let surfacePrimary = Color(red: 0, green: 0, blue: 0)            // L0: screen bg
    public static let surfaceSecondary = Color(red: 0.07, green: 0.07, blue: 0.09) // L1: tab bars
    public static let surfaceElevated = Color(red: 0.10, green: 0.10, blue: 0.13)  // L2: cards, sheets

    // Signal colours (accent palette)
    public static let signalPrimary = Color(red: 0.0, green: 1.0, blue: 0.533)     // Primary accent
    public static let signalWarm = Color(red: 1.0, green: 0.42, blue: 0.208)       // Warnings, errors

    // Text hierarchy
    public static let textPrimary = Color.white.opacity(0.95)
    public static let textSecondary = Color.white.opacity(0.6)
    public static let textTertiary = Color.white.opacity(0.4)                       // WCAG AA threshold

    // Semantic borders
    public static let border = Color(red: 0.102, green: 0.102, blue: 0.141)
}
```

### Typography

```swift
public enum AppTypography {
    public static let display = Font.system(size: 34, weight: .bold, design: .default)
    public static let title = Font.system(size: 22, weight: .semibold, design: .default)
    public static let headline = Font.system(size: 17, weight: .medium, design: .default)
    public static let body = Font.system(size: 15, weight: .regular, design: .default)
    public static let caption = Font.system(size: 12, weight: .regular, design: .default)
    public static let data = Font.system(size: 14, weight: .medium, design: .monospaced)
}
```

### Spacing (4pt Grid)

```swift
public enum AppSpacing {
    public static let xs: CGFloat = 4
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 16
    public static let lg: CGFloat = 24
    public static let xl: CGFloat = 32
}
```

### Corner Radius

```swift
public enum AppCornerRadius {
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 14
    public static let lg: CGFloat = 20
    public static let pill: CGFloat = 999
}
```

### Animation Tokens

```swift
public enum AppAnimation {
    public static let spring = Animation.spring(response: 0.35, dampingFraction: 0.8)
    public static let typedCharacter: TimeInterval = 0.03
    public static let staggerDelay: TimeInterval = 0.08
}
```

## Layer 2: Reusable Components

Components use tokens exclusively. No hardcoded colours or sizes.

- **Card** -- Consistent elevated container with background, corner radius, and border stroke.
- **ErrorCard** -- Typed error states with recovery actions. Each error maps to title, message, SF Symbol icon, and recovery action.
- **FeedbackToggle** -- Thumbs up/down with tri-state (none/positive/negative).
- **AutoSizingTextEditor** -- Grows from 1 to 4 lines with spring animation.
- **FlowLayout** -- Custom `Layout` protocol for chip/tag wrapping.
- **PressableStyle** -- Custom `ButtonStyle` with scale and opacity spring feedback.

## Layer 3: Animation Components

- **TypedText** -- Character-by-character reveal with blinking cursor.
- **CountUpText** -- Animates from 0 to target value over a duration.
- **SlideUp modifier** -- Staggered slide-up entrance animation.
- **BreathingGlow modifier** -- Pulsing glow effect for active states.

Reduced motion fallback: check `@Environment(\.accessibilityReduceMotion)` and use instant transitions when enabled.

## Layer 4: Haptic Feedback System

```swift
public enum AppHaptics {
    // Pre-initialised generators (eliminate latency)
    private static let selectionGenerator = UISelectionFeedbackGenerator()
    private static let mediumImpactGenerator = UIImpactFeedbackGenerator(style: .medium)
    private static let notificationGenerator = UINotificationFeedbackGenerator()

    public static func prepare() { /* prepare all generators */ }

    // Semantic haptic events
    public static func tabSwitch() { selectionGenerator.selectionChanged() }
    public static func sendMessage() { mediumImpactGenerator.impactOccurred(intensity: 0.8) }
    public static func success() { notificationGenerator.notificationOccurred(.success) }
    public static func error() { notificationGenerator.notificationOccurred(.error) }
}
```

## Design Principles

1. **Dark mode only** -- no light mode variants. `preferredColorScheme(.dark)` at app root.
2. **4pt grid** -- all spacing tokens are multiples of 4.
3. **44pt+ touch targets** -- enforced by minimum frame sizes.
4. **SF Symbols only** -- no custom icon assets.
5. **OLED optimised** -- true black (#000000) as primary background.
6. **Surface hierarchy** -- 3-level z-axis: Primary (black) / Secondary (0.07) / Elevated (0.10).
7. **Semantic naming** -- use `textPrimary`, `surfaceElevated` not `white95`, `gray10`. Allows future theming without renaming.

## Accessibility

- **Dynamic Type:** Wrap sizing values in `@ScaledMetric(relativeTo:)` for accessibility compliance.
- **Reduced Motion:** Check `@Environment(\.accessibilityReduceMotion)` and provide instant transitions as fallbacks.
- **Contrast Ratios:** Audit all colour combinations with Accessibility Inspector. `textTertiary` at 0.4 opacity on `surfacePrimary` meets WCAG AA (~5.3:1), but drops below AA on `surfaceElevated`.
- **VoiceOver:** Use `.accessibilityElement(children:)` and `.accessibilitySortPriority()` for traversal order.

## Anti-Patterns

- Do not hardcode colours as `.init(red:green:blue:)` in feature modules. Always use tokens.
- Do not create new `UIImpactFeedbackGenerator()` instances locally. Use the centralised haptics enum.
- Do not add light mode overrides.
- Do not use `AnyView` wrapping for design components.
