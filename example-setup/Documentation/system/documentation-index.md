# Documentation Index

Use this file as the canonical map for project documentation. Update it when adding, moving, or deleting durable project docs.

## Required Reads

| Need | Document |
|---|---|
| Agent entrypoint | `AGENTS.md` |
| Product and platform facts | `Documentation/system/project-context.md` |
| Architecture and dependency rules | `Documentation/system/architecture.md` |
| Build and validation commands | `Documentation/system/build-and-validation.md` |
| Code style and API conventions | `Documentation/system/coding-standards.md` |
| Test strategy | `Documentation/system/testing-strategy.md` |
| Release and compatibility policy | `Documentation/system/release-policy.md` |

## Feature Work

Feature specs should live in `Documentation/specifications/`.

If that folder does not exist, search `docs/`, `Documentation/`, issue trackers, and planning docs before starting implementation. If no approved spec exists, ask whether to draft one.

## Ownership Rules

- One fact should have one canonical home.
- Entry files should route to policy, not duplicate it.
- Outdated docs should be fixed or deleted, not worked around.
