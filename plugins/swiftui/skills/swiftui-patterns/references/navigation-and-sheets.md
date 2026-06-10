# Navigation and Sheets

## NavigationStack Patterns

### Route-Based Navigation

Define a `Hashable` route enum and use `navigationDestination(for:)`:

```swift
enum Route: Hashable {
    case account(id: String)
    case status(id: String)
    case settings
}

@MainActor
struct TimelineTab: View {
    @State private var routerPath = RouterPath()

    var body: some View {
        NavigationStack(path: $routerPath.path) {
            TimelineView()
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .account(let id): AccountView(id: id)
                    case .status(let id): StatusView(id: id)
                    case .settings: SettingsView()
                    }
                }
        }
        .environment(routerPath)
    }
}
```

### Router Object

```swift
@MainActor
@Observable
final class RouterPath {
    var path: [Route] = []
    var presentedSheet: SheetDestination?

    func navigate(to route: Route) {
        path.append(route)
    }

    func reset() {
        path = []
    }
}
```

### Centralised Destination Mapping

Avoid duplicating route switches across screens:

```swift
extension View {
    func withAppRouter() -> some View {
        navigationDestination(for: Route.self) { route in
            switch route {
            case .account(let id): AccountView(id: id)
            case .status(let id): StatusView(id: id)
            case .settings: SettingsView()
            }
        }
    }
}

// Apply once per stack
NavigationStack(path: $routerPath.path) {
    TimelineView().withAppRouter()
}
```

### Per-Tab Independent History

Each tab gets its own `NavigationStack` and router:

```swift
@MainActor
@Observable
final class TabRouter {
    private var routers: [AppTab: RouterPath] = [:]

    func router(for tab: AppTab) -> RouterPath {
        routers[tab, default: RouterPath()]
    }

    func binding(for tab: AppTab) -> Binding<[Route]> {
        let router = router(for: tab)
        return Binding(get: { router.path }, set: { router.path = $0 })
    }
}
```

### Rules

- One `NavigationStack` per tab to preserve independent history
- Use `navigationDestination(for:)` — never `NavigationLink(destination:)`
- Never mix `navigationDestination(for:)` and `NavigationLink(destination:)` in the same hierarchy
- Register `navigationDestination(for:)` once per data type — flag duplicates
- Store lightweight route data in the path, not view instances
- Reset path on context change (account switch, logout)
- Keep the router outside other `@Observable` objects to avoid nested observation
- Attach `confirmationDialog()` to the UI that triggers it (enables Liquid Glass source animations)

## Sheet Patterns

### sheet(item:) Preferred

```swift
@State private var selectedItem: Item?

.sheet(item: $selectedItem) { item in
    EditItemSheet(item: item)
}

// When the sheet view takes item as its only init parameter:
.sheet(item: $selectedItem, content: EditItemSheet.init)
```

### Sheets Own Their Actions

```swift
struct EditItemSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(Store.self) private var store

    let item: Item
    @State private var isSaving = false

    var body: some View {
        VStack {
            Button(isSaving ? "Saving..." : "Save") {
                Task { await save() }
            }
        }
    }

    private func save() async {
        isSaving = true
        await store.save(item)
        dismiss()
    }
}
```

### Enum-Driven Sheet Routing

Centralise sheet state for scalability:

```swift
enum SheetDestination: Identifiable {
    case composer
    case editProfile
    case settings
    case report(itemID: String)

    var id: String {
        switch self {
        case .composer, .editProfile: "editor"  // mutually exclusive
        case .settings: "settings"
        case .report: "report"
        }
    }
}

extension View {
    func withSheetDestinations(sheet: Binding<SheetDestination?>) -> some View {
        sheet(item: sheet) { destination in
            switch destination {
            case .composer: ComposerView()
            case .editProfile: EditProfileView()
            case .settings: SettingsView()
            case .report(let id): ReportView(itemID: id)
            }
        }
    }
}
```

### Sheets That Need Navigation

```swift
struct NavigationSheet<Content: View>: View {
    var content: () -> Content

    var body: some View {
        NavigationStack {
            content()
                .toolbar { CloseToolbarItem() }
        }
    }
}
```

## Deep Linking

Centralise URL handling in the router:

```swift
extension RouterPath {
    func handle(url: URL) -> OpenURLAction.Result {
        if isInternal(url) {
            navigate(to: .status(id: url.lastPathComponent))
            return .handled
        }
        return .systemAction
    }
}

extension View {
    func withLinkRouter(_ router: RouterPath) -> some View {
        self
            .environment(\.openURL, OpenURLAction { url in
                router.handle(url: url)
            })
            .onOpenURL { url in
                router.handle(url: url)
            }
    }
}
```

Rules:
- Keep URL parsing in the router — one entry point
- Validate URLs before assuming internal
- Avoid blocking UI while resolving remote links — use `Task`
- Always provide fallback to `.systemAction`

## State Restoration

### SceneStorage for Lightweight State

Use `@SceneStorage` for tab selection and simple per-scene state that survives app backgrounding:

```swift
struct ContentView: View {
    @SceneStorage("selectedTab") private var selectedTab = "timeline"
    @SceneStorage("lastViewedItemID") private var lastViewedItemID: String?

    var body: some View {
        TabView(selection: $selectedTab) {
            TimelineTab().tag("timeline")
            ProfileTab().tag("profile")
        }
    }
}
```

`@SceneStorage` is per-scene (multi-window safe on iPad) and survives app termination. Use it for lightweight values only — selected tab, last scroll position, draft text. Not suitable for complex navigation paths.

### NavigationPath Codable Restoration

`NavigationPath` conforms to `Codable` when all path elements are `Codable`. Persist via `@SceneStorage` using its `CodableRepresentation`:

```swift
@MainActor
@Observable
final class RouterPath {
    var path = NavigationPath()

    // Persist to SceneStorage via JSON
    var encoded: Data? {
        guard let representation = path.codable else { return nil }
        return try? JSONEncoder().encode(representation)
    }

    func restore(from data: Data) {
        guard let representation = try? JSONDecoder().decode(
            NavigationPath.CodableRepresentation.self, from: data
        ) else { return }
        path = NavigationPath(representation)
    }
}
```

Wire to SceneStorage in the view:

```swift
struct TimelineTab: View {
    @State private var router = RouterPath()
    @SceneStorage("timelinePath") private var savedPath: Data?

    var body: some View {
        NavigationStack(path: $router.path) {
            TimelineView().withAppRouter()
        }
        .onChange(of: router.path) {
            savedPath = router.encoded
        }
        .onAppear {
            if let savedPath { router.restore(from: savedPath) }
        }
    }
}
```

### Restoration Rules

- **Store IDs, not objects.** Persist lightweight identifiers. Resolve to full objects after restore — deleted items should be silently dropped, not crash.
- **Use `compactMap` on restore.** Items may have been deleted since the path was saved. Filter invalid IDs gracefully.
- **Keep restoration optional.** If decoding fails, start fresh. Never crash on corrupt restoration data.
- **Multi-window iPad:** `@SceneStorage` is scoped per scene — each window gets independent state automatically.
- **Don't over-persist.** Deep navigation stacks can confuse returning users. Consider restoring only 1-2 levels deep, or only the selected tab.

## Pitfalls

- Do not share one path across all tabs unless you want global history
- Do not store heavy state inside `SheetDestination` — use lightweight IDs
- Avoid mixing `sheet(isPresented:)` and `sheet(item:)` for the same concern
- If an alert has only a dismiss button, the action can be empty: `.alert("Title", isPresented: $showing) { }`
