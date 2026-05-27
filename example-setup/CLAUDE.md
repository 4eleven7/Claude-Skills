# [Your App] Claude Guide

<!--
  This is an example CLAUDE.md for an iOS project.
  Replace [Your App] with your app name and adapt sections to your project.
  CLAUDE.md is loaded automatically when Claude Code opens this repo.
-->

This file is an entrypoint for Claude Code in this repo.

It intentionally avoids duplicating stable project policy. Canonical rules live under `Documentation/system/` and `Documentation/templates/`.

## Start Here

Before coding:

1. Read `Documentation/lessons.md`
2. Read the approved feature spec in `Documentation/specifications/` if the task changes feature behaviour
3. Use the **Doc Lookup** table below to find the right system doc for the task

If a spec, template, or canonical system doc conflicts with an old example, the canonical doc wins.

## Claude Runtime Rules

<!-- Adapt these to your build tooling. XcodeBuildMCP is an MCP server for Xcode projects. -->

- Use XcodeBuildMCP for Xcode build, test, clean, simulator, and coverage operations
- Use `Documentation/system/build-and-validation-commands.md` as the canonical shell-command reference
- Use shell commands for non-Xcode tasks such as lint, repo scripts, `rg`, and git
- Prefer building over planning unless the user explicitly asks for a plan

## Agent Operating Rules

- State assumptions explicitly when they matter
- If something is unclear, ask a targeted question instead of guessing
- When given a bug or failing test, fix it end-to-end
- Write or refine tests first for logic bugs and behavioural changes where the behaviour should be proven
- Keep changes surgical; do not refactor unrelated code
- Prefer concrete implementations over speculative abstractions
- If a request conflicts with an approved spec, call it out before implementing
- After any user correction, update `Documentation/lessons.md`
- Verify work with the appropriate build, test, lint, or review steps before calling it done
- **Never discard uncommitted changes.** Do not run `git restore`, `git checkout -- <file>`, or `git clean` on files with uncommitted modifications. If separating changes across branches, use `git stash push -- <files>` to preserve them. If unsure, ask.
- **Analysis paralysis guard:** If you make 5+ consecutive read/search/grep calls without writing any code, stop. Either write code or report that you are blocked and need direction.
- **Deviation rules during implementation:**
  - Auto-fix: bugs encountered during implementation (no need to ask)
  - Auto-add: missing imports, conformances, or glue code that is clearly required (no need to ask)
  - Stop and ask: architectural changes, new patterns, scope expansion, or anything that changes the plan's intent

## Doc Lookup

<!--
  This table maps keywords to documentation files so Claude knows where to look.
  Add rows for every system doc and spec in your project.
  The keywords column should include natural terms a developer would use when asking about that topic.
-->

Before touching a topic area, read the matching doc(s). Full index: `Documentation/system/documentation-index.md`

| Keywords | Read |
|---|---|
| SwiftUI, views, layout, body, modifiers | `Documentation/system/swiftui-view-guidelines.md` |
| UI polish, spacing, colour, typography | `Documentation/system/swiftui-polish-guidelines.md` |
| Colour palette, shades, dark mode | `Documentation/system/colour-system.md` |
| UI checklist, merge review | `Documentation/system/ui-implementation-checklist.md` |
| Design quality, anti-patterns, visual hierarchy | `Documentation/system/swiftui-design-quality.md` |
| Architecture, layers, feature boundaries | `Documentation/system/system-architecture.md` |
| Modules, packages, dependencies, imports | `Documentation/system/modules-and-dependencies.md` |
| Persistence, SwiftData, schema, models | `Documentation/system/persistence-policy.md` |
| Migrations, schema versioning | `Documentation/system/swiftdata-migrations.md` |
| Tests, testing, mocks, fixtures | `Documentation/system/testing-strategy.md` + `Documentation/system/fixture-and-mock-data-guidelines.md` |
| Swift style, naming, conventions | `Documentation/system/swift-coding-guidelines.md` |
| Modern API, deprecated APIs | `Documentation/system/modern-api-guidelines.md` |
| Errors, debugging, diagnostics | `Documentation/system/error-and-debugging-guidelines.md` |
| Build, test, lint, CI, scripts | `Documentation/system/build-and-validation-commands.md` |
| Workflow, implementation steps | `Documentation/system/development-workflow.md` |
| Git, commits, PRs, code review | `Documentation/system/git-and-review-workflow.md` + `Documentation/system/code-review-standard.md` |
| New feature, template, scaffold | `Documentation/templates/feature-template.md` |
| Dev-view, debug UI | `Documentation/templates/dev-view-template.md` |
| Specification, spec, requirements | `Documentation/specifications/` (read the relevant feature spec) |
| Lessons, past mistakes, corrections | `Documentation/lessons.md` |
| Scope, todo, progress, next feature | `Documentation/current-scope.md` |
| Persona, user validation, feature resonance | `Documentation/personas/` |

<!--
  You can also map keywords to slash commands:
  | Bug, failing test, debug | `/debug-this` command |
  | Trivial change, typo, rename | `/tweak` command |
  | Implement feature from spec | `/implement` command |
-->

## Persistence Rules

<!--
  If your app uses SwiftData, Core Data, or GRDB, include persistence rules.
  These prevent Claude from resetting user data as a quick fix for schema issues.
-->

- Persisted schema changes are product changes.
- Do not treat app-data resets as the default answer to schema evolution.
- If a persisted model is durable, on `main`, spec-referenced, UI-visible, or reused across features, plan migrations.
- `DEBUG`-only local store reset tooling is allowed only as an explicit developer convenience.
- No silent destructive fallback outside `DEBUG`.
- Persistence-related PRs must cover schema versioning, migration decision, tests, and doc/spec updates.

## Rule

If you are about to add project policy to this file, put it in a canonical document instead and link it here.
