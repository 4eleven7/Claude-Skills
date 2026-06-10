# State Management

## Property Wrapper Selection Matrix

| Scenario | Wrapper | Why |
|----------|---------|-----|
| View-local toggle, counter, draft text | `@State private var` | View owns it, SwiftUI preserves across redraws |
| View owns an `@Observable` class | `@State private var model = MyModel()` | Without `@State`, parent redraw recreates instance |
| Child writes parent's value | `@Binding var` | Two-way connection to parent's `@State` |
| Child displays parent's value | `let` | Simplest — no overhead, no write contract |
| Child reacts to value changes | `var` + `.onChange()` | Read-only but triggers side effects on change |
| Injected `@Observable` needing bindings | `@Bindable var` | iOS 17+ — enables `$model.property` syntax |
| Shared state across the tree | `@Environment(MyType.self)` | Read at container boundaries, pass narrow values down |
| System values (colorScheme, dismiss) | `@Environment(\.key)` | Provided by SwiftUI |
| Legacy: view owns `ObservableObject` | `@StateObject private var` | Prefer `@Observable` + `@State` for new code |
| Legacy: view receives `ObservableObject` | `@ObservedObject var` | Never create inline — recreates every redraw |

## MV (Model-View) Pattern

Default to MV: views are lightweight state expressions, models and services own logic.

```swift
// The view multi-agent-implementations — no view model needed
struct WorkoutView: View {
    @Environment(WorkoutClient.self) private var client
    @State private var selectedDate = Date.now

    var body: some View {
        List(client.workouts(for: selectedDate)) { workout in
            WorkoutRow(workout: workout)
        }
        .task(id: selectedDate) {
            await client.loadWorkouts(for: selectedDate)
        }
    }
}
```

Introduce a view model only when existing code already has one. If one exists, make it non-optional:

```swift
@State private var viewModel: SomeViewModel

init(dependency: Dependency) {
    _viewModel = State(initialValue: SomeViewModel(dependency: dependency))
}
```

## @Observable Rules

```swift
@Observable
@MainActor  // Required unless project uses default MainActor isolation
final class DataModel {
    var name = ""
    var count = 0

    // Property wrappers MUST use @ObservationIgnored
    @ObservationIgnored @AppStorage("theme") var theme = "light"
}
```

Key rules:
- Mark `@Observable` classes `@MainActor` for thread safety
- Use `@ObservationIgnored` on `@AppStorage`, `@SceneStorage`, `@Query` inside `@Observable` — they conflict with the macro's property transformation
- **`@AppStorage` inside `@Observable` breaks observation tracking.** The `@Observable` macro rewrites stored properties to use `_$observationRegistrar` access tracking. `@AppStorage` is itself a property wrapper that manages its own storage via `UserDefaults`. When both macros transform the same property, `@Observable`'s tracking is silently bypassed — views that read the property won't re-evaluate when it changes. Always wrap with `@ObservationIgnored` and bridge manually:

```swift
@Observable
@MainActor
final class Settings {
    // WRONG — observation silently broken, views won't update
    @AppStorage("theme") var theme = "light"

    // CORRECT — observation works, UserDefaults synced manually
    @ObservationIgnored @AppStorage("theme") private var _theme = "light"
    var theme: String {
        get { access(keyPath: \.theme); return _theme }
        set { withMutation(keyPath: \.theme) { _theme = newValue } }
    }
}
```

- `@Observable` handles nested objects fine; legacy `ObservableObject` does not

## Data Flow Rules

**Never pass values as `@State`** — they accept an initial value and ignore parent updates:

```swift
// WRONG — child shows stale data forever
struct ChildView: View {
    @State var item: Item  // Ignores parent updates!
}

// CORRECT
struct ChildView: View {
    let item: Item
}
```

**Never use `Binding(get:set:)` in body** — use `@State` + `.onChange()`:

```swift
// WRONG
TextField("Name", text: Binding(
    get: { model.name },
    set: { model.name = $0; model.save() }
))

// CORRECT
TextField("Name", text: $model.name)
    .onChange(of: model.name) { model.save() }
```

**Read environment at container boundaries**, pass narrow values down:

```swift
// Container reads the client
struct TimelineView: View {
    @Environment(TimelineClient.self) private var client

    var body: some View {
        TimelineList(items: client.items)  // Pass narrow data
    }
}

// Rendering view takes plain values — easy to preview
struct TimelineList: View {
    let items: [TimelineItem]
}
```

## View Ordering Convention

Organise view properties top to bottom:

```swift
struct ExampleView: View {
    // 1. Environment
    @Environment(\.dismiss) private var dismiss
    @Environment(DataClient.self) private var client

    // 2. let / public properties
    let title: String

    // 3. @State / stored properties
    @State private var isExpanded = false

    // 4. Computed var (non-view)
    private var subtitle: String { "Count: \(client.count)" }

    // 5. init (if needed)

    // 6. body
    var body: some View { /* ... */ }

    // 7. View builders
    private var header: some View { /* ... */ }

    // 8. Helper / async functions
    private func refresh() async { /* ... */ }
}
```

## Custom Environment Values

Use the `@Entry` macro (Xcode 16+, backward-compatible to iOS 13):

```swift
extension EnvironmentValues {
    @Entry var accentTheme: Theme = .default
}

// Inject
ContentView().environment(\.accentTheme, customTheme)

// Access
@Environment(\.accentTheme) private var theme
```

## @FocusState

```swift
// Single field
@FocusState private var isFocused: Bool

// Multiple fields — use enum
enum Field: Hashable { case name, email, password }
@FocusState private var focusedField: Field?

TextField("Name", text: $name)
    .focused($focusedField, equals: .name)
```

Set `focusedField = .email` to move focus; set `nil` to dismiss keyboard.
