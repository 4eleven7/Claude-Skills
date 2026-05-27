# Accessibility Patterns

## Button Over onTapGesture

`Button` provides VoiceOver support, focus handling, and proper traits for free. Never use `onTapGesture` unless you specifically need tap location or count.

```swift
// GOOD — accessible by default
Button("Add User", systemImage: "plus", action: addUser)

// BAD — invisible to VoiceOver
Image(systemName: "plus")
    .onTapGesture { addUser() }
```

If `onTapGesture` must be used, add `.accessibilityAddTraits(.isButton)`.

Buttons with image labels MUST include text:

```swift
// GOOD
Button("Add User", systemImage: "plus", action: addUser)

// BAD — icon-only, VoiceOver says nothing useful
Button(action: addUser) {
    Image(systemName: "plus")
}
```

Prefer direct action parameters: `Button("Label", systemImage: "plus", action: myAction)` over closure wrapping.

## @ScaledMetric

System `Text` scales with Dynamic Type automatically. For custom numeric values (padding, image sizes, spacing), use `@ScaledMetric`:

```swift
struct ProfileHeader: View {
    @ScaledMetric private var avatarSize = 60.0
    @ScaledMetric private var spacing = 12.0

    var body: some View {
        HStack(spacing: spacing) {
            Image("avatar")
                .resizable()
                .frame(width: avatarSize, height: avatarSize)
            Text("Username")
        }
    }
}
```

Scale relative to a specific text style:

```swift
@ScaledMetric(relativeTo: .caption) private var iconSize = 16.0
```

iOS 26+: `.font(.body.scaled(by:))` is also available for font-size adjustment.

Do not force specific font sizes. Use Dynamic Type (`.font(.body)`, `.font(.headline)`). If you need a custom size on iOS 18 and earlier, use `@ScaledMetric`.

## Element Grouping

### .combine — Auto-join child labels

```swift
HStack {
    Image(systemName: "star.fill")
    Text("Favorites")
    Text("(\(count))")
}
.accessibilityElement(children: .combine)
// VoiceOver: "star.fill, Favorites, 5"
```

### .ignore — Manual label for container

```swift
HStack {
    Text(item.name)
    Spacer()
    Text(item.price)
}
.accessibilityElement(children: .ignore)
.accessibilityLabel("\(item.name), \(item.price)")
```

### .contain — Semantic grouping

```swift
HStack {
    ForEach(tabs) { tab in
        TabButton(tab: tab)
    }
}
.accessibilityElement(children: .contain)
.accessibilityLabel("Tab bar")
```

## Custom Controls

### accessibilityRepresentation

Make custom views behave like native controls for VoiceOver:

```swift
HStack {
    Text(label)
    Toggle("", isOn: $isOn)
}
.accessibilityRepresentation {
    Toggle(label, isOn: $isOn)
}
```

### Adjustable Controls

```swift
PageControl(selectedIndex: $selectedIndex, pageCount: pageCount)
    .accessibilityElement()
    .accessibilityValue("Page \(selectedIndex + 1) of \(pageCount)")
    .accessibilityAdjustableAction { direction in
        switch direction {
        case .increment:
            guard selectedIndex < pageCount - 1 else { break }
            selectedIndex += 1
        case .decrement:
            guard selectedIndex > 0 else { break }
            selectedIndex -= 1
        @unknown default: break
        }
    }
```

### Label-Content Pairing

```swift
@Namespace private var ns

HStack {
    Text("Volume")
        .accessibilityLabeledPair(role: .label, id: "volume", in: ns)
    Slider(value: $volume)
        .accessibilityLabeledPair(role: .content, id: "volume", in: ns)
}
```

## VoiceOver Image Labels

Flag images with unclear readings. For decorative images, use `Image(decorative:)` or `.accessibilityHidden(true)`. For meaningful images, add `.accessibilityLabel()`.

For complex or frequently changing button labels, use `.accessibilityInputLabels()` for better Voice Control:

```swift
Button("AAPL $271.68") { }
    .accessibilityInputLabels(["Apple", "Apple stock"])
```

## Reduce Motion

When "Reduce Motion" is enabled, replace large motion-based animations with opacity:

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

withAnimation(reduceMotion ? .none : .spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}
```

## Colour Differentiation

Respect `.accessibilityDifferentiateWithoutColor` by providing non-colour indicators (icons, patterns, strokes):

```swift
@Environment(\.accessibilityDifferentiateWithoutColor) private var noColour

Circle()
    .fill(status.colour)
    .overlay {
        if noColour {
            Image(systemName: status.icon)
        }
    }
```

## Minimum Hit Area

Interactive elements must be at least 44x44pt. Expand small elements:

```swift
Button(action: close) {
    Image(systemName: "xmark")
        .font(.caption)
        .frame(minWidth: 44, minHeight: 44)
        .contentShape(.rect)
}
```

Never let hit areas of adjacent interactive elements overlap.

## Menu Accessibility

Always include text labels on `Menu`:

```swift
// GOOD
Menu("Options", systemImage: "ellipsis.circle") { /* ... */ }

// BAD — image-only, no VoiceOver label
Menu { /* ... */ } label: { Image(systemName: "ellipsis.circle") }
```
