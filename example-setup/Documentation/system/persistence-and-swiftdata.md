<!-- This is an example template. Replace [YourApp] with your actual app name and adjust model types, bundle IDs, and package names to match your project. -->

# Persistence and SwiftData

> How the single SwiftData container is assembled, provisioned, and used across the app.
>
> For the policy that defines when schema changes require migration, reset constraints, testing, and PR/docs updates, see `Documentation/system/persistence-policy.md`.
>
> For the migration chain, historical schema rules, and migration testing strategy, see `Documentation/system/swiftdata-migrations.md`.

**Version:** 1.0
**Status:** Example Template

---

## iOS + SwiftData Constraints

1. Minimum deployment target is **iOS 26.1** for all targets that import `SwiftData`.
2. [YourApp] runtime contract: one long-lived production `ModelContainer` instance per process.
3. Test and dev-view contract: ephemeral in-memory `ModelContainer` instances are allowed and expected.
4. No contract is made for macOS or Mac Catalyst persistence behaviour in this document.

---

## Schema Assembly

`Infrastructure/Persistence/` is the only location that knows about ALL `@Model` types. Feature-internal entities are referenced directly (same module — no import needed).

```swift
// Infrastructure/Persistence/PersistenceSchema.swift
import SwiftData

enum PersistenceSchema {

    /// Every @Model type in the app. Add new models here when adding features.
    static let allModels: [any PersistentModel.Type] = [
        // Keep deterministic order: alphabetically by feature, then by type name.

        // Dashboard
        DashboardWidgetModel.self,

        // Notifications
        NotificationPreferenceModel.self,
        ScheduledNotificationModel.self,

        // Profile
        UserProfileModel.self,

        // Projects
        ProjectModel.self,
        ProjectMilestoneModel.self,

        // Settings
        AppSettingsModel.self,

        // Tags
        TagModel.self,

        // Tasks
        TaskModel.self,
        TaskAttachmentModel.self,
    ]

    static var schema: Schema {
        Schema(allModels)
    }
}
```

When adding a new feature: add its `@Model` types to `allModels`. That's it. If you forget, the container won't know about those models and queries will return nothing.

`allModels` ordering is part of the contract: alphabetically by feature folder, then alphabetically by type name within each feature. This makes schema diffs reviewable.

CI script `Scripts/check_model_registration.sh` verifies every `@Model` declaration in the project appears in `allModels`.

---

## ModelContainer Creation

`Infrastructure/Persistence/` creates and owns the single `ModelContainer`. The container is created once at app launch and lives for the app's lifetime.

```swift
// Infrastructure/Persistence/PersistenceContainer.swift
import SwiftData

final class PersistenceContainer {

    let modelContainer: ModelContainer

    /// Production initialiser — persistent store in App Group container.
    init(appGroup: String = "group.com.example.[yourapp]") throws(PersistenceError) {
        let configuration = ModelConfiguration(
            schema: PersistenceSchema.schema,
            groupContainer: .identifier(appGroup)
        )
        do {
            self.modelContainer = try ModelContainer(
                for: PersistenceSchema.schema,
                migrationPlan: PersistenceMigrationPlan.self,
                configurations: [configuration]
            )
        } catch {
            throw .containerCreationFailed(underlying: error)
        }
    }

    /// Test/dev-view initialiser — in-memory, ephemeral.
    init(inMemory: Bool) throws(PersistenceError) {
        let configuration = ModelConfiguration(
            schema: PersistenceSchema.schema,
            isStoredInMemoryOnly: inMemory
        )
        do {
            self.modelContainer = try ModelContainer(
                for: PersistenceSchema.schema,
                migrationPlan: PersistenceMigrationPlan.self,
                configurations: [configuration]
            )
        } catch {
            throw .containerCreationFailed(underlying: error)
        }
    }
}
```

### Rules

- [YourApp] MUST create one `PersistenceContainer` during startup and reuse it for app lifetime.
- Production config MUST use `ModelConfiguration(groupContainer: .identifier(appGroupID))` so the app and widget extension read the same store.
- Features MUST NOT create their own `ModelContainer`. Allowed callers: `Infrastructure/Persistence/`, test targets, and dev-view debug screens only.
- If container creation fails, startup MUST fail deterministically by surfacing the thrown error to the app startup state (no silent fallback container).
- Dev-view debug screens (`{Feature}DevView.swift`, `#if DEBUG`) may create in-memory containers with only their feature's models for isolated testing.

---

## Migrations

[YourApp] uses a single app-wide `SchemaMigrationPlan` in `Infrastructure/Persistence/`.

Current live chain:

- `SchemaV1` through `SchemaV3`

Core mechanics:

- `PersistenceSchema.schema` points at the latest `VersionedSchema`.
- `PersistenceMigrationPlan.schemas` lists every shipped schema in order.
- `PersistenceMigrationPlan.stages` lists every adjacent migration stage in order.
- Historical schemas keep explicit model membership.
- Historical schemas must not be built from `PersistenceSchema.allModels` or other current registries.

That last rule is non-negotiable. Deriving old schemas from current model lists silently mutates shipped history when new models are added later.

Additional constraint: every adjacent pair of `VersionedSchema` definitions must resolve to a unique set of Swift model types. If two adjacent schemas share the exact same type list (because a model in a shared list was modified without freezing the old version), SwiftData computes identical checksums and crashes at container init.

---

## Context Provisioning

`Infrastructure/Persistence/` provides two ways to get a `ModelContext`:

### 1. `mainContext` — for UI reads

```swift
extension PersistenceContainer {

    /// The main-actor-bound context for UI reads.
    /// Use this for fetch requests that drive the UI.
    @MainActor
    var mainContext: ModelContext {
        modelContainer.mainContext
    }
}
```

- Lives on `@MainActor`.
- Use for all read operations that feed SwiftUI views.
- MUST NOT be used for heavy writes or batch imports.

### 2. `backgroundContext()` — for writes and imports

```swift
extension PersistenceContainer {

    /// Creates a new background context for writes, imports, or batch operations.
    /// Each call returns a fresh context. Do not cache or share across tasks.
    func backgroundContext() -> ModelContext {
        ModelContext(modelContainer)
    }
}
```

- Returns a new `ModelContext` each time. Cheap to create.
- Use for writes, batch imports, data syncing.
- MUST be used off the main actor.
- Mutation contract: callers MUST finish write operations with `try context.save()`.
- Visibility contract: committed changes are guaranteed to appear on a subsequent fetch (`mainContext.fetch(_:)`) or a re-evaluated SwiftUI `@Query`; previously fetched arrays are not guaranteed to mutate in place.

### Context Injection Pattern

Features receive a `ModelContext` via constructor injection. They don't know whether it's a main context or background context.

```swift
// Features/Tasks/TaskRepository.swift
final class TaskRepository {

    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    func fetchAll() throws(TaskError) -> [TaskModel] {
        let descriptor = FetchDescriptor<TaskModel>(
            sortBy: [SortDescriptor(\.title)]
        )
        do {
            return try modelContext.fetch(descriptor)
        } catch {
            throw .storageFailed(underlying: error)
        }
    }
}
```

For features that need both read and write contexts, inject a context provider:

```swift
/// Defined in CoreModels
protocol ModelContextProviding: Sendable {
    @MainActor var mainContext: ModelContext { get }
    func backgroundContext() -> ModelContext
}
```

`PersistenceContainer` conforms to this protocol. Feature clients accept `ModelContextProviding` and pick the right context for each operation.

`ModelContextProviding` is `Sendable` with `@MainActor` on the `mainContext` property only. The `backgroundContext()` method must remain non-isolated so callers can create contexts off the main actor for write operations. This design is safe because each `backgroundContext()` call returns a fresh, unshared `ModelContext`.

---

## Cross-Reference Rules

| From | To | Mechanism |
|------|----|-----------|
| Feature → own local data | `ModelContext` + `FetchDescriptor` | Direct SwiftData queries |
| Feature → another feature's data | Forbidden | Store `UUID`, resolve at UI layer |

---

## Write Transaction Contract

For any mutation path (create/update/delete), the repository/client MUST execute this sequence:

1. Obtain a `ModelContext` (`mainContext` for lightweight UI edits, `backgroundContext()` for imports/batch writes).
2. Perform inserts/updates/deletes.
3. Call `try modelContext.save()`.
4. Propagate save errors to the caller; no silent retries inside repositories.
5. Re-fetch before returning read models that must reflect committed state.

Skipping step 3 means no persistence guarantee.

---

## Rules Summary

| Rule | Detail |
|------|--------|
| One container | Created by `Infrastructure/Persistence/`, once, at app launch. |
| Shared store location | Production uses `ModelConfiguration(groupContainer: .identifier(appGroupID))`. |
| No feature containers | Features MUST NOT create `ModelContainer`. Allowed: Persistence, test targets, dev-views. |
| Startup failure handling | Container init failures are surfaced; no silent fallback store. |
| Injected contexts | Features receive `ModelContext` via init. |
| Main for reads | `mainContext` on `@MainActor` for UI-driving fetches. |
| Background for writes | `backgroundContext()` off main actor for mutations. |
| Save required for writes | Mutation paths call `try modelContext.save()`. |
| Visibility semantics | New fetch / re-evaluated `@Query` after save is required for deterministic reads. |
| No shared contexts | Never pass a `ModelContext` across actor boundaries. |
| Direct queries for local data | Features use `FetchDescriptor`, `#Predicate`, `modelContext.fetch()` for their own entities. No wrapper DSL. |
| No cross-feature relationships | Link by `UUID` or `Identifier<T>`. No `@Relationship` across feature boundaries. |
| Schema in Persistence | All `@Model` types registered in `PersistenceSchema.allModels`. |
| Migrations in Persistence | All `VersionedSchema` and `MigrationStage` definitions live in `Infrastructure/Persistence/`. |

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Initial example template. |
