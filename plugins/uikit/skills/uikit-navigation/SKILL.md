---
name: uikit-navigation
description: Use when building or reviewing UIKit navigation controllers, modal presentations, custom transitions, or coordinator routing.
---

# UIKit Navigation

Review and write UIKit navigation code for correct push/pop flows, modal presentations, custom transitions, and coordinator-based architecture.

## Responsibility

**Owns:** UINavigationController (push, pop, toolbar, large titles), modal presentation styles, UIPresentationController, UIViewControllerTransitioningDelegate, UIViewControllerAnimatedTransitioning, coordinator pattern, UIAdaptivePresentationControllerDelegate.

**Does NOT own:** SwiftUI NavigationStack (swiftui-patterns skill), tab bars in SwiftUI, view controller lifecycle (uikit-fundamentals skill), SwiftUI bridging (uikit-interop skill).

## Core Principles

1. **Push for drill-down, modals for tasks.** Push when navigating deeper in a hierarchy. Present modally for self-contained tasks (compose, settings, alerts).
2. **Presentation styles matter.** `.automatic` (default) is `.pageSheet` on iPhone/iPad. Use `.fullScreen` only when the underlying content shouldn't be visible. `.formSheet` for compact dialogs on iPad.
3. **Large titles for top-level screens.** Set `navigationItem.largeTitleDisplayMode = .always` for root, `.never` for detail. The navigation bar handles the transition.
4. **Custom transitions need three objects.** A `UIViewControllerTransitioningDelegate` that vends an `UIViewControllerAnimatedTransitioning` (and optionally a `UIPresentationController`).
5. **Coordinator pattern for flow management.** Coordinators own navigation controllers and handle routing. View controllers fire delegate methods; they don't know about the next screen.
6. **Handle dismissal.** Implement `presentationControllerDidDismiss(_:)` on the adaptive presentation delegate to clean up when users swipe to dismiss a `.pageSheet`.

## References

- `references/uikit-navigation-patterns.md` — Push/pop, modals, custom transitions, coordinators
