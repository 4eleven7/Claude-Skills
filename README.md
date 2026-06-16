# Agent Skills

Reusable agent skills for Apple platform engineering, product work, and project workflows. The active catalog contains 112 skills, grouped into plugin bundles but usable as plain `SKILL.md` directories by any agent runtime that supports local skills.

## What This Repo Contains

- Active skills live in `plugins/<bundle>/skills/<skill-name>/SKILL.md`.
- Long guidance, examples, and checklists live under each skill's `references/` directory.
- Project workflow personas live in `plugins/project-tools/agents/`.
- Plugin metadata lives in `.claude-plugin/` directories for runtimes that install bundled plugins.
- Repository validation helpers live in `scripts/`.
- `example-setup/` contains compact, generic project instruction and documentation templates.

## Lifecycle View

The lifecycle is exposed as skills, not command wrappers. Use `next-step-router` when the next phase is unclear.

| Phase | Primary Skills | Use |
|---|---|---|
| Define | `interview-me`, `idea-refine`, `spec-workflow`, `design`, `user-test` | Clarify intent, explore ideas, scope product direction, and define acceptance criteria before building. |
| Plan | `plan`, `project-state-audit`, `blast-radius`, `source-driven-development` | Turn scope into ordered work, find affected systems, and verify source-backed API assumptions. |
| Build | `implement`, `incremental-implementation`, `test-driven-implementation`, `small-change` | Execute approved work with the right level of slicing, tests, and verification. |
| Doubt | `doubt-driven-development`, `strategy-audit`, `independent-review` | Stress-test non-trivial implementation hypotheses, strategy claims, and high-risk decisions. |
| Debug | `hypothesis-debug`, `deep-investigate`, `forensics`, `agent-harness-audit` | Reproduce failures, isolate causes, fix bugs, or improve missing agent harnesses. |
| Review | `code-review`, `code-simplification`, `code-style`, `ux-audit`, `pre-ship` | Review correctness, quality, complexity, user experience, and release readiness. |
| Ship | `post-implementation-qa`, `pr-shipping`, `change-summary`, `session-handoff` | Run validation, summarize changes, commit, push, open PRs, and leave durable handoff state. |

## Catalog Summary

| Bundle | Skills | Purpose |
|---|---:|---|
| `plugins/ios-frameworks` | 35 | Apple framework skills for iOS and Apple platform development. |
| `plugins/ios-platform` | 11 | Cross-cutting Apple platform skills for architecture, debugging, testing, tooling, HIG, Swift language, and App Store release work. |
| `plugins/swiftui` | 9 | SwiftUI skills for implementation, design exploration, hardening, performance, visual review, shaders, and Figma translation. |
| `plugins/uikit` | 6 | UIKit skills for Auto Layout, collection views, Core Animation, navigation, fundamentals, and SwiftUI interop. |
| `plugins/project-tools` | 47 | Generic project workflow skills for planning, specs, debugging, review, refactoring, release, memory, and session hygiene. |
| `plugins/product` | 4 | Product skills for analytics interpretation, App Store marketing, monetization strategy, and onboarding. |
| **Total** | **112** | |

## Installation

### Codex

Use the skill directories directly, or copy/symlink them into the Codex skills directory.

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -sfn "$PWD"/plugins/*/skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Use copies instead of symlinks when you want a pinned snapshot that does not change as this repository changes.

### Claude Code

Install the plugin bundles from the Claude plugin marketplace:

```bash
/plugin marketplace add 4eleven7/Claude-Skills
/plugin install ios-frameworks@claude-skills
/plugin install ios-platform@claude-skills
/plugin install swiftui@claude-skills
/plugin install uikit@claude-skills
/plugin install project-tools@claude-skills
/plugin install product@claude-skills
```

Update installed plugins:

```bash
/plugin marketplace update claude-skills
```

## Skill Catalog

### ios-frameworks (35 skills)

Apple framework skills for iOS and Apple platform development.

| Skill | Use |
|---|---|
| `accessibility-audit` | Use when auditing Apple platform UI for VoiceOver, Dynamic Type, keyboard navigation, contrast, semantics, and patch-ready accessibility fixes. |
| `activitykit` | Use when implementing or reviewing Live Activities, Dynamic Island, Lock Screen presentations, or ActivityKit updates. |
| `alarmkit` | Use when implementing or reviewing AlarmKit alarms, countdowns, presentations, authorization, or timer flows. |
| `app-intents` | Use when implementing or reviewing App Intents, App Shortcuts, Siri, AppEntity, EntityQuery, Spotlight, or Control Center actions. |
| `apple-haptics` | Use when designing, implementing, or reviewing haptics with sensoryFeedback, UIFeedbackGenerator, Core Haptics, or AHAP patterns. |
| `authentication-services` | Use when implementing or reviewing Sign in with Apple, passkeys, credential providers, AutoFill, or AuthenticationServices flows. |
| `background-tasks` | Use when scheduling, reviewing, or debugging BGTaskScheduler, background refresh, processing tasks, or SwiftUI background tasks. |
| `camera-media` | Use when implementing or debugging camera capture, AVCaptureSession, PhotosPicker, PHPicker, limited library access, or HDR media handling. |
| `cloudkit` | Use when implementing, reviewing, or debugging CloudKit sync, CKSyncEngine, SwiftData with CloudKit, iCloud Drive, or iCloud key-value storage. |
| `combine` | Use when writing, reviewing, or migrating Combine publishers, subscribers, subjects, operator chains, or async bridges. |
| `core-data` | Use when writing or reviewing Core Data stacks, models, migrations, concurrency, relationships, or CloudKit integration. |
| `core-location` | Use when implementing or debugging Core Location authorization, CLServiceSession, CLMonitor, background location, or async location updates. |
| `coreml-vision` | Use when implementing or reviewing on-device machine learning with CoreML model loading, predictions, Vision image analysis, feature providers, or ML pipeline integration. |
| `discoverability` | Use when planning or debugging app discoverability through App Intents, Spotlight, Siri suggestions, Action Button, or Control Center. |
| `foundation-models` | Use when implementing Apple Foundation Models sessions, guided generation, tool calling, streaming, or availability checks. |
| `grdb` | Use when writing or reviewing GRDB records, SQL, migrations, associations, observation, concurrency, or persistence safety. |
| `healthkit` | Use when implementing or reviewing HealthKit authorization, samples, queries, workouts, background delivery, or HealthKit UI. |
| `ios-energy` | Use when diagnosing battery drain, thermal issues, power impact, polling, timers, Low Power Mode behavior, hot devices, Power Profiler findings, or energy efficiency regressions. |
| `ios-file-storage` | Use when choosing iOS file locations, backup behavior, file protection, disk pressure handling, atomic writes, or file I/O safety. |
| `ios-localization` | Use when implementing or reviewing string catalogs, plurals, RTL, locale-aware formatting, XLIFF, or localized App Shortcuts. |
| `ios-networking` | Use when implementing or reviewing URLSession, Network.framework, async network connections, diagnostics, or iOS networking failures. |
| `mapkit` | Use when implementing or debugging MapKit maps, annotations, clustering, search, directions, Look Around, or camera behavior. |
| `metal` | Use when implementing or debugging Metal render/compute pipelines, shaders, MTKView, command buffers, textures, or GPU capture. |
| `pdfkit` | Use when displaying, loading, annotating, searching, selecting, or bridging PDFKit documents into SwiftUI. |
| `push-notifications` | Use when implementing or debugging APNs registration, permission flows, payloads, notification extensions, Live Activity pushes, or FCM. |
| `realitykit` | Use when implementing or debugging RealityKit, visionOS spatial computing, RealityView, entities, components, systems, AR, or 3D content. |
| `scenekit` | Use when implementing or debugging SceneKit scenes, nodes, materials, lighting, cameras, physics, animation, or SceneView bridging. |
| `sf-symbols` | Use when working with SF Symbols rendering modes, symbol effects, animation, palettes, variable symbols, or accessibility labels. |
| `spritekit` | Use when implementing or debugging SpriteKit scenes, nodes, actions, physics, particles, tile maps, SpriteView, or texture atlases. |
| `storekit` | Use when implementing or reviewing StoreKit 2 products, purchases, transaction verification, subscriptions, entitlements, or tests. |
| `swift-charts` | Use when building or reviewing Swift Charts marks, axes, scales, legends, selection, scrolling, vectorized plots, or chart accessibility. |
| `swiftdata` | Use when writing or reviewing SwiftData models, queries, migrations, schema policy, runtime patterns, or persisted schema changes. |
| `tipkit` | Reviews and writes TipKit code — tip definitions, eligibility rules, events, display frequency, popover and inline tips, and testing. Use when implementing feature discovery tips. |
| `translation-framework` | Use when adding Apple Translation framework UI, custom sessions, language availability checks, or batch translation. |
| `widgetkit` | Use when implementing or debugging WidgetKit timelines, widgets, Live Activities, Control Center controls, or extension lifecycle limits. |

### ios-platform (11 skills)

Cross-cutting Apple platform skills for architecture, debugging, testing, tooling, HIG, Swift language, and App Store release work.

| Skill | Use |
|---|---|
| `app-store-release` | Use when preparing App Store submission, privacy manifests, metadata, rejection responses, or App Store Connect release work. |
| `hang-diagnostics` | Use when diagnosing app freezes, watchdog terminations, main-thread blocking, MetricKit hangs, or Swift concurrency deadlocks. |
| `ios-architecture` | Use when designing or reviewing iOS app architecture, service boundaries, dependency injection, composition roots, or module guardrails. |
| `ios-debugging` | Use when debugging iOS runtime issues with LLDB, diagnostics, memory tools, stack traces, breakpoints, or SwiftUI state inspection. |
| `ios-tooling` | Use when building, running, testing, profiling, debugging, documenting, or releasing iOS/macOS apps with command-line tooling. |
| `ios-ux-writing` | Use when writing or reviewing iOS microcopy, alerts, empty states, error messages, button labels, or accessibility text. |
| `platform-hig` | Use when building, reviewing, or refactoring UI against Apple Human Interface Guidelines across iOS, iPadOS, macOS, tvOS, watchOS, or visionOS. |
| `swift-concurrency` | Use when writing or reviewing async/await, actors, Sendable, task cancellation, isolation, or Swift concurrency migrations. |
| `swift-language` | Use when writing or reviewing Swift language features, ownership, noncopyable types, InlineArray, Span, typed throws, or C bounds safety. |
| `swift-testing` | Use when writing, reviewing, debugging, or improving Swift Testing code with modern APIs, TDD workflow, fixtures, traits, expectations, or test organization. |
| `xcuitest` | Use when writing or debugging XCUITest flows, accessibility identifiers, waits, page objects, system alerts, or UI test failures. |

### swiftui (9 skills)

SwiftUI skills for implementation, design exploration, hardening, performance, visual review, shaders, and Figma translation.

| Skill | Use |
|---|---|
| `figma-to-swiftui` | Use when translating Figma designs, nodes, tokens, or assets into production SwiftUI for an iOS app. |
| `screen-design-exploration` | Use when exploring SwiftUI screen design directions, comparing layout variants, or turning an ambiguous screen idea into a concrete visual direction. |
| `swiftui-harden` | Use when hardening SwiftUI views against edge cases: long text, empty data, large datasets, errors, Dynamic Type extremes, RTL, concurrency, accessibility, or pre-ship resilience. |
| `swiftui-microinteractions` | Use when designing, reviewing, or implementing iOS microinteractions, toggles, confirmations, pull-to-refresh, input validation, interactive polish, or signature product moments. |
| `swiftui-patterns` | Use when building, reviewing, or refactoring SwiftUI view code, data flow, composition, navigation, accessibility, performance, polish, or SDK migrations. |
| `swiftui-performance-audit` | Use when diagnosing SwiftUI jank, slow rendering, high CPU/memory, identity churn, layout thrash, or update storms. |
| `swiftui-shaders` | Use when building or reviewing SwiftUI Shader API effects, Metal shader functions, ripple, pixel, color, distortion, or layer effects. |
| `swiftui-view-refactor` | Use when refactoring SwiftUI views, splitting bodies, extracting subviews, removing side effects, or simplifying data flow. |
| `swiftui-visual-review` | Use when reviewing SwiftUI views for visual quality, accessibility, HIG fit, state coverage, polish, and design-system drift. |

### uikit (6 skills)

UIKit skills for Auto Layout, collection views, Core Animation, navigation, fundamentals, and SwiftUI interop.

| Skill | Use |
|---|---|
| `auto-layout` | Use when building or reviewing UIKit Auto Layout constraints, UIStackView, priorities, hugging, compression, or safe areas. |
| `core-animation` | Use when writing or reviewing CALayer, CAAnimation, UIViewPropertyAnimator, or UIKit animation bridges. |
| `uikit-collections` | Use when building or reviewing UITableView, UICollectionView, diffable data sources, compositional layout, or cell registration. |
| `uikit-fundamentals` | Use when reviewing UIKit lifecycle, view hierarchy, responder chain, traits, size classes, or modernization away from shared state. |
| `uikit-interop` | Use when bridging SwiftUI and UIKit with representables, UIHostingController, UIHostingConfiguration, or incremental adoption. |
| `uikit-navigation` | Use when building or reviewing UIKit navigation controllers, modal presentations, custom transitions, or coordinator routing. |

### project-tools (47 skills)

Generic project workflow skills for planning, specs, debugging, review, refactoring, release, memory, and session hygiene.

| Skill | Use |
|---|---|
| `agent-harness-audit` | Use when an agent repeatedly fails, needs manual context, cannot reproduce or verify a bug, cannot inspect runtime behaviour, or relies on copy-pasted human knowledge. |
| `blast-radius` | Use when analyzing a diff, branch, or planned change to identify affected files, dependents, tests, release risk, rollback scope, or hidden blast radius before shipping. |
| `breaking-change-guard` | Use when changing behavior, persisted state, schemas, contracts, flags, routing, or architecture where compatibility, migration, fallback, or dual behavior is being considered. |
| `capture-idea` | Use when capturing an early idea or out-of-scope improvement in a lightweight backlog without derailing current work. |
| `capture-lesson` | Use when a correction, gotcha, near-miss, surprising behavior, or repeated mistake should be captured as durable project knowledge. |
| `change-summary` | Use when summarizing changes, documenting root cause, listing verification, producing rollback notes, or drafting a change-summary. |
| `code-review` | Use when reviewing code changes for defects, regressions, missing tests, risky design decisions, security issues, performance problems, or overall quality before shipping. |
| `code-simplification` | Use when working code is harder than necessary to understand, review, maintain, test, or change, and behavior must be preserved while reducing complexity. |
| `code-style` | Use when auditing or fixing non-mechanical code style issues that formatters and linters usually miss, including clarity, naming, consistency, and house-style drift. |
| `competitor-research` | Use when researching competitor apps, product alternatives, market references, app listings, pricing, positioning, or structured competitor entries for a project reference document. |
| `debate` | Use when comparing approaches or tradeoffs through structured opposing arguments before choosing a technical or product direction. |
| `deep-investigate` | Use when diagnosing a specific root cause without applying fixes, performing read-only investigation, building a causal chain, or producing an evidence-backed report. |
| `design` | Use when creative implementation work needs clarified intent, approach exploration, design direction, user-facing product decisions, or approval before code changes. |
| `doubt-driven-development` | Use when a non-trivial implementation decision, hypothesis, safety claim, migration, or architecture choice needs adversarial review before it becomes code or shipping guidance. |
| `evaluate-findings` | Use when validating external feedback, review comments, AI findings, dead-code reports, or suspected false positives. |
| `explain` | Explain how code works with summaries, diagrams, analogies, and annotated snippets. Use when the user asks "how does X work?" or wants a codebase walkthrough. |
| `find-dead-code` | Use when finding unused production code, dead exports, stale helpers, test-only references, or deletion candidates with analysis-only reporting before any removal. |
| `forensics` | Use when investigating what happened after confusing failures, regressions, bad merges, unexpected repository state, unclear causality, or contradictory evidence. |
| `git-worktrees` | Use when starting isolated feature work in a git worktree or when implementation needs branch/worktree separation. |
| `hypothesis-debug` | Use when debugging and fixing a bug end-to-end with reproduction, hypotheses, evidence, a minimal fix, regression coverage, and verification. |
| `idea-refine` | Use when a raw idea, feature concept, product direction, or speculative improvement needs divergent exploration, assumption testing, convergence, and a concrete next-step artifact. |
| `implement` | Use when implementing approved specifications or scoped feature work through a test-first, verified project workflow after requirements and boundaries are clear. |
| `incremental-implementation` | Use when implementing multi-file changes, large tasks, risky edits, or approved plans that need careful slicing, verification after each slice, and rollback-friendly progress. |
| `independent-review` | Use when asking an independent reviewer or external review tool to audit recent changes, then validate each finding before acting. |
| `interview-me` | Use when an ask, idea, feature, plan, or product direction is underspecified and the user wants guided questions, multiple-choice tradeoffs, recommended defaults, or collaborative scope shaping before specs or implementation. |
| `multi-agent-implementation` | Use when executing an implementation plan with multiple mostly independent tasks that can be delegated and reviewed in parallel. |
| `next-step-router` | Use when deciding which workflow or skill should run next based on conversation state, repo state, and verification status. |
| `plan` | Use when work requires a persistent multi-step plan, findings log, or progress file before implementation. |
| `post-implementation-qa` | Use when implementation is complete and the work needs project-defined validation, diff review, lesson capture, or handoff to commit and PR shipping. |
| `pr-shipping` | Use when committing, staging, pushing, opening pull requests, monitoring checks, preparing merge notes, or landing changes through a disciplined PR workflow. |
| `pre-ship` | Use when running a final quality gate across spec compliance, UX, visual polish, verification, release readiness, and unresolved risk before shipping. |
| `project-skill-audit` | Use when auditing, deduplicating, renaming, removing, or improving project skill catalogs. |
| `project-state-audit` | Use when reconciling repository code, specs, scope, todos, and backlog items to determine current project state and next work. |
| `reference-library` | Use when saving useful external references such as repositories, articles, documentation, examples, or research notes into a project reference library. |
| `session-distill` | Use when distilling a session, saving learnings, capturing durable corrections, extracting lessons, updating project memory, or improving future agent behaviour. |
| `session-handoff` | Use when pausing, resuming, or creating a durable handoff so later work can continue safely. |
| `skill-research` | Use when researching a technology or external skill to create, update, or improve reusable agent skills from verified sources. |
| `small-change` | Use when making a trivial or small targeted change that needs direct implementation plus the minimum verification appropriate to its risk. |
| `source-driven-development` | Use when framework, SDK, API, dependency, or platform-specific code must be grounded in current official documentation instead of memory or stale examples. |
| `spec-workflow` | Use when drafting, clarifying, researching, or syncing a feature specification before or after implementation. |
| `strategic-refactor` | Use when finding high-leverage refactors, identifying repo-wide complexity, choosing the best refactor, reducing architectural drag, or ranking refactor candidates. |
| `strategy-audit` | Use when proposing, reviewing, or choosing a strategy, plan, architecture, migration, rollout, or confidence claim. |
| `test-driven-implementation` | Use when implementing specs with significant business logic, persistence, complex rules, or high-risk behaviour where independent behavioural tests should drive the implementation. |
| `tidy-memory` | Use when auditing, shrinking, organizing, compacting, trimming, or deduplicating agent memory or project memory that has become stale or too large. |
| `user-test` | Use when evaluating a feature, idea, spec, design, onboarding flow, product decision, or tradeoff through target personas before implementation or release. |
| `ux-audit` | Use when auditing user-facing workflows, screens, navigation, onboarding, conversion paths, or product promises from entry point through outcome. |
| `writing-skills` | Use when creating new skills, editing existing skills, or verifying skills work before deployment |

## Project Personas

Reusable persona prompts live in `plugins/project-tools/agents/`.

| Persona | Use |
|---|---|
| `code-reviewer` | Fresh code review across correctness, architecture, tests, security, performance, and maintainability. |
| `test-engineer` | Test strategy review, regression coverage, edge cases, and verification gaps. |
| `security-auditor` | Practical security review for exploitable risks, trust boundaries, secrets, auth, and privacy. |
| `web-performance-auditor` | Web performance review with metric honesty for Core Web Vitals, loading, rendering, and JavaScript cost. |

### product (4 skills)

Product skills for analytics interpretation, App Store marketing, monetization strategy, and onboarding.

| Skill | Use |
|---|---|
| `analytics-interpretation` | Use when interpreting product analytics, retention, funnel, cohort, LTV, ARPU, payback, or App Store metric changes. |
| `app-store-marketing` | Use when working on ASO, App Store metadata, keywords, screenshots, previews, customer review replies, Apple Search Ads, or featuring. |
| `monetization-strategy` | Use when choosing monetization, pricing, subscriptions, trials, freemium tiers, paywall splits, ARPU, or charge-readiness. |
| `product-onboarding` | Use when designing or reviewing onboarding, activation, first-run flows, feature adoption, setup tasks, or time-to-value. |

## Skill Authoring Rules

- Name skills after what they do, not what they aspire to do.
- Keep frontmatter standard, succinct, and specific: only `name` and `description`.
- Keep `SKILL.md` focused on trigger boundary, routing, workflow, and hard rules.
- Move detailed patterns, examples, and checklists into `references/`.
- Prefer generic, runtime-neutral wording inside skills.
- Keep framework-specific skills separate when merging would reduce correctness.
- Add routing notes between competing or complementary skills.
- If a workflow needs project setup, search for it first; ask only when it cannot be found.

## Validation

Run the local validator before shipping catalog changes:

```bash
node scripts/validate-skills.js
```

The validator checks `plugins/*/skills/*/SKILL.md` frontmatter, description length, trigger wording, required Markdown structure, and dead cross-skill references.

## License

MIT
