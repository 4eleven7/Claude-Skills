<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name, adjust schema version chains and model names to match your persistence layer. -->

# SwiftData Migrations

> Canonical [YourApp] strategy for SwiftData schema evolution, migration implementation, and migration testing.
>
> For the policy that decides when migration work is mandatory, see `Documentation/system/persistence-policy.md`.
> For container assembly and runtime persistence mechanics, see `Documentation/system/persistence-and-swiftdata.md`.

**Version:** 1.1
**Status:** Approved
**Last Updated:** Thursday 20 March 2026

---

## Purpose

[YourApp] uses one unified SwiftData schema for the whole app. A persistence change in any feature can stop the whole app from opening.

This document defines how [YourApp] evolves SwiftData safely:

- how schema history is structured
- when to use lightweight vs custom migration stages
- how to freeze historical schema definitions
- how migration tests must prove real store compatibility
- when backfill belongs in migration code vs runtime repair code

---

## [YourApp] Strategy

[YourApp] ships one migration chain in `Infrastructure/Persistence/PersistenceMigrationPlan.swift`.

Current live chain:

- `SchemaV1` through `SchemaV3` (example — your chain will grow as you ship versions)

Rules:

- [YourApp] has one app-wide schema version chain, not per-feature version chains.
- `PersistenceSchema.schema` must always point at the latest `VersionedSchema`.
- `PersistenceMigrationPlan.schemas` must contain every shipped schema version in order.
- `PersistenceMigrationPlan.stages` must contain every adjacent version transition in order.
- Historical schema membership must be explicit.
- Historical schemas must never be derived from `PersistenceSchema.allModels`, `stableModels`, or any other current registry.

That last rule matters. Using current model registries inside old `VersionedSchema` definitions is a migration bug. Future model additions or model-shape changes will silently mutate old schemas and make migration tests lie.

---

## Historical Schema Structure

[YourApp] keeps the latest schema in current model files, but historical schemas must freeze old shapes.

Required structure:

1. Latest schema:
   - uses current `@Model` types
   - is the only schema allowed to point at `PersistenceSchema.allModels`
2. Historical schemas:
   - use explicit model arrays
   - use frozen snapshot types for any model that changed after that version shipped
   - must not be edited in place except to replace an accidentally current mutable type with the frozen historical copy

Practical rule:

- If `UserPreferencesModel` changes in `SchemaV3`, then `SchemaV2` must stop referencing the live `UserPreferencesModel` type and instead use a frozen `SchemaV2.UserPreferencesModel` snapshot.

Do not rely on "it still compiles." Compilation does not prove historical schemas are still historically correct.

**`stableModels` trap:** [YourApp] uses `PersistenceSchema.stableModels` as a convenience for models that have never changed. This is safe only as long as the models remain unchanged. The moment a model in `stableModels` gains, loses, or renames a stored property, it must be removed from `stableModels`, frozen at the last unchanged version, and the frozen type referenced in every prior schema. If you skip this step, two adjacent `VersionedSchema` definitions will resolve to the same Swift types, producing duplicate checksums and a `NSStagedMigrationManager` crash at container init. See failure scenario #5 below.

---

## When A Migration Must Be Added

Follow `Documentation/system/persistence-policy.md`.

In practice, add a new schema version when any durable persisted change happens:

- add a persisted property
- remove a persisted property
- rename a persisted property
- change a property type
- change relationship semantics
- add or remove a model/entity
- change identifier or uniqueness semantics
- change the meaning of stored data

Do not use "developers can reset their stores" as the default answer once the data is durable, on `main`, user-visible, or spec-referenced.

---

## Lightweight vs Custom Migration

### Lightweight

Use lightweight migration only when SwiftData can safely carry old rows forward without data transformation.

Typical lightweight changes:

- add an optional property
- rename a property using `@Attribute(originalName:)`
- add a new model with no required data copied from old rows
- add a non-optional property only when the stored-property default is explicit and tested

Important rule:

- Initializer defaults are not migration defaults.
- If a new non-optional field needs a default for migrated rows, put the default on the stored property itself and prove it with a migration test.

Bad:

```swift
@Model
final class UserPreferencesModel {
    var showTransportInTimeline: Bool

    init(showTransportInTimeline: Bool = true) {
        self.showTransportInTimeline = showTransportInTimeline
    }
}
```

Good:

```swift
@Model
final class UserPreferencesModel {
    var showTransportInTimeline: Bool = true
}
```

### Custom

Use a custom migration stage when existing rows need transformation or repair.

Typical custom cases:

- change stored type
- split or merge models
- remove required data that needs fallback handling
- backfill required fields from old columns
- semantic changes that need deterministic transformation

Rule:

- Lightweight is only acceptable when the old row can open safely and mean the right thing after migration.
- If semantics need deliberate repair, use a custom stage.

---

## How To Add A New Schema Version

When adding `SchemaVN`:

1. Add `SchemaVN: VersionedSchema`.
2. Point `PersistenceSchema.currentVersion` at `SchemaVN`.
3. Append `SchemaVN.self` to `PersistenceMigrationPlan.schemas`.
4. Append exactly one `MigrationStage` for `SchemaV(N-1) -> SchemaVN`.
5. **Freeze any changed models:** if the change modifies an existing model (not just adding a new one), create a frozen `@Model` snapshot inside `SchemaV(N-1)` that captures the model's shape WITHOUT the new fields. Remove the model from `stableModels`/`HistoricalSchemaModels` and reference the frozen type in every schema before N.
6. **Verify checksum uniqueness:** confirm that no two adjacent `VersionedSchema.models` arrays contain the same set of Swift types.
7. Add or update migration tests for `V(N-1) -> VN`.
8. Update persistence docs and any affected feature specs.

Do not:

- edit old shipped schema snapshots in place to match new production models
- skip version numbers
- add a new schema without tests
- rely on a reset flow as the migration plan

---

## Backwards Compatibility Rules

- [YourApp] supports forward migration from every shipped schema in the version chain.
- [YourApp] does not support backward migration.
- Migration failure must be loud and diagnosable.
- Outside explicit developer-only flows, [YourApp] must not silently destroy the store to recover.
- If a downgrade cannot read a newer store, the app must fail with diagnostics rather than fabricate a fake "fresh install" state.

---

## Breaking Changes During Active Development

[YourApp] is allowed to treat truly throwaway persistence differently, but only while it is still genuinely throwaway.

Allowed reset-first cases:

- isolated spike work
- non-shared experiments
- no approved spec
- no UI-visible retained data
- not on `main`

Not allowed:

- shared mainline features
- durable developer/test/demo stores
- any persisted model already referenced by specs, tests, or visible UI

If you are arguing that a durable model should avoid migration because "this is still early," the default assumption is that you are wrong.

---

## Migration Testing Contract

Every adjacent migration stage must be tested with a real on-disk store created from the old schema.

Minimum required coverage:

1. Create a store using the old `VersionedSchema`.
2. Seed representative old rows.
3. Close that container.
4. Re-open through `PersistenceContainer` and the real migration plan.
5. Verify the current models after migration.
6. Verify untouched models still survive the version step.
7. Verify defaults, backfills, identifiers, and important invariants.

[YourApp] also needs guard tests that fail earlier than migration smoke tests:

- latest schema in `PersistenceSchema.schema` matches the tail of `PersistenceMigrationPlan.schemas`
- migration plan stage count matches adjacent version transitions
- historical schemas use frozen snapshot types for changed models instead of live mutable current types

Migration smoke tests without guard tests are not enough. Guard tests catch structural mistakes before a specific migration fixture is even written.

---

## Backfill vs Runtime Repair

Use migration/backfill logic when:

- the store must open correctly
- required persisted fields need values
- meaning of stored data changed
- future queries would be wrong unless data is transformed immediately

Use runtime repair only when all of these are true:

- the store already opens safely
- the data is recoverable or derived
- the repair is idempotent
- the app can tolerate the old value until the repair runs
- the repair is documented as runtime repair, not migration

Examples of acceptable runtime repair:

- recomputing cached summaries
- refreshing derived analytics snapshots
- opportunistically rebuilding debug artifacts

Examples that belong in migration instead:

- backfilling a new required persisted field
- remapping old enum raw values
- converting identifiers or relationships
- fixing a stored field whose old value now means the wrong thing

Do not hide a broken migration behind startup "repair" code.

---

## Common Failure Scenarios

### 1. Historical schema derived from current model registry

Problem:

- adding a future model silently changes an old schema
- migration tests stop proving what they claim to prove

Prevention:

- keep historical schema membership explicit
- add guard tests for frozen historical models

### 2. New required field relies on initializer default

Problem:

- old rows migrate without a stored value
- container creation can fail or the field can be wrong

Prevention:

- use a stored-property default or a custom migration backfill
- add a migration test for the old schema store

### 3. Old schema snapshots edited in place

Problem:

- migration history no longer matches shipped reality

Prevention:

- only add the next schema version
- never "update" old historical snapshots to the new live shape

### 4. Tests only cover fresh in-memory stores

Problem:

- fresh-store behavior passes while migrated on-disk stores fail

Prevention:

- migration tests must build real old-schema stores on disk and reopen them through the real container

### 5. "Stable" model modified without freezing the old version

Problem:

- a model in `stableModels` or `HistoricalSchemaModels` gains a stored property
- multiple VersionedSchemas reference the live type, so they all reflect the new field
- two adjacent schemas produce identical model checksums
- `NSStagedMigrationManager` crashes with `_findCurrentMigrationStageFromModelChecksum:` abort

Prevention:

- before adding a property to any model in a shared list, remove it from that list
- create a frozen snapshot (without the new field) nested inside the last schema version before the change
- reference the frozen type in every prior historical schema
- reference the live type only in the schema version where the field was introduced and later

### 6. Runtime repair used as migration substitute

Problem:

- store-open bugs move later into app lifecycle
- data integrity becomes timing-dependent

Prevention:

- put structural and semantic repair in migration stages
- reserve runtime repair for derived or recoverable data only

---

## Example Patterns

### Correct lightweight version bump

```swift
nonisolated enum SchemaV3: VersionedSchema {
    static var versionIdentifier: Schema.Version { Schema.Version(3, 0, 0) }

    static var models: [any PersistentModel.Type] {
        PersistenceSchema.allModels
    }
}

nonisolated enum PersistenceMigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] {
        [SchemaV1.self, SchemaV2.self, SchemaV3.self]
    }

    static var stages: [MigrationStage] {
        [
            MigrationStage.lightweight(fromVersion: SchemaV1.self, toVersion: SchemaV2.self),
            MigrationStage.lightweight(fromVersion: SchemaV2.self, toVersion: SchemaV3.self)
        ]
    }
}
```

### Correct freeze when modifying a model in `stableModels`

When a model in `stableModels` or `HistoricalSchemaModels` gains a new stored property, you must freeze the old shape. This example shows adding `categoryID` to `ItemModel` in SchemaV3.

**Step 1 — Remove from shared list:**

```swift
// PersistenceSchema.swift
static let stableModels: [any PersistentModel.Type] = [
    // ... other models ...
    // ItemModel.self  ← REMOVE from here
]

static let allModels: [any PersistentModel.Type] =
    stableModels + [
        ItemModel.self,  // ← ADD here (live type, has categoryID)
        // ... other non-stable models ...
    ]
```

**Step 2 — Create frozen snapshot in the last schema before the change:**

```swift
nonisolated enum SchemaV2: VersionedSchema {
    // ...
    static var models: [any PersistentModel.Type] {
        PersistenceSchema.stableModels + [
            SchemaV2.ItemModel.self,  // ← frozen type WITHOUT categoryID
            // ... other models ...
        ]
    }

    /// Frozen snapshot of ItemModel at V2.
    /// V3 adds categoryID: UUID?
    @Model
    final class ItemModel {
        @Attribute(.unique) var id: UUID
        var name: String
        var createdAt: Date
        // ... all fields EXCEPT categoryID ...
    }
}
```

**Step 3 — Reference frozen type in all prior schemas:**

```swift
// HistoricalSchemaModels (used by V1):
static let items: [any PersistentModel.Type] = [
    SchemaV2.ItemModel.self  // ← frozen, not live
]

// V2 (use stableModels + explicit):
static var models: [any PersistentModel.Type] {
    PersistenceSchema.stableModels + [
        SchemaV2.ItemModel.self,  // ← frozen
        // ...
    ]
}
```

**Step 4 — New schema uses live type:**

```swift
nonisolated enum SchemaV3: VersionedSchema {
    static var models: [any PersistentModel.Type] {
        PersistenceSchema.stableModels + [
            ItemModel.self,  // ← live type WITH categoryID
            // ...
        ]
    }
}
```

**Step 5 — Add guard test:**

```swift
#expect(ObjectIdentifier(SchemaV2.ItemModel.self) != ObjectIdentifier(ItemModel.self))
```

### Correct custom backfill

Use a custom stage when data transformation is required, and test it with a seeded old store.

```swift
static let migrateV2toV3 = MigrationStage.custom(
    fromVersion: SchemaV2.self,
    toVersion: SchemaV3.self,
    willMigrate: { context in
        // fetch old rows, transform, save deterministically
        try context.save()
    },
    didMigrate: nil
)
```

---

## CI And Validation

CI should fail migration mistakes in three ways:

1. `[YourApp]Tests/PersistenceMigrationPlanTests`
   - migration smoke tests for every adjacent version pair
   - missing-stage failure tests
   - frozen historical schema guard tests
2. `[YourApp]Tests/PersistenceSchemaTests`
   - latest schema registration and completeness checks
3. full [YourApp] test suite in `Scripts/check_all_builds.sh`

Recommended developer command for migration work:

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:[YourApp]Tests/PersistenceMigrationPlanTests \
  -only-testing:[YourApp]Tests/PersistenceSchemaTests \
  -only-testing:[YourApp]Tests/PersistenceContainerTests \
  test
```

If a schema changed and these tests were not updated, the review is incomplete.

---

## Related Docs

- `Documentation/system/persistence-policy.md`
- `Documentation/system/persistence-and-swiftdata.md`
- `Documentation/system/release-migration-policy.md`
- `Documentation/system/testing-strategy.md`
- `Documentation/specifications/persistence-specification.md`
