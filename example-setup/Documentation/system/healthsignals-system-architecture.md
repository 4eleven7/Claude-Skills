<!-- This is an example template. Replace [YourApp] and all generic names with your actual app and domain concepts. -->

# DataPipeline System Architecture

> Every feature reads from DataPipeline. Every data source writes through DataPipeline. Nothing else.

**Version:** 1.0
**Status:** Example Template

---

## 1. DataPipeline Contract

This section defines what the core guarantees and what it requires. Every feature team (or AI agent) must understand this contract before integrating.

### 1.1 What DataPipeline Guarantees

| Guarantee | Detail |
|-----------|--------|
| **Single canonical truth** | For any (eventType, time window), exactly one resolved canonical value exists. No feature ever sees conflicting data. |
| **Deterministic resolution** | Ingesting Source A then Source B produces identical canonical state to Source B then Source A. Resolution uses priority rank + alphabetical tiebreaker — never timestamps or ingestion order. |
| **Idempotent ingestion** | Ingesting the same raw batch twice produces identical canonical state. No duplicates, no value drift. |
| **Per-chunk atomicity** | Each 500-event chunk commits fully or rolls back entirely. Previously committed chunks survive failures. |
| **Serialised mutations** | All mutating operations (sync, ingest, delete, priority change) execute one at a time through the `IngestionEngine` actor. No concurrent modification races. |
| **Rolling aggregates** | Statistical summaries (count, average, min, max) over 7/14/30/60/90-day windows. Auto-recomputed on ingestion, deletion, and priority change. Returns `nil` when below minimum event thresholds. |
| **Provenance chain** | Every canonical event retains a full audit trail of which sources contributed what values. Queryable through the public API. |
| **Session reconciliation** | Overlapping sessions from multiple sources are merged into one canonical session using deterministic overlap rules. Non-overlapping sessions remain separate. |
| **Write-back** | Manual entries and feature-computed data are written back to writable connectors after canonical persist. Failure is isolated — canonical data is never lost. |
| **Observable state** | `isSyncing` and `sources` are observable `@MainActor` properties. Features can react to sync state changes. |

### 1.2 What DataPipeline Requires from Features

| Requirement | Detail |
|-------------|--------|
| **Read through `DataPipelineClient` only** | Call `events(type:in:)`, `sessions(type:in:)`, `aggregate(type:windowDays:)`, `provenance(for:)`. Never query SwiftData entities directly. |
| **Write through `DataPipelineClient` only** | Use `ingestManualEntry(_:)` for user-entered data, `ingestFeatureData(_:)` for feature-derived data. Never insert entities directly. |
| **Do not import `DataPipelineModels`** | Entity types are internal to DataPipeline and Persistence. Features import `DataPipelineFeature` only. |
| **Provide valid `RawEvent`** | Non-empty `externalID`, value within valid bounds, `endDate >= startDate`, timestamps not >1h in future or >2yr in past. Invalid events are silently discarded. |
| **Tolerate `nil` aggregates** | Aggregates return `nil` when insufficient data exists. Features must degrade gracefully. |

### 1.3 What DataPipeline Requires from Connectors

| Requirement | Detail |
|-------------|--------|
| **Conform to `DataConnector`** | Implement `fetchEvents(types:in:)` and `fetchSessions(types:in:)`. |
| **Self-filter** | Exclude events that [YourApp] originally wrote (e.g., filter by bundle ID). |
| **Provide stable `externalID`** | Same real-world event must produce the same external ID across syncs. |
| **Handle pagination internally** | The protocol returns `[RawEvent]`; large datasets should be paged internally to bound memory. |

### 1.4 Identity Rules

- **Events:** Identified by `(eventType, sourceType, sourceExternalID)` for same-source dedup, and `(eventType, time proximity within dedup window)` for cross-source dedup (where permitted).
- **Sessions:** Identified by `(sessionType, sourceExternalIDs[sourceType])` for same-source update, and `(sessionType, overlap ratio + minimum duration)` for cross-source merge.
- **Aggregates:** Identified by `(eventType, windowDays)`. One cached result per pair.

### 1.5 Time Semantics

- All `Date` values are absolute timestamps (UTC).
- DataPipeline performs no timezone conversion. Display-layer features handle local time.
- Logical day grouping (for cumulative aggregates) uses CoreTypes date policy.
- Aggregates exclude today's partial data (`referenceDate` = start of logical day).

### 1.6 Conflict Resolution

Priority-based, deterministic, order-independent:

1. Lower priority number wins (1 beats 2).
2. Equal priority: alphabetical `sourceType.rawValue` wins.
3. Never uses `importedAt` or any ingestion-order-dependent value.

### 1.7 Ownership Boundaries

| Entity | Owner | Others |
|--------|-------|--------|
| Canonical events | DataPipeline (write via pipeline only) | Features read through client |
| Canonical sessions | DataPipeline (write via pipeline only) | Features read through client |
| Provenance records | DataPipeline (append-only) | Features read through client |
| Rolling aggregates | DataPipeline (recomputed automatically) | Features read through client |
| Source configuration | DataPipeline + User (enable/disable/priority) | Features observe |
| Sync state | DataPipeline (watermarks, status) | Not exposed to features |

---

## 2. Feature Integration Mapping

Each feature is classified by its role relative to DataPipeline:

- **Producer** — writes raw events into DataPipeline via `ingestManualEntry()` or `ingestFeatureData()`
- **Consumer** — reads canonical events, sessions, or aggregates from `DataPipelineClient`
- **Transformer** — reads events, computes derived data, and writes results back (consumer + producer)
- **Independent** — does not interact with DataPipeline at all

### 2.1 Feature Role Summary

| Feature | Role | Depends On | Runs When | Failure Behaviour |
|---------|------|------------|-----------|-------------------|
| **Dashboard** | Consumer | task events, project events | User views dashboard, sync completes | Degrades to empty state if no data |
| **Reports** | Consumer | All event types (via summary providers) | Scheduled refresh, on demand | Partial data produces partial report; retry on next refresh |
| **Notifications** | Independent | — | Scheduled delivery, user interaction | N/A |
| **Profile** | Independent | — | User interaction | N/A |
| **Settings** | Independent | — | User interaction | N/A |

### 2.2 Detailed Integration Notes

#### Dashboard -- Consumer

Dashboard reads canonical events from DataPipeline:

- Task completion events are `CanonicalEvent(type: .taskCompletion)` from DataPipeline.
- Project milestone events are `CanonicalEvent(type: .projectMilestone)` from DataPipeline.
- `DashboardClient` wraps `DataPipelineClient` to provide dashboard-specific queries and computed metrics.

**Recomputation trigger:** Whenever DataPipeline completes a sync that touches relevant event types.

#### Reports -- Consumer

Report providers read from DataPipeline instead of feature-specific stores:

- Task summary provider: reads canonical task completion events.
- Project summary provider: reads project milestone events.
- Each provider computes period-level aggregates from canonical data.

### 2.3 Future Features

| Future Feature | Role | Events Consumed | Events Produced |
|---------------|------|-----------------|-----------------|
| **Insights** | Consumer | All event types, aggregates | Insight score (feature-internal) |
| **Integrations** | Transformer | External API events | Normalised events written back |
| **Automation** | Consumer | Task events, project events | Automated actions (feature-internal) |

---

## 3. Key Architecture Decisions

### 3.1 DataPipeline as Shared Infrastructure, Not a Feature

DataPipeline occupies the same architectural tier as CoreModels and Persistence. Features MAY import `DataPipelineFeature`. This is a deliberate departure from the "no feature imports another feature" rule — DataPipeline is infrastructure, not a feature.

### 3.2 Features Become Thin Facades

Dashboard and Reports no longer own primary event data. They become thin computation layers over `DataPipelineClient`:

- Dashboard computes metrics and summaries from canonical events.
- Reports presents canonical events with computed aggregates.

This eliminates data duplication, inconsistent sources of truth, and per-feature dedup logic.

### 3.3 Post-Sync Notification Pattern

After `syncAll()` completes, the composition root dispatches notifications to interested feature clients. This is a simple `@MainActor` callback, not an event stream. Features re-query `DataPipelineClient` to get updated data. This keeps the architecture boring and obvious.

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Initial example template. DataPipeline contract, integration mapping, key decisions. |
