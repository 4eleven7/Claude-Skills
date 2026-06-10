# Branding Patterns (HIG)

## Core Rule

Your brand should enhance the experience, not compete with it. Apple's platform conventions come first — brand expression lives in the details.

## Where to Express Brand

### Yes — Appropriate Brand Expression
- **Colour accent:** One or two brand colours as tint/accent, not overwhelming backgrounds
- **Typography:** Custom fonts for headlines/logos. System font for body text (SF Pro scales with Dynamic Type automatically)
- **Iconography:** Custom SF Symbol variants, app icon, brand illustrations
- **Tone of voice:** Microcopy, empty states, error messages
- **Motion:** Distinctive but subtle animation signatures (spring parameters, transitions)
- **Sounds and haptics:** Custom notification sounds, branded haptic patterns

### No — Don't Override Platform Conventions
- Don't replace the navigation bar with a custom header
- Don't use a custom tab bar that doesn't behave like UITabBar
- Don't put your logo on every screen
- Don't override system colours for standard controls (buttons, links, destructive actions)
- Don't use a custom back button that breaks swipe-to-go-back
- Don't disable Dark Mode to enforce brand colours

## Colour Strategy

```swift
// Brand accent — used for tint, highlights, CTAs
extension Color {
    static let brandPrimary = Color("BrandPrimary")    // Defined in asset catalog
    static let brandSecondary = Color("BrandSecondary")
}

// Apply as accent
ContentView()
    .tint(.brandPrimary)

// Use semantic colours for everything else
Text("Label").foregroundStyle(.primary)          // NOT .brandPrimary
Text("Subtitle").foregroundStyle(.secondary)
```

**Rule:** Brand colour for accent/tint. Semantic system colours for surfaces, text, and standard controls.

## Custom Fonts

```swift
// Headlines only — custom font adds brand personality
Text("Dashboard")
    .font(.custom("YourBrandFont-Bold", size: 28, relativeTo: .title))

// Body text — ALWAYS system font for readability and Dynamic Type
Text("Your daily summary")
    .font(.body)
```

**Rule:** Custom fonts for display text (titles, headers, logos). System font for body text, captions, buttons, and any text that needs to scale with Dynamic Type.

### Register Custom Fonts

1. Add `.ttf`/`.otf` to your target
2. Add to Info.plist under `Fonts provided by application`
3. Use `Font.custom(_:size:relativeTo:)` for Dynamic Type scaling

## Splash / Launch Screen

- Use a simple, clean launch screen (solid colour + centred logo or app icon)
- Match the app's initial background colour
- Don't animate the launch screen
- Don't show a loading indicator
- Transition quickly — launch screens should be visible for < 1 second ideally

## What NOT to Do

- Don't splash your logo on every screen — the app icon is already in the home screen
- Don't fight the platform (custom nav bars, custom tab bars, custom pull-to-refresh)
- Don't use brand colours for system semantic roles (destructive = red, link = tint)
- Don't sacrifice readability for brand fonts in body text
- Don't disable system features (Dark Mode, Dynamic Type) for brand consistency
