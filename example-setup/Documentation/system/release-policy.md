# Release Policy

Use this document for compatibility, migration, rollout, and release-risk rules.

## Compatibility

- Do not break persisted data, public APIs, deep links, automation contracts, or exported files without an approved migration.
- Treat schema changes and irreversible migrations as release-sensitive.
- Prefer reversible rollout where the risk is material.

## Release Checklist

- `[build command]` passes.
- `[test command]` passes.
- Migration or compatibility tests pass when applicable.
- User-facing text, privacy notes, and release notes are updated when applicable.
- Rollback or mitigation path is known.

## Data Safety

- Never delete user data to hide a migration or parsing bug.
- Fail loudly with diagnostics when recovery is unsafe.
- Document any destructive operation and require explicit user approval before running it.
