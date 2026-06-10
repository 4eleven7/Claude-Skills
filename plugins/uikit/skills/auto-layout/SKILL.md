---
name: auto-layout
description: Use when building or reviewing UIKit Auto Layout constraints, UIStackView, priorities, hugging, compression, or safe areas.
---

# Auto Layout

Review and write Auto Layout code for correct constraint setup, stack view usage, priority management, and debugging.

## Responsibility

**Owns:** NSLayoutConstraint, layout anchors API, UIStackView (axis, distribution, alignment, spacing), constraint priorities, content hugging priority, compression resistance priority, safe area layout guide, layout margins, `translatesAutoresizingMaskIntoConstraints`, Auto Layout debugging.

**Does NOT own:** SwiftUI layout (swiftui-patterns skill), UIView lifecycle (uikit-fundamentals skill), collection view layouts (uikit-collections skill), Core Animation transforms (core-animation skill).

## Core Principles

1. **Always set `translatesAutoresizingMaskIntoConstraints = false`.** Forgetting this is the #1 Auto Layout bug. Only exception: views created by Interface Builder.
2. **Use the anchors API.** `view.leadingAnchor.constraint(equalTo:)` — never `NSLayoutConstraint(item:attribute:...)` in new code.
3. **UIStackView first.** Before writing manual constraints, check if a stack view handles the layout. Nested stacks are fine.
4. **Priorities prevent ambiguity.** Use `.defaultHigh` (750) and `.defaultLow` (250). Avoid `.required` (1000) unless the constraint must never break.
5. **Hugging vs compression resistance.** Content hugging = "don't grow beyond intrinsic size". Compression resistance = "don't shrink below intrinsic size". Labels default to 251/750.
6. **Safe area for system chrome.** Pin to `safeAreaLayoutGuide` for content, `layoutMarginsGuide` for readable widths.
7. **Debug with `_autolayoutTrace()`.** Call `po UIWindow.value(forKeyPath: "keyWindow._autolayoutTrace")` in the debugger. Check console for `AMBIGUOUS LAYOUT` and `Unable to simultaneously satisfy constraints`.

## References

- `references/auto-layout-patterns.md` — Anchors, stack views, priorities, debugging
