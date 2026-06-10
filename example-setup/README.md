# Example Project Setup

This folder is a small starter set for project-level agent instructions. It is intentionally generic.

## Use

1. Copy the files you want into a real project.
2. Replace every bracketed placeholder such as `[ProjectName]`.
3. Delete documents that do not apply.
4. Add exact build, test, lint, and release commands only after verifying them in the target project.

## Contents

| Path | Purpose |
|---|---|
| `AGENTS.md` | Canonical project entrypoint for agent instructions. |
| `CLAUDE.md` | Tiny pointer for runtimes that load that filename. |
| `Documentation/system/` | Stable project policy and setup facts. |
| `Documentation/templates/` | Reusable templates for specs, plans, and decisions. |
| `Documentation/personas/` | Optional product persona template. |

Keep examples short. Real projects should point agents at canonical docs, not paste large policy manuals into entrypoint files.
