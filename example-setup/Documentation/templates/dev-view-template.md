<!-- EXAMPLE TEMPLATE: Replace the reference file paths with your own project's dev-view locations. -->

# Dev-View Template

## Purpose

Show how to build a useful debug screen for manual inspection without turning dev-views into a second architecture.

Dev-views are optional. They help when a feature benefits from seeded data, manual interaction, or operational diagnostics.

For general SwiftUI structure, state, lifecycle, computed-property, and preview rules, follow `Documentation/system/swiftui-view-guidelines.md`. This template covers only dev-view-specific concerns.
For deterministic preview and dev-view data, follow `Documentation/system/fixture-and-mock-data-guidelines.md`.

## When to Use

- The feature has enough behaviour that manual inspection is useful
- The feature has debug-only controls, diagnostics, or seed/reset flows
- You need a fast way to exercise the feature inside the app

Do not add a dev-view just because the feature exists.

## Workflow

### 1. Decide the data source

Prefer the simplest safe option:

- **Debug menu inside the app:** inject the real client or the app's existing context
- **Preview-only isolation:** use an in-memory container if no app-owned container already exists

Do not create a second production-like `ModelContainer` inside a running app flow that already owns one.

### 2. Keep the screen focused

A dev-view should usually contain:

- a small control section
- a compact state summary
- the feature UI or the critical controls you need to exercise

Seed/reset controls are useful when the feature owns or can safely reset synthetic data. They are not mandatory for every dev-view.

### 3. Add previews when they help

If the dev-view has meaningful visual states, add previews for them. Do not add previews by reflex. Follow the preview rules in `Documentation/system/swiftui-view-guidelines.md`.

Typical preview set:

- `#Preview("Seeded")`
- `#Preview("Empty")`

Use deterministic debug data when preview state matters.

### 4. Keep debug behaviour local

- wrap the file in `#if DEBUG`
- keep mock/debug-only helpers local to debug code where possible
- never let dev-only setup leak into production wiring

## Example

```swift
#if DEBUG
import SwiftUI

struct ExampleDevView: View {
    @Environment(ExampleClient.self) private var client
    @State private var error: ExampleError?

    var body: some View {
        List {
            Section("Controls") {
                Button("Seed Data") {
                    do { try client.seedSampleData() }
                    catch { error = error as? ExampleError }
                }
                Button("Reset", role: .destructive) {
                    do { try client.deleteAll() }
                    catch { error = error as? ExampleError }
                }
            }

            Section("State") {
                Text("Items: \(client.items.count)")
            }

            Section {
                ExampleView()
                    .environment(client)
            }
        }
        .navigationTitle("Example Dev")
        .task {
            do { try client.load() }
            catch { error = error as? ExampleError }
        }
    }
}

#Preview("Seeded") {
    let persistence = try! PersistenceContainer(inMemory: true)
    let client = ExampleClient(contextProvider: persistence)
    NavigationStack {
        ExampleDevView()
    }
    .environment(client)
}
#endif
```

## Notes

- Previews are applicable when the view has meaningful states worth seeing in Canvas.
- Use fixed dates and fixed UUIDs for preview-only mock data when determinism matters.
- Dev-views are debugging aids. They do not replace tests.
- Do not create a second app-owned `ModelContainer` inside a running app flow. Use the app's existing context there; keep in-memory containers preview-local or otherwise isolated from the app's live container.
- For real reference code, inspect your own project's dev-views, for example:
  - `[YourApp]/Features/Network/NetworkDevView.swift`
  - `[YourApp]/Features/Cache/CacheDevView.swift`
  - `[YourApp]/Features/DevTools/DiagnosticsDevView.swift`
