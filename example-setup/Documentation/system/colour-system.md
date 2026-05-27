<!-- EXAMPLE TEMPLATE: The palette below contains example values. Replace hue assignments, chroma values, and role names with your own brand colours. -->

# Colour System

Perceptually uniform colour palettes for [YourApp], defined in OKLCH and converted to SwiftUI `Color`.

This document complements the existing SwiftUI docs:

- **design-quality** = what to avoid (no inline hex, no `Color.blue` everywhere)
- **polish-guidelines** = execution techniques (shadows, animations)
- **colour-system** (this doc) = how to choose, generate, and use colours

## Why OKLCH

OKLCH (Oklab Lightness-Chroma-Hue) is a perceptual colour space where equal numeric changes produce equal visual changes. Traditional colour spaces (HSL, sRGB) fail at this:

- HSL "50% lightness" yellow looks far brighter than "50% lightness" blue
- Desaturating in HSL shifts perceived brightness unpredictably
- Generating shade ramps in RGB requires manual tuning per hue

OKLCH fixes all three. A shade ramp is just a lightness sweep at constant hue and chroma.

### The Three Channels

| Channel | Range | What It Controls |
|---|---|---|
| **L** (Lightness) | 0.0 – 1.0 | Black (0) to white (1) |
| **C** (Chroma) | 0.0 – ~0.4 | Grey (0) to vivid. Displayable sRGB maxes out around 0.25 |
| **H** (Hue) | 0 – 360 | Hue angle. 0 = pink-red, 90 = yellow, 145 = green, 265 = blue, 330 = magenta |

## Example Palette

### Hue Assignments

Each semantic role maps to a single OKLCH hue. Chroma and lightness vary by shade.

| Role | Hue (H) | Base Chroma (C) | Usage |
|---|---|---|---|
| **Positive** | 145 | 0.16 | Good outcomes, completed, on-target |
| **Caution** | 75 | 0.16 | Warnings, approaching limits, needs attention |
| **Negative** | 25 | 0.16 | Errors, missed, over-limit |
| **Info** | 250 | 0.12 | Neutral information, links, interactive elements |
| **Accent** | 265 | 0.18 | Primary brand accent, key actions |
| **Neutral** | 265 | 0.02 | Surfaces, borders, muted backgrounds |

### Shade Scale

Each hue produces a 7-step lightness ramp. Name shades by lightness level, not purpose — purpose is assigned at the usage layer.

| Step | Lightness (L) | Typical Use |
|---|---|---|
| **50** | 0.97 | Tinted backgrounds |
| **100** | 0.93 | Hover / pressed states |
| **200** | 0.85 | Subtle fills |
| **400** | 0.70 | Secondary text on dark, icons |
| **500** | 0.60 | Default — badges, indicators, chart fills |
| **700** | 0.45 | Primary text on light backgrounds |
| **900** | 0.30 | High-contrast text, dark mode foreground |

The scale is intentionally sparse. Add intermediate steps (300, 600, 800) only when a specific design requires it — document why.

### Generating a Shade

To produce `positive-500`:

```
L = 0.60, C = 0.16, H = 145 → oklch(0.60 0.16 145)
```

To produce `positive-50` (background tint):

```
L = 0.97, C = 0.03, H = 145 → oklch(0.97 0.03 145)
```

Rule: as lightness increases, reduce chroma proportionally. Very light shades with high chroma look neon. A reasonable formula:

```
effectiveChroma = baseChroma * min(1.0, (1.0 - L) / 0.4)
```

This keeps full chroma up to L=0.60, then fades to near-grey by L=1.0.

## Dark Mode Strategy

OKLCH lightness is perceptual, so dark mode is straightforward: swap which end of the ramp you use.

| Semantic Use | Light Mode | Dark Mode |
|---|---|---|
| Tinted background | 50 | 900 |
| Subtle fill | 200 | 700 |
| Default indicator | 500 | 500 |
| Primary text | 700 | 200 |
| High-contrast text | 900 | 50 |

The 500 step stays the same in both modes — it is the anchor.

## Swift Implementation

### OKLCH to SwiftUI Color

SwiftUI `Color` accepts sRGB or Display P3. Convert OKLCH → linear sRGB → gamma-encoded sRGB.

```swift
import SwiftUI

extension Color {
    /// Create a colour from OKLCH values.
    /// - Parameters:
    ///   - lightness: Perceptual lightness, 0.0 (black) to 1.0 (white)
    ///   - chroma: Colourfulness, 0.0 (grey) to ~0.4 (vivid)
    ///   - hue: Hue angle in degrees, 0–360
    init(oklch lightness: Double, chroma: Double, hue: Double) {
        let hueRad = hue * .pi / 180
        let a = chroma * cos(hueRad)
        let b = chroma * sin(hueRad)

        // Oklab → linear sRGB
        let l_ = lightness + 0.3963377774 * a + 0.2158037573 * b
        let m_ = lightness - 0.1055613458 * a - 0.0638541728 * b
        let s_ = lightness - 0.0894841775 * a - 1.2914855480 * b

        let l = l_ * l_ * l_
        let m = m_ * m_ * m_
        let s = s_ * s_ * s_

        let red   = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
        let green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
        let blue  = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

        // Linear sRGB → gamma-encoded sRGB
        func gamma(_ v: Double) -> Double {
            v <= 0.0031308 ? 12.92 * v : 1.055 * pow(v, 1.0 / 2.4) - 0.055
        }

        self.init(
            .sRGB,
            red: gamma(red).clamped(to: 0...1),
            green: gamma(green).clamped(to: 0...1),
            blue: gamma(blue).clamped(to: 0...1)
        )
    }
}

private extension Double {
    func clamped(to range: ClosedRange<Double>) -> Double {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
```

### Palette Definition

Define the palette as static computed properties grouped by role. Each property name follows the pattern `role` + shade step.

```swift
extension Color {

    // MARK: - Positive (H: 145)

    static let positive50  = Color(oklch: 0.97, chroma: 0.03, hue: 145)
    static let positive100 = Color(oklch: 0.93, chroma: 0.06, hue: 145)
    static let positive200 = Color(oklch: 0.85, chroma: 0.10, hue: 145)
    static let positive400 = Color(oklch: 0.70, chroma: 0.14, hue: 145)
    static let positive500 = Color(oklch: 0.60, chroma: 0.16, hue: 145)
    static let positive700 = Color(oklch: 0.45, chroma: 0.14, hue: 145)
    static let positive900 = Color(oklch: 0.30, chroma: 0.10, hue: 145)

    // MARK: - Caution (H: 75)

    static let caution50  = Color(oklch: 0.97, chroma: 0.03, hue: 75)
    static let caution100 = Color(oklch: 0.93, chroma: 0.06, hue: 75)
    static let caution200 = Color(oklch: 0.85, chroma: 0.10, hue: 75)
    static let caution400 = Color(oklch: 0.70, chroma: 0.14, hue: 75)
    static let caution500 = Color(oklch: 0.60, chroma: 0.16, hue: 75)
    static let caution700 = Color(oklch: 0.45, chroma: 0.14, hue: 75)
    static let caution900 = Color(oklch: 0.30, chroma: 0.10, hue: 75)

    // MARK: - Negative (H: 25)

    static let negative50  = Color(oklch: 0.97, chroma: 0.03, hue: 25)
    static let negative100 = Color(oklch: 0.93, chroma: 0.06, hue: 25)
    static let negative200 = Color(oklch: 0.85, chroma: 0.10, hue: 25)
    static let negative400 = Color(oklch: 0.70, chroma: 0.14, hue: 25)
    static let negative500 = Color(oklch: 0.60, chroma: 0.16, hue: 25)
    static let negative700 = Color(oklch: 0.45, chroma: 0.14, hue: 25)
    static let negative900 = Color(oklch: 0.30, chroma: 0.10, hue: 25)

    // MARK: - Info (H: 250)

    static let info50  = Color(oklch: 0.97, chroma: 0.02, hue: 250)
    static let info100 = Color(oklch: 0.93, chroma: 0.04, hue: 250)
    static let info200 = Color(oklch: 0.85, chroma: 0.07, hue: 250)
    static let info400 = Color(oklch: 0.70, chroma: 0.10, hue: 250)
    static let info500 = Color(oklch: 0.60, chroma: 0.12, hue: 250)
    static let info700 = Color(oklch: 0.45, chroma: 0.10, hue: 250)
    static let info900 = Color(oklch: 0.30, chroma: 0.07, hue: 250)

    // MARK: - Accent (H: 265)

    static let accent50  = Color(oklch: 0.97, chroma: 0.03, hue: 265)
    static let accent100 = Color(oklch: 0.93, chroma: 0.06, hue: 265)
    static let accent200 = Color(oklch: 0.85, chroma: 0.10, hue: 265)
    static let accent400 = Color(oklch: 0.70, chroma: 0.15, hue: 265)
    static let accent500 = Color(oklch: 0.60, chroma: 0.18, hue: 265)
    static let accent700 = Color(oklch: 0.45, chroma: 0.15, hue: 265)
    static let accent900 = Color(oklch: 0.30, chroma: 0.10, hue: 265)

    // MARK: - Neutral (H: 265, low chroma)

    static let neutral50  = Color(oklch: 0.97, chroma: 0.005, hue: 265)
    static let neutral100 = Color(oklch: 0.93, chroma: 0.008, hue: 265)
    static let neutral200 = Color(oklch: 0.85, chroma: 0.010, hue: 265)
    static let neutral400 = Color(oklch: 0.70, chroma: 0.015, hue: 265)
    static let neutral500 = Color(oklch: 0.60, chroma: 0.018, hue: 265)
    static let neutral700 = Color(oklch: 0.45, chroma: 0.015, hue: 265)
    static let neutral900 = Color(oklch: 0.30, chroma: 0.010, hue: 265)
}
```

The neutral set has very low chroma (0.005–0.018) tinted toward the accent hue. This gives greys a subtle warmth that feels cohesive without being obviously coloured.

### Adaptive Helpers

For colours that automatically flip between light and dark mode:

```swift
extension Color {
    /// Returns a colour that adapts between light and dark variants.
    static func adaptive(light: Color, dark: Color) -> Color {
        Color(light: light, dark: dark)
    }
}

// Usage
extension Color {
    static let positiveFill = adaptive(light: .positive50, dark: .positive900)
    static let positiveText = adaptive(light: .positive700, dark: .positive200)
    static let positiveIndicator = .positive500 // same in both modes
}
```

## Usage Rules

### Do

- Reference palette colours by role (`positive500`, `caution200`), not by visual description
- Use the adaptive helpers for any colour that appears in both light and dark mode
- Use SwiftUI semantic colours (`.primary`, `.secondary`, `.tertiary`) for text hierarchy — the palette is for indicators, charts, badges, and tinted surfaces
- Keep one accent colour per screen. Use `accent500` as the default `.tint()`
- Use `neutral` shades for custom surfaces and borders instead of `Color.gray`

### Do Not

- Scatter `Color(oklch:)` calls through view code — define named statics
- Use full-chroma shades (500) as large background fills — use 50 or 100
- Mix palette colours with inline `Color(hex:)` or system colours (`Color.blue`) for the same semantic purpose
- Invent new hues outside this table without updating this document first

### Relationship to System Colours

SwiftUI semantic colours (`.primary`, `.secondary`, `.tertiary`, `.background`, `.groupedBackground`) remain the default for text and container backgrounds. The OKLCH palette is for **domain-specific meaning**: health indicators, status badges, chart fills, and feature-specific tints.

| Layer | Source |
|---|---|
| Text hierarchy | SwiftUI `.primary` / `.secondary` / `.tertiary` |
| Container backgrounds | SwiftUI `.background` / `.groupedBackground` / materials |
| Interactive tint | `.accent500` via `.tint()` |
| Status indicators | `positive` / `caution` / `negative` palette |
| Charts and data | Any palette role appropriate to the data type |
| Feature-specific tints | Palette roles or new hues (documented here first) |

## Adding a New Hue

1. Choose a hue angle that is at least 30 degrees from existing hues
2. Pick a base chroma appropriate to the use (0.10–0.18 for most roles)
3. Generate all 7 shade steps following the lightness scale
4. Add the palette statics and document the role in this file
5. Create adaptive helpers if the colour will be used in both modes

## WCAG Contrast Notes

OKLCH lightness directly maps to perceived brightness, making contrast checking simpler:

- **L difference of 0.40+** between text and background generally meets WCAG AA (4.5:1)
- **L difference of 0.55+** generally meets WCAG AAA (7:1)
- Always verify with a contrast checker — OKLCH lightness is an approximation, not a formal WCAG calculation

| Pairing | L Difference | Approximate Ratio |
|---|---|---|
| 700 text on 50 background | 0.52 | ~8:1 (AAA) |
| 500 text on 50 background | 0.37 | ~4:1 (AA large text) |
| 900 text on 50 background | 0.67 | ~12:1 (AAA) |
| 200 text on 900 background | 0.55 | ~7:1 (AAA) |

## Review Checklist

- [ ] New colours use the OKLCH palette, not inline hex or system colour names
- [ ] Adaptive helpers exist for colours used in both light and dark mode
- [ ] Shade steps match the standard scale (50, 100, 200, 400, 500, 700, 900)
- [ ] Hue assignments match the role table — no ad-hoc hue angles in view code
- [ ] High-chroma shades (500+) are not used as large background fills
- [ ] Text on coloured backgrounds meets WCAG AA minimum (L diff >= 0.40)
- [ ] New hues are documented in this file before use
