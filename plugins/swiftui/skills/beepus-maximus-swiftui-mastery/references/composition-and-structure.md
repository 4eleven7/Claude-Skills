# Composition and Structure

## Container vs Rendering View Split

The default pattern when a screen has non-trivial state or dependencies.

**Container views:**
- Read feature clients from environment or init
- Own screen-level `@State`
- Coordinate loading, navigation, sheets, alerts, tasks
- Convert feature state into narrow rendering inputs

**Rendering views:**
- Accept plain values and bindings
- Avoid environment access by default
- Avoid lifecycle hooks
- Easy to preview in isolation

```swift
// Container — owns state, reads environment
struct TimelineView: View {
    @Environment(TimelineClient.self) private var client
    @State private var selectedDate = Date.now

    var body: some View {
        TimelineList(
            sections: client.sections(for: selectedDate),
            onRefresh: { await client.refresh() }
        )
    }
}

// Rendering — plain inputs, no environment
struct TimelineList: View {
    let sections: [TimelineSection]
    let onRefresh: () async -> Void

    var body: some View {
        List {
            ForEach(sections) { section in
                Section(section.title) {
                    ForEach(section.items) { item in
                        TimelineRow(item: item)
                    }
                }
            }
        }
        .refreshable { await onRefresh() }
    }
}
```

## Subview Extraction Decision Tree

**Extract when:**
- The child has a distinct responsibility
- The child can take narrow inputs instead of parent's broad state
- The child needs its own preview
- The child is reused in multiple places
- The parent becomes hard to scan

**Keep local when:**
- Markup is small and used once
- Extraction would require passing many one-off values
- The child has no independent meaning
- Extraction would create wrapper noise

**Same file vs separate file:**
- Same file: tightly coupled to one parent, not reused, helps readability
- Separate file: has own responsibility and name, reused, changes independently

## Stable View Tree

Avoid top-level `if/else` returning different root branches. Use modifiers instead.

```swift
// GOOD — stable base, conditions localised
var body: some View {
    List {
        documentsListContent
    }
    .toolbar {
        if canEdit { editToolbar }
    }
    .disabled(!canEdit)
}

// BAD — root identity churn, broader invalidation
var body: some View {
    if canEdit {
        editableDocumentsList
    } else {
        readOnlyDocumentsList
    }
}
```

For modifier toggling, prefer ternary over `if/else` to preserve structural identity:

```swift
// GOOD — same view, different modifier value
Text(title)
    .foregroundStyle(isActive ? .primary : .secondary)

// BAD — _ConditionalContent, recreates platform views
if isActive {
    Text(title).foregroundStyle(.primary)
} else {
    Text(title).foregroundStyle(.secondary)
}
```

## Splitting Large Bodies

When `body` grows beyond a screen, split into smaller pieces.

**Option 1: Computed view properties (same file)**

```swift
var body: some View {
    List {
        header
        filters
        results
    }
}

private var header: some View {
    VStack(alignment: .leading, spacing: 6) {
        Text(title).font(.title2)
        Text(subtitle).font(.subheadline).foregroundStyle(.secondary)
    }
}
```

**Option 2: Private struct subviews (same file)**

```swift
private struct HeaderSection: View {
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.headline)
            if let subtitle { Text(subtitle).font(.subheadline) }
        }
    }
}
```

**Option 3: Separate files** — when the subview has its own responsibility, preview, or reuse.

## File-Splitting Rules

| Situation | Rule |
|-----------|------|
| Small helper used once, tightly coupled | Same file, private subview or computed property |
| Section improves readability but used once | Same file first |
| Subview has own preview/responsibility/churn | Separate file |
| Same UI in multiple features, same contract | Shared reusable component |
| Reuse is hypothetical | Do not extract yet |
| Extraction needs many parent-only details | Keep local, simplify parent |

Files over ~300 lines: split with extensions grouped by `// MARK:` comments:

```swift
// MARK: - Actions
extension MyView {
    private func save() async { /* ... */ }
    private func delete() { /* ... */ }
}

// MARK: - Subviews
extension MyView {
    private var header: some View { /* ... */ }
}
```

## Passing Data to Subviews

Pass small inputs, not parent state:

```swift
// GOOD — narrow inputs
WorkoutRow(name: workout.name, duration: workout.duration, onTap: { select(workout) })

// BAD — whole parent state
WorkoutRow(viewModel: viewModel, index: index)
```

## Container Views

Prefer `@ViewBuilder let content: Content` over closure storage:

```swift
// GOOD — built view value, synthesised init
struct CardView<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading) { content }
            .padding()
            .background(.ultraThinMaterial)
            .clipShape(.rect(cornerRadius: 8))
    }
}

// BAD — escaping closure stored on view
struct CardView<Content: View>: View {
    let content: () -> Content
}
```

## Lifecycle Hooks

Prefer `.task` over `onAppear` for async work — it cancels automatically.

```swift
// GOOD
.task { await loadData() }
.task(id: selectedDate) { await loadData(for: selectedDate) }

// BAD
.onAppear { Task { await loadData() } }
```

Use `onAppear` / `onDisappear` only for local, idempotent, view-lifetime behaviour (focusing a control, starting a visual effect, lightweight analytics that tolerate repeated calls).

## UIViewRepresentable

Bridge UIKit views into SwiftUI when no native equivalent exists (maps, web views, camera previews, custom text input).

### Basic Structure

```swift
struct WrappedTextField: UIViewRepresentable {
    @Binding var text: String

    func makeUIView(context: Context) -> UITextField {
        let field = UITextField()
        field.delegate = context.coordinator
        return field
    }

    func updateUIView(_ uiView: UITextField, context: Context) {
        // Guard against unnecessary updates to prevent infinite loops
        if uiView.text != text {
            uiView.text = text
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    final class Coordinator: NSObject, UITextFieldDelegate {
        var text: Binding<String>

        init(text: Binding<String>) {
            self.text = text
        }

        func textFieldDidChangeSelection(_ textField: UITextField) {
            text.wrappedValue = textField.text ?? ""
        }
    }
}
```

### Lifecycle

1. `makeCoordinator()` — called once, before `makeUIView`. Create delegates, data sources, target-action handlers here.
2. `makeUIView(context:)` — called once. Create and configure the UIKit view. Wire the coordinator as delegate.
3. `updateUIView(_:context:)` — called on every SwiftUI state change. Push new values into the UIKit view.

### Infinite Loop Prevention

The most common bug. `updateUIView` fires when SwiftUI state changes. If `updateUIView` mutates the UIKit view, and that mutation triggers a delegate callback that updates `@Binding`/`@State`, SwiftUI calls `updateUIView` again.

```swift
// BAD — infinite loop
func updateUIView(_ uiView: UITextField, context: Context) {
    uiView.text = text  // triggers delegate → updates binding → triggers updateUIView
}

// GOOD — guard against no-op updates
func updateUIView(_ uiView: UITextField, context: Context) {
    if uiView.text != text {
        uiView.text = text
    }
}
```

For complex views, use a flag on the Coordinator:

```swift
final class Coordinator: NSObject {
    var isUpdatingFromSwiftUI = false
}

func updateUIView(_ uiView: MyView, context: Context) {
    context.coordinator.isUpdatingFromSwiftUI = true
    uiView.value = value
    context.coordinator.isUpdatingFromSwiftUI = false
}

// In delegate callback:
func viewDidChangeValue(_ view: MyView) {
    guard !isUpdatingFromSwiftUI else { return }
    binding.wrappedValue = view.value
}
```

### Coordinator Rules

- The Coordinator is the bridge between UIKit callbacks and SwiftUI state
- Store `Binding` references, not copies of values
- Implement delegate protocols on the Coordinator, not the representable struct
- Use `@MainActor` on the Coordinator when it touches SwiftUI state

### Sizing

By default, representable views propose their intrinsic content size. Override `sizeThatFits(_:uiView:context:)` for custom sizing:

```swift
func sizeThatFits(_ proposal: ProposedViewSize, uiView: UITextField, context: Context) -> CGSize? {
    CGSize(width: proposal.width ?? 200, height: 44)
}
```

### Cleanup

Use `dismantleUIView(_:coordinator:)` (static method) to clean up resources when the view is removed:

```swift
static func dismantleUIView(_ uiView: UITextField, coordinator: Coordinator) {
    // Cancel observers, invalidate timers, release resources
}
```

### When NOT to Use

- A native SwiftUI equivalent exists (use `TextField`, `Map`, `WebView`)
- You only need styling — use SwiftUI modifiers instead
- You need a full-screen UIKit controller — use `UIViewControllerRepresentable` instead
