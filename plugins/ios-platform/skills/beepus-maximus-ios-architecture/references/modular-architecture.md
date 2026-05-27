# Modular Architecture

Tuist-based modular architecture with Core/Feature layers, protocol-driven service catalog, and UI Composer pattern.

## Module Hierarchy

```
Core Modules (frameworks)     --> No feature dependencies, only other Core modules
Feature Modules (frameworks)  --> Depend on Core modules, never on other Features
App Target                    --> Depends on everything, wires services
Widget / Intent Extensions    --> Lightweight, share data via App Groups
```

## Tuist Project Structure

```
Modules/
+-- Core/
|   +-- Catalog/
|   |   +-- Sources/
|   |   +-- Tests/
|   +-- DesignSystem/
|   |   +-- Sources/
|   |   +-- Resources/
|   |   +-- Tests/
|   +-- CalendarService/
|       +-- Sources/
|       +-- Tests/
+-- Features/
    +-- Chat/
    |   +-- Sources/
    |   +-- Resources/
    |   +-- Tests/
    +-- Settings/
        +-- Sources/
        +-- Tests/
```

## Helper Functions for Module Declaration

```swift
func coreFramework(
    name: String,
    dependencies: [TargetDependency] = [],
    resources: ResourceFileElements? = nil,
    hasTests: Bool = true
) -> [Target] {
    var targets: [Target] = [
        .target(
            name: name,
            destinations: destinations,
            product: .framework,
            bundleId: "app.myapp.ios.Core.\(name)",
            deploymentTargets: deploymentTargets,
            infoPlist: .default,
            sources: ["Modules/Core/\(name)/Sources/**"],
            resources: resources,
            dependencies: dependencies
        )
    ]
    if hasTests {
        targets.append(
            .target(
                name: "\(name)Tests",
                destinations: destinations,
                product: .unitTests,
                bundleId: "app.myapp.ios.Core.\(name).Tests",
                deploymentTargets: deploymentTargets,
                infoPlist: .default,
                sources: ["Modules/Core/\(name)/Tests/**"],
                dependencies: [.target(name: name)]
            )
        )
    }
    return targets
}

func featureFramework(
    name: String,
    moduleName: String? = nil,
    dependencies: [TargetDependency] = [],
    resources: ResourceFileElements? = nil
) -> [Target] {
    let dirName = moduleName ?? name
    return [
        .target(
            name: name,
            destinations: destinations,
            product: .framework,
            bundleId: "app.myapp.ios.Features.\(name)",
            deploymentTargets: deploymentTargets,
            infoPlist: .default,
            sources: ["Modules/Features/\(dirName)/Sources/**"],
            resources: resources ?? [.glob(pattern: "Modules/Features/\(dirName)/Resources/**")],
            dependencies: dependencies
        )
    ]
}
```

### Module Classification

- **Core:** No UI, could be used by 2+ features. Services, stores, design system.
- **Feature:** Owns a screen or user-facing flow. Chat, Settings, Insights.

## Protocol-Driven Service Catalog

A complete service catalog in ~80 lines of Swift. No third-party frameworks.

### Three-Layer Architecture

**Layer 1: Protocol** (in the module that owns the service)

```swift
public protocol CalendarServiceProtocol: Sendable {
    func fetchEvents(from: Date, to: Date) async throws -> [CalendarEvent]
    func requestAccess() async -> Bool
}
```

**Layer 2: Blueprint** (same module -- describes how to assemble the service)

```swift
public struct CalendarServiceBlueprint: Blueprint {
    public typealias Output = CalendarServiceProtocol
    public static func assemble(from catalog: Assembling) -> CalendarServiceProtocol {
        CalendarService()
    }
}

extension Catalog {
    public var calendarService: CalendarServiceBlueprint.Type { CalendarServiceBlueprint.self }
}
```

**Layer 3: Registration** (in the app target -- the composition root)

```swift
extension Catalog {
    public func prepareAll() {
        allBlueprints().forEach { blueprint in installBlueprint(blueprint) }
    }
}
```

### Catalog Core

- Type-safe obtainment via `KeyPath`: `let service: CalendarServiceProtocol = try Catalog.main[\.calendarService]`
- Thread-safe via `NSLock` + `@unchecked Sendable`
- Circular reference detection via `assemblyChain`
- `clear()` for clean test state
- `supply()` for transient instances, `supplyShared()` for cached singletons

### Testing

```swift
// Override for testing:
Catalog.main.supply(CalendarServiceBlueprint.self) { _ in
    StubCalendarService()
}

// Clean state:
Catalog.main.clear()
```

## UI Composer Pattern

Each Feature module exposes a **UIComposer** that accepts pre-obtained dependencies via constructor injection and provides `compose*View()` methods.

### Structure

```swift
public struct ChatUIComposer {
    private let store: CalendarStoreProtocol
    private let llmEngine: LLMEngineProtocol

    @MainActor
    public func composeChatView() -> ChatView {
        ChatView(viewModel: ChatViewModel(
            store: store,
            llmEngine: llmEngine
        ))
    }
}
```

### Usage at Call Site

```swift
// Zero knowledge of dependencies:
Catalog.main[\.chatUI].composeChatView()
```

### Variations

- **With callback:** `composeOnboardingView(onComplete: @escaping () -> Void)` -- callbacks go in `compose*()` parameters, not the constructor.
- **With runtime data:** Constructor captures data obtained at blueprint assembly time.
- **Split composer:** For features with 5+ screens, split into sub-composers for SRP.

### Rules

- Callbacks (navigation, completion) go in `compose*()` parameters.
- Dependencies (services, stores) go in the composer constructor.
- `@MainActor` on `compose*View()` ensures views are created on the main thread.
- Views are concrete types (not `AnyView`).
- Create composers lazily at call sites, not eagerly at preparation time.

## Key Benefits

- **No Xcode project file in Git** -- Tuist generates it, eliminating merge conflicts.
- **Compile-time dependency enforcement** -- if Feature A tries to import Feature B, the build fails.
- **Parallel builds** -- independent modules compile concurrently.
- **Test isolation** -- each module's tests only depend on that module.
- **No service locator calls inside views** -- all dependencies are constructor-injected.

## Anti-Patterns

- Do not create circular dependencies between Core modules.
- Do not let Feature modules depend on other Feature modules.
- Do not put shared model types in Feature modules.
- Do not skip test targets.
- Do not pass `Catalog` into ViewModels. Inject obtained protocols instead.
- Do not use `@EnvironmentObject` for core service dependencies.
- Do not create ViewModels inside Views.
- Do not eagerly create all composers at preparation time.
