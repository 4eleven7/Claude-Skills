---
name: hard-cut
description: Use when changing product behaviour, persisted state, routing, contracts, configuration, schemas, enums, feature flags, or architecture where compatibility, migration, fallback, or dual behavior might be kept.
---

# Hard-Cut Policy

Apply a hard-cut policy as the default decision filter for product and architecture changes. Keep one current-state codepath, fail fast on invalid old state, and prefer explicit recovery steps over compatibility logic.

## Responsibility

**Owns:** Enforcing canonical-codepath discipline during implementation changes.
**Does NOT own:** Deciding whether a migration is needed (check the project persistence or migration policy for that).

## Operating Rules

- Treat historical local state as non-authoritative unless the user explicitly requests migration or compatibility support.
- Delete compatibility bridges, fallback paths, dual reads/writes, adapter layers, old enum aliases, legacy route parsing, and silent coercions when touching the primary codepath.
- Update contracts, validation, flags, constants, and configuration in one canonical location. Do not preserve parallel policy logic.
- Fail fast when persisted state, inputs, or contracts do not match the canonical format.
- Prefer explicit operator or user recovery steps over automatic migration.
- If a change makes old local state invalid, surface that clearly and keep the canonical implementation clean.

## Decision Test

1. Is there a real external-user compatibility requirement? (Check the project persistence or migration policy — durable models on `main` that are spec-referenced, UI-visible, or reused across features **do** require migrations.)
2. If no compatibility requirement → remove the old path, keep only canonical current-state behavior.
3. If yes because the user explicitly asked for transition support → keep it narrow and temporary.
4. In the same diff, state: why the compatibility code exists, why the canonical path is insufficient, the exact deletion criteria, and the tracking task.

## persistence-Specific Rules

This skill works WITH the persistence policy, not against it:

- **Durable models on `main`**: These require proper versioned migrations per the project migration documentation. Hard-cut applies to the *implementation* (one canonical model shape), not to the migration path.
- **In-progress models** (not yet on `main`): Hard-cut fully applies. Delete old shapes, no compatibility code.
- **DEBUG-only reset tooling**: Allowed as explicit developer convenience. This is not a "compatibility bridge."
- **No silent destructive fallback** outside DEBUG. Ever.

## Review Checklist

- [ ] Remove dead migration and fallback code once the canonical path exists
- [ ] Collapse duplicated validation or policy logic into one source of truth
- [ ] Replace silent fallback with explicit error, assertion, or recovery instruction
- [ ] Prefer invalid-state diagnostics over best-effort parsing or coercion
- [ ] Call out any unavoidable temporary compatibility code in the PR body
- [ ] If persistence models changed, verify migration plan exists per persistence policy

## Anti-Patterns

| Anti-Pattern | What to do instead |
|---|---|
| Silent `try?` swallowing old-format data | Fail fast with diagnostic error |
| `if let oldFormat = ... { migrate() }` in production | Versioned schema migration |
| Dual enum cases (`case legacyFoo`, `case foo`) | Single canonical case |
| Adapter layer translating old API shape | Delete old shape, update callers |
| Feature flag preserving both behaviors | Ship the new behavior, delete the flag |
