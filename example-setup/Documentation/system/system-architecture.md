<!-- This is an example template. Replace [YourApp] with your actual app name and adjust layers, features, and package names to match your project. -->

# System Architecture

## Purpose

Define the hard architectural rules for [YourApp].

This document is the constitution. If a feature, template, or implementation conflicts with these rules, this document wins.

## When to Use

- Starting a new feature
- Reviewing dependencies across features
- Wiring Persistence or Services
- Deciding where code belongs

## Workflow

Before adding a new type or dependency, answer:

1. Which layer owns it?
2. Can the feature depend on an existing concrete type instead of adding abstraction?
3. Does the change violate a boundary that should stay hard?

## Current Architecture

| Layer | Role |
|---|---|
| `[YourApp]/[YourApp]/App` | composition root, app bootstrap, top-level navigation |
| `[YourApp]/[YourApp]/Features/*` | feature code: clients, repositories, models, views |
| `[YourApp]/[YourApp]/Infrastructure/*` | persistence and services |
| `[YourApp]/Packages/CoreModels` | shared leaf types and protocols |
| `[YourApp]/Packages/Networking` | HTTP client and endpoint definitions |
| `[YourApp]/Packages/Analytics` | event tracking and analytics |

## Hard Guardrails

These rules are non-negotiable.

1. Features are folders, not packages.
2. Features do not depend on other features directly.
3. [YourApp] has one production SwiftData container.
4. Cross-feature `@Relationship` is forbidden.
5. Feature code uses `internal`, not `public`.
6. Date and time logic uses the shared logical day policy from `CoreModels`.
7. Every new `@Model` must be registered in `PersistenceSchema.allModels`.
8. Repository is internal; client is the facade.
9. Package manifests declare exactly `platforms: [.iOS("26.1")]`.

Violation of any rule above is a defect.

## Core Rules

### 1. Features are folders, not packages

- App features live under `[YourApp]/[YourApp]/Features/{Feature}/`.
- Do not create a Swift Package for a normal app feature.
- Package extraction is exceptional, not a default.

### 2. Features do not depend on other features

- Feature code must not import or reference types from another feature folder.
- Cross-feature linking uses IDs, shared types in `CoreModels`, or a shared service as an intermediary.

### 3. Persistence has one production container

- `PersistenceContainer` owns the production SwiftData container.
- Feature code receives injected context providers or clients.
- Feature code must not create its own production `ModelContainer`.

### 4. Prefer concrete implementations

- Do not add protocols or infrastructure unless the current feature needs them now.
- [YourApp] uses direct composition through `CompositionRoot`, SwiftUI environment injection, and constructor injection.

## App Composition Contract

- `CompositionRoot` owns long-lived app services and feature clients.
- Top-level app code injects feature clients into the SwiftUI environment.
- Root navigation is tab-based. Each tab can own a `NavigationStack` as needed.
- Startup registration, background task registration, and other process-lifetime work belong in app composition code, not in SwiftUI views.

## Feature Folder Contract

Typical feature layout:

```text
[YourApp]/[YourApp]/Features/{Feature}/
├── {Feature}Client.swift
├── {Feature}Error.swift                  [optional]
├── {Feature}Repository.swift             [optional]
├── {Feature}.swift                       [optional]
├── {Feature}Model.swift                  [optional]
├── {Feature}DevView.swift                [optional, #if DEBUG]
└── Views/
    └── {Feature}View.swift               [optional]
```

Rules:

- Add only the files the feature actually needs
- `{Feature}Client` is the entry point
- `{Feature}Repository` stays internal to the feature
- Feature-owned `@Model` types must be registered in `PersistenceSchema.allModels`
- UI lives under `Views/`
- Dev-views are optional debug tools, not a second app architecture

## Feature Client Contract

- Feature clients are `@Observable`
- Feature clients are `@MainActor`
- Feature clients use concrete initializer injection
- Shared collaborators stay private
- Clients expose presentation-ready state and feature actions
- Typed domain errors are preferred when callers can react meaningfully

## View Layer Contract

- Views follow `Documentation/system/swiftui-view-guidelines.md`
- Container views read environment clients and own screen-level UI state
- Rendering views take narrow values, bindings, and closures
- Views do not own business logic, persistence bootstrapping, or process-lifetime work

## Allowed Dependencies

| From | Allowed |
|---|---|
| Feature code | `CoreModels`, `Networking`, `Analytics`, `SwiftData`, needed Apple frameworks |
| Persistence | `CoreModels`, `SwiftData` |
| Services | `CoreModels` and the wrapped system framework |
| App layer | everything required for composition |

## Verification Rules

These are enforced by project scripts and lint rules:

- `Scripts/check_model_registration.sh`
- `swiftlint lint --config .swiftlint.yml --no-cache`

## Example

Good:

- `DashboardClient` reads task summaries from `TasksClient` via shared service
- `ProfileClient` owns local profile models and a local repository
- `NotificationsClient` wraps `NotificationService` for scheduling

Bad:

- `Dashboard` importing `TasksRepository`
- a feature creating its own production `ModelContainer`
- a feature importing `Persistence` internals

## Notes

- `ModelContextProviding` is a current pattern for features that need local persistence without owning container creation.
- `CompositionRoot` is where [YourApp] wires feature clients and services together.
- `Documentation/templates/feature-template.md` defines the implementation workflow for new features.
- Keep this document short. It should contain rules, not speculative architecture.
