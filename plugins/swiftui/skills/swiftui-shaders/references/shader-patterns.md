# SwiftUI Shader Patterns

Complete reference for writing Metal shaders that plug into SwiftUI's `Shader` API. All examples target iOS 17+ / iOS 26+.

---

## How SwiftUI Shaders Work

1. You write a `[[stitchable]]` function in a `.metal` file
2. SwiftUI compiles it and makes it available via `ShaderLibrary`
3. You apply it as a view modifier (`.colorEffect`, `.distortionEffect`, `.layerEffect`)
4. SwiftUI rasterises the view, then runs your shader on every pixel

```
.metal file → ShaderLibrary.functionName(...) → .colorEffect / .distortionEffect / .layerEffect
```

---

## Effect Types

### colorEffect

Transforms each pixel's colour. Cannot read neighbours.

**Metal signature:**

```metal
[[stitchable]] half4 myColorEffect(float2 position, half4 color, /* uniforms */) {
    return color;  // Modified colour
}
```

**SwiftUI usage:**

```swift
Text("Hello")
    .colorEffect(ShaderLibrary.myColorEffect())
```

### distortionEffect

Returns the source position to sample for each output pixel. Moves pixels around.

**Metal signature:**

```metal
[[stitchable]] float2 myDistortion(float2 position, /* uniforms */) {
    return position;  // Modified sample position
}
```

**SwiftUI usage:**

```swift
Image("photo")
    .distortionEffect(
        ShaderLibrary.myDistortion(),
        maxSampleOffset: CGSize(width: 50, height: 50)
    )
```

### layerEffect

Full access to the rasterised view as a texture. Can read any pixel.

**Metal signature:**

```metal
[[stitchable]] half4 myLayerEffect(float2 position, SwiftUI::Layer layer, /* uniforms */) {
    return layer.sample(position);  // Read pixel at position
}
```

**SwiftUI usage:**

```swift
Image("photo")
    .layerEffect(
        ShaderLibrary.myLayerEffect(),
        maxSampleOffset: CGSize(width: 10, height: 10)
    )
```

---

## Passing Uniforms

SwiftUI passes uniforms as additional arguments after the required parameters.

### Supported Types

| Swift | Metal | Notes |
|---|---|---|
| `Float` | `float` | Single scalar |
| `CGFloat` | `float` | Auto-converted |
| `SIMD2<Float>` / `CGSize` / `CGPoint` | `float2` | 2D vector |
| `Color` | `half4` | Premultiplied alpha |
| `Image` | `texture2d<half>` | Texture resource |

### Example: Passing Time and Strength

```metal
[[stitchable]] half4 pulse(float2 position, half4 color, float time, float strength) {
    float wave = sin(time * 3.0 + position.x * 0.05) * strength;
    return half4(color.rgb * half(1.0 + wave), color.a);
}
```

```swift
TimelineView(.animation) { timeline in
    let time = timeline.date.timeIntervalSince1970
    Text("Pulse")
        .colorEffect(ShaderLibrary.pulse(.float(time), .float(0.3)))
}
```

### Example: Passing a Size

```metal
[[stitchable]] float2 wave(float2 position, float2 size, float time) {
    float2 uv = position / size;  // Normalise to 0..1
    float offset = sin(uv.y * 10.0 + time * 3.0) * 10.0;
    return float2(position.x + offset, position.y);
}
```

```swift
GeometryReader { geo in
    TimelineView(.animation) { timeline in
        Image("photo")
            .distortionEffect(
                ShaderLibrary.wave(.float2(geo.size), .float(timeline.date.timeIntervalSince1970)),
                maxSampleOffset: CGSize(width: 10, height: 0)
            )
    }
}
```

---

## Animation with TimelineView

Shaders are static unless driven by changing uniforms. Use `TimelineView` for time-based animation.

```swift
struct AnimatedShaderView: View {
    let startDate = Date()

    var body: some View {
        TimelineView(.animation) { timeline in
            let elapsed = timeline.date.timeIntervalSince(startDate)
            content
                .colorEffect(ShaderLibrary.myEffect(.float(elapsed)))
        }
    }
}
```

**Tip:** Use `.animation` schedule for 60fps, or `.periodic(from:by:)` for lower update rates to save power.

---

## Recipes

### Colour Invert

```metal
[[stitchable]] half4 invertColors(float2 position, half4 color) {
    return half4(color.a - color.rgb, color.a);  // Premultiplied alpha
}
```

### Colour Tint

```metal
[[stitchable]] half4 tint(float2 position, half4 color, half4 tintColor) {
    half luminance = dot(color.rgb, half3(0.2126h, 0.7152h, 0.0722h));
    return half4(tintColor.rgb * luminance * color.a, color.a);
}
```

### Posterize

```metal
[[stitchable]] half4 posterize(float2 position, half4 color, float levels) {
    half3 c = floor(color.rgb * half(levels) + 0.5h) / half(levels);
    return half4(c * color.a, color.a);  // Re-premultiply
}
```

### Pixelate

```metal
[[stitchable]] float2 pixelate(float2 position, float size) {
    return floor(position / size) * size + size * 0.5;
}
```

```swift
Image("photo")
    .distortionEffect(ShaderLibrary.pixelate(.float(8)), maxSampleOffset: .zero)
```

### Ripple

```metal
[[stitchable]] float2 ripple(float2 position, float2 origin, float time, float speed,
                              float frequency, float amplitude, float decay) {
    float distance = length(position - origin);
    float wave = sin(frequency * distance - speed * time);
    float envelope = exp(-decay * max(0.0, distance - speed * time * 0.5));
    float2 offset = normalize(position - origin) * wave * amplitude * envelope;
    return position + offset;
}
```

```swift
Image("photo")
    .distortionEffect(
        ShaderLibrary.ripple(
            .float2(tapLocation),
            .float(elapsed),
            .float(800),    // speed
            .float(15),     // frequency
            .float(12),     // amplitude
            .float(4)       // decay
        ),
        maxSampleOffset: CGSize(width: 12, height: 12)
    )
```

### Chromatic Aberration

```metal
[[stitchable]] half4 chromaticAberration(float2 position, SwiftUI::Layer layer,
                                          float2 size, float strength) {
    float2 uv = position / size;
    float2 offset = (uv - 0.5) * strength;

    half4 r = layer.sample(position + offset * size);
    half4 g = layer.sample(position);
    half4 b = layer.sample(position - offset * size);

    return half4(r.r, g.g, b.b, g.a);
}
```

### Gaussian Blur

```metal
[[stitchable]] half4 gaussianBlur(float2 position, SwiftUI::Layer layer,
                                   float radius, float2 direction) {
    half4 result = half4(0.0h);
    half totalWeight = 0.0h;
    int samples = int(ceil(radius));

    for (int i = -samples; i <= samples; i++) {
        half weight = half(exp(-0.5 * float(i * i) / (radius * radius)));
        float2 offset = direction * float(i);
        result += layer.sample(position + offset) * weight;
        totalWeight += weight;
    }
    return result / totalWeight;
}
```

```swift
Image("photo")
    .layerEffect(
        ShaderLibrary.gaussianBlur(.float(8), .float2(CGSize(width: 1, height: 0))),
        maxSampleOffset: CGSize(width: 24, height: 0)
    )
    .layerEffect(
        ShaderLibrary.gaussianBlur(.float(8), .float2(CGSize(width: 0, height: 1))),
        maxSampleOffset: CGSize(width: 0, height: 24)
    )
```

### Noise Dissolve

```metal
float hash21(float2 p) {
    float3 p3 = fract(float3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

[[stitchable]] half4 noiseDissolve(float2 position, half4 color, float progress) {
    float noise = hash21(position * 0.02);
    if (noise < progress) return half4(0.0h);

    // Edge glow
    float edge = smoothstep(progress, progress + 0.05, noise);
    half3 glow = mix(half3(1.0h, 0.5h, 0.0h), color.rgb, half(edge));
    return half4(glow * color.a, color.a);
}
```

### Vignette

```metal
[[stitchable]] half4 vignette(float2 position, half4 color, float2 size, float intensity) {
    float2 uv = position / size;
    float dist = distance(uv, float2(0.5));
    half v = half(smoothstep(0.7, 0.3, dist * intensity));
    return half4(color.rgb * v, color.a);
}
```

### CRT Scanlines

```metal
[[stitchable]] half4 crtScanlines(float2 position, half4 color, float lineWidth, float darkness) {
    float scanline = fmod(position.y, lineWidth * 2.0);
    half brightness = scanline < lineWidth ? 1.0h : half(1.0 - darkness);
    return half4(color.rgb * brightness, color.a);
}
```

### Gradient Map

```metal
[[stitchable]] half4 gradientMap(float2 position, half4 color,
                                  half4 shadowColor, half4 highlightColor) {
    half luminance = dot(color.rgb, half3(0.2126h, 0.7152h, 0.0722h));
    half3 mapped = mix(shadowColor.rgb, highlightColor.rgb, luminance);
    return half4(mapped * color.a, color.a);
}
```

### Procedural Noise Overlay

```metal
float2 hashGrad(float2 p) {
    p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float perlinNoise(float2 p) {
    float2 i = floor(p);
    float2 f = fract(p);
    float2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hashGrad(i), f),
                   dot(hashGrad(i + float2(1, 0)), f - float2(1, 0)), u.x),
               mix(dot(hashGrad(i + float2(0, 1)), f - float2(0, 1)),
                   dot(hashGrad(i + float2(1, 1)), f - float2(1, 1)), u.x), u.y);
}

[[stitchable]] half4 noiseOverlay(float2 position, half4 color, float scale, float opacity) {
    float n = perlinNoise(position / scale) * 0.5 + 0.5;
    return half4(mix(color.rgb, half3(half(n)), half(opacity)), color.a);
}
```

---

## Premultiplied Alpha

SwiftUI passes colours in **premultiplied alpha** format. This means `color.rgb` is already multiplied by `color.a`.

### Rules

- When modifying RGB, the result must stay premultiplied: `result.rgb <= result.a`
- When replacing colour entirely, multiply by alpha: `half4(newRGB * color.a, color.a)`
- When blending, work in premultiplied space — no need to unpremultiply first
- `layer.sample()` also returns premultiplied colours

### Common Mistake

```metal
// WRONG: result can exceed alpha
return half4(color.rgb + half3(0.5h), color.a);

// CORRECT: clamp or scale
return half4(min(color.rgb + half3(0.5h) * color.a, color.a), color.a);
```

---

## maxSampleOffset Guide

| Effect | Typical maxSampleOffset |
|---|---|
| `colorEffect` (any) | Not needed — `colorEffect` doesn't sample neighbours |
| Pixelate | `.zero` (reads from shifted position within bounds) |
| Small ripple / wave | `CGSize(width: amplitude, height: amplitude)` |
| Blur (radius R) | `CGSize(width: R * 3, height: R * 3)` |
| Chromatic aberration | Size proportional to `strength * viewSize` |
| Anything reading far offscreen | Set generously — clipping artefacts at edges are the symptom of too-small offset |

---

## Debugging Tips

| Problem | Solution |
|---|---|
| Shader doesn't appear | Check function is `[[stitchable]]`, `.metal` file is in target, function name matches |
| Colours look wrong | Remember premultiplied alpha — don't unpremultiply accidentally |
| Effect clips at edges | Increase `maxSampleOffset` |
| No animation | Wrap in `TimelineView(.animation)` — shaders don't animate alone |
| Performance issues | Profile on device; use `half` precision; reduce loop iterations in `layerEffect` |
| Crash: "Shader function not found" | Ensure the `.metal` file is compiled into the app target (check Build Phases > Compile Sources) |

---

## Combining Effects

Stack multiple shader modifiers. They apply bottom-to-top (last modifier runs first on the rasterised view).

```swift
Image("photo")
    .colorEffect(ShaderLibrary.posterize(.float(6)))       // 3rd: posterize
    .distortionEffect(ShaderLibrary.pixelate(.float(4)),   // 2nd: pixelate
                       maxSampleOffset: .zero)
    .layerEffect(ShaderLibrary.gaussianBlur(.float(2),     // 1st: blur
                  .float2(CGSize(width: 1, height: 0))),
                 maxSampleOffset: CGSize(width: 6, height: 0))
```

**Performance note**: Each effect modifier triggers a separate rasterisation pass. Keep the chain short (2-3 effects). If you need more, write a single `layerEffect` that combines them.

---

## Transition Shaders

Use shaders to power custom SwiftUI transitions.

```swift
extension AnyTransition {
    static var dissolve: AnyTransition {
        .modifier(
            active: DissolveModifier(progress: 1.0),
            identity: DissolveModifier(progress: 0.0)
        )
    }
}

struct DissolveModifier: ViewModifier {
    var progress: Double

    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func body(content: Content) -> some View {
        content
            .colorEffect(ShaderLibrary.noiseDissolve(.float(progress)))
    }
}
```
