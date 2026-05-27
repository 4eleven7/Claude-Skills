<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust feature-specific examples to match your domain. -->

# SwiftUI View Guidelines

## Purpose

Define how SwiftUI views are built in [YourApp].

This document is an engineering standard, not a SwiftUI tutorial. It exists to keep [YourApp] views predictable, performant, and easy to reason about.

Developers and AI agents should use this document when:

- adding a new feature screen
- changing an existing view hierarchy
- deciding where state or presentation logic belongs
- deciding whether to extract a subview or reusable component
- reviewing a SwiftUI change before merge

If a proposed view structure fights these rules, fix the structure instead of documenting the exception.

## Core Principles For SwiftUI Views

### 1. Treat `body` as a cheap, pure description

SwiftUI may re-evaluate a view often. That is normal. The problem is not recomputation itself; the problem is expensive work during recomputation.

Rules:

- Keep `body` side-effect free.
- Keep `body` cheap enough that frequent recomputation is harmless.
- Assume every property read in `body` becomes part of that view's dependency surface.
- Do not perform synchronous I/O, heavy formatting, large transformations, or business logic in `body`.
- **Never call SwiftData repository methods inside `body`, computed view properties, or `ForEach` closures.** Fetch in `.task` or `.onChange`, cache in `@State`, bind views to the cache.
- Only hold `@Environment` references to `@Observable` clients whose properties the view actually reads. Each unnecessary environment dependency creates a spurious re-render surface — if the client's properties change from background work, the view re-evaluates during scrolling.

Anti-patterns:

- creating `DateFormatter`, `MeasurementFormatter`, `NumberFormatter`, or `Calendar`-heavy work inline
- sorting, filtering, grouping, or section-building collections inline
- allocating `UUID()` or random values in `body`
- starting `Task`s, network work, persistence writes, or analytics directly from `body`

### 2. Keep views small and focused

A view should own one job:

- screen coordination
- section layout
- row rendering
- reusable control rendering

When one view owns loading, routing, filtering, formatting, layout, and cell rendering at once, it becomes fragile and expensive.

### 3. Minimise invalidation scope

A view should depend on the smallest state surface that can drive it.

Rules:

- Read shared clients at the container boundary, not everywhere by default.
- Pass narrow values or bindings to child views instead of entire clients when the child does not need the client.
- Avoid broad observation of large models or arrays when a child only needs one value.
- Prefer small rendering views with plain inputs for repeated UI such as rows and cards.

### 4. Prefer stable identity

SwiftUI state and lifetime are tied to identity. If identity changes unnecessarily, state resets and lifecycle hooks fire again.

Rules:

- Use stable domain IDs in `ForEach`.
- Do not use array offsets as identity unless the data is static and order never changes.
- Do not create ephemeral IDs in `body`.
- Prefer changing modifiers over swapping whole view types when the underlying view is conceptually the same.
- Prefer inert modifier changes over `if` branches when the structure is the same and only style or enablement changes.
- Avoid `AnyView` unless bridging an API leaves no realistic alternative.

### 5. Keep state ownership explicit

[YourApp] does not want mystery state.

Rules:

- `@State` owns view-local UI state only.
- `@Binding` edits state owned by a parent.
- `let` properties carry immutable rendering input.
- `@Environment` or injected clients carry shared feature-level state.
- Persisted or business-critical state belongs in the feature client, repository, or domain layer, not copied into ad-hoc view state.

### 6. Push real logic out of the view

Views may contain presentation logic. They should not contain domain logic.

Belongs in the view:

- layout branching
- trivial display-only booleans
- choosing between already-prepared display strings
- cheap styling decisions

Does not belong in the view:

- business rules
- persistence coordination
- domain data interpretation
- logical day calculations
- expensive data shaping
- work that clearly deserves direct tests

If the code needs its own behavioural tests, it probably does not belong in the view.

### 7. Use lifecycle callbacks sparingly

`onAppear` and `onDisappear` are easy to abuse because views appear and disappear for structural reasons, scrolling, navigation, and identity changes. They are not reliable substitutes for app lifecycle or model lifecycle.

Default stance:

- do not reach for `onAppear` first
- do not put startup work in views
- do not rely on `onDisappear` for critical commits or cleanup

Use them only when the behaviour is genuinely tied to visible view lifetime.

## Modern SwiftUI Structure Guidance

### Container vs rendering view

This is the default [YourApp] split when a screen has non-trivial state or dependencies.

Container views:

- read feature clients from environment or init injection
- own screen-level `@State`
- coordinate loading, navigation, sheets, alerts, and tasks
- convert feature state into narrow rendering inputs

Rendering views:

- accept plain values and bindings
- avoid environment access by default
- avoid lifecycle hooks by default
- stay easy to preview in isolation

Example:

- `DashboardView` reads `DashboardClient`, owns selected date, and triggers refresh
- `DashboardList` renders sections from prepared display models
- `DashboardRow` renders one row from plain row data and closures

This split is useful when it shrinks dependency scope and makes previews easier. It is not mandatory for every small screen.

### When to extract a subview

Extract a subview when at least one of these is true:

- the child has a distinct responsibility
- the child can take a narrow input surface instead of the parent's broad state
- the child needs its own preview
- the child is reused
- the parent becomes hard to scan because multiple conceptual sections are mixed together

### When not to extract a subview

Do not extract a subview just because `body` is long.

Keep code local when:

- the markup is small and only used once
- extraction would require passing a large pile of one-off values
- the child has no independent meaning outside the parent
- extraction would hide simple layout behind file churn

Bad extraction makes the codebase worse:

- five tiny files for one screen
- "shared" components with one call site
- wrapper views that only forward parameters

### Same-file private subview vs separate file

Use a same-file private subview when:

- it is tightly coupled to one parent
- it is not reused
- it helps readability but does not justify another file
- keeping the preview beside the parent improves local reasoning

Move a subview into its own file when:

- it has its own responsibility and name
- it is large enough to deserve its own preview and review surface
- it is reused in multiple places
- changes to it are likely to happen independently of the parent

### When a reusable component should exist

Create a shared reusable component only when reuse is real.

Good reasons:

- two or more concrete call sites already exist
- a common control needs one consistent contract across features
- accessibility and interaction behaviour should be centralized

Bad reasons:

- "we might reuse this later"
- "the design looks generic"
- "the file felt long"

[YourApp] prefers duplication over fake reuse. Duplicate once, then extract when the second use proves the shape.

## File-Splitting Rules

Use these decision rules in order.

| Situation | Rule |
|---|---|
| Small helper layout used once and tightly coupled to one screen | Keep it in the same file as a private subview or computed view property |
| Section or row used once but meaningfully improves readability | Keep it in the same file first |
| Subview has its own preview, own responsibility, or independent churn | Move it into a separate file |
| Same UI concept appears in multiple features or screens with the same contract | Create a shared reusable component |
| Reuse is hypothetical or based on visual similarity only | Do not extract yet |
| Extraction would require passing many parent-only details | Keep it local and simplify the parent another way |

Practical defaults:

- start with one file for one screen
- split only when the structure becomes clearer after the split
- keep parent plus tightly-coupled child views together until a real boundary appears
- do not create a component folder full of one-use wrappers

The goal is local reasoning first, reuse second.

## State And Update-Frequency Guidance

### Choose the narrowest source of truth

Ask one question first: who actually owns this state?

Use:

- `@State` for local UI concerns such as selection, expansion, focus, temporary draft text, or presentation flags
- `@Binding` when a parent owns the state
- feature clients for persisted state, async loading state, and shared feature state
- plain immutable inputs for already-derived display data

Do not mirror shared client state into local `@State` unless you are intentionally creating a staged editing buffer.

### Limit dependency surfaces

SwiftUI updates a view when data it depends on changes. With Observation, property access matters. Reading broad state broadly causes broad invalidation.

Rules:

- Read only the properties a view truly needs.
- Avoid passing a whole client into a repeated child if the child only needs a title and a flag.
- Avoid helper methods that reach back into broad observed state from many child views.
- Prefer prepared row/section models for lists instead of having each row rediscover data from a shared source.

### Reduce unnecessary redraws

Focus on the real causes first:

- broad dependencies
- unstable identity
- expensive work in `body`

Do not start with clever micro-optimizations.

Preferred fixes:

- move heavy derivation to the client or a helper that runs when source data changes
- split broad container views into smaller rendering views with narrow inputs
- make list identity stable
- keep expensive formatters or transformation helpers out of hot render paths

Do not reach for `Equatable` wrappers, manual invalidation tricks, or wrapper indirection first. Fix dependencies and work placement first.

### Avoid transient work during updates

Do not re-do work every time a view updates if the input did not meaningfully change.

Examples of work that should usually happen outside `body`:

- sorting events into sections
- generating chart points
- building display strings from expensive formatters
- grouping by day or month
- deduplicating, filtering, or joining collections

Good destinations for that work:

- feature client when source data changes
- dedicated mapper/helper with explicit inputs
- cached shared formatter helpers
- preview fixtures when only previews need it

Do not stuff derived data into `@State` just to avoid recomputation. That creates stale mirrors and broken update logic. Put the work at the real source of change instead.

### Be careful with environment access

Environment injection is useful, but broad environment reads deep in the tree can make updates harder to reason about.

House style:

- read environment clients at container boundaries by default
- pass narrow values, bindings, or closures down
- let deeply nested views read environment directly only when that genuinely simplifies the code and the dependency is stable and intentional

### Do not use views as caches of business data

If a screen needs precomputed sections, statistics, or display models, compute them in the client or a helper that the client owns.

The view should render current state, not secretly maintain a second model of the feature.

## `onAppear` / `onDisappear` Guidance

### Why they are overused

They look convenient, but they hide lifecycle assumptions that are often wrong:

- views can appear multiple times
- rows in lazy containers appear and disappear during scrolling
- identity changes can trigger fresh appearance
- parent structure changes can recreate children

If the work must happen exactly once for the process, feature, or screen state machine, a view callback is the wrong tool.

### Appropriate uses

Use `onAppear` or `onDisappear` only for local, idempotent, view-lifetime behaviour such as:

- starting or stopping a visual effect tied to visibility
- focusing a control when the screen becomes visible
- lightweight analytics that truly track visibility and tolerate repeated calls

Even then, keep the work cheap and explicit.

### Prefer these alternatives first

Use `.task` when:

- the work is asynchronous
- the work should cancel automatically when the view disappears
- the work should restart when a specific input changes via `.task(id:)`

Use explicit user actions when:

- the work is caused by a tap, refresh, submit, or selection

Use parent coordination when:

- the parent owns navigation or presentation
- child visibility should trigger parent-owned behaviour

Use the model layer or app composition when:

- the work is startup, registration, persistence bootstrapping, background task registration, or feature lifecycle setup

### Anti-patterns

- loading core screen data in `onAppear` when `.task` is the real intent
- treating `onAppear` as "view init"
- treating `onDisappear` as guaranteed final cleanup
- saving critical edits only in `onDisappear`
- kicking off pagination from every row without idempotence or debouncing
- registering app-wide services from a view

## Computed Property Guidance

### Harmless computed properties

These are usually fine:

- simple booleans
- cheap optional unwrapping
- small style choices
- tiny `some View` helpers that just compose existing values
- trivial display text from already-prepared values

Rule of thumb:

- constant-time
- allocation-free or near enough
- no iteration over collections
- no formatter creation
- no hidden environment or client reads beyond what the view obviously depends on

### Computed properties that cause avoidable overhead

These are common mistakes:

- computed properties that sort, filter, map, group, or reduce collections
- computed properties that create formatters
- computed properties that perform date boundary logic repeatedly
- computed properties that walk shared observed state in many children
- computed properties with hidden side effects

These still run during view evaluation. Moving work from inline `body` code into a computed property does not make it cheap.

Moving the same work into a view `init` usually does not fix the problem either. SwiftUI view values are transient, so heavy initialization code can still run far more often than you expect.

### When to precompute

Precompute when the work is non-trivial and the inputs change less often than the view updates.

Examples:

- list sections derived from events
- chart series derived from samples
- formatted summary strings for large lists
- grouped and sorted presentation models

Good homes for precomputation:

- feature client
- dedicated mapper/helper with explicit input data
- debug or preview fixture builder

### When to memoize or cache

Cache only when the work is measured or obviously expensive.

Preferred forms:

- shared formatter helpers with stable configuration
- client-owned derived state refreshed when the real source changes
- preview-specific shared context for heavy preview setup

Do not build ad-hoc memoization layers inside views unless you have measured a real problem. Most of the time the correct fix is narrower dependencies and less work in `body`.

## Previews

### When previews are required

Previews are required for:

- reusable controls and reusable rendering components
- visually non-trivial rows, cards, and sections
- screens with meaningful empty, content, error, or loading states where visual iteration matters

### When previews are optional

Previews are optional for:

- thin container views that mostly inject dependencies and delegate rendering
- trivial wrappers with no meaningful visual states
- debug-only dev-views where the preview adds no real signal

[YourApp] does not require previews for the sake of ceremony.

### How many previews are useful

Usually two to four is enough.

Prefer major states:

- primary content state
- empty state
- loading or error state if visually meaningful
- one stress state if layout can break from long text or dense data

Do not explode every boolean combination into a preview matrix unless the component is genuinely state-heavy and the matrix reveals real layout risk.

### Preview data rules

Use lightweight, deterministic preview data:

- fixed dates
- fixed UUIDs where identity matters
- small data sets
- no network
- no HealthKit
- no app boot sequence

Prefer direct sample values or `.mock` / `.mockList` fixtures over bootstrapping `CompositionRoot`.

For shared preview and fixture conventions, see `Documentation/system/fixture-and-mock-data-guidelines.md`.

If a preview truly needs a model container, keep it preview-local and in-memory. Do not create a second container inside a running app flow.

### Keep previews fast and stable

Rules:

- use modern `#Preview` syntax
- use `@Previewable` for simple preview-local state when helpful
- keep preview wiring minimal
- avoid async preview setup that hits real services
- share heavy preview setup only when multiple previews genuinely need it

Good preview code should make the view easy to inspect, not recreate production startup.

### Previews vs dev-views

Previews:

- fast visual iteration
- focused state snapshots
- local component inspection

Dev-views:

- manual workflows
- seeded data inspection
- operational diagnostics

They solve different problems. Neither replaces tests.

## Stability And Performance Checklist

Before merging a SwiftUI change, check:

- `body` is pure and cheap
- no heavy sorting, filtering, grouping, or formatter creation happens in `body`
- view identity is stable and `ForEach` uses real IDs
- state ownership is explicit and the narrowest sensible owner holds it
- repeated subviews do not observe broad shared state unnecessarily
- side effects are not hidden in computed properties or `body`
- lifecycle hooks are justified, idempotent, and not standing in for app or model lifecycle
- extraction improved clarity instead of creating wrapper noise
- reusable components exist because reuse is real, not hypothetical
- previews cover the major visual states that matter
- preview setup is deterministic and lightweight

For a shorter merge-time checklist, see `Documentation/system/ui-implementation-checklist.md`.

## AI-Agent Instructions

When an AI agent builds SwiftUI views in [YourApp], follow these rules:

- Prefer concrete implementations over protocols and scaffolding.
- Start with one screen file and split only when a real boundary appears.
- Keep `body` cheap. Move expensive derivation out of the view.
- Extract subviews to narrow dependencies or improve readability, not to satisfy aesthetics.
- Keep tightly coupled helper views in the same file first.
- Create shared components only after concrete reuse exists.
- Read environment clients at container boundaries by default.
- Pass narrow values, bindings, and closures to rendering views.
- Avoid broad observation in repeated subviews.
- Do not put business logic, persistence, startup work, or domain-data interpretation in views.
- Prefer `.task` over `onAppear` for async view-lifetime work.
- Avoid `onDisappear` for critical commits or teardown assumptions.
- Add previews when they materially improve iteration or review; skip ceremonial previews.
- Keep previews deterministic, in-memory, and lightweight.
- Prefer readability and local reasoning over clever SwiftUI tricks.
- For visual quality standards and anti-pattern avoidance, follow `Documentation/system/swiftui-design-quality.md`.

If an agent cannot explain why a subview was extracted, the extraction is probably wrong.
