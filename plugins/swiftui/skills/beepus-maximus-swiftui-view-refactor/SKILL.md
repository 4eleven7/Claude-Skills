---
name: swiftui-view-refactor
description: Use when refactoring SwiftUI views: splitting long bodies, extracting subviews, removing inline side effects, stabilizing view identity, simplifying data flow, or standardizing Observation usage.
---

# SwiftUI View Refactor

Refactor SwiftUI views toward small, explicit, stable view types. Preserve behavior unless the user explicitly asks for a behavior change.

## Responsibility

**Owns:** SwiftUI view structure, body length, subview extraction, view identity, local state ownership, Observation usage, action extraction, and dependency flow.

**Does NOT own:** Visual redesign, product behavior changes, persistence schema changes, broad architecture changes, or performance profiling beyond obvious view-structure problems.

## Core Rules

1. **Keep the view tree stable.** Avoid top-level `if/else` branches that swap entire root views. Prefer one stable base view with localized conditional sections or modifiers.
2. **Extract meaningful subviews.** Prefer dedicated `View` types for non-trivial sections. Use computed `some View` helpers only for small local fragments.
3. **Pass narrow inputs.** Extracted subviews should receive plain values, bindings, and callbacks instead of whole parent models or broad environment state.
4. **Move side effects out of `body`.** Button actions, `.task`, `.onChange`, and `.refreshable` should call named methods. Real business logic belongs in services or models.
5. **Default to MV, not MVVM.** Do not introduce a view model just to wrap local state or mirror environment dependencies. Use a view model only when existing code already does or the user asks for it.
6. **Use Observation correctly.** Own root `@Observable` reference models with `@State` on iOS 17+. Use legacy wrappers only when the deployment target or existing code requires them.

## Workflow

1. Read the target view and adjacent local patterns before editing.
2. Identify the main problems: long body, inline side effects, unstable branching, broad state passing, view model misuse, or Observation mistakes.
3. Reorder the view so stored properties, `init`, `body`, view helpers, and actions are easy to scan.
4. Extract sections into private subviews in the same file first. Move to separate files only when reused, independently meaningful, or large enough to churn separately.
5. Replace broad parent-state passing with narrow values, bindings, and callbacks.
6. Move non-trivial inline actions and async work into named private methods.
7. Preserve behavior and run the smallest relevant build or test check.

## Extraction Rules

| Situation | Default |
|---|---|
| Body is longer than one screen | Extract named sections |
| Section has state, async work, branching, or preview value | Dedicated `View` type |
| Small markup used once | Keep local or use a small computed helper |
| Subview needs many parent-only values | Simplify parent first; do not create parameter soup |
| UI is reused or has independent responsibility | Move to its own file |
| Reuse is hypothetical | Keep it private and local |

## Patterns

Prefer a body that reads as structure:

```swift
var body: some View {
    List {
        HeaderSection(title: title, subtitle: subtitle)
        FilterSection(options: options, selection: $selection)
        ResultsSection(items: filteredItems, onSelect: select)
    }
    .task { await load() }
}
```

Avoid rebuilding a screen from large computed fragments:

```swift
var body: some View {
    List {
        header
        filters
        results
    }
}
```

Avoid inline side effects:

```swift
Button("Save") {
    Task {
        isSaving = true
        defer { isSaving = false }
        try await service.save(draft)
    }
}
```

Prefer named actions:

```swift
Button("Save", action: save)

private func save() {
    Task { await saveDraft() }
}

private func saveDraft() async {
    isSaving = true
    defer { isSaving = false }
    try? await service.save(draft)
}
```

## Red Flags

- `body` mixes layout, networking, formatting, persistence, and navigation decisions.
- Extracted subviews receive an entire store or view model when they need two values.
- Optional view models or `bootstrapIfNeeded` exist only to work around initialization.
- `ForEach` uses unstable identity, indices, or generated `UUID()` values.
- Top-level conditional branches return unrelated root views.
- A refactor changes visible behavior without the user asking for that.

## Verification

Run the smallest useful check after editing:

- Build the affected target for structural refactors.
- Run focused tests when logic or state flow changed.
- Use previews or screenshots only when visual layout risk is meaningful.

Report what changed, what behavior was preserved, and what validation ran.
