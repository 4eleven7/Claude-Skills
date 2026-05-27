---
name: core-animation
description: Reviews and writes Core Animation code — CALayer, CAAnimation, UIViewPropertyAnimator, and bridging UIKit animations to SwiftUI. Use when SwiftUI animation isn't sufficient or when wrapping UIKit animation in SwiftUI.
---

# Core Animation

Review and write Core Animation code for correct layer management, animation timing, and SwiftUI-UIKit bridging.

## Responsibility

**Owns:** CALayer properties and sublayers, CABasicAnimation, CAKeyframeAnimation, CAAnimationGroup, CATransaction, UIViewPropertyAnimator, UIView.animate, UIViewRepresentable animation bridging, CADisplayLink, CAGradientLayer, CAShapeLayer, CAEmitterLayer.

**Does NOT own:** SwiftUI animations (swiftui-mastery skill), Metal rendering, SpriteKit/SceneKit, RealityKit.

## Core Principles

1. **SwiftUI animation first.** Only drop to Core Animation when SwiftUI can't express the animation (custom timing curves, layer-specific effects, complex keyframes).
2. **Layers are not views.** CALayer is lighter weight but has no responder chain, no accessibility, no Auto Layout.
3. **Animate properties, not frames.** Use `transform`, `opacity`, `position`, `cornerRadius` — not `frame`.
4. **CATransaction for implicit animation control.** Wrap property changes in CATransaction to control or disable implicit animations.
5. **UIViewRepresentable for bridging.** Use `animate(changes:completion:)` context method (iOS 17+) to coordinate UIKit and SwiftUI animations.

## References

- `references/core-animation-patterns.md` — Layer types, animation APIs, timing, UIKit bridging
