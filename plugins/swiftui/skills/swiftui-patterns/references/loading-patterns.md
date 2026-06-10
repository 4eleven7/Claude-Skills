# Loading Patterns (HIG)

## Core Rule

Make content appear as quickly as possible. If loading takes time, show meaningful progress — not empty screens.

## Decision Tree

```
How long is the wait?
├── < 0.5s → Show nothing (instant feel)
├── 0.5-2s → Placeholder / skeleton screen
├── 2-10s → Progress indicator (determinate if possible)
└── > 10s → Progress indicator + explanation + cancel option
```

## Skeleton Screens (Preferred)

Show the shape of content before data loads. Better than spinners because it sets expectations about the layout.

```swift
struct SkeletonRow: View {
    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(.quaternary)
                .frame(width: 48, height: 48)
            VStack(alignment: .leading, spacing: 6) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(.quaternary)
                    .frame(width: 120, height: 14)
                RoundedRectangle(cornerRadius: 4)
                    .fill(.quaternary)
                    .frame(width: 80, height: 12)
            }
            Spacer()
        }
        .redacted(reason: .placeholder)  // Or manual shapes
    }
}
```

### Shimmer Effect

```swift
struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [.clear, .white.opacity(0.3), .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .offset(x: phase)
                .mask(content)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 300
                }
            }
    }
}
```

## Progress Indicators

### Indeterminate (Unknown Duration)

```swift
ProgressView()                    // Spinning wheel
ProgressView("Loading…")          // With label
```

Use when: duration is unknown, network requests, initial data fetch.

### Determinate (Known Progress)

```swift
ProgressView(value: 0.65)                        // Bar
ProgressView(value: bytesDownloaded, total: totalBytes)
ProgressView("Importing…", value: 3, total: 10)  // With label
```

Use when: file upload/download, multi-step processing, data import/export.

## Pull to Refresh

```swift
List(items) { item in
    ItemRow(item: item)
}
.refreshable {
    await loadLatestData()
}
```

- Data should appear to update immediately (optimistic UI)
- Don't show a full-screen spinner on refresh — only the pull indicator

## Background Loading

- Load data incrementally — show what you have, then fill in more
- Cache aggressively — show cached content immediately, then refresh in background
- Use `.task` to start loading when the view appears
- Paginate lists — load 20-50 items, then load more on scroll

## Async Image

```swift
AsyncImage(url: imageURL) { phase in
    switch phase {
    case .empty:
        ProgressView()
    case .success(let image):
        image.resizable().aspectRatio(contentMode: .fill)
    case .failure:
        Image(systemName: "photo").foregroundStyle(.secondary)
    @unknown default:
        EmptyView()
    }
}
```

## What NOT to Do

- Don't show a blank white screen while loading
- Don't block the entire UI — let users interact with what's already loaded
- Don't use indeterminate spinners when you know the progress
- Don't hide the back button during loading — let users cancel
- Don't reload everything on every appearance — cache smartly
- Don't show loading for < 0.5s operations — it feels slower than no indicator
