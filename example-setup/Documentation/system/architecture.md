# Architecture

Document the architecture that exists, not the architecture the project wishes it had.

## Current Shape

| Area | Current choice |
|---|---|
| App/module layout | `[Folders, packages, targets]` |
| UI framework | `[SwiftUI/UIKit/React/etc.]` |
| State management | `[Pattern actually used]` |
| Persistence | `[SwiftData/Core Data/SQLite/files/none]` |
| Networking | `[HTTP client/service layer/etc.]` |
| Dependency injection | `[Constructor/environment/service locator/etc.]` |

## Rules

- New code should follow the nearest existing pattern unless there is a documented reason to change it.
- Do not add a new abstraction until the second real use proves the shape.
- Keep domain logic out of view code when it must be tested independently.
- Keep IO boundaries explicit: networking, persistence, file access, sensors, and clocks should be replaceable in tests.

## Change Gate

Before changing architecture, identify:

- affected targets or packages;
- call sites that must migrate;
- test coverage needed before and after;
- rollback path if the change fails.
