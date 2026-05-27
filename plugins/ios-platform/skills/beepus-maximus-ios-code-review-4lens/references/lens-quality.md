# Lens 2: Quality — Swift/SwiftUI Patterns

## Redundant State

The most common quality issue in SwiftUI code. State that shouldn't exist.

### @State on Derived Values

```swift
// BAD — redundant state derived from other state
@State private var isFormValid: Bool = false

var body: some View {
    Form { ... }
        .onChange(of: name) { isFormValid = !name.isEmpty && !email.isEmpty }
        .onChange(of: email) { isFormValid = !name.isEmpty && !email.isEmpty }
}

// GOOD — computed property, no state needed
private var isFormValid: Bool {
    !name.isEmpty && !email.isEmpty
}
```

### @State on Passed Values

```swift
// BAD — copying parent value into local state
struct DetailView: View {
    @State private var title: String  // copies on init, never syncs

    init(item: Item) {
        _title = State(initialValue: item.title)
    }
}

// GOOD — read from the source
struct DetailView: View {
    let item: Item

    var body: some View {
        Text(item.title)
    }
}
```

### Cached Values That Could Be Computed

```swift
// BAD — caching what @Query already provides
@Query private var items: [Item]
@State private var itemCount: Int = 0

var body: some View {
    Text("\(itemCount) items")
        .onChange(of: items.count) { itemCount = items.count }
}

// GOOD — use directly
@Query private var items: [Item]

var body: some View {
    Text("\(items.count) items")
        .monospacedDigit()
}
```

## Observation Issues

### @Observable Missing @MainActor

```swift
// BAD — @Observable without actor isolation
@Observable
class ProfileClient {
    var entries: [Entry] = []
    var isLoading = false
}

// GOOD — MainActor isolation for UI-bound observable
@MainActor @Observable
class ProfileClient {
    var entries: [Entry] = []
    var isLoading = false
}
```

### Broad Observation in Lists

```swift
// BAD — entire client passed to each row, all rows invalidate on any change
ForEach(client.items) { item in
    ItemRow(client: client, item: item)  // reads client.selectedID too
}

// GOOD — pass only what the row needs
ForEach(client.items) { item in
    ItemRow(
        item: item,
        isSelected: client.selectedID == item.id,
        onTap: { client.select(item.id) }
    )
}
```

### Missing @ObservationIgnored

```swift
// BAD — property wrapper inside @Observable without ignore
@Observable
class LocationClient {
    @AppStorage("lastVenue") var lastVenue: String = ""  // triggers spurious observation
}

// GOOD
@Observable
class LocationClient {
    @ObservationIgnored @AppStorage("lastVenue") var lastVenue: String = ""
}
```

## Parameter Sprawl

View inits that keep growing instead of using a model or environment.

```swift
// BAD — parameter sprawl
struct MetricCard: View {
    let title: String
    let value: Double
    let unit: String
    let trend: Trend
    let trendPeriod: String
    let icon: String
    let iconColor: Color
    let showSparkline: Bool
    let sparklineData: [Double]
}

// GOOD — use a model
struct MetricCard: View {
    let metric: DashboardMetric

    var body: some View {
        // access metric.title, metric.value, etc.
    }
}
```

**Threshold**: Flag when a view init has 6+ parameters that all come from the same domain object.

## Copy-Paste With Variation

Near-duplicate views that should be unified.

```swift
// BAD — two views that differ only in icon and label
struct MetricEntryRow: View {
    let entry: Entry
    var body: some View {
        HStack {
            Image(systemName: "scalemass")
            VStack(alignment: .leading) {
                Text(entry.value, format: .number)
                Text(entry.date, format: .dateTime)
            }
            Spacer()
        }
    }
}

struct BodyFatRow: View {
    let entry: BodyFat
    var body: some View {
        HStack {
            Image(systemName: "percent")
            VStack(alignment: .leading) {
                Text(entry.value, format: .number)
                Text(entry.date, format: .dateTime)
            }
            Spacer()
        }
    }
}

// GOOD — unified with protocol or generic
struct MeasurementRow<M: Measurement>: View {
    let entry: M
    var body: some View {
        HStack {
            Image(systemName: M.iconName)
            VStack(alignment: .leading) {
                Text(entry.value, format: .number)
                Text(entry.date, format: .dateTime)
            }
            Spacer()
        }
    }
}
```

**Threshold**: Flag when two view bodies share 70%+ structure with only data/styling differences.

## Leaky Abstractions

### Business Logic in Views

```swift
// BAD — filtering and sorting in view body
var body: some View {
    let activeItems = items.filter { $0.status == .active && $0.date > Calendar.current.startOfDay(for: .now) }
    let sorted = activeItems.sorted { $0.priority.rawValue > $1.priority.rawValue }
    List(sorted) { item in ... }
}

// GOOD — client or model owns the logic
var body: some View {
    List(client.activeItemsByPriority) { item in ... }
}
```

### Repository Internals in Views

```swift
// BAD — view knows about ModelContext
struct ItemList: View {
    @Environment(\.modelContext) private var context

    func deleteItem(_ item: Item) {
        context.delete(item)
        try? context.save()
    }
}

// GOOD — view calls client method
struct ItemList: View {
    let client: ItemClient

    func deleteItem(_ item: Item) {
        client.delete(item)
    }
}
```

## Stringly-Typed Code

```swift
// BAD — raw strings where enums exist
func setCategory(_ category: String) {
    if category == "workout" { ... }
    else if category == "meal" { ... }
}

// GOOD — use the enum
func setCategory(_ category: ActivityCategory) {
    switch category {
    case .workout: ...
    case .meal: ...
    }
}
```

Also flag: notification names as strings when `Notification.Name` constants exist, UserDefaults keys as strings when an enum or `@AppStorage` with a constant key exists.
