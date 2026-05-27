---
name: platform-hig
description: Apple Human Interface Guidelines for all Apple platforms. Use when building, reviewing, or refactoring UI for iOS, iPadOS, macOS, tvOS, watchOS, or visionOS. Covers layout, navigation, typography, colour, accessibility, input paradigms, and platform-specific patterns.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---

# Apple Platform Human Interface Guidelines

Navigation layer for platform-specific HIG rules. Each reference file is self-contained — read only the file for your target platform.

---

## Responsibility

### What this skill owns
- Platform-specific layout, navigation, and component rules
- Minimum target sizes and safe area guidance per platform
- Typography, Dynamic Type, and text style requirements
- Colour system strategy (semantic colours, dark mode, OKLCH technique)
- Input paradigm rules (touch, pointer, keyboard, focus, gaze, Digital Crown, Siri Remote)
- Accessibility requirements (VoiceOver, Reduce Motion, Bold Text, contrast)
- Privacy permission request patterns
- System integration patterns (widgets, Spotlight, share sheets, complications, Top Shelf)
- Evaluation checklists and anti-pattern tables per platform

### What this skill does NOT own
- Implementation code beyond illustrative HIG examples
- Accessibility auditing or automated testing
- UX flow verification or user research
- App architecture decisions (MVVM, TCA, etc.)
- Backend or networking design

---

## Core Principles

1. **Platform constraints drive design.** Each Apple platform has unique physical constraints (screen size, viewing distance, input method) that dictate fundamentally different design approaches. Never port one platform's UI patterns to another without adaptation.

2. **Unique interaction paradigms per platform.** Touch on iPhone, pointer+keyboard on Mac, focus+remote on TV, glance+Crown on Watch, gaze+pinch in spatial computing. Design for the primary input method first.

3. **Minimum target sizes are non-negotiable.** 44pt on iOS/iPadOS, 22-28pt on macOS (pointer precision), 250x150pt on tvOS (focus navigation), 60pt on visionOS (gaze targeting). Undersized targets cause mis-taps and frustration.

4. **Dark mode, Dynamic Type, and semantic colours are mandatory.** Every app must support both appearances, scale text with user preferences, and use semantic system colours that adapt automatically.

5. **Privacy permissions require context.** Request permissions at the moment the user takes an action that needs them, never at launch. Explain why before showing the system prompt.

6. **Accessibility is not optional.** VoiceOver labels, Reduce Motion support, sufficient contrast ratios, and alternative interaction paths are baseline requirements on every platform.

---

## Platform Quick Reference

| Platform | Primary Input | Min Target Size | Key Constraint |
|----------|--------------|-----------------|----------------|
| iOS (iPhone) | Touch | 44x44pt | One-handed use, thumb zone, small screen |
| iPadOS | Touch + Pointer + Keyboard | 44x44pt | Multitasking splits, size class adaptation |
| macOS | Pointer + Keyboard | 22-28pt height | Menu bar, multi-window, keyboard-first |
| tvOS | Siri Remote (focus) | 250x150pt | 10-foot viewing distance, no touch screen |
| watchOS | Touch + Digital Crown | 44pt tap area | Glanceable (2-second comprehension), tiny screen |
| visionOS | Eye + Hand (gaze+pinch) | 60pt | Spatial layout, comfort distance, no cursor |

---

## Cross-Platform Rules

These rules apply to ALL Apple platforms:

- Use semantic system colours — never hardcode `Color.white` or `Color.black` for UI surfaces
- Support Dark Mode with intentional design, not just colour inversion
- Use SF Symbols for iconography — they scale with Dynamic Type and adapt to platform conventions
- Provide VoiceOver labels on all interactive elements
- Respect Reduce Motion — disable decorative animations when the user requests it
- Never rely on colour alone to convey meaning — pair with icons, text, or shapes
- Meet WCAG AA contrast minimums: 4.5:1 for normal text, 3:1 for large text
- Use semantic text styles (`.headline`, `.body`, `.caption`) rather than hardcoded font sizes
- Provide immediate feedback for user actions (visual, haptic, or audio as appropriate)
- Handle interruptions gracefully — save state when the app moves to background

---

## Platform Selection Guide

Choose the reference file based on your target platform:

| Building for... | Read this reference |
|-----------------|-------------------|
| iPhone app | [ios.md](ios.md) |
| iPad app | [ipados.md](ipados.md) |
| Mac app (SwiftUI or AppKit) | [macos.md](macos.md) |
| Apple TV app | [tvos.md](tvos.md) |
| Apple Watch app | [watchos.md](watchos.md) |
| Apple Vision Pro app | [visionos.md](visionos.md) |
| Custom colour palette technique | [colour-system.md](colour-system.md) |
| Universal app (iPhone + iPad) | Read [ios.md](ios.md) then [ipados.md](ipados.md) |
| Cross-platform (all devices) | Read the file for each target platform |

---

## References

- `ios.md` — iPhone HIG: layout, navigation, typography, colour, accessibility, gestures, components, patterns, privacy, system integration
- `ipados.md` — iPad HIG: responsive layout, multitasking, sidebar navigation, pointer/trackpad, keyboard shortcuts, Apple Pencil, drag & drop, external display
- `macos.md` — Mac HIG: menu bar, windows, toolbars, sidebars, keyboard-first, pointer/mouse, notifications, system integration, visual design
- `tvos.md` — Apple TV HIG: focus-based navigation, Siri Remote, 10-foot UI, Top Shelf, media/playback, tab bar
- `watchos.md` — Watch HIG: glanceable design, Digital Crown, navigation, complications, Always On Display, workouts, notifications
- `visionos.md` — Vision Pro HIG: spatial layout, eye+hand input, windows, volumes, immersive spaces, materials, ornaments
- `colour-system.md` — OKLCH colour space technique: channels, shade scales, chroma reduction, dark mode strategy, SwiftUI Color(oklch:) initialiser, WCAG contrast mapping
