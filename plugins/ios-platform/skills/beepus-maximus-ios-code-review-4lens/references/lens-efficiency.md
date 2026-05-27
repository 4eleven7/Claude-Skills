# Lens 3: Efficiency — Swift/SwiftUI Patterns

## Body Pollution

The `body` property (and any `@ViewBuilder` computed property) runs on every state change. Anything expensive in body is a per-frame cost.

### Formatter Creation in Body

```swift
// BAD — creates a new formatter every render
var body: some View {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    Text(formatter.string(from: date))
}

// GOOD — static formatter or FormatStyle
var body: some View {
    Text(date, format: .dateTime.month().day().year())
}

// GOOD — if custom format needed, use static
private static let dateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateStyle = .medium
    return f
}()
```

### Object Allocation in Body

```swift
// BAD — UUID and Date created every render
var body: some View {
    let id = UUID()  // new identity every frame
    Text("Created: \(Date())")  // new date every frame
}

// GOOD — stable values from state or model
var body: some View {
    Text("Created: \(item.createdAt, format: .dateTime)")
}
```

### Sorting, Filtering, Grouping in Body

```swift
// BAD — O(n log n) sort on every render
var body: some View {
    let sorted = items.sorted { $0.date > $1.date }
    ForEach(sorted) { item in ... }
}

// GOOD — sort in the data source or use a computed property with caching
// Option 1: @Query with sort descriptor
@Query(sort: \Item.date, order: .reverse) private var items: [Item]

// Option 2: computed property (acceptable for small collections)
private var sortedItems: [Item] {
    items.sorted { $0.date > $1.date }
}
```

**Note**: A computed property calling `.sorted()` still runs on each access, but it's cleaner than inline in ForEach and only runs once per body evaluation, not once per item.

## Query Patterns

### Over-Fetching

```swift
// BAD — fetching all items when only count needed
@Query private var items: [Item]

var body: some View {
    Text("\(items.count) items")  // loaded every Item into memory for a count
}

// GOOD — use a predicate-filtered query or count from client
Text("\(client.activeItemCount) items")
```

### Missing Predicates

```swift
// BAD — fetch all, filter in Swift
@Query private var allSessions: [SleepSession]

var todaySessions: [SleepSession] {
    allSessions.filter { Calendar.current.isDateInToday($0.startDate) }
}

// GOOD — push filter to the store
@Query(filter: #Predicate<SleepSession> { session in
    session.startDate >= Calendar.current.startOfDay(for: .now)
}) private var todaySessions: [SleepSession]
```

## Task Triggers

### Missing task(id:)

```swift
// BAD — .task runs once on appear, doesn't reload when selection changes
.task {
    await client.load(for: selectedDate)
}

// GOOD — re-triggers when id changes
.task(id: selectedDate) {
    await client.load(for: selectedDate)
}
```

### Unstable Task Identity

```swift
// BAD — Date() is never stable, task re-runs constantly
.task(id: Date()) {
    await refresh()
}

// GOOD — use a meaningful, stable trigger
.task(id: refreshTrigger) {
    await refresh()
}
```

## Missing Concurrency

### Sequential Awaits That Could Be Parallel

```swift
// BAD — sequential when loads are independent
let sleep = await sleepClient.fetchToday()
let activity = await activityClient.fetchToday()
let weight = await weightClient.fetchLatest()

// GOOD — parallel
async let sleep = sleepClient.fetchToday()
async let activity = activityClient.fetchToday()
async let weight = weightClient.fetchLatest()
let (s, a, w) = await (sleep, activity, weight)
```

**Flag when**: 2+ consecutive `await` calls to different services/clients with no data dependency between them.

## Hot-Path Allocations

### ForEach Body Allocations

```swift
// BAD — creating closures and objects per row per render
ForEach(items) { item in
    let action = { client.select(item) }  // closure allocated per row
    let vm = ItemViewModel(item: item)     // object per row per render
    ItemRow(viewModel: vm, onTap: action)
}

// GOOD — lightweight value passing
ForEach(items) { item in
    ItemRow(item: item, isSelected: client.selectedID == item.id)
        .onTapGesture { client.select(item) }
}
```

### Scroll/Animation Callbacks

```swift
// BAD — allocating in scroll callback
ScrollView {
    content
}
.onScrollGeometryChange(for: CGFloat.self) { geo in
    geo.contentOffset.y
} action: { old, new in
    let threshold = CGFloat(100)  // allocated per callback
    showHeader = new > threshold
}

// GOOD — use constant
private let headerThreshold: CGFloat = 100

// in body:
.onScrollGeometryChange(for: Bool.self) { geo in
    geo.contentOffset.y > headerThreshold
} action: { old, new in
    showHeader = new
}
```

## Eager Loading

### Non-Lazy Stacks for Collections

```swift
// BAD — VStack loads all items at once
ScrollView {
    VStack {
        ForEach(entries) { entry in  // 500 entries all in memory
            EntryRow(entry: entry)
        }
    }
}

// GOOD — lazy loading
ScrollView {
    LazyVStack(spacing: 0) {
        ForEach(entries) { entry in
            EntryRow(entry: entry)
        }
    }
}
```

**Threshold**: Flag non-lazy stacks when the data source could contain 20+ items.

### Loading Full Objects for Summary Display

```swift
// BAD — fetching full SleepSession objects to show a count
@Query private var sessions: [SleepSession]  // loads all properties, relationships

var body: some View {
    Text("You've logged \(sessions.count) sessions")
}

// GOOD — count from client or lightweight query
Text("You've logged \(client.sessionCount) sessions")
```

## Impact Classification

Use these guidelines for the `impact` field:

| Impact | Criteria |
|--------|----------|
| **high** | Runs per-frame in body, affects scroll performance, or creates O(n) work per render |
| **medium** | Runs on state change but not per-frame, or creates unnecessary network/disk work |
| **low** | One-time cost (on appear), small collection, or preview-only code |
