---
name: uikit-interop
description: Reviews and writes SwiftUI-UIKit interop code — UIViewRepresentable, UIViewControllerRepresentable, UIHostingController, UIHostingConfiguration, incremental adoption. Use when bridging between SwiftUI and UIKit.
---

# UIKit Interop

Review and write interop code for correct bridging between SwiftUI and UIKit in both directions.

## Responsibility

**Owns:** UIViewRepresentable (makeUIView, updateUIView, Coordinator), UIViewControllerRepresentable (makeUIViewController, updateUIViewController), UIHostingController, UIHostingConfiguration (iOS 16+), `context.animate {}` for coordinated animations (iOS 17+), incremental adoption patterns.

**Does NOT own:** Pure SwiftUI views (swiftui-mastery skill), pure UIKit views (uikit-fundamentals skill), Core Animation bridging (core-animation skill).

## Core Principles

1. **UIViewRepresentable is a struct.** `makeUIView` creates once, `updateUIView` syncs state. Never recreate the UIView in `updateUIView`.
2. **Coordinator for delegates.** Use the `Coordinator` class for UIKit delegate callbacks. The coordinator holds a reference to the parent representable via the binding, not a strong reference to the SwiftUI view.
3. **context.animate {} for coordinated animations.** On iOS 17+, use `context.animate { }` in `updateUIView` to coordinate UIKit animations with SwiftUI transitions.
4. **UIHostingController for SwiftUI in UIKit.** Embed SwiftUI views in UIKit via `UIHostingController`. Add as a child view controller — don't just add its view.
5. **UIHostingConfiguration for cells.** Use `UIHostingConfiguration { SwiftUIView() }` for collection/table view cells (iOS 16+). No need for a hosting controller per cell.
6. **Incremental adoption.** Start with leaf views (buttons, inputs) when adopting SwiftUI in a UIKit app. Start with UIKit wrappers for missing components when adopting UIKit in a SwiftUI app.
7. **sizingOptions for hosting controllers.** Set `.intrinsicContentSize` on UIHostingController to let Auto Layout size it correctly.

## References

- `references/uikit-interop-patterns.md` — Representable protocols, hosting, coordinated animations, adoption patterns
