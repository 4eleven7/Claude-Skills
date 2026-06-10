# Build And Validation

Replace placeholders with commands verified in this project. Do not invent commands.

## Commands

| Task | Command | When to run |
|---|---|---|
| Build main target | `[build command]` | Code changes touching production paths |
| Run targeted tests | `[targeted test command]` | Logic or behaviour changes |
| Run full tests | `[full test command]` | Shared code, release prep, risky refactors |
| Format | `[format command]` | Before review when formatting tools exist |
| Lint | `[lint command]` | Before review when lint tools exist |

## Discovery

If this file is not filled in, inspect:

- `README.md`;
- package or project files;
- `Makefile`, `justfile`, or `Scripts/`;
- CI workflows under `.github/`, `.gitlab/`, or equivalent.

If multiple commands exist, prefer the command used by CI.

## Validation Standard

- Run the smallest check that proves the change.
- Run broader checks when the change touches shared code, persistence, release paths, or public contracts.
- Report skipped validation and the reason.
