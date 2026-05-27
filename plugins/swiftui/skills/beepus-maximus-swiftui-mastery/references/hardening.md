# Hardening

Stress test SwiftUI views and features for production readiness. Designs that only work with perfect data aren't production-ready.

## Extreme Content Testing

### Text Overflow
Every `Text` view must handle extreme lengths gracefully.

Test with:
- Single character ("A")
- 200+ character strings
- Emoji-heavy strings ("🏋️‍♂️💪🏃‍♀️🧘‍♂️")
- Mixed scripts ("Hello مرحبا こんにちは")
- No text (empty string)

```swift
// GOOD — handles overflow
Text(name)
    .lineLimit(2)
    .truncationMode(.tail)

// GOOD — multiline with constraint
Text(description)
    .lineLimit(3...)  // grows but bounded
    .fixedSize(horizontal: false, vertical: true)

// BAD — no limit, can blow up layout
Text(userInput)  // unbounded
```

### Dynamic Type at Extremes
Test every screen at `AX5` (maximum accessibility size):
- Do elements overlap?
- Does text truncate meaningfully or become unreadable?
- Do scroll views accommodate expanded content?
- Are `@ScaledMetric` values reasonable at extreme sizes?

```swift
// Preview at largest accessibility size
#Preview("AX5") {
    MyView()
        .dynamicTypeSize(.accessibility5)
}

// Also test smallest
#Preview("XS") {
    MyView()
        .dynamicTypeSize(.xSmall)
}
```

### Numbers and Data
- Zero values: 0 items, 0.0 score, empty arrays
- Large values: 999,999 or 1,000,000+
- Negative values (if possible in domain)
- Decimal precision: 3.14159265358979...
- Currency: different locales format differently

```swift
// GOOD — handles all cases
Text(count, format: .number)
    .monospacedDigit()

// GOOD — explicit zero state
if items.isEmpty {
    ContentUnavailableView("No Items", systemImage: "tray")
} else {
    ForEach(items) { item in ... }
}
```

## State Edge Cases

### Loading States
Every async operation needs three states:

```swift
enum LoadState<T> {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}

// Every screen must handle all four
switch loadState {
case .idle:
    Color.clear  // or initial prompt
case .loading:
    ProgressView()
case .loaded(let data):
    ContentView(data: data)
case .failed(let error):
    ContentUnavailableView {
        Label("Couldn't Load", systemImage: "exclamationmark.triangle")
    } description: {
        Text(error.localizedDescription)
    } actions: {
        Button("Retry") { Task { await load() } }
    }
}
```

### Empty States
Never show a blank screen. Always provide:
1. What would be here (icon + explanation)
2. Why it's empty (if not obvious)
3. How to populate it (action button)

```swift
// GOOD
ContentUnavailableView(
    "No Workouts",
    systemImage: "figure.run",
    description: Text("Start tracking to see your workout history.")
)

// BAD
Text("No items")
    .foregroundStyle(.secondary)
```

### Error States
- Network failure → retry button + explanation
- Validation error → inline near the field, not alert
- Permission denied → explain what's needed + Settings link
- Data corruption → graceful degradation, not crash

```swift
// Network error with retry
ContentUnavailableView {
    Label("Connection Lost", systemImage: "wifi.slash")
} description: {
    Text("Check your connection and try again.")
} actions: {
    Button("Retry") { Task { await refresh() } }
}
```

### Concurrent Operations
- Double-tap prevention: disable button during async work
- Race conditions: `.task(id:)` cancels previous tasks automatically
- Optimistic updates: update UI immediately, rollback on failure

```swift
// Double-tap prevention
Button("Save") {
    Task { await save() }
}
.disabled(isSaving)

// Task cancellation on new input
.task(id: searchText) {
    try? await Task.sleep(for: .milliseconds(300))
    guard !Task.isCancelled else { return }
    await search(searchText)
}
```

## Internationalisation Hardening

### Text Expansion
German and Finnish can be 30-40% longer than English. Russian and Arabic vary differently. Never use fixed-width text containers.

```swift
// BAD — fixed width breaks with translations
Text(label)
    .frame(width: 80)

// GOOD — adapts to content
Text(label)
    .fixedSize(horizontal: true, vertical: false)

// GOOD — truncates gracefully
Text(label)
    .lineLimit(1)
    .truncationMode(.tail)
```

### Right-to-Left (RTL)
SwiftUI handles most RTL automatically, but watch for:
- Custom `HStack` layouts with hardcoded `.leading`/`.trailing`
- Manual `offset(x:)` values that assume LTR
- Icons that imply direction (arrows, progress)

```swift
// Test RTL
#Preview("RTL") {
    MyView()
        .environment(\.layoutDirection, .rightToLeft)
}
```

### Date and Number Formatting
Always use formatters — never manual string interpolation for dates, numbers, or currency.

```swift
// GOOD — respects locale
Text(date, format: .dateTime.month().day())
Text(price, format: .currency(code: "USD"))
Text(count, format: .number)

// BAD — locale-unaware
Text("\(month)/\(day)")
Text("$\(price)")
Text("\(count) items")  // pluralisation broken
```

### Pluralisation
Use String Catalogs with automatic plural rules:

```swift
// In Localizable.xcstrings, define plural variants
Text("^[\(count) item](inflect: true)")
```

## App Lifecycle Hardening

### Background/Foreground Transitions
- Data refreshes on foreground: `.task` + `scenePhase`
- In-progress operations survive backgrounding
- UI state preserved across background cycles

```swift
@Environment(\.scenePhase) private var scenePhase

.onChange(of: scenePhase) { _, newPhase in
    if newPhase == .active {
        Task { await refreshIfStale() }
    }
}
```

### Low Memory
- Images use appropriate resolution (not 4K for thumbnails)
- Large collections use `LazyVStack` / `LazyVGrid`
- Caches have eviction policies
- No strong reference cycles in closures

### Interrupted Operations
- Network request during airplane mode toggle
- Save during app termination
- Form submission during incoming call
- Photo capture during low battery warning

## Device Variation

### Screen Sizes
Test on:
- iPhone SE (smallest current)
- iPhone 16 Pro Max (largest)
- iPad (if universal app)
- Landscape orientation

```swift
// Preview at multiple sizes
#Preview("SE") {
    MyView()
        .previewDevice("iPhone SE (3rd generation)")
}
```

### Dark Mode
Every screen must work in both modes:
- No hardcoded colours (use semantic or asset catalogue)
- Images/icons visible in both modes
- Sufficient contrast in both modes

```swift
#Preview("Dark") {
    MyView()
        .preferredColorScheme(.dark)
}
```

## Hardening Checklist

### Content
- [ ] All `Text` views handle empty, short, and very long strings
- [ ] Numbers formatted with locale-aware formatters
- [ ] Dates use `format:` parameter, not string interpolation
- [ ] Pluralisation uses String Catalogs or `inflect: true`
- [ ] Images have fallback for missing/failed loads

### States
- [ ] Every async operation has loading, loaded, and error states
- [ ] Empty states use `ContentUnavailableView` with action
- [ ] Error states offer retry or guidance
- [ ] Buttons disabled during async operations (double-tap prevention)
- [ ] `.task(id:)` used to cancel stale requests

### Layout
- [ ] No fixed widths on text containers
- [ ] Tested at Dynamic Type `.accessibility5`
- [ ] Tested at Dynamic Type `.xSmall`
- [ ] Tested in RTL layout direction
- [ ] Tested in landscape orientation
- [ ] Tested in dark mode

### Lifecycle
- [ ] Refreshes stale data on foreground return
- [ ] Handles interrupted operations gracefully
- [ ] No strong reference cycles in closures
- [ ] Large collections use lazy containers
