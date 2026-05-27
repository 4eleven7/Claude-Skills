# Component Patterns

## Tab Architecture

### AppTab Enum

Centralise tab identity, labels, icons, and content:

```swift
@MainActor
enum AppTab: Identifiable, Hashable, CaseIterable {
    case home, notifications, settings
    var id: String { String(describing: self) }

    @ViewBuilder
    func makeContentView() -> some View {
        switch self {
        case .home: HomeView()
        case .notifications: NotificationsView()
        case .settings: SettingsView()
        }
    }

    @ViewBuilder
    var label: some View {
        switch self {
        case .home: Label("Home", systemImage: "house")
        case .notifications: Label("Notifications", systemImage: "bell")
        case .settings: Label("Settings", systemImage: "gear")
        }
    }
}
```

### Tab Selection with Side Effects

Intercept special tabs (compose, search) instead of changing selection:

```swift
TabView(selection: .init(
    get: { selectedTab },
    set: { updateTab(with: $0) }
)) {
    ForEach(AppTab.allCases) { tab in
        Tab(value: tab) { tab.makeContentView() } label: { tab.label }
    }
}

private func updateTab(with newTab: AppTab) {
    if newTab == .post {
        presentComposer()
        return
    }
    selectedTab = newTab
}
```

### Platform-Adaptive Tabs

Use `TabSection` + `.tabPlacement(.sidebarOnly)` for sidebar on iPad/macOS:

```swift
TabView(selection: $selectedTab) {
    ForEach(sections) { section in
        TabSection(section.title) {
            ForEach(section.tabs) { tab in
                Tab(value: tab) { tab.makeContentView() } label: { tab.label }
                    .tabPlacement(tab.tabPlacement)
            }
        }
        .tabPlacement(.sidebarOnly)
    }
}
```

## App Wiring

### Root Shell

```swift
@MainActor
struct AppView: View {
    @State private var selectedTab: AppTab = .home
    @State private var tabRouter = TabRouter()

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(AppTab.allCases) { tab in
                let router = tabRouter.router(for: tab)
                NavigationStack(path: tabRouter.binding(for: tab)) {
                    tab.makeContentView()
                        .withAppRouter()
                }
                .withSheetDestinations(sheet: Binding(
                    get: { router.presentedSheet },
                    set: { router.presentedSheet = $0 }
                ))
                .environment(router)
                .tabItem { tab.label }
                .tag(tab)
            }
        }
        .withAppDependencyGraph()
    }
}
```

### Dependency Graph Modifier

Install environment objects and lifecycle tasks in one place:

```swift
extension View {
    func withAppDependencyGraph() -> some View {
        environment(accountManager)
            .environment(currentAccount)
            .environment(theme)
            .task(id: accountManager.currentClient.id) {
                // Re-seed services on account change
                currentAccount.setClient(client: accountManager.currentClient)
            }
    }
}
```

Keep the modifier slim — no feature state or heavy logic.

## Sheet Patterns

### Enum-Driven Sheet Routing

```swift
enum SheetDestination: Identifiable {
    case composer
    case settings
    case report(itemID: String)
    var id: String { String(describing: self) }
}

extension View {
    func withSheetDestinations(sheet: Binding<SheetDestination?>) -> some View {
        sheet(item: sheet) { destination in
            switch destination {
            case .composer: ComposerView()
            case .settings: SettingsView()
            case .report(let id): ReportView(itemID: id)
            }
        }
    }
}
```

### Presenting from Child Views

```swift
struct StatusRow: View {
    @Environment(RouterPath.self) private var router

    var body: some View {
        Button("Report") {
            router.presentedSheet = .report(itemID: "123")
        }
    }
}
```

Required wiring: parent owns the router, attaches `withSheetDestinations`, and injects via `.environment(router)`.

### Sheets with Internal Navigation

```swift
struct NavigationSheet<Content: View>: View {
    @ViewBuilder var content: () -> Content

    var body: some View {
        NavigationStack {
            content()
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Close") { dismiss() }
                    }
                }
        }
    }
}
```

## Scroll-Reveal Pattern

For detail screens that reveal secondary content by scrolling between full-screen sections:

```swift
private enum DetailSection: Hashable {
    case primary, secondary
}

struct DetailSurface: View {
    @State private var revealProgress: CGFloat = 0
    @State private var secondaryHeight: CGFloat = 1

    var body: some View {
        GeometryReader { geometry in
            ScrollViewReader { proxy in
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {
                        PrimaryContent(progress: revealProgress)
                            .frame(height: geometry.size.height)
                            .id(DetailSection.primary)
                        SecondaryContent(progress: revealProgress)
                            .id(DetailSection.secondary)
                            .onGeometryChange(for: CGFloat.self) { geo in
                                geo.size.height
                            } action: { newHeight in
                                secondaryHeight = max(newHeight, 1)
                            }
                    }
                    .scrollTargetLayout()
                }
                .scrollTargetBehavior(.paging)
                .onScrollGeometryChange(for: CGFloat.self, of: { scroll in
                    scroll.contentOffset.y + scroll.contentInsets.top
                }) { _, offset in
                    revealProgress = (offset / secondaryHeight).clamped(to: 0...1)
                }
                .safeAreaInset(edge: .bottom) {
                    ChevronAffordance(progress: revealProgress) {
                        withAnimation(.smooth) {
                            let target: DetailSection = revealProgress < 0.5
                                ? .secondary : .primary
                            proxy.scrollTo(target, anchor: .top)
                        }
                    }
                }
            }
        }
    }
}
```

Key design choices:
- Primary section = viewport height for paging feel
- Single `progress` value from scroll offset drives all visual state
- Use `ScrollViewReader` for programmatic snapping
- Light haptics at threshold, stronger near committed state
- Disable vertical scrolling during conflicting modes (pinch-to-zoom, crop)

## Style vs View vs Modifier Decision Framework

When creating a reusable UI element, choose the right abstraction:

| Abstraction | Use When | Example |
|---|---|---|
| **Style protocol** (`ButtonStyle`, `ToggleStyle`, custom) | Visual appearance changes only. No child views, no internal state. | `PrimaryButtonStyle`, `CompactToggleStyle` |
| **ViewModifier** | Single `content` child, applies visual treatments (padding, background, shadow). | `.cardStyle()`, `.sectionHeader()` |
| **View** | Compound component with multiple children, internal state, or interaction logic. | `RatingControl`, `SearchBar`, `MetricCard` |

Decision rules:
- If it wraps a single piece of content and only applies modifiers → `ViewModifier`
- If it changes how a standard control looks → Style protocol (preserves SwiftUI rendering pipeline)
- If it has its own state or arranges multiple children → View
- Don't abstract until a pattern repeats 3+ times

### Wrapper Views vs Style Protocols

Prefer style protocols over wrapper views for standard controls. Wrappers bypass SwiftUI's rendering pipeline, break in menus/swipe actions/forms, and add unnecessary nesting:

```swift
// BAD — wrapper breaks in .swipeActions, menu, etc.
struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(title, action: action)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.accent500, in: .capsule)
            .foregroundStyle(.white)
    }
}

// GOOD — works everywhere Button works
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.accent500, in: .capsule)
            .foregroundStyle(.white)
            .opacity(configuration.isPressed ? 0.8 : 1)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: PrimaryButtonStyle { .init() }
}
```

### Configuration Over Parameters

When a component has 3+ boolean parameters, group them into a configuration struct with named presets:

```swift
// BAD — 4 booleans = 16 states, most untested
struct MetricCard: View {
    let value: Double
    let showTrend: Bool
    let isCompact: Bool
    let showUnit: Bool
    let isHighlighted: Bool
}

// GOOD — named presets cover real use cases
struct MetricCardConfiguration {
    var layout: Layout = .standard
    var showTrend: Bool = true

    enum Layout { case compact, standard, hero }

    static let compact = MetricCardConfiguration(layout: .compact, showTrend: false)
    static let hero = MetricCardConfiguration(layout: .hero)
}

struct MetricCard: View {
    let value: Double
    let unit: String
    var configuration: MetricCardConfiguration = .standard
}
```

Use configuration structs when 80%+ of rendering logic is shared across variants. Use separate views when variants are fundamentally different.

### Custom Style Protocols (DLS Pattern)

For complex components with multiple visual variants, define a custom style protocol. The base component owns interaction and accessibility; styles provide visual rendering only:

```swift
protocol RatingControlStyle {
    associatedtype Body: View
    @ViewBuilder func makeBody(configuration: Configuration) -> Body

    struct Configuration {
        let rating: Int
        let maxRating: Int
        let isInteractive: Bool
    }
}

struct StarRatingStyle: RatingControlStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 4) {
            ForEach(1...configuration.maxRating, id: \.self) { i in
                Image(systemName: i <= configuration.rating ? "star.fill" : "star")
                    .foregroundStyle(i <= configuration.rating ? .caution500 : .tertiary)
            }
        }
    }
}
```

Adding a new variant is O(1) — implement the style protocol. Zero risk of accessibility regressions because the base component handles all interaction.

## Loading and Empty States

### Loading Placeholder

```swift
List {
    ForEach(0..<5) { _ in
        PlaceholderRow()
    }
}
.redacted(reason: .placeholder)
```

### Empty State

```swift
ContentUnavailableView(
    "No Workouts",
    systemImage: "figure.run",
    description: Text("Start a workout to see it here.")
)
```

### Search Empty State

```swift
ContentUnavailableView.search  // includes search term automatically
```

### Error State

```swift
ContentUnavailableView(
    "Unable to Load",
    systemImage: "exclamationmark.triangle",
    description: Text("Check your connection and try again.")
) {
    Button("Retry") { Task { await refresh() } }
}
```

## SwiftData Container

Install once at the root:

```swift
extension View {
    func withModelContainer() -> some View {
        modelContainer(for: [Draft.self, TagGroup.self])
    }
}
```

Single container avoids duplicated stores per sheet or tab.
