---
name: uikit-fundamentals
description: Use when reviewing UIKit lifecycle, view hierarchy, responder chain, traits, size classes, or modernization away from shared state.
---

# UIKit Fundamentals

Review and write UIKit code for correct view controller lifecycle, view hierarchy management, responder chain handling, and trait-based adaptation.

## Responsibility

**Owns:** UIViewController lifecycle, UIView hierarchy and layout passes, responder chain and first responder, trait collections and size classes, UITraitChangeRegistration (iOS 17+), appearance customization, viewIsAppearing (iOS 13+), and UIKit app modernization for multi-window environments.

**Does NOT own:** Auto Layout constraints (auto-layout skill), collection/table views (uikit-collections skill), navigation flows (uikit-navigation skill), Core Animation layers (core-animation skill), SwiftUI bridging (uikit-interop skill).

## Core Principles

1. **Apple modernization guidance wins.** For `UIScreen.main`, `mainScreen`, `interfaceOrientation`, application-vs-scene lifecycle, and safe-area modernization, read `references/apple-uikit-modernization/` first and apply the task-specific replacement there.
1. **Lifecycle order matters.** `viewDidLoad` → `viewIsAppearing` → `viewDidAppear` → `viewWillDisappear` → `viewDidDisappear`. Put geometry-dependent code in `viewIsAppearing`, not `viewWillAppear`.
2. **viewIsAppearing replaces most viewWillAppear uses.** Available from iOS 13+, called with up-to-date trait collection and geometry. Prefer it for layout adjustments.
3. **Views are not view controllers.** Keep UIView subclasses focused on rendering. Business logic belongs in the view controller or a separate object.
4. **Responder chain flows up.** First responder → superview chain → view controller → parent VC → window → application. Use `becomeFirstResponder()` / `resignFirstResponder()` deliberately.
5. **Trait changes (iOS 17+).** Use `registerForTraitChanges([UITraitUserInterfaceStyle.self]) { (self: Self, _) in ... }` instead of the deprecated `traitCollectionDidChange(_:)`.
6. **Size classes drive adaptive layout.** `.compact` and `.regular` for horizontal and vertical axes. Check `traitCollection.horizontalSizeClass` rather than checking device type.
7. **No global scene/window guesses.** Do not replace deprecated shared-state reads with `UIApplication.shared` or another global walk. Prefer context closest to the consumer: the view, view controller, window scene, or an explicit parameter.
8. **Modernization edits must be complete.** If a replacement requires a new overload plus a deprecated forwarding wrapper or trait-change registration, make the whole pattern atomic. Partial migrations are worse than no migration.

## References

- `references/apple-uikit-modernization/` — Apple-authoritative modernization tasks for `UIScreen`, safe areas, orientation, and scene lifecycle.
- `references/uikit-fundamentals-patterns.md` — Lifecycle, view hierarchy, responder chain, traits
