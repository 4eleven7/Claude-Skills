---
name: uikit-fundamentals
description: Reviews and writes UIKit view controller and view code — UIViewController lifecycle, UIView hierarchy, responder chain, trait collections, size classes. Use when building or reviewing imperative UIKit view layer code.
---

# UIKit Fundamentals

Review and write UIKit code for correct view controller lifecycle, view hierarchy management, responder chain handling, and trait-based adaptation.

## Responsibility

**Owns:** UIViewController lifecycle, UIView hierarchy and layout passes, responder chain and first responder, trait collections and size classes, UITraitChangeRegistration (iOS 17+), appearance customization, viewIsAppearing (iOS 13+).

**Does NOT own:** Auto Layout constraints (auto-layout skill), collection/table views (uikit-collections skill), navigation flows (uikit-navigation skill), Core Animation layers (core-animation skill), SwiftUI bridging (uikit-interop skill).

## Core Principles

1. **Lifecycle order matters.** `viewDidLoad` → `viewIsAppearing` → `viewDidAppear` → `viewWillDisappear` → `viewDidDisappear`. Put geometry-dependent code in `viewIsAppearing`, not `viewWillAppear`.
2. **viewIsAppearing replaces most viewWillAppear uses.** Available from iOS 13+, called with up-to-date trait collection and geometry. Prefer it for layout adjustments.
3. **Views are not view controllers.** Keep UIView subclasses focused on rendering. Business logic belongs in the view controller or a separate object.
4. **Responder chain flows up.** First responder → superview chain → view controller → parent VC → window → application. Use `becomeFirstResponder()` / `resignFirstResponder()` deliberately.
5. **Trait changes (iOS 17+).** Use `registerForTraitChanges([UITraitUserInterfaceStyle.self]) { (self: Self, _) in ... }` instead of the deprecated `traitCollectionDidChange(_:)`.
6. **Size classes drive adaptive layout.** `.compact` and `.regular` for horizontal and vertical axes. Check `traitCollection.horizontalSizeClass` rather than checking device type.

## References

- `references/uikit-fundamentals-patterns.md` — Lifecycle, view hierarchy, responder chain, traits
