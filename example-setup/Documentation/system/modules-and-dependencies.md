<!-- This is an example template. Replace [YourApp] with your actual app name and adjust packages, features, and model types to match your project. -->

# Modules and Dependencies

> Complete module inventory and dependency graph. If a module isn't listed here, it doesn't exist.

**Version:** 1.0
**Status:** Example Template

---

## Structure Overview

[YourApp] uses **Swift Packages** for infrastructure and a **single Xcode project** for everything else. See `system-architecture.md` for the authoritative rules.

- **Packages:** CoreModels, Networking, Analytics.
- **Project:** All features, infrastructure, services, shared code, tests, and resources live in `[YourApp].xcodeproj`.

---

## Package Inventory

### CoreModels — `Packages/CoreModels/`

| Product | Purpose |
|---------|---------|
| `CoreModels` | Typed identifiers (`Identifier<T>`), date policies, shared protocols (`ModelContextProviding`), shared enums. Leaf dependency — imports only `Foundation` and `SwiftData`. |

### Networking — `Packages/Networking/`

| Product | Purpose |
|---------|---------|
| `Networking` | HTTP client, endpoint definitions, request/response types, authentication token management. Imported by features that need network access. |

Test target: `NetworkingTests` (within the package).

### Analytics — `Packages/Analytics/`

| Product | Purpose |
|---------|---------|
| `Analytics` | Event tracking, screen view logging, user property management. Thin wrapper over the analytics provider SDK. |

Test target: `AnalyticsTests` (within the package).

---

## Project Feature Inventory

All features are folders within `[YourApp]/[YourApp]/Features/` in the Xcode project. They are in the **same module** as the app target — no framework boundaries between features.

### Feature Folders

| # | Folder | Owned `@Model` Types | External Framework Dependencies |
|---|--------|---------------------|-------------------------------|
| 1 | `Features/Dashboard/` | DashboardWidgetModel | — |
| 2 | `Features/Tasks/` | TaskModel, TaskAttachmentModel | — |
| 3 | `Features/Projects/` | ProjectModel, ProjectMilestoneModel | — |
| 4 | `Features/Tags/` | TagModel | — |
| 5 | `Features/Notifications/` | NotificationPreferenceModel, ScheduledNotificationModel | UserNotifications |
| 6 | `Features/Profile/` | UserProfileModel | — |
| 7 | `Features/Settings/` | AppSettingsModel | — |

### Infrastructure Folders

| Folder | Purpose |
|--------|---------|
| `Infrastructure/Persistence/` | Single `ModelContainer`, schema assembly (`PersistenceSchema.allModels`), migrations. |
| `Infrastructure/Services/` | System framework wrappers: `NotificationService` (UserNotifications), `AnalyticsService` (Analytics wrapper). |

### App & Extensions

| Target | Purpose |
|--------|---------|
| `[YourApp]` (app) | Composition root, tab bar, navigation. Depends on all packages and contains all project code. |
| `[YourApp]Widgets` (widget extension) | WidgetKit extension. No [YourApp] or package dependencies — standalone leaf module. |
| `[YourApp]Tests` (test bundle) | All feature tests, organised as `[YourApp]Tests/{Feature}/`. |

---

## Schema Registration

One file, one list. Every `@Model` type in the project must appear here. CI verifies via `Scripts/check_model_registration.sh`.

| # | `@Model` Type | Owning Module |
|---|---------------|---------------|
| 1 | `TaskModel` | Tasks |
| 2 | `TaskAttachmentModel` | Tasks |
| 3 | `ProjectModel` | Projects |
| 4 | `ProjectMilestoneModel` | Projects |
| 5 | `TagModel` | Tags |
| 6 | `DashboardWidgetModel` | Dashboard |
| 7 | `NotificationPreferenceModel` | Notifications |
| 8 | `ScheduledNotificationModel` | Notifications |
| 9 | `UserProfileModel` | Profile |
| 10 | `AppSettingsModel` | Settings |

---

## Dependency Graph

### Dependency Rules (Normative)

| Source | Allowed Imports |
|--------|----------------|
| Feature folder code | `CoreModels`, `Networking`, `Analytics`, `SwiftData`, needed Apple frameworks |
| `Infrastructure/Persistence` | `CoreModels`, `SwiftData` |
| `Infrastructure/Services` | `CoreModels`, their system framework |
| `App` | Everything |

Features MUST NOT import other features' types or `Persistence` internals. See `system-architecture.md` for the complete forbidden dependencies table.

### Dependency Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      [YourApp] App                            │
│              (composition root, imports everything)            │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Tasks │ │Projects│ │Dashbrd │ │Profile │ │  ...   │  Feature Folders
│        │ │        │ │        │ │        │ │        │  (same module)
└───┬────┘ └───┬────┘ └───┬────┘ └────────┘ └────────┘
    │          │          │
    ▼          ▼          ▼
┌──────────────────────────────────────────────────────────────┐
│                    Networking (package)                        │
│                  (HTTP client, endpoints)                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  CoreModels  │  ← leaf dependency (package)
                    └──────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Infrastructure/Persistence                        │
│   imports all feature @Model types                            │
│   (same module — no package import needed for feature models)  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Infrastructure/Services                           │
│   NotificationService, AnalyticsService                       │
│   (each imports CoreModels + its system framework)            │
└──────────────────────────────────────────────────────────────┘
```

---

## Adding a New Feature

1. Create a folder at `[YourApp]/[YourApp]/Features/{Name}/`.
2. Create `{Name}Client.swift` (internal `@Observable @MainActor` facade).
3. Create `{Name}Repository.swift` (internal, if feature owns data).
4. Create `{Name}Error.swift` (typed error enum).
5. Create `{Name}Models.swift` (if feature owns `@Model` types).
6. Create `{Name}DevView.swift` (debug screen, `#if DEBUG`).
7. Create `Views/` subfolder for SwiftUI views.
8. Register all `@Model` types in `Infrastructure/Persistence/PersistenceSchema.swift`.
9. Wire `{Name}Client` in `App/CompositionRoot.swift`.
10. Create test files at `[YourApp]Tests/{Name}/`.
11. Update this document: add row to Feature Folders table, add rows to Schema Registration table.

See `Documentation/templates/feature-template.md` for the complete checklist.

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Feature folder | `Features/{FeatureName}/` | `Features/Tasks/` |
| Public facade | `{Feature}Client` | `TasksClient` |
| Internal data access | `{Feature}Repository` | `TasksRepository` |
| Feature-owned models | `{Feature}Models.swift` (file) | `TaskModels.swift` |
| Typed error | `{Feature}Error` | `TasksError` |
| Debug screen | `{Feature}DevView` | `TasksDevView` |
| Test folder | `[YourApp]Tests/{Feature}/` | `[YourApp]Tests/Tasks/` |

No abbreviations. `NotificationsClient`, not `NotifsClient`.

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Initial example template. |
