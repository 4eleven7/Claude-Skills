<!-- This is an example template. Replace [YourApp] with your actual app name and adjust feature clients, services, and package names to match your project. -->

# Service Composition and Dependency Injection

> No service locator. No DI framework. One composition root. Constructor injection.

**Version:** 1.0
**Status:** Example Template

---

## Philosophy

The app uses the simplest DI pattern that works: a single `CompositionRoot` in `App/` that constructs everything and passes dependencies down via initialisers. If you're reaching for a DI container, a service locator, or `@EnvironmentObject` for dependency wiring, you've gone too far.

---

## iOS Platform Constraints

1. Minimum deployment target is **iOS 26.1** for typed environment injection APIs (`.environment(_:)`, `@Environment(Type.self)`).
2. Composition wiring runs on `@MainActor` because SwiftUI app lifecycle state is main-actor-bound.
3. This spec does not guarantee macOS or Mac Catalyst composition behaviour.

---

## CompositionRoot

Lives in `App/CompositionRoot.swift`. It is the only place where concrete types are assembled and wired together. Nothing else in the app creates feature clients or repositories.

```swift
// App/CompositionRoot.swift
import CoreModels
import Networking

@MainActor
final class CompositionRoot {

    // MARK: - Infrastructure

    let persistence: PersistenceContainer

    // MARK: - Services

    let networking: NetworkingService
    let notifications: NotificationService
    let analytics: AnalyticsService

    // MARK: - Feature Clients

    let auth: AuthClient
    let profile: ProfileClient
    let settings: SettingsClient
    let notificationsFeature: NotificationsClient
    let dashboard: DashboardClient

    init() throws(PersistenceError) {
        // 1. Infrastructure
        persistence = try PersistenceContainer()

        // 2. Services
        networking = NetworkingService()
        notifications = NotificationService()
        analytics = AnalyticsService()

        // 3. Feature clients (injected with context + services)
        let mainContext = persistence.mainContext

        auth = AuthClient(
            networking: networking
        )
        profile = ProfileClient(
            modelContext: mainContext,
            networking: networking
        )
        settings = SettingsClient(
            modelContext: mainContext
        )
        notificationsFeature = NotificationsClient(
            modelContext: mainContext,
            notificationService: notifications
        )
        dashboard = DashboardClient(
            modelContext: mainContext,
            networking: networking
        )
    }
}
```

### Rules

- `CompositionRoot` is the **only** place that imports all packages and wires all feature clients together.
- It is created once in the `App` struct's `init()`.
- Feature clients are stored as properties, not recreated.
- Services are concrete at the composition root. Features see them as protocols.
- Startup failures from `CompositionRoot.init()` MUST be surfaced as explicit app startup state (error screen/log), not hidden behind `try!`.

### What CompositionRoot Imports

| Import | Why |
|--------|-----|
| `CoreModels` | For shared protocols and types |
| `Networking` | To construct `NetworkingService` for injection |

Feature clients, repositories, infrastructure, and services are in the same module ([YourApp] app target) — no import needed.

---

## App Entry Point

```swift
// App/[YourApp]App.swift
@main
struct [YourApp]App: App {

    enum StartupState {
        case ready(CompositionRoot)
        case failed(any Error)
    }

    @State private var startupState: StartupState

    init() {
        do {
            _startupState = State(initialValue: .ready(try CompositionRoot()))
        } catch {
            _startupState = State(initialValue: .failed(error))
        }
    }

    var body: some Scene {
        WindowGroup {
            switch startupState {
            case .ready(let root):
                ContentView()
                    .environment(root.auth)
                    .environment(root.profile)
                    .environment(root.settings)
                    .environment(root.notificationsFeature)
                    .environment(root.dashboard)
            case .failed(let error):
                StartupErrorView(error: error)
            }
        }
    }
}
```

App startup is deterministic: either `CompositionRoot` is available (`.ready`) or a startup error surface is shown (`.failed`).

Feature clients are injected into the SwiftUI environment at the top level. For deeply nested views, use `@Environment(ProfileClient.self)` to retrieve them. Business logic and repositories use constructor injection.

---

## Injection Patterns

### Constructor Injection (Preferred)

Every feature client, repository, and service takes its dependencies through `init`. This is the default. Use it everywhere.

```swift
// Features/Profile/ProfileClient.swift
@Observable @MainActor
final class ProfileClient {

    private let repository: ProfileRepository
    private let networking: NetworkingService

    init(modelContext: ModelContext, networking: NetworkingService) {
        self.repository = ProfileRepository(modelContext: modelContext)
        self.networking = networking
    }

    func fetchProfile() async throws -> UserProfile {
        try await networking.request(.profile)
    }
}
```

```swift
// Features/Settings/SettingsClient.swift
@Observable @MainActor
final class SettingsClient {

    private let repository: SettingsRepository

    init(modelContext: ModelContext) {
        self.repository = SettingsRepository(modelContext: modelContext)
    }
}
```

### Environment Injection (For Views Only)

When constructor injection creates too much prop-drilling through the view hierarchy, inject feature clients into the SwiftUI environment at the top of the tree.

```swift
// At the top level ([YourApp]App body):
.environment(root.profile)
.environment(root.settings)

// In a deeply nested view:
@Environment(ProfileClient.self) private var profile
```

This is a convenience for the view layer. Business logic and repositories MUST use constructor injection.

---

## Service Protocols

Service protocols live in `CoreModels`. They define the contract for system framework wrappers. Concrete implementations live in `Infrastructure/Services/`.

```swift
// In CoreModels package:
public protocol NetworkProviding: Sendable {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

public protocol NotificationProviding: Sendable {
    func scheduleLocal(_ notification: LocalNotification) async throws
    func cancelPending(identifiers: [String]) async
}
```

```swift
// In Infrastructure/Services/NetworkingService.swift:
import CoreModels
import Foundation

final class NetworkingService: NetworkProviding {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        // URLSession implementation
    }
}
```

Features depend on the protocol. CompositionRoot injects the concrete type. Features never know which concrete service they're using.

---

## Lifetime and Ownership Contracts

1. `CompositionRoot` owns long-lived service and feature-client instances for the app process lifetime.
2. Views MUST NOT instantiate feature clients directly.
3. Repositories are internal details of feature clients and may be recreated, but their injected dependencies are explicit constructor parameters.
4. Any operation that needs an isolated write context MUST call `backgroundContext()` per operation; no shared mutable global `ModelContext`.

---

## Dev-View Composition

Dev-view debug screens (`{Feature}DevView.swift`, `#if DEBUG`) are not a second composition system.

Rules:

- If a dev-view runs inside the app, use the app's existing feature client or `ModelContext`.
- If a preview or isolated debug flow has no app-owned container, an in-memory container is acceptable there.
- Do not create a second app-owned `ModelContainer` inside a running app flow that already owns one.
- Keep dev-view wiring local and debug-only.

Dev-views are intentionally simple. They exist to inspect one feature, not to rebuild production startup in parallel.

Read:

- `Documentation/templates/dev-view-template.md`
- `Documentation/system/persistence-and-swiftdata.md`
- `Documentation/system/swiftui-view-guidelines.md`

---

## What NOT to Build

| Anti-Pattern | Why Not |
|--------------|---------|
| Service locator / registry | Hidden dependencies, untestable, runtime crashes instead of compile errors. |
| DI framework (Swinject, etc.) | Overkill. Constructor injection is sufficient for this app's scale. |
| Global singletons | Untestable, unclear ownership, implicit coupling. |
| Protocol-only abstractions for features | Features expose concrete clients. Only services need protocol abstraction (because test mocking requires it). |
| `@EnvironmentObject` for dependency wiring | Avoid: implicit runtime dependencies and weaker compile-time guarantees than constructor injection / typed `@Environment`. |

---

## Adding a New Feature to the Composition Root

1. Create `{Feature}Client` in `Features/{Feature}/` with constructor injection.
2. Add a `let {feature}: {Feature}Client` property to `CompositionRoot`.
3. Construct it in `CompositionRoot.init()`, injecting the appropriate `ModelContext`, networking, and any service protocols.
4. Add `.environment(root.{feature})` in `[YourApp]App.body`.
5. Done. No imports needed — same module.

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Initial example template. |
