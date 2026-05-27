---
name: ios-architecture
description: Use when building, reviewing, or modifying an iOS app architecture: composition root, dependency injection, service boundaries, error handling, design systems, StoreKit, CI/CD, or module guardrails.
---

# iOS App Architecture

Production iOS app architecture: composition root, dependency injection, layered architecture, error handling, on-device language generation, design systems, monetisation, CI/CD, and engineering process.

## Responsibility

**Owns:**
- App composition root and startup
- Dependency injection patterns
- Service protocols and infrastructure contracts
- Layered architecture (App / Features / Infrastructure / Packages)
- Error handling and debug descriptions
- Foundation Models integration (on-device language generation)
- Design system tokens and components
- StoreKit 2 subscription patterns
- CI/CD pipelines and GitHub Actions
- Code review standard and git workflow
- Development workflow (spec-driven, TDD)

**Does NOT own:**
- Individual view construction or screen layout (see SwiftUI view guidelines)
- Concurrency mechanics (actors, Sendable, async/await primitives)
- Test syntax and assertion patterns (Swift Testing framework)
- Platform HIG compliance
- Data modelling and persistence schema design

## Core Principles

1. **One composition root.** `CompositionRoot` in `App/` is the only place that constructs and wires feature clients, services, and infrastructure. Nothing else in the app creates these objects.

2. **No service locator.** Dependencies are explicit. Every feature client, repository, and service declares what it needs through its initialiser. No global registry, no `resolve<T>()`, no runtime lookups.

3. **Constructor injection everywhere.** Initialisers are the default injection mechanism. SwiftUI environment injection (`.environment()` / `@Environment(Type.self)`) is a convenience for the view layer only. Business logic and repositories always use constructor injection.

4. **StartupState, not try!.** App startup is deterministic: `CompositionRoot.init()` uses `throws` and the app entry point wraps it in a `StartupState` enum (`.ready` / `.failed`). Failures show an error screen, never a crash.

5. **Features are folders, not packages.** App features live under `Features/{Feature}/`. Do not create a Swift Package for a normal app feature. Package extraction is exceptional.

6. **No inter-feature dependencies.** Feature code must not import or reference types from another feature folder. Cross-feature linking uses IDs, shared types in `CoreTypes`, or a shared data layer as intermediary.

7. **Protocol abstraction only where testing requires it.** Features expose concrete clients. Only non-feature services (location, notifications, HomeKit) need protocol abstraction because test mocking requires it. Do not add a protocol for a single implementation.

8. **Hard guardrails with verification.** Architectural rules are enforced by scripts (`check_feature_isolation.sh`, `check_model_registration.sh`, `check_architecture_guardrails.sh`). Violation of a guardrail is a defect.

9. **Every generated string has a deterministic fallback.** The app must function identically without Apple Intelligence. All Foundation Models output passes through `validated()` before reaching UI or persistence.

10. **Prefer concrete implementations.** Do not add protocols or infrastructure unless the current feature needs them now. Speculative abstraction is an anti-pattern.

## What NOT to Build

| Anti-Pattern | Why Not |
|---|---|
| Service locator / registry | Hidden dependencies, untestable, runtime crashes instead of compile errors |
| DI framework (Swinject, etc.) | Overkill. Constructor injection is sufficient |
| Global singletons | Untestable, unclear ownership, implicit coupling |
| `@EnvironmentObject` for dependency wiring | Implicit runtime dependencies, weaker compile-time guarantees than constructor injection / typed `@Environment` |
| Protocol for single implementations | Premature abstraction. Mock at the data layer instead |
| `ObservableObject` / `@Published` in new code | Use `@Observable` |
| Force unwrapping (`!`) | Use `guard let`, `if let`, nil coalescing, or optional chaining |
| Callbacks for new async work | Use `async/await` |
| `AnyView` | Use concrete view types unless an API boundary leaves no alternative |
| Business logic in SwiftUI views | Views render state. Clients own logic |

## Code Review Priority

Review changes in this order:

1. **Correctness** and behavioural regressions
2. **Data integrity**, persistence safety, and architecture violations
3. **Performance** and update-frequency risk
4. **Test coverage** and verification gaps
5. **Code clarity** and maintainability

## Definition of Done

A change is not done until:

- Behaviour matches the spec or agreed request
- Targeted tests pass when behaviour matters
- Build passes when the touched surface justifies it
- Lint and guardrail checks are clean when the change is broad enough
- Warnings are resolved
- Documentation or specs are updated if the contract changed
- Known risks and untested areas are disclosed

## Development Workflow

```
Specification --> Implementation Plan --> Tests --> Feature Implementation --> Verification
```

Spec-driven, test-driven, verification before handoff. Write or update the spec first. Write tests before production code. Verify against the spec before requesting review.

## Commit Format

```
[FEATURE] TYPE: description

TYPE = FEAT | FIX | REFACTOR | TEST | DOCS | CHORE
```

Subject line is imperative, under 50 characters, no trailing period. Body explains what changed and why.

## Pressure Defense

**"Just put the logic in the view for now"**
Extracting to a client/service takes the same time and is testable without SwiftUI. The "for now" version ships and never gets refactored.

**"We don't need DI, it's a small app"**
Constructor injection costs nothing and makes every test faster. Service locators and singletons are the tech debt that compounds silently.

**"Skip the protocol, there's only one implementation"**
Protocols exist for testability, not polymorphism. Without one, every test that touches this service needs the real implementation and all its dependencies.

## References

Detailed implementation patterns are in the `references/` directory:

| Reference | Covers |
|---|---|
| [composition-root.md](references/composition-root.md) | CompositionRoot pattern, StartupState, injection patterns, service protocols, lifetime contracts, adding a new feature |
| [architectural-guardrails.md](references/architectural-guardrails.md) | Layer-based architecture, features as folders, dependency matrix, feature folder/client contracts, verification scripts |
| [error-handling.md](references/error-handling.md) | Typed throws, domain error enums, LocalizedError, UI error presentation, debug descriptions, debugging philosophy |
| [foundation-models-architecture.md](references/foundation-models-architecture.md) | Three-part generation pattern, pack requirements, prompt isolation, schema validation, deterministic fallbacks, Apple prompt patterns |
| [design-system.md](references/design-system.md) | 4-layer design system (tokens, components, animations, haptics), colour system, typography, spacing |
| [modular-architecture.md](references/modular-architecture.md) | Tuist-based Core/Feature layers, protocol-driven service catalog, UI Composer pattern |
| [engineering-process.md](references/engineering-process.md) | Code review standard, git workflow, development workflow, modern API preferences, coding standards |
| [platform-frameworks.md](references/platform-frameworks.md) | StoreKit 2 patterns, CI/CD with GitHub Actions, App Store Connect pipeline |
