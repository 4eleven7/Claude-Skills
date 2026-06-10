# Composition Root

> No service locator. No DI framework. One composition root. Constructor injection.

## CompositionRoot

Lives in `App/CompositionRoot.swift`. It is the only place where concrete types are assembled and wired together. Nothing else in the app creates feature clients or repositories.

```swift
// App/CompositionRoot.swift
@MainActor
final class CompositionRoot {

    // MARK: - Infrastructure

    let persistence: PersistenceContainer

    // MARK: - Services (system framework wrappers)

    let location: LocationService
    let notifications: NotificationService
    let foundationModels: FoundationModelsService

    // MARK: - Feature Clients

    let auth: AuthClient
    let profile: ProfileClient
    let settings: SettingsClient
    // ... all feature clients

    init() throws(PersistenceError) {
        // 1. Infrastructure
        persistence = try PersistenceContainer()

        // 2. Services
        location = LocationService()
        notifications = NotificationService()
        foundationModels = FoundationModelsService()

        // 3. Feature clients (injected with context + services)
        let mainContext = persistence.mainContext

        auth = AuthClient(modelContext: mainContext)
        profile = ProfileClient(modelContext: mainContext)
        settings = SettingsClient(
            modelContext: mainContext,
            notificationService: notifications
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

## StartupState Pattern

```swift
// App/MyApp.swift
@main
struct MyApp: App {

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
                    // ... all feature clients
            case .failed(let error):
                StartupErrorView(error: error)
            }
        }
    }
}
```

App startup is deterministic: either `CompositionRoot` is available (`.ready`) or a startup error surface is shown (`.failed`). Never `try!`.

## Injection Patterns

### Constructor Injection (Preferred)

Every feature client, repository, and service takes its dependencies through `init`. This is the default. Use it everywhere.

```swift
// Features/Profile/ProfileClient.swift
@Observable @MainActor
final class ProfileClient {

    private let repository: ProfileRepository

    init(modelContext: ModelContext) {
        self.repository = ProfileRepository(modelContext: modelContext)
    }
}
```

### Environment Injection (For Views Only)

When constructor injection creates too much prop-drilling through the view hierarchy, inject feature clients into the SwiftUI environment at the top of the tree.

```swift
// At the top level (App body):
.environment(root.auth)
.environment(root.profile)

// In a deeply nested view:
@Environment(ProfileClient.self) private var profile
```

This is a convenience for the view layer. Business logic and repositories MUST use constructor injection. Requires iOS 26+ for typed environment injection APIs.

## Service Protocols

Service protocols live in a shared types package. They define the contract for system framework wrappers. Concrete implementations live in `Infrastructure/Services/`.

```swift
// In shared types package:
public protocol LocationProviding: Sendable {
    func requestCurrentLocation() async throws -> Coordinate
    func startMonitoring(region: Region) async
}

public protocol NotificationProviding: Sendable {
    func scheduleLocal(_ notification: LocalNotification) async throws
    func cancelPending(identifiers: [String]) async
}
```

```swift
// In Infrastructure/Services/LocationService.swift:
import CoreLocation

final class LocationService: LocationProviding {
    func requestCurrentLocation() async throws -> Coordinate {
        // CoreLocation implementation
    }
}
```

Features depend on the protocol. CompositionRoot injects the concrete type. Features never know which concrete service they are using.

### When to Use Protocol Abstraction

| Data Category | Access Pattern |
|---|---|
| Canonical data (domain-specific data layer) | Concrete client (not protocol). Mock at the data layer for tests |
| System services (location, notifications, HomeKit) | Protocol in shared types, concrete in `Infrastructure/Services/` |
| Feature clients | Concrete type. One implementation. No protocol needed |

## Lifetime and Ownership Contracts

1. `CompositionRoot` owns long-lived service and feature-client instances for the app process lifetime.
2. Views MUST NOT instantiate feature clients directly.
3. Repositories are internal details of feature clients and may be recreated, but their injected dependencies are explicit constructor parameters.
4. Any operation that needs an isolated write context MUST call `backgroundContext()` per operation; no shared mutable global `ModelContext`.

## Dev-View Composition

Dev-view debug screens (`{Feature}DevView.swift`, `#if DEBUG`) are not a second composition system.

Rules:

- If a dev-view runs inside the app, use the app's existing feature client or `ModelContext`.
- If a preview or isolated debug flow has no app-owned container, an in-memory container is acceptable there.
- Do not create a second app-owned `ModelContainer` inside a running app flow that already owns one.
- Keep dev-view wiring local and debug-only.

## Adding a New Feature

Five-step checklist:

1. **Create** `{Feature}Client` in `Features/{Feature}/` with constructor injection.
2. **Add** a `let {feature}: {Feature}Client` property to `CompositionRoot`.
3. **Construct** it in `CompositionRoot.init()`, injecting the appropriate `ModelContext` and any service protocols.
4. **Add** `.environment(root.{feature})` in your App body.
5. **Done.** No imports needed for features in the same module.
