<!-- This is an example template. Replace [YourApp] with your actual app name and adjust feature names, paths, and dependency patterns to match your project. -->

# Feature Template

## Purpose

Show how [YourApp] features are added or extended without inventing extra architecture.

Use this after the feature specification is approved. This template is a build checklist, not a code generator.

## When to Use

- Adding a new feature under `[YourApp]/[YourApp]/Features/`
- Adding a major capability to an existing feature
- Wiring a feature into `CompositionRoot`

Do not use this for one-off bug fixes or tiny UI tweaks.

## Workflow

### 1. Read the source of truth

Read these first:

- `Documentation/system/documentation-index.md`
- the approved feature specification
- `Documentation/system/development-workflow.md`
- `Documentation/system/system-architecture.md`
- `Documentation/system/testing-strategy.md`
- `Documentation/system/swift-coding-guidelines.md`
- `Documentation/system/swiftui-view-guidelines.md` if the feature has SwiftUI views
- `Documentation/templates/reference-feature.md`

### 2. Audit the current code

Before creating files, answer:

- Is this a new feature or an extension of an existing one?
- Does it own local SwiftData models?
- Does it need networking or other service access?
- Does it need a SwiftUI screen?

### 3. Create only the files the feature actually needs

Typical feature shape:

```text
[YourApp]/[YourApp]/Features/{Feature}/
├── {Feature}Client.swift
├── {Feature}Error.swift                  [if the feature has domain errors]
├── {Feature}Repository.swift             [if the feature owns local persistence]
├── {Feature}.swift                       [if the feature has a distinct domain type]
├── {Feature}Model.swift                  [if the feature owns SwiftData models]
├── {Feature}DevView.swift                [optional]
└── Views/
    └── {Feature}View.swift               [if the feature has UI]
```

Do not create files just because the template lists them.

### 4. Choose the dependency shape

Use the simplest initializer that matches the feature:

| Feature kind | Typical dependency shape |
|---|---|
| Local-only feature | `contextProvider: any ModelContextProviding` |
| Network-backed feature | `networking: NetworkingService` or both `contextProvider` + `networking` |
| Service-backed feature | Inject the concrete service the feature needs |
| Aggregator / coordinator | Inject closures or concrete collaborators directly |

Avoid protocols unless the feature needs one now for testability or multiple live implementations.

### 5. Write tests first

Convert the spec into failing tests before substantial production code.

Use deterministic fixtures and mock data. See `Documentation/system/fixture-and-mock-data-guidelines.md`.

Typical tests:

- `{Feature}ClientTests.swift` for business logic and state transitions
- `{Feature}RepositoryTests.swift` for persistence round-trips
- integration tests when multiple layers interact

Test files live under:

```text
[YourApp]Tests/{Feature}/
```

### 6. Implement the feature

Rules:

- Keep feature code concrete and local.
- Do not import other features.
- Do not create a production `ModelContainer` in feature code.
- Register any new `@Model` types in `PersistenceSchema.allModels`.
- If the feature has UI, follow `Documentation/system/swiftui-view-guidelines.md` for view structure, state scope, lifecycle, and previews.
- Follow `Documentation/system/swift-coding-guidelines.md`, `Documentation/system/error-and-debugging-guidelines.md`, and `Documentation/system/modern-api-guidelines.md` for code shape and defaults.

### 7. Wire the feature into the app

Typical integration points:

- `[YourApp]/[YourApp]/App/CompositionRoot.swift`
- a feature view under `Features/{Feature}/Views/`
- a tab, navigation flow, or environment injection point

### 8. Verify

Minimum verification:

- run the targeted tests you added
- build the [YourApp] app target
- run lint if the change is broad enough to justify it
- compare the result against the spec

## Example

Use real maintained features as references:

- small local feature: `[YourApp]/[YourApp]/Features/Settings/`
- network-backed feature: `[YourApp]/[YourApp]/Features/Profile/`
- service-heavy feature: `[YourApp]/[YourApp]/Features/Notifications/`
- aggregator feature: `[YourApp]/[YourApp]/Features/Dashboard/`

## Notes

- A repository is optional. Use one when the feature owns non-trivial local queries.
- A dev-view is optional. Add one only if manual inspection materially helps.
- A feature may have no local `@Model` types at all.
- Previews are required only when they add real review or iteration value. Do not add ceremonial previews.
- Use `Documentation/system/ui-implementation-checklist.md` before merging non-trivial SwiftUI work.
- All feature types stay `internal`. Isolation is enforced by project rules, not access modifiers.

## Checklist

- [ ] Approved spec exists
- [ ] Only necessary files were added
- [ ] New `@Model` types are registered in `PersistenceSchema.allModels`
- [ ] Targeted tests exist and pass
- [ ] Feature is wired through `CompositionRoot` if needed
- [ ] Any previews added follow `Documentation/system/swiftui-view-guidelines.md` and cover meaningful states only
- [ ] Build passes
- [ ] Lint and guardrails are clean when applicable
