# Project Agent Guide

This is a generic template. Replace bracketed placeholders before using it in a real project.

## First Reads

1. Read this file.
2. Read `Documentation/system/documentation-index.md`.
3. Read the relevant system document before changing architecture, persistence, testing, UI, release, or build behaviour.
4. Read the approved feature spec before changing user-visible behaviour.

If a referenced file is missing, search `Documentation/`, `docs/`, `.github/`, and the repo root. If no canonical rule exists, ask before inventing one.

## Project Facts

| Item | Value |
|---|---|
| Product name | `[ProjectName]` |
| Primary platforms | `[iOS/macOS/web/server/etc.]` |
| Main app or package target | `[TargetName]` |
| Test targets | `[TestTargetNames]` |
| Minimum supported version | `[PlatformVersion]` |
| Package manager/build system | `[Xcode/SwiftPM/npm/etc.]` |

## Working Rules

- Prefer direct, technical feedback over soft wording.
- Keep changes scoped to the user request.
- Do not invent APIs, targets, scripts, folders, or conventions.
- Do not discard uncommitted changes unless explicitly asked.
- If a request conflicts with an approved spec or canonical doc, call out the conflict before implementing.
- Reread files after editing them.
- Verify with targeted tests first, then broader checks when risk warrants it.

## Validation

Read `Documentation/system/build-and-validation.md` before running broad commands.

If validation commands are not documented:

1. Inspect project files for real targets and scripts.
2. Prefer the smallest command that proves the changed behaviour.
3. Tell the user when validation cannot be run locally.

## Documentation Routing

| Task | Read |
|---|---|
| Project map and doc ownership | `Documentation/system/documentation-index.md` |
| Product and platform context | `Documentation/system/project-context.md` |
| Architecture or dependency changes | `Documentation/system/architecture.md` |
| Build, test, lint, or format commands | `Documentation/system/build-and-validation.md` |
| Code style or API conventions | `Documentation/system/coding-standards.md` |
| Test strategy or fixtures | `Documentation/system/testing-strategy.md` |
| Release, migration, or compatibility risk | `Documentation/system/release-policy.md` |

## Keep This File Small

This file is a map, not a manual. Put durable policy in `Documentation/system/` and link to it here.
