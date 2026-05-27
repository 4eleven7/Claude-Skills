# Liquid Glass (iOS 26+)

Only adopt when explicitly requested by the user. All APIs require iOS 26+.

## Core API

```swift
// Basic glass effect
Text("Label")
    .padding()
    .glassEffect()  // default: .regular style, .rect shape

// With shape
Text("Rounded")
    .padding()
    .glassEffect(in: .rect(cornerRadius: 16))

Image(systemName: "star")
    .padding()
    .glassEffect(in: .circle)

Text("Capsule")
    .padding(.horizontal, 20)
    .padding(.vertical, 10)
    .glassEffect(in: .capsule)
```

## Styles

```swift
.glassEffect(.regular)                        // Standard
.glassEffect(.prominent)                      // Higher contrast
.glassEffect(.regular.tint(.blue))           // Colour tint
.glassEffect(.regular.interactive())          // Responds to touch/hover
.glassEffect(.regular.tint(.blue).interactive())  // Combined
```

**Rule:** `.interactive()` only on elements that respond to user input (buttons, tappable views, focusable elements). Never on static content.

## GlassEffectContainer

Glass cannot sample other glass. Nearby glass elements in different containers produce inconsistent visuals. Wrap grouped glass elements in `GlassEffectContainer`:

```swift
GlassEffectContainer(spacing: 24) {
    HStack(spacing: 24) {
        GlassChip(icon: "pencil")
        GlassChip(icon: "eraser")
        GlassChip(icon: "trash")
    }
}
```

Container `spacing` must match the actual layout spacing.

## Glass Button Styles

```swift
Button("Action") { }
    .buttonStyle(.glass)

Button("Primary") { }
    .buttonStyle(.glassProminent)

// Custom glass button
Button(action: { }) {
    Label("Settings", systemImage: "gear").padding()
}
.glassEffect(.regular.interactive(), in: .capsule)
```

## Morphing Transitions

Smooth transitions between glass elements using `glassEffectID` and `@Namespace`:

```swift
struct MorphingExample: View {
    @Namespace private var animation
    @State private var isExpanded = false

    var body: some View {
        GlassEffectContainer {
            if isExpanded {
                ExpandedCard()
                    .glassEffect()
                    .glassEffectID("card", in: animation)
            } else {
                CompactCard()
                    .glassEffect()
                    .glassEffectID("card", in: animation)
            }
        }
        .animation(.smooth, value: isExpanded)
    }
}
```

Requirements: same `glassEffectID`, same `@Namespace`, wrap in `GlassEffectContainer`, animation on parent.

## Glass Effect Union

Unite multiple views into a single glass effect when they aren't in a direct stack:

```swift
@Namespace private var namespace

GlassEffectContainer(spacing: 20) {
    HStack(spacing: 20) {
        ForEach(items.indices, id: \.self) { item in
            Image(systemName: items[item])
                .frame(width: 80, height: 80)
                .font(.system(size: 36))
                .glassEffect()
                .glassEffectUnion(id: item < 2 ? "group1" : "group2", namespace: namespace)
        }
    }
}
```

Items sharing the same union ID merge into a single glass region. Useful for dynamically created views or views outside a direct HStack/VStack.

## Scroll Extension

Extend horizontal scroll content under sidebars:

```swift
ScrollView(.horizontal) {
    // Scrollable content
}
.scrollExtensionMode(.underSidebar)
```

## Modifier Order

Apply `glassEffect` LAST, after layout and visual modifiers:

```swift
// CORRECT
Text("Label")
    .font(.headline)           // 1. Typography
    .foregroundStyle(.primary) // 2. Colour
    .padding()                 // 3. Layout
    .glassEffect()             // 4. Glass LAST

// WRONG
Text("Label")
    .glassEffect()             // Too early
    .padding()
```

## Fallback Strategy

```swift
if #available(iOS 26, *) {
    content.glassEffect(.regular, in: .rect(cornerRadius: 16))
} else {
    content.background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
}
```

Reusable fallback modifier:

```swift
extension View {
    @ViewBuilder
    func glassEffectWithFallback(
        _ style: GlassEffectStyle = .regular,
        in shape: some Shape = .rect,
        fallbackMaterial: Material = .ultraThinMaterial
    ) -> some View {
        if #available(iOS 26, *) {
            self.glassEffect(style, in: shape)
        } else {
            self.background(fallbackMaterial, in: shape)
        }
    }
}
```

## Complete Example: Glass Toolbar

```swift
struct GlassToolbar: View {
    var body: some View {
        if #available(iOS 26, *) {
            GlassEffectContainer(spacing: 16) {
                HStack(spacing: 16) {
                    ToolbarButton(icon: "pencil", action: { })
                    ToolbarButton(icon: "eraser", action: { })
                    Spacer()
                    ToolbarButton(icon: "square.and.arrow.up", action: { })
                }
                .padding(.horizontal)
            }
        }
    }
}

struct ToolbarButton: View {
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.title2)
                .frame(width: 44, height: 44)
        }
        .glassEffect(.regular.interactive(), in: .circle)
    }
}
```

## Design Notes

- Toolbar icons use monochrome rendering by default — use `tint(_:)` only to convey meaning
- Partial-height sheets use Liquid Glass background by default — remove custom `presentationBackground(_:)` to let it shine
- Automatic scroll edge effect blurs content under system toolbars — remove custom darkening backgrounds behind bar items
- Sheets can morph out of glass controls using `navigationZoomTransition`

## Checklist

- [ ] `#available(iOS 26, *)` with material fallback
- [ ] `GlassEffectContainer` wraps grouped glass elements
- [ ] Container `spacing` matches layout spacing
- [ ] `.glassEffect()` applied after layout/appearance modifiers
- [ ] `.interactive()` only on tappable/focusable elements
- [ ] `glassEffectID` + `@Namespace` for morphing transitions
- [ ] Consistent shapes and tints across feature
- [ ] No custom darkening behind toolbars (conflicts with scroll edge effect)
- [ ] No custom `presentationBackground(_:)` on sheets (use default glass)
