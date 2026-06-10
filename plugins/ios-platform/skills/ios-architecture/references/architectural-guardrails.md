# Architectural Guardrails

This document is the constitution. If a feature, template, or implementation conflicts with these rules, this document wins.

## Layer-Based Architecture

| Layer | Role |
|---|---|
| `App/` | Composition root, app bootstrap, top-level navigation |
| `Features/*` | Feature code: clients, repositories, models, views |
| `Infrastructure/*` | Persistence and services |
| `Packages/CoreTypes` | Shared leaf types and protocols |
| `Packages/<Domain>` | Domain-specific data layer |
| `Packages/Connectors/*` | External data adapters |

## Hard Guardrails

These rules are non-negotiable. Violation of any rule is a defect.

1. **Features are folders, not packages.**
2. **Features do not depend on other features directly.**
3. **One production SwiftData container.** `PersistenceContainer` owns it.
4. **Cross-feature `@Relationship` is forbidden.**
5. **Feature code uses `internal`, not `public`.**
6. **Feature code does not import platform-specific data frameworks directly** (e.g. `HealthKit`). That access belongs in connector packages.
7. **Date and time logic uses the shared logical day policy from `CoreTypes`.**
8. **Every new `@Model` must be registered in `PersistenceSchema.allModels`.**
9. **Repository is internal; client is the facade.**
10. **Package manifests declare exactly `platforms: [.iOS(.v26)]`.**

## Feature Folder Contract

Typical feature layout:

```text
Features/{Feature}/
+-- {Feature}Client.swift
+-- {Feature}Error.swift                  [optional]
+-- {Feature}Repository.swift             [optional]
+-- {Feature}.swift                       [optional]
+-- {Feature}Model.swift                  [optional]
+-- {Feature}DevView.swift                [optional, #if DEBUG]
+-- {Feature}TimelineProvider.swift        [optional]
+-- Views/
    +-- {Feature}View.swift               [optional]
```

Rules:

- Add only the files the feature actually needs.
- `{Feature}Client` is the entry point.
- `{Feature}Repository` stays internal to the feature.
- Feature-owned `@Model` types must be registered in `PersistenceSchema.allModels`.
- UI lives under `Views/`.
- Dev-views are optional debug tools, not a second app architecture.

## Feature Client Contract

- Feature clients are `@Observable`.
- Feature clients are `@MainActor`.
- Feature clients use concrete initialiser injection.
- Shared collaborators stay private.
- Clients expose presentation-ready state and feature actions.
- Typed domain errors are preferred when callers can react meaningfully.

## View Layer Contract

- Container views read environment clients and own screen-level UI state.
- Rendering views take narrow values, bindings, and closures.
- Views do not own business logic, persistence bootstrapping, or process-lifetime work.

## Cross-Feature Communication

- Feature code must not import or reference types from another feature folder.
- Cross-feature linking uses IDs, shared types in `CoreTypes`, or a canonical data layer as intermediary.
- Timeline must not import another feature's repository directly.
- Cross-feature aggregation happens at the client/provider layer, not through persistence coupling.

## Allowed Dependencies

| From | Allowed |
|---|---|
| Feature code | `CoreTypes`, canonical data client, `SwiftData`, needed Apple frameworks (except raw data frameworks like `HealthKit`) |
| Persistence | `CoreTypes`, data models, `SwiftData` |
| Services | `CoreTypes` and the wrapped system framework |
| Connectors | `CoreTypes`, data models, connector-specific SDKs |
| App layer | Everything required for composition |

## Composition Contract

- `CompositionRoot` owns long-lived app services and feature clients.
- Top-level app code injects feature clients into the SwiftUI environment.
- Root navigation is tab-based. Each tab can own a `NavigationStack` as needed.
- Startup registration, background task registration, and other process-lifetime work belong in app composition code, not in SwiftUI views.

## Verification Checks

These are enforced by project checks and lint rules when available:

- Project feature-isolation check -- no cross-feature imports
- Project model-registration check -- all persisted model types are registered in the schema
- Project architecture guardrail check -- hard guardrail enforcement
- Project Swift lint command

## When to Use

Before adding a new type or dependency, answer:

1. Is this canonical shared data or feature-local data?
2. Which layer owns it?
3. Can the feature depend on an existing concrete type instead of adding abstraction?
4. Does the change violate a boundary that should stay hard?
