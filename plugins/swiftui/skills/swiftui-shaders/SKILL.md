---
name: swiftui-shaders
description: Use when building or reviewing SwiftUI Shader API effects, Metal shader functions, ripple, pixel, color, distortion, or layer effects.
---

# SwiftUI Shaders Quick Reference

## Routing

Use for SwiftUI Shader API effects. Use `metal` for render or compute pipelines, `swiftui-patterns` for general SwiftUI view architecture, and `swiftui-performance-audit` when shader usage causes jank or high GPU cost.

## Purpose

Write custom visual effects for SwiftUI views using Metal shaders. iOS 17+ introduced `Shader` — a bridge that lets `.metal` fragment functions run as SwiftUI view modifiers. This skill covers writing those shaders and wiring them to SwiftUI. For full Metal render pipelines (MTKView, compute, etc.), see the `metal` skill instead.

## How to Use

1. **Pick the effect type** using the decision tree below
2. **Write the `.metal` function** with the correct signature
3. **Apply it in SwiftUI** via the matching modifier
4. **For full patterns and recipes**, read `references/shader-patterns.md`

## Decision Tree: Which Effect Type?

```
Change pixel colours only (tint, invert, posterize)?    -> colorEffect
Displace pixel positions (ripple, wave, barrel)?        -> distortionEffect
Read neighbouring pixels (blur, glow, outline)?         -> layerEffect
Need a full render pipeline (3D, compute, particles)?   -> metal skill (MTKView)
```

| Effect Type | Shader Signature | What It Does |
|---|---|---|
| `colorEffect` | `(float2 position, half4 color) -> half4` | Transforms each pixel's colour |
| `distortionEffect` | `(float2 position) -> float2` | Returns new sample position for each pixel |
| `layerEffect` | `(float2 position, SwiftUI::Layer layer) -> half4` | Reads arbitrary pixels from the rasterised view |

## Anti-Patterns

| Mistake | Fix |
|---|---|
| Using `float` precision for all colour math | Use `half` / `half4` — 2x throughput on Apple GPUs |
| Heavy loops in `colorEffect` | `colorEffect` runs per-pixel; keep it simple or switch to `layerEffect` |
| Forgetting `maxSampleOffset` on `layerEffect` | SwiftUI clips sampling to the view bounds unless you specify the max offset |
| Not testing on device | Simulator runs shaders on CPU; always verify performance on device |
| Passing too many uniforms | Pack related values into `float2`/`float4` to reduce binding overhead |
| Using `distortionEffect` when `colorEffect` suffices | Distortion effects are more expensive — only use when position displacement is needed |

## Core Principles

1. **Shader files are `.metal` files** added to your Xcode target — SwiftUI finds them via `ShaderLibrary` at runtime.
2. **Use `half` precision** for all colour work. Apple GPUs run `half` at 2x the throughput of `float`.
3. **All shader functions must be `[[stitchable]]`** — this attribute makes them available to SwiftUI's `ShaderLibrary`.
4. **Time-based animation** requires `TimelineView` wrapping the shader modifier — shaders don't animate on their own.
5. **`maxSampleOffset`** is required for `layerEffect` and `distortionEffect` — it tells SwiftUI how far the shader reads outside the original bounds so the rasterisation area can be expanded.
6. **Test on device.** The Simulator uses a software Metal implementation that is much slower and may behave differently.

## References

- `references/shader-patterns.md` — Full API reference, effect recipes, uniform passing, animation wiring
