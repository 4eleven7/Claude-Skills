# Beepus Maximus Skills

Reusable Beepus Maximus agent skills and Claude Code plugin bundles for Apple platform engineering, product work, and project workflows. Skills are plain `SKILL.md` directories, so the same content can be used by Codex and Claude. Claude-only slash commands live under `plugins/project-tools/commands`.

## What's Included

- Plugin bundles for Claude Code.
- Standalone skill directories for Codex or other agents that read `SKILL.md`.
- Thin Claude slash-command wrappers for selected project workflows.
- Example project instruction templates in `example-setup/`.

## Installation

### Claude Code Plugin

Install through the Claude plugin marketplace:

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

### Codex Skills

Codex can use the same `SKILL.md` directories. For a local checkout, symlink skills into `${CODEX_HOME:-~/.codex}/skills` so Codex reads the current repository copy:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -sfn "$PWD"/plugins/*/skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Each installed skill directory should contain its own `SKILL.md` at the top level.

Use copies instead of symlinks when you want a pinned snapshot that does not change as the repository changes.

### Local Development

Use the plugin directories directly while editing. Before publishing changes, verify:

- every skill directory has a top-level `SKILL.md`
- every `SKILL.md` has `name` and `description` frontmatter
- skill names are unique within the catalog
- Claude commands stay thin wrappers around skills

## Plugins

### ios-frameworks (35 skills)

Apple framework skills for iOS and Apple platform development.

| Skill | Use |
|---|---|
| `activitykit` | Reviews and writes ActivityKit code — Live Activities, Dynamic Island, Lock Screen presentations, push updates, and Activity lifecycle. Use when implementing live updating content outside your app. |
| `alarmkit` | Reviews and writes AlarmKit code — alarm scheduling, countdown timers, alarm presentation, Live Activities integration, and authorization. Use when implementing alarms, timers, or countdown features. |
| `app-intents` | Use when implementing, reviewing, or debugging App Intents, App Shortcuts, Siri, AppEntity, EntityQuery, parameter summaries, Spotlight intents, Focus filters, Control Center, or Action Button integrations. |
| `apple-accessibility-auditor` | Audit Apple platform UI code for accessibility — VoiceOver, Dynamic Type, keyboard navigation, colour contrast, and semantic correctness — with prioritised, patch-ready fixes |
| `authentication` | Reviews and writes AuthenticationServices code — Sign in with Apple, passkeys, ASAuthorizationController, credential providers, and AutoFill. Use when implementing authentication flows. |
| `background-tasks` | Reviews and writes BackgroundTasks code — BGTaskScheduler, app refresh tasks, processing tasks, continued processing (iOS 26), health research tasks, SwiftUI .backgroundTask, system constraints, and diagnostics. Use when scheduling background work. |
| `camera-media` | Use when implementing, reviewing, or debugging camera capture, AVCaptureSession, RotationCoordinator, responsive capture, deferred processing, PhotosPicker/PHPicker, limited library access, or HDR preservation. |
| `cloudkit` | Reviews and writes iCloud sync code — CloudKit databases, CKSyncEngine, SwiftData+CloudKit integration, iCloud Drive documents, NSUbiquitousKeyValueStore, conflict resolution, and sync diagnostics. Use when implementing, reviewing, or debugging any iCloud data sync. |
| `combine` | Reviews and writes Combine framework code for correctness, memory safety, and migration readiness. Use when working with publishers, subscribers, @Published, subjects, operator chains, or bridging Combine with async/await. |
| `core-data` | Writes, reviews, and governs Core Data persistence -- stack setup, concurrency, relationships, migrations, and CloudKit integration. Use when reading, writing, or reviewing any Core Data code or schema changes. Not for SwiftData projects (use the swiftdata skill instead). |
| `core-location` | Reviews and writes Core Location code — authorization strategy, CLServiceSession layering, CLMonitor geofencing, background location, CLLocationUpdate async patterns, and common anti-patterns. Use when implementing, reviewing, or debugging any location feature. |
| `coreml-vision` | On-device machine learning with CoreML model loading/prediction and Vision framework image analysis |
| `discoverability` | Use when planning, reviewing, or debugging app discoverability through App Intents, Core Spotlight, NSUserActivity, IndexedEntity, Siri suggestions, Action Button, or Control Center. |
| `file-storage` | Use when deciding where iOS files should be stored, choosing Documents vs Caches vs Application Support vs tmp, handling backup exclusion, disk pressure, file protection, atomic writes, or file I/O races. |
| `foundation-models` | Reviews and writes FoundationModels code — on-device LLM sessions, guided generation with @Generable, tool calling, snapshot streaming, and availability checking. Use when implementing Apple Intelligence text generation features. |
| `grdb` | Writes, reviews, and governs GRDB persistence — record types, query interface, associations, migrations, observation, concurrency, and SQL safety. Use when reading, writing, or reviewing any GRDB code. |
| `haptics` | Use when designing, implementing, reviewing, or debugging haptic feedback with sensoryFeedback, UIFeedbackGenerator, Core Haptics, AHAP patterns, intensity, sharpness, or tactile feedback. |
| `healthkit` | Writes, reviews, and governs HealthKit integration — authorization, data types, samples, queries, workouts, background delivery, and HealthKit UI. Use when reading, writing, or reviewing any HealthKit code. |
| `ios-energy` | Use when diagnosing battery drain, thermal issues, power impact, polling, timers, Low Power Mode behavior, hot devices, Power Profiler findings, or energy efficiency regressions. |
| `localization` | Use when implementing, reviewing, or debugging iOS localization: string catalogs, plurals, RTL, locale-aware formatting, XLIFF, text expansion, generated symbols, or App Shortcut localization. |
| `mapkit` | Reviews and writes MapKit code -- SwiftUI Map vs MKMapView selection, annotation strategies, clustering, search, directions, Look Around, camera management, and common anti-patterns. Use when implementing, reviewing, or debugging any map feature. |
| `metal` | Use when implementing, reviewing, or debugging Metal graphics or compute code: render/compute pipelines, MSL shaders, MTKView, command buffers, textures, frame pacing, GPU capture, or SwiftUI integration. |
| `networking` | Reviews and writes iOS networking code — URLSession for HTTP, Network.framework for custom protocols, iOS 26+ NetworkConnection async patterns, connection diagnostics, and common anti-patterns. Use when implementing, reviewing, or debugging any network connection. |
| `pdfkit` | Reviews and writes PDFKit code — PDF display, document loading, annotations, thumbnails, search, selection, and UIViewRepresentable integration. Use when rendering or manipulating PDF documents. |
| `push-notifications` | Reviews and writes iOS push notification code — APNs registration, permission flows, payload design, actionable notifications, service extensions, communication notifications, Live Activity push transport, broadcast push, and FCM integration. Use when implementing, reviewing, or debugging any notification feature. |
| `realitykit` | Use when implementing, reviewing, or debugging RealityKit, visionOS spatial computing, RealityView, Entity/Component/System architecture, AR experiences, immersive spaces, or 3D content. |
| `scenekit` | Use when implementing, reviewing, or debugging SceneKit scenes, nodes, materials, lighting, cameras, physics, animations, particle systems, model loading, or SwiftUI SceneView integration. |
| `sf-symbols` | Use when working with SF Symbols rendering modes, symbol effects, symbol animation, palette/hierarchical/multicolor styles, variable symbols, custom symbols, or symbol accessibility. |
| `spritekit` | Use when implementing, reviewing, or debugging SpriteKit games: SKScene, SKNode, SKAction, physics bodies, collisions, particles, tile maps, SpriteView, cameras, or texture atlases. |
| `storekit` | Reviews and writes StoreKit 2 in-app purchase code — product loading, purchasing, transaction verification, subscription management, entitlement tracking, and testing configuration. Use when implementing, reviewing, or debugging any IAP flow. |
| `swift-charts` | Reviews and writes Swift Charts code — mark selection, axis configuration, scales, legends, selection, scrolling, vectorized plots, 3D charts, and accessibility. Use when building, reviewing, or debugging any chart or data visualization. |
| `swiftdata` | Writes, reviews, and governs SwiftData persistence — modelling, queries, migrations, schema policy, and runtime patterns. Use when reading, writing, or reviewing any SwiftData code or persisted schema changes. |
| `tipkit` | Reviews and writes TipKit code — tip definitions, eligibility rules, events, display frequency, popover and inline tips, and testing. Use when implementing feature discovery tips. |
| `translation` | Reviews and writes Translation framework code — system translation UI, custom translation sessions, language availability, and batch translation. Use when adding in-app text translation. |
| `widgets` | Reviews and writes iOS widgets, Live Activities, and Control Center controls — timeline management, data sharing, extension lifecycle, memory limits, and common anti-patterns. Use when implementing, reviewing, or debugging any WidgetKit, ActivityKit, or ControlWidget code. |

### ios-platform (13 skills)

Cross-cutting Apple platform skills for architecture, debugging, testing, tooling, UX writing, and shipping.

| Skill | Use |
|---|---|
| `code-review-4lens` | Four-lens parallel code review for Swift/SwiftUI: reuse, quality, efficiency, clarity. Launches 4 agents scanning the same diff through different lenses, then aggregates and fixes. Triggers on: review code, code review, simplify code, check code quality, 4-lens review, review my changes. |
| `debugging` | Guides LLDB usage, runtime diagnostics, memory leak detection, and systematic debugging for iOS apps. Covers variable inspection, breakpoints, memory leak workflows, Jetsam diagnostics, and SwiftUI state debugging. |
| `hang-diagnostics` | Diagnoses and resolves app hangs — main thread blocking, watchdog terminations, MetricKit hang reports, and Swift concurrency deadlocks. Use when app freezes, UI unresponsive, or Xcode Organizer shows hang diagnostics. |
| `ios-architecture` | Use when building, reviewing, or modifying an iOS app architecture: composition root, dependency injection, service boundaries, error handling, design systems, StoreKit, CI/CD, or module guardrails. |
| `ios-hig-quick` | Quick Apple HIG decision frameworks for common iOS design choices: navigation, sheets, tabs, modals, and platform pattern choices. |
| `ios-tooling` | Build, run, test, debug, profile, and release iOS/macOS apps using XcodeBuildMCP tools, xctrace profiling, Apple docs CLI, changelog generation, and macOS SwiftPM packaging. Use when performing any build-run-debug loop, simulator/device management, performance profiling, documentation lookup, or release workflow. |
| `ios-ux-writing` | UX writing for iOS app interfaces — voice, microcopy, alerts, errors, empty states, buttons, destructive actions, and accessibility labels. Use when writing or reviewing any user-facing text in the app. |
| `platform-hig` | Apple Human Interface Guidelines for all Apple platforms. Use when building, reviewing, or refactoring UI for iOS, iPadOS, macOS, tvOS, watchOS, or visionOS. Covers layout, navigation, typography, colour, accessibility, input paradigms, and platform-specific patterns. |
| `shipping` | App Store submission pre-flight checklist, rejection prevention, privacy manifests, metadata requirements, and rejection diagnosis. Use when preparing any app for submission, handling rejections, or managing App Store Connect. |
| `swift-concurrency` | Reviews and writes Swift concurrency code for correctness, modern API usage, and common async/await pitfalls. Use when reading, writing, or reviewing Swift concurrency code targeting Swift 6.2+. |
| `swift-language` | Reviews and writes code using Swift language features and standard library types — ownership modifiers (borrowing, consuming, inout), noncopyable types (~Copyable), InlineArray, Span, value generics, typed throws. Use when working with Swift 6.2+ language features or performance-critical standard library types. |
| `swift-testing` | Writes, reviews, and improves Swift Testing code using modern APIs, TDD workflow, fixture philosophy, and best practices. |
| `xcuitest` | Reviews and writes XCUITest UI automation code — element queries, waiting patterns, accessibility identifiers, page objects, network conditioning, and crash debugging. Use when writing, reviewing, or debugging UI tests. |

### swiftui (14 skills)

SwiftUI skills for components, design quality, Figma translation, hardening, microinteractions, performance, view refactors, shaders, and workflow audits.

| Skill | Use |
|---|---|
| `design-memory` | Use when starting UI work to load persistent design decisions, or after completing design exploration to save decisions. Triggers on: design consistency, remember this style, save design choices, design system decisions, brand preferences, UI conventions. |
| `design-screen` | Interactive design exploration for SwiftUI screens. Generates 5 variants exploring hierarchy, layout, density, interaction, and brand expression. Triggers on: design screen, explore designs, variant exploration, design direction, try different layouts, design options. |
| `figma-to-swiftui` | Use when translating Figma designs, selected Figma nodes, design tokens, or Figma assets into production SwiftUI for an iOS app. Requires an available Figma MCP/tool connection. Do not use for web or React implementation. |
| `implement-component` | TDD workflow for building new SwiftUI components. Steps: understand, design decisions, tests first, implement, polish, previews, verify. |
| `review-ui` | Two-pass visual review of SwiftUI code. Report-only by default. Pass 1 catches critical issues (accessibility, HIG, states). Pass 2 evaluates aesthetic quality (anti-slop, polish, design memory). Triggers on: review UI, check my views, visual review, merge review, design review, code review UI. |
| `swiftui-anti-slop` | Detect and replace generic, AI-looking SwiftUI patterns with concrete design-quality fixes and code examples. |
| `swiftui-components` | Quick reference for choosing and implementing iOS-native SwiftUI components, layouts, forms, lists, tabs, sheets, alerts, and toolbars. |
| `swiftui-harden` | Use when hardening SwiftUI views against edge cases: long text, empty data, large datasets, errors, Dynamic Type extremes, RTL, concurrency, accessibility, or pre-ship resilience. |
| `swiftui-mastery` | Comprehensive SwiftUI skill covering state management, view composition, performance, polish, accessibility, navigation, and iOS 26+ Liquid Glass. Use when building, reviewing, improving, or refactoring any SwiftUI code. |
| `swiftui-microinteractions` | Use when designing, reviewing, or implementing iOS microinteractions, toggles, confirmations, pull-to-refresh, input validation, interactive polish, or signature product moments. |
| `swiftui-performance-audit` | Use when diagnosing or improving SwiftUI performance: janky scrolling, slow rendering, high CPU or memory, excessive updates, identity churn, layout thrash, image cost, hangs, or profiling evidence. |
| `swiftui-shaders` | Use when building or reviewing SwiftUI Shader API effects such as colorEffect, distortionEffect, layerEffect, ShaderLibrary, Metal shader functions, ripple, pixel, or custom visual effects. |
| `swiftui-view-refactor` | Use when refactoring SwiftUI views: splitting long bodies, extracting subviews, removing inline side effects, stabilizing view identity, simplifying data flow, or standardizing Observation usage. |
| `workflow-audit` | Systematic UI workflow auditing for SwiftUI applications. Discovers entry points, traces user flows, detects dead ends and broken promises, audits data wiring, evaluates from user perspective. Triggers: "workflow audit", "audit flows", "find dead ends", "check navigation". |

### uikit (6 skills)

UIKit skills for Auto Layout, collection views, Core Animation, navigation, and SwiftUI interop.

| Skill | Use |
|---|---|
| `auto-layout` | Reviews and writes Auto Layout code — NSLayoutConstraint anchors, UIStackView, constraint priorities, content hugging, compression resistance, safe area, debugging. Use when building or reviewing constraint-based layouts in UIKit. |
| `core-animation` | Reviews and writes Core Animation code — CALayer, CAAnimation, UIViewPropertyAnimator, and bridging UIKit animations to SwiftUI. Use when SwiftUI animation isn't sufficient or when wrapping UIKit animation in SwiftUI. |
| `uikit-collections` | Reviews and writes UITableView and UICollectionView code — diffable data sources, compositional layout, cell registration, section snapshots. Use when building or reviewing list and grid interfaces in UIKit. |
| `uikit-fundamentals` | Reviews and writes UIKit view controller and view code — UIViewController lifecycle, UIView hierarchy, responder chain, trait collections, size classes. Use when building or reviewing imperative UIKit view layer code. |
| `uikit-interop` | Reviews and writes SwiftUI-UIKit interop code — UIViewRepresentable, UIViewControllerRepresentable, UIHostingController, UIHostingConfiguration, incremental adoption. Use when bridging between SwiftUI and UIKit. |
| `uikit-navigation` | Reviews and writes UIKit navigation code — UINavigationController, modal presentations, UIPresentationController, custom transitions, coordinator pattern. Use when building or reviewing navigation flows in UIKit. |

### project-tools (50 skills)

Generic project workflow skills for planning, specs, docs audit, TDD, debugging, review, refactoring, release notes, and session hygiene. Skills are canonical; Claude commands are thin wrappers around these skills.

| Skill | Use |
|---|---|
| `blast-radius` | Analyze a diff or branch to identify affected files, dependents, tests, and release risk before shipping. |
| `change-audit` | Use when auditing or summarizing session changes, documenting what changed, explaining the root cause, listing verification, or producing rollback notes. |
| `changelog` | Generate user-facing changelogs from git history. Transforms technical commits into clear release notes. Use when preparing releases or summarising recent changes. |
| `clarify-spec` | Identify ambiguous or missing specification details and resolve them through targeted questions before implementation. |
| `code-review` | Review code changes for defects, regressions, missing tests, and risky design decisions before shipping. |
| `code-style` | Audit and fix non-mechanical code style issues that formatters and linters usually miss. |
| `codex-audit` | Use Codex or another independent reviewer to audit recent changes, then validate each finding before acting. |
| `competitor-research` | Research competitor apps and add structured competitor entries to a project reference document. |
| `debate` | Use when comparing approaches, weighing alternatives, choosing between options, arguing for or against a decision, or evaluating technical, product, architecture, or process tradeoffs. |
| `deep-investigate` | Diagnose a specific root cause without applying fixes. Use for read-only investigation, causal-chain analysis, and evidence-backed reports. |
| `design` | Design gate before implementation. Explores intent, proposes approaches, and produces an approved spec before any code is written. Use before any creative work — features, components, behaviour changes. |
| `docs-audit` | Audit project documents, specs, scope, todos, and lessons for inconsistencies, gaps, and contradictions. |
| `dont-do-that-again` | Use when a mistake, gap, correction, or near-miss should be captured immediately as a durable lesson, rule, or project instruction. |
| `draft-spec` | Interview the user about a feature idea and produce a structured implementation-ready specification. |
| `evaluate-findings` | Use when evaluating external feedback, code review comments, AI review output, dead-code reports, or suspected false positives. Classifies findings by evidence and confidence without applying fixes. |
| `explain` | Explain how code works with summaries, diagrams, analogies, and annotated snippets. Use when the user asks "how does X work?" or wants a codebase walkthrough. |
| `finalize` | Run the post-implementation QA pipeline: lint, build, test, simplify, review, distill, and prepare changes for commit. |
| `find-dead-code` | Find unused production code with parallel analysis, treating code referenced only from tests as dead. Analysis-only; does not delete code. |
| `forensics` | Investigate what happened after confusing failures, regressions, bad merges, or unclear project state. |
| `git-worktrees` | Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification |
| `hard-cut` | Use when changing product behaviour, persisted state, routing, contracts, configuration, schemas, enums, feature flags, or architecture where compatibility, migration, fallback, or dual behavior might be kept. |
| `hypothesis-debug` | Debug and fix a bug end-to-end using reproduction, hypotheses, evidence, a minimal fix, regression coverage, and verification. |
| `idea-seed` | Capture early product, design, or technical ideas in a lightweight backlog without derailing current work. |
| `implement` | Implement approved specifications through a scoped, test-first, verified project workflow. |
| `improvement-backlog` | Capture, review, and process out-of-scope improvement opportunities without derailing the current task. |
| `inspire-skill` | Use when evaluating an external skill to find inspiration for improving our own skills. Triggers on "inspire skill", "audit this skill", "evaluate skill", "compare skill", "skill gap analysis", "what can we learn from this skill", or when the user provides a skill URL or file path for assessment. |
| `learn` | Research a technology from the web and generate a reusable skill from what's found. Use when creating skills for unfamiliar libraries, frameworks, or tools. |
| `orchestrate` | Coordinate agents to execute implementation plans. Dispatch implementers, run spec and quality reviews, handle status reports. Use when executing plans with multiple independent tasks. |
| `patch` | Make a small targeted code change with enough context, tests, and verification to avoid guesswork. |
| `pause-session` | Create a durable handoff that lets a later session resume the current work safely. |
| `plan` | File-based planning for complex multi-step tasks. Creates task_plan.md, findings.md, and progress.md to persist state across long sessions. Use when a task requires >5 tool calls or multiple phases. |
| `pre-ship` | Run a final quality gate across spec compliance, UX, visual polish, and verification before release. |
| `project-scope` | Reconcile repository code, specs, scope, and todos to determine current project state and next work. |
| `project-skill-audit` | Use when auditing a project’s skills, finding missing skills, updating stale skills, deduplicating overlapping skills, or recommending new skills from real project history, memory, sessions, and repo conventions. |
| `reference-library` | Save useful external references such as repositories or articles into a project reference library. |
| `research-questions` | Generate structured research questions for a feature, product area, technology, or decision. |
| `resume-session` | Resume work from a saved handoff by validating state, reloading context, and continuing the workflow. |
| `session-distill` | Use when distilling a session, saving learnings, capturing durable corrections, extracting lessons, updating project memory, or improving future agent behaviour. |
| `ship-it` | Commit, push, open pull requests, monitor checks, and land changes through a disciplined shipping workflow. |
| `strategic-refactor` | Use when finding high-leverage refactors, identifying repo-wide complexity, choosing the best refactor, reducing architectural drag, or ranking refactor candidates. |
| `strategy-audit-loop` | Use when proposing, reviewing, or choosing a strategy, plan, architecture, implementation approach, migration, rollout, or when asked about confidence, loopholes, failure modes, edge cases, residual risk, or whether a strategy is sound. |
| `sync-spec` | Reconcile a specification with the implementation after code, review, or product decisions change. |
| `tdd` | Test-driven development — write a failing test, make it pass, refactor. Use before writing any implementation code for features or bugfixes. |
| `tidy-memory` | Use when auditing, shrinking, organizing, compacting, trimming, or deduplicating agent memory or project memory that has become stale or too large. |
| `tweak` | Make trivial low-risk changes directly, then run the minimum useful verification. |
| `user-test` | Evaluate a feature, idea, spec, or design through target personas and produce a product verdict. |
| `ux-audit` | Audit user-facing workflows from entry points through outcomes to find broken promises and dead ends. |
| `weird-findings` | Use when documenting surprising behaviour, gotchas, non-obvious mechanisms, quirks, confusing code paths, or discoveries future maintainers would otherwise rediscover. |
| `workflow-navigator` | Recommend the next workflow step from the current conversation, repo state, and verification status. |
| `writing-skills` | Use when creating new skills, editing existing skills, or verifying skills work before deployment |

## Claude Commands

`project-tools` also includes 25 Claude Code slash commands. These are Claude-only convenience wrappers. The skill named in each row is the source of truth, so Codex and Claude share the same workflow behavior.

| Command | Wrapper Target |
|---|---|
| `/add-competitor` | Thin Claude wrapper for `competitor-research`. |
| `/add-reference` | Thin Claude wrapper for `reference-library`. |
| `/audit-docs` | Thin Claude wrapper for `docs-audit`. |
| `/blast-radius` | Thin Claude wrapper for `blast-radius`. |
| `/clarify-spec` | Thin Claude wrapper for `clarify-spec`. |
| `/code-review` | Thin Claude wrapper for `code-review`. |
| `/code-style` | Thin Claude wrapper for `code-style`. |
| `/codex-audit` | Thin Claude wrapper for `codex-audit`. |
| `/debug-this` | Thin Claude wrapper for `hypothesis-debug`. |
| `/draft-spec` | Thin Claude wrapper for `draft-spec`. |
| `/forensics` | Thin Claude wrapper for `forensics`. |
| `/implement` | Thin Claude wrapper for `implement`. |
| `/patch` | Thin Claude wrapper for `patch`. |
| `/pause` | Thin Claude wrapper for `pause-session`. |
| `/plant-seed` | Thin Claude wrapper for `idea-seed`. |
| `/pre-ship` | Thin Claude wrapper for `pre-ship`. |
| `/research-questions` | Thin Claude wrapper for `research-questions`. |
| `/resume` | Thin Claude wrapper for `resume-session`. |
| `/scope` | Thin Claude wrapper for `project-scope`. |
| `/ship` | Thin Claude wrapper for `ship-it`. |
| `/sync-spec` | Thin Claude wrapper for `sync-spec`. |
| `/tweak` | Thin Claude wrapper for `tweak`. |
| `/user-test` | Thin Claude wrapper for `user-test`. |
| `/ux-audit` | Thin Claude wrapper for `ux-audit`. |
| `/whats-next` | Thin Claude wrapper for `workflow-navigator`. |

### product (4 skills)

Product skills for analytics interpretation, App Store marketing, monetization strategy, and onboarding.

| Skill | Use |
|---|---|
| `analytics-interpretation` | Use when interpreting product analytics, diagnosing weak metrics, comparing cohorts, evaluating retention, sanity-checking LTV, ARPU, ARPPU, payback, App Store funnel data, or deciding whether to invest, iterate, pivot, or sunset. |
| `app-store-marketing` | Use when working on App Store Optimization, app metadata, keywords, screenshots, App Preview, review responses, Apple Search Ads, App Store rejection responses, or featuring nominations. |
| `monetization-strategy` | Use when choosing paid, freemium, subscription, consumable, or hybrid monetization; designing free vs paid tiers, trials, paywall feature splits, pricing, payback, ARPU, or charge-readiness. |
| `product-onboarding` | Use when designing, implementing, or reviewing product onboarding, activation flows, first-run experiences, feature adoption prompts, product tours, setup tasks, aha moments, or time-to-value. |

## Example Setup

The `example-setup/` directory contains optional project instruction templates and documentation examples. Treat them as starting points, not canonical rules for every project.

## Skill Authoring Rules

- Keep skill names short, obvious, and global enough to avoid project branding.
- Put heavy detail in `references/`; keep `SKILL.md` focused on trigger boundary, workflow, rules, and failure modes.
- Do not hard-code one agent runtime unless the skill is explicitly runtime-specific.
- Prefer references for APIs, framework patterns, and checklists that would bloat the main skill.
- Keep skills instruction-only; they should guide agent behaviour, not silently mutate files.

## License

MIT
