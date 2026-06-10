# Coding Standards

Keep this document focused on project-specific conventions. General language rules belong in external references or tooling.

## Defaults

- Match existing names, file organisation, and dependency direction.
- Prefer clear concrete code over clever abstraction.
- Keep public API surface small.
- Make errors explicit at boundaries.
- Do not hide failing states with silent fallback behaviour.

## Style

| Topic | Rule |
|---|---|
| Formatting | `[Formatter or manual rule]` |
| Naming | `[Project-specific naming rule]` |
| Access control | `[Default visibility]` |
| Comments | Explain why, not what |
| Generated code | `[Where it lives and how it is regenerated]` |

## Review Traps

- Adding a second pattern when the existing one works.
- Changing behaviour without updating specs or tests.
- Treating warnings as harmless without checking user impact.
- Adding global state for local convenience.
