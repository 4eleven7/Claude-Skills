# Performance

## 7 Code Smells

### 1. Expensive Formatters in `body`

```swift
// BAD — allocates on every body evaluation
var body: some View {
    let formatter = NumberFormatter()
    let measure = MeasurementFormatter()
    Text(measure.string(from: .init(value: meters, unit: .meters)))
}

// GOOD — use Text format or cached formatter
Text(100, format: .currency(code: "USD"))
Text(Date.now, format: .dateTime.day().month().year())

// GOOD — shared formatter when Format API insufficient
final class DistanceFormatter {
    static let shared = DistanceFormatter()
    let formatter = MeasurementFormatter()
}
```

### 2. Heavy Computed Properties

```swift
// BAD — runs on every body evaluation
var filtered: [Item] {
    items.filter { $0.isEnabled }  // O(n) each time
}

// GOOD — precompute on change
@State private var filtered: [Item] = []

.onChange(of: items) { _, newItems in
    filtered = newItems.filter { $0.isEnabled }
}

// GOOD — compute in the model/client layer
// client.enabledItems is already filtered
```

Do not cache in `@State` without explicit invalidation logic — it creates stale mirrors. Prefer computing at the source of change.

### 3. Sorting in `body`

```swift
// BAD — sorts on every redraw
List {
    ForEach(items.sorted(by: sortRule)) { item in
        Row(item)
    }
}

// GOOD — sort once, store result
let sortedItems: [Item]  // computed before body
```

### 4. Inline ForEach Filtering

```swift
// BAD — unstable identity, recomputes every time
ForEach(items.filter { $0.isEnabled }) { item in
    Row(item)
}

// GOOD — prefiltered collection with stable identity
ForEach(enabledItems) { item in
    Row(item)
}
```

### 5. Unstable Identity

```swift
// BAD — identity changes when order changes
ForEach(items, id: \.self) { item in Row(item) }
ForEach(items.indices, id: \.self) { i in Row(items[i]) }

// GOOD — stable domain ID
ForEach(items) { item in Row(item) }  // Identifiable
```

Also: never allocate `UUID()` in `body` — generates new IDs each evaluation.

### 6. Top-Level Conditional View Swapping

```swift
// BAD — root identity churn
var body: some View {
    if isEditing { editingView } else { readOnlyView }
}

// GOOD — stable base, localised conditions
var body: some View {
    List { content }
        .toolbar { if isEditing { editToolbar } }
        .disabled(!isEditing)
}
```

### 7. Main-Thread Image Decoding

```swift
// BAD — blocks main thread
Image(uiImage: UIImage(data: data)!)

// GOOD — decode/downsample off main thread
.task {
    decodedImage = await ImageDecoder.downsample(data: data, maxPixels: 300)
}
```

## Broad Dependencies

The most impactful performance problem. A view that reads a large `@Observable` model re-evaluates when any property changes.

```swift
// BAD — row re-evaluates when ANY model property changes
struct Row: View {
    @Environment(BigModel.self) private var model

    var body: some View {
        Text(model.items[index].name)
    }
}

// GOOD — narrow per-item data
struct Row: View {
    let name: String  // only what the row needs
}
```

For lists, consider per-item `@Observable` state objects to narrow the dependency scope.

## Diagnostic Workflow

### Step 1: Code Review

Check for the 7 code smells above. Most problems are visible in the source.

### Step 2: Runtime Debugging

```swift
// Add temporarily to suspect views
var body: some View {
    let _ = Self._printChanges()  // prints which property triggered the redraw
    // ... view content
}
```

### Step 3: SwiftUI Instrument Diagnostic Protocol (30 minutes)

Before guessing at fixes, run a structured diagnostic using Instruments:

**Setup (5 min):**
1. Build a **Release** configuration archive
2. Profile on a **real device** (Simulator is not representative)
3. Open Instruments → **SwiftUI** template (Instruments 26+)
4. Prepare the exact interaction to reproduce

**Capture (5 min):**
1. Start recording
2. Reproduce the problematic interaction 3 times
3. Stop recording

**Analyse with Cause & Effect Graph (15 min):**
The SwiftUI Instrument in Instruments 26 provides a **Cause & Effect Graph** that traces data flow:
1. Select a slow body evaluation in the timeline
2. Open the Cause & Effect Graph (bottom panel)
3. Trace backward: what property change triggered this evaluation?
4. Trace forward: what downstream views were invalidated?
5. Identify the root cause — usually a broad dependency or unnecessary state change

**Key signals:**
- **Long body updates** (>4ms) → expensive work in body, or too many child views
- **Unnecessary updates** → view re-evaluated but produced identical output (broad dependency)
- **Hitch** → frame deadline missed, causing visible stutter (>16.67ms for 60fps)

**Decide (5 min):**
- If broad dependency → narrow it (pass specific values, per-item @Observable)
- If expensive body → move work out (formatter caching, precomputed state)
- If layout thrash → simplify hierarchy, replace GeometryReader with onGeometryChange
- If no clear signal → the performance is likely acceptable; don't optimise speculatively

**iOS 26 Automatic Improvements:**
iOS 26 delivers significant SwiftUI performance improvements for free:
- **6x faster** List/ForEach loading for large datasets
- **16x faster** view updates in common patterns
- **Improved scrolling** with automatic prefetching
These apply automatically — no code changes needed. Test on iOS 26 before investing in manual optimisation for older issues.

### Step 4: Fix Priority

1. **Narrow dependencies** — biggest impact, fix first
2. **Stabilise identity** — prevents state resets and lifecycle churn
3. **Move work out of body** — formatters, sorting, filtering
4. **Use lazy stacks** — for large collections
5. **Downsample images** — decode off main thread
6. **Equatable wrappers** — only after fixing fundamentals

## Additional Performance Rules

- Pass only needed values to views (avoid large config objects)
- Check for value changes before assigning state in hot paths (`guard newValue != oldValue`)
- Avoid redundant state updates in `onReceive`, `onChange`, scroll handlers
- Use `LazyVStack`/`LazyHStack` for large lists; eager stacks for small, fixed content
- Ensure constant number of views per ForEach element
- Avoid `AnyView` in list rows — prevents diffing optimisations
- Gate frequent geometry updates by thresholds
- `Shape.path()`, `visualEffect`, `Layout`, and `onGeometryChange` closures may run off main thread — capture values instead of accessing `@MainActor` state
- Prefer transforms (`offset`, `scale`, `rotation`) over layout changes (`frame`) for animation performance
- If `ScrollView` has an opaque, static background, use `scrollContentBackground(.visible)` for scroll-edge efficiency
- Avoid storing escaping `@ViewBuilder` closures — store built view results instead
- Keep view `init` as small as possible — flag non-trivial work that can move to `.task()`

## Image Optimisation

### AsyncImage Phase Handling

```swift
AsyncImage(url: imageURL) { phase in
    switch phase {
    case .empty:
        ZStack {
            Color.gray.opacity(0.2)
            ProgressView()
        }
    case .success(let image):
        image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .transition(.opacity)
    case .failure:
        ZStack {
            Color.gray.opacity(0.2)
            Image(systemName: "exclamationmark.triangle")
                .foregroundStyle(.secondary)
        }
    @unknown default:
        EmptyView()
    }
}
.clipShape(.rect(cornerRadius: 12))
```

### Off-Thread Downsampling

When displaying large images at smaller sizes (lists, grids, galleries), downsample off the main thread:

```swift
actor ImageProcessor {
    func downsample(data: Data, to targetSize: CGSize) -> UIImage? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil) else { return nil }

        let maxDimension = max(targetSize.width, targetSize.height) * UIScreen.main.scale
        let options: [CFString: Any] = [
            kCGImageSourceThumbnailMaxPixelSize: maxDimension,
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCache: false
        ]

        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
```

Usage in a view:

```swift
struct OptimisedImageView: View {
    let imageData: Data
    let targetSize: CGSize
    @State private var image: UIImage?
    private let processor = ImageProcessor()

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            } else {
                ProgressView()
            }
        }
        .task {
            image = await processor.downsample(data: imageData, to: targetSize)
        }
    }
}
```

### UIImage Caching Trap

`UIImage(named:)` caches in the system cache — memory builds up when loading many images (galleries, sliders). For single-use or frequently rotated images, bypass the cache:

```swift
// Caches in system cache — memory builds up
let image = UIImage(named: "Wallpapers/image_001")

// No system caching — memory stays flat
guard let path = Bundle.main.path(forResource: "image_001", ofType: "jpg") else { return nil }
let image = UIImage(contentsOfFile: path)
```

### Bounded NSCache

When processing images (resizing, filtering), use `NSCache` with `countLimit` instead of the system cache:

```swift
struct ImageCache {
    private let cache = NSCache<NSString, UIImage>()

    init(countLimit: Int = 50) {
        cache.countLimit = countLimit
    }

    subscript(key: String) -> UIImage? {
        get { cache.object(forKey: key as NSString) }
        nonmutating set {
            if let newValue {
                cache.setObject(newValue, forKey: key as NSString)
            } else {
                cache.removeObject(forKey: key as NSString)
            }
        }
    }
}

## Equatable Views

SwiftUI diffs the view tree each evaluation. Conforming a view to `Equatable` lets the framework skip `body` entirely when the inputs haven't changed.

### When to Use

- List rows with many properties where the default per-property diff is measurable
- Views that receive frequently-changing parent state but only care about a subset
- After profiling confirms redundant body evaluations (use `Self._printChanges()`)
- Airbnb measured a **15% scroll hitch reduction** by conforming design system views to `Equatable`

Do **not** reach for `Equatable` before fixing broad dependencies and identity issues — it is a refinement, not a first resort. Do not blanket-apply to every view — profile first, apply where measured.

### Implementation

```swift
struct MetricRow: View, Equatable {
    let title: String
    let value: Double
    let unit: String

    // Only needed when you want to ignore certain properties
    static func == (lhs: MetricRow, rhs: MetricRow) -> Bool {
        lhs.title == rhs.title && lhs.value == rhs.value && lhs.unit == rhs.unit
    }

    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value, format: .number) + Text(" \(unit)")
        }
    }
}
```

Apply `.equatable()` at the call site to opt in:

```swift
ForEach(metrics) { metric in
    MetricRow(title: metric.title, value: metric.value, unit: metric.unit)
        .equatable()
}
```

### POD Views (Plain Old Data)

Views whose stored properties are all value types with trivial `Equatable` conformance (String, Int, Double, Bool, enum, UUID, Date) are POD views. SwiftUI can compare them with `memcmp` — the fastest possible diff path.

Rules for POD views:
- All properties are value types (no classes, closures, or `@Observable` references)
- No `@Environment`, `@Binding`, or other property wrappers that wrap reference types
- Conforming to `Equatable` is free — the compiler synthesises it

```swift
// POD view — memcmp-eligible, zero-cost diffing
struct StatLabel: View, Equatable {
    let label: String
    let value: Int
    let isHighlighted: Bool

    var body: some View {
        Text("\(label): \(value)")
            .foregroundStyle(isHighlighted ? .primary : .secondary)
    }
}
```

When a view takes a closure (action handler), it can no longer be POD. Move the closure to the parent and pass only data:

```swift
// NOT POD — closure prevents memcmp
struct ActionRow: View {
    let title: String
    let onTap: () -> Void  // breaks POD
}

// POD — parent handles action via ForEach index or ID
struct ActionRow: View, Equatable {
    let title: String
    let isSelected: Bool
}
```

## View Diffing Internals

Understanding how SwiftUI compares views helps write faster code. SwiftUI uses three comparison strategies, from fastest to slowest:

### Comparison Strategy Table

| View Type | Strategy | Speed | Notes |
|---|---|---|---|
| POD (all value-type stored properties, no property wrappers) | `memcmp` — raw byte comparison | Fastest | No `==` call overhead |
| `Equatable`-conforming view | `==` operator | Fast | Custom equality; can skip expensive properties |
| Non-POD, non-Equatable | Reflection | Slowest | Walks each property via Mirror; allocates |

### The POD Wrapper Trick

When an expensive non-POD view can't be made POD (e.g., it takes a closure or `@Observable` reference), wrap it in a parent that only has `let` value-type properties. The parent becomes POD and gets `memcmp` diffing:

```swift
// PROBLEM — closure breaks POD, forces reflection
struct ExpensiveRow: View {
    let title: String
    let onTap: () -> Void  // non-POD: closure

    var body: some View {
        Button(title, action: onTap)
    }
}

// SOLUTION — POD wrapper, parent controls action via ID
struct ExpensiveRowWrapper: View, Equatable {
    let title: String
    let itemID: UUID  // POD: all value types

    var body: some View {
        Text(title)
    }
}
```

Alternative: move the closure to the parent and pass only data to the row. This is the preferred pattern for list rows.

### Escaping Closure Anti-Pattern

Custom container views that store `@ViewBuilder` closures as `() -> Content` prevent SwiftUI from diffing the content efficiently. Closures have no stable equality — SwiftUI falls back to re-evaluating the closure on every pass.

```swift
// BAD — stores escaping closure, no stable equality for diffing
struct Card<Content: View>: View {
    let content: () -> Content  // escaping closure

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        VStack { content() }
            .padding()
            .background(.background)
    }
}

// GOOD — evaluates closure immediately, stores the result
struct Card<Content: View>: View {
    let content: Content  // concrete view value

    init(@ViewBuilder content: () -> Content) {
        self.content = content()  // evaluate immediately
    }

    var body: some View {
        VStack { content }
            .padding()
            .background(.background)
    }
}
```

### ForEach Identity Pitfalls

```swift
// CRASHES — .indices makes content static; mutating the array crashes
ForEach(items.indices, id: \.self) { i in
    Row(items[i])
}

// BAD — .self on non-Identifiable creates unstable identity
ForEach(items, id: \.self) { item in
    Row(item)
}

// GOOD — stable domain ID via Identifiable conformance
ForEach(items) { item in
    Row(item)
}
```

Using `.indices` with `ForEach` makes the content static at creation time. If the array mutates later, SwiftUI crashes because it still references the original index range.

### Debugging Tools

```swift
// Print which property triggered a view re-evaluation
var body: some View {
    let _ = Self._printChanges()
    // ... view content
}

// Check if a view type is POD (memcmp-eligible)
// Returns true for views with only value-type stored properties
let _ = Self._isPOD()
```

Both are private SwiftUI APIs useful during development. Remove before shipping.

## Skeleton Loading

Use `.redacted(reason: .placeholder)` to show skeleton screens while content loads. SwiftUI replaces text and images with rounded placeholder shapes automatically.

### Basic Pattern

```swift
struct ProfileView: View {
    let profile: Profile?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(profile?.name ?? "Placeholder Name")
                .font(.title2)
            Text(profile?.bio ?? "This is a placeholder bio that spans two lines for layout")
                .font(.body)
                .foregroundStyle(.secondary)
        }
        .redacted(reason: profile == nil ? .placeholder : [])
    }
}
```

### Custom Unredaction

Mark elements that should remain visible during loading (spinners, icons) with `.unredacted()`:

```swift
VStack {
    ProgressView()
        .unredacted()  // always visible
    Text(status ?? "Loading content")
    Text(detail ?? "Placeholder detail text here")
}
.redacted(reason: isLoading ? .placeholder : [])
```

### Shimmer Effect

Pair with a shimmer animation for polish:

```swift
extension View {
    func shimmer(isActive: Bool) -> some View {
        self
            .redacted(reason: isActive ? .placeholder : [])
            .opacity(isActive ? 0.6 : 1)
            .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: isActive)
    }
}

// Usage
ProfileCard(profile: profile)
    .shimmer(isActive: profile == nil)
```

### Rules

- Design placeholder content with realistic dimensions — use representative text, not empty strings
- Apply `.redacted` at the container level, not individual views
- Transition from redacted to loaded with `.animation` for smooth reveal
- Prefer skeleton screens over spinners for content-heavy screens (lists, cards, profiles)
- Use spinners for actions (save, submit) and full-screen initial loads
