# List and Scroll Patterns

## ForEach Identity Stability

The most important rule for lists: stable, domain-model IDs.

```swift
// GOOD — stable Identifiable conformance
ForEach(items) { item in
    Row(item: item)
}

// BAD — identity changes when order changes
ForEach(items, id: \.self) { item in Row(item: item) }

// BAD — array indices as identity
ForEach(items.indices, id: \.self) { i in Row(item: items[i]) }
```

Prefer making structs conform to `Identifiable` rather than using `id: \.someProperty` inline.

Constant number of views per ForEach element — never conditionally emit different view counts per iteration.

## List Patterns

### Feed-Style List

```swift
List {
    ForEach(items) { item in
        TimelineRow(item: item)
            .id(item.id)
            .listRowInsets(.init(top: 12, leading: 16, bottom: 6, trailing: 16))
            .listRowSeparator(.hidden)
    }
}
.listStyle(.plain)
.environment(\.defaultMinListRowHeight, 1)
```

### Settings-Style List

```swift
List {
    Section("General") {
        NavigationLink("Display") { DisplaySettingsView() }
        NavigationLink("Haptics") { HapticsSettingsView() }
    }
    Section("Account") {
        Button("Sign Out", role: .destructive) { }
    }
}
.listStyle(.insetGrouped)
```

### List Styling

- `.listStyle(.plain)` — modern feed layouts
- `.listStyle(.grouped)` — multi-section discovery pages
- `.listStyle(.insetGrouped)` — settings-style
- `.scrollContentBackground(.hidden)` + custom background for themed surfaces
- `.listRowInsets(...)` and `.listRowSeparator(.hidden)` to tune spacing
- `.contentShape(Rectangle())` on rows that should be tappable end-to-end
- `.refreshable` for pull-to-refresh

## Lazy Loading

### When to Use Lazy vs Eager Stacks

| Content | Use |
|---------|-----|
| Large or unknown item count | `LazyVStack` / `LazyHStack` |
| Small, fixed content (<20 items) | `VStack` / `HStack` |
| Grid layouts | `LazyVGrid` with adaptive columns |

```swift
// Vertical feed
ScrollView {
    LazyVStack {
        ForEach(messages) { message in
            MessageRow(message: message)
        }
    }
}

// Horizontal chips
ScrollView(.horizontal, showsIndicators: false) {
    LazyHStack(spacing: 8) {
        ForEach(chips) { chip in
            ChipView(chip: chip)
        }
    }
}

// Adaptive grid
let columns = [GridItem(.adaptive(minimum: 120))]
ScrollView {
    LazyVGrid(columns: columns, spacing: 8) {
        ForEach(items) { item in
            GridItemView(item: item)
        }
    }
    .padding(8)
}
```

## Scroll Patterns

### Scroll-to-Top / Scroll-to-ID

```swift
ScrollViewReader { proxy in
    List {
        ForEach(items) { item in
            ItemRow(item: item).id(item.id)
        }
    }
    .onChange(of: scrollTarget) { _, newValue in
        if let newValue {
            withAnimation { proxy.scrollTo(newValue, anchor: .top) }
        }
    }
}
```

### Bottom-Anchored (Chat)

```swift
private enum Constants { static let bottomAnchor = "bottom" }

ScrollViewReader { proxy in
    ScrollView {
        LazyVStack {
            ForEach(messages) { message in
                MessageRow(message: message).id(message.id)
            }
            Color.clear.frame(height: 1).id(Constants.bottomAnchor)
        }
    }
    .safeAreaInset(edge: .bottom) {
        MessageInputBar()
    }
    .onAppear {
        withAnimation { proxy.scrollTo(Constants.bottomAnchor, anchor: .bottom) }
    }
}
```

### Scroll-Reveal Detail Surface

For detail screens that reveal secondary content by scrolling:

```swift
ScrollView(.vertical, showsIndicators: false) {
    VStack(spacing: 0) {
        PrimaryContent(progress: revealProgress)
            .frame(height: geometry.size.height)
        SecondaryContent(progress: revealProgress)
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.paging)
.onScrollGeometryChange(for: CGFloat.self, of: { scroll in
    scroll.contentOffset.y + scroll.contentInsets.top
}) { _, offset in
    revealProgress = (offset / secondaryHeight).clamped(to: 0...1)
}
```

Derive a single `progress` value from scroll offset and drive all visual changes from it.

## Pagination

### Threshold-Based Loading

```swift
ForEach(items) { item in
    ItemRow(item: item)
        .task {
            if item == items.last {
                await loadNextPage()
            }
        }
}
```

Or trigger earlier with a threshold:

```swift
.task {
    if items.suffix(5).contains(where: { $0.id == item.id }) {
        await loadNextPage()
    }
}
```

## Scroll Target Behaviour (iOS 17+)

### Paging ScrollView

```swift
ScrollView(.horizontal) {
    LazyHStack(spacing: 0) {
        ForEach(pages) { page in
            PageView(page: page)
                .containerRelativeFrame(.horizontal)
        }
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.paging)
```

### Snap to Items

```swift
ScrollView(.horizontal) {
    LazyHStack(spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
                .frame(width: 280)
        }
    }
    .scrollTargetLayout()
}
.scrollTargetBehavior(.viewAligned)
.contentMargins(.horizontal, 20)
```

## Scroll-Based Visual Effects (iOS 17+)

### Opacity Fade Based on Scroll Position

```swift
ScrollView {
    LazyVStack(spacing: 20) {
        ForEach(items) { item in
            ItemCard(item: item)
                .visualEffect { content, geometry in
                    let frame = geometry.frame(in: .scrollView)
                    let distance = min(0, frame.minY)
                    return content
                        .opacity(1 + distance / 200)
                }
        }
    }
}
```

### Parallax Header

```swift
ScrollView {
    VStack(spacing: 0) {
        Image("hero")
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(height: 300)
            .visualEffect { content, geometry in
                let offset = geometry.frame(in: .scrollView).minY
                return content
                    .offset(y: offset > 0 ? -offset * 0.5 : 0)
            }
            .clipped()

        ContentView()
    }
}
```

### Scroll-Based Header Visibility

Gate state updates by threshold to avoid per-pixel re-renders:

```swift
@State private var showHeader = true

ScrollView {
    content
        .background(
            GeometryReader { geometry in
                Color.clear
                    .preference(
                        key: ScrollOffsetKey.self,
                        value: geometry.frame(in: .named("scroll")).minY
                    )
            }
        )
}
.coordinateSpace(name: "scroll")
.onPreferenceChange(ScrollOffsetKey.self) { offset in
    // Only update when crossing threshold — not on every pixel
    if offset < -50 {
        withAnimation { showHeader = false }
    } else if offset > 50 {
        withAnimation { showHeader = true }
    }
}
```

## Pitfalls

- Avoid heavy custom layouts inside `List` rows — use `ScrollView` + `LazyVStack` instead
- Don't nest scroll views of the same axis — causes gesture conflicts
- Don't combine `List` and `ScrollView` in the same hierarchy without reason
- Avoid `AnyView` in list rows — breaks diffing optimisations
- Overuse of `LazyVStack` for tiny content adds unnecessary complexity
- Inline filtering in `ForEach` creates unstable identity and recomputes every time
- Avoid expensive inline transforms in `List`/`ForEach` initialisers
- Don't track scroll position into `@State` on every frame — gate by threshold
