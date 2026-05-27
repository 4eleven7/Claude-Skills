<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust schema references to match your persistence layer. -->

# Persistence Policy

> Canonical policy for [YourApp] persisted-schema changes, migrations, store resets, and persistence-related review expectations.
>
> For SwiftData migration implementation details, historical schema structure, and migration testing mechanics, see `Documentation/system/swiftdata-migrations.md`.
>
> For container assembly and runtime persistence mechanics, see `Documentation/system/persistence-and-swiftdata.md`.

**Version:** 1.1
**Status:** Approved
**Last Updated:** Friday 13 March 2026

---

## Purpose

Persistence breakage is not an acceptable routine cost of development.

Persisted model changes are product changes. They affect whether existing installs, internal builds, seeded environments, and developer stores can still open and preserve meaning. Repeatedly breaking store creation because schema changes were introduced without migration handling is an engineering failure, not a harmless inconvenience.

This policy exists to make the default behaviour explicit: durable persistence changes must be versioned, migration-aware, tested, and reviewed as data-integrity work.

## Core Principles

- Persisted schema changes are product changes.
- Resetting app data is a debug convenience, not a migration strategy.
- Durable product-direction changes must be migratable.
- Schema evolution must be explicit and versioned.
- No silent destructive fallback outside `DEBUG`.
- If a store cannot be opened or migrated, [YourApp] must fail loudly and diagnostically.

## Schema Versioning Rules

- Persisted schema changes MUST be versioned deliberately.
- Ad hoc breaking changes to shipped or durable schemas are not acceptable.
- Schema history MUST remain explicit through `VersionedSchema` definitions and migration-plan history.
- Migration planning MUST accompany durable schema changes before they merge.
- Editing old shipped schema snapshots in place is forbidden. Add the next schema version instead.

## When Migration Is Required

Migration planning is required whenever a durable persisted change can affect existing data shape, meaning, or readability.

The following changes require an explicit migration decision and usually require a migration:

- adding or removing an entity or model
- adding, removing, renaming, or retyping a persisted property
- changing relationships or reference semantics
- changing identifiers, uniqueness rules, or key composition
- changing the semantic meaning of a stored field
- splitting one entity into multiple entities
- consolidating multiple entities into one entity
- turning transient or computed-on-write data into persisted data
- changing the meaning of persisted derived fields or cached values

**Special case — models in shared registries:** If the model being modified lives in `PersistenceSchema.stableModels` or `HistoricalSchemaModels`, the property change silently mutates every historical schema that references the live type. This produces duplicate checksums across adjacent `VersionedSchema` definitions and crashes `NSStagedMigrationManager` at container init. Before modifying such a model, freeze a snapshot of the old shape. See `Documentation/system/swiftdata-migrations.md` (failure scenario #5) for the full procedure.

Technical lightweight migration is not a waiver. If the semantic meaning of existing data changes, treat it as migration work even when the storage engine can open the store automatically.

## Debug Reset Policy

- Local store reset is allowed only in `DEBUG` or other explicit developer-only workflows.
- Reset actions MUST be explicit, visible, and opt-in.
- Automatic destructive fallback is forbidden in release builds.
- [YourApp] MUST NOT silently reset the store after a migration or store-open failure.
- Debug reset tooling MUST NOT be presented as the default solution for durable schema evolution.

## Store Initialization And Failure Handling

- Store open failures MUST fail loudly and diagnostically.
- Migration failures MUST be surfaced clearly to the user or developer.
- Logs and diagnostics MUST include relevant schema and migration version information when available.
- Hidden destructive fallback is forbidden.
- Recovery UI may offer an explicit reset action, but only as a user-visible last resort.

## Experimental Vs Durable Models

Reset-first development is acceptable only when the persisted model is clearly throwaway:

- short-lived spikes or prototypes
- isolated experiments with no meaningful retained data dependency yet
- models not referenced by approved specs
- models not depended on by other features, tests, demos, or seeded data

Migration becomes mandatory when any of the following is true:

- the feature or model is on `main`
- the feature is referenced by an approved spec
- the data is user-visible or drives visible UI
- tests, fixtures, demos, or seeded data depend on it
- multiple features depend on it
- the same breakage has already happened more than once

If a model has crossed out of experiment status, reset-first development is over.

## Environment Rules

### Spike Work

- Explicit reset-only workflows are acceptable.
- Do not pretend spike persistence is durable.
- Before merging, either remove the throwaway model or promote it to durable handling.

### Main Branch

- Durable persisted changes on `main` must carry schema versioning and migration planning.
- "Everyone can just reset" is not acceptable once the change is shared on the mainline.

### Internal, Shared, And Test Builds

- Migration is mandatory for durable schema changes.
- Store-open paths and migration behaviour must be tested before handoff.
- Seeded and demo data must continue to open or be intentionally regenerated through explicit tooling.

### Production Readiness

- Migration is mandatory.
- Migration behaviour must be tested against prior schema versions.
- Destructive reset may exist only as an explicit recovery path, never as a hidden fallback.

## Testing Requirements

Changes that touch persisted models or migration paths MUST include the right verification. At minimum, require the tests that prove the real risk.

- test that the current store still opens successfully
- test migration from the relevant prior schema version or versions
- test preservation of critical entities, identifiers, and relationships
- test required defaults, backfilled values, and derived-field meaning after migration
- add migration smoke tests where feasible so gross incompatibilities fail fast

When multiple features share the same unified schema, migration tests must prove that changed models migrate correctly and unchanged models still survive the version step.

## Specification And Documentation Alignment

Persistence-affecting changes must update the relevant durable docs, not just code.

- update the relevant feature specification when persisted behaviour or contracts change
- update persistence system docs when persistence rules or implementation expectations change
- keep terminology consistent across specs, system docs, code, and PR descriptions
- do not leave conflicting old guidance in agent docs, lessons, or workflow docs

## PR Expectations

Any PR touching persisted models, migration plans, or store lifecycle must answer these questions clearly:

- Did the persisted schema change?
- What schema version change is required?
- Is migration required? If not, why not?
- If a model in `stableModels` or `HistoricalSchemaModels` was modified, was it frozen and replaced in prior schemas?
- Do all adjacent `VersionedSchema` definitions resolve to unique model type sets (no duplicate checksums)?
- Were store-open and migration tests added or updated?
- Are defaults, derived values, identifiers, and relationships preserved correctly?
- Are any reset tools strictly `DEBUG`-only or explicitly developer-only?
- Is destructive fallback avoided outside explicit recovery flows?
- Were relevant specs and docs updated?

If the PR does not answer those questions, the review is incomplete.

## Default Decision Rule

If you are unsure, choose migration unless the model is clearly throwaway.

## Release Migration Enforcement

For release-aware migration enforcement — git tag protocol, fixture store testing, upgrade path verification across all shipped versions, and the release workflow checklist — see `Documentation/system/release-migration-policy.md`.

The release migration policy extends this document. It does not replace it.

## Related Docs

- `Documentation/system/persistence-and-swiftdata.md`
- `Documentation/system/swiftdata-migrations.md`
- `Documentation/system/release-migration-policy.md`
- `Documentation/system/testing-strategy.md`
- `Documentation/system/git-and-review-workflow.md`
- `Documentation/system/code-review-standard.md`
- `Documentation/specifications/persistence-specification.md`
