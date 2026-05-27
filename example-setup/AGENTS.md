# [Your App] Agent Guide

<!--
  This is an example AGENTS.md for an iOS project.
  Replace [Your App] with your app name and adapt sections to your project.
  AGENTS.md is loaded for subagents (e.g. those spawned by the Agent tool).
  Keep it leaner than CLAUDE.md — subagents have smaller context windows.
-->

This file is an entrypoint for coding agents working in this repo.

It intentionally does not duplicate project policy. Canonical rules live under `Documentation/system/` and `Documentation/templates/`.

## Start Here

Before coding:

1. Read `Documentation/system/documentation-index.md`
2. Read `Documentation/lessons.md`
3. Read the approved feature spec in `Documentation/specifications/` if the task changes feature behaviour

If a spec, template, or canonical system doc conflicts with an old example, the canonical doc wins.

## Agent Operating Rules

- State assumptions explicitly when they matter
- If something is unclear, ask a targeted question instead of guessing
- Default to building, not prolonged planning
- When given a bug or failing test, fix it end-to-end
- Write or refine tests first for logic bugs and behavioural changes where the behaviour should be proven
- Keep changes surgical; do not refactor unrelated code
- Prefer concrete implementations over speculative abstractions
- If a request conflicts with an approved spec, call it out before implementing
- After any user correction, update `Documentation/lessons.md`
- Verify work with the appropriate build, test, lint, or review steps before calling it done

## Runtime Notes

<!--
  Adapt these to your project's targets and tooling.
  Subagents need to know the minimum context to build and test correctly.
-->

- Use `Documentation/system/build-and-validation-commands.md` for canonical commands
- Prefer canonical docs over stale examples in old comments or partial snippets

## Common Paths

<!--
  List the most important docs so subagents can find them quickly.
  Keep this short — subagents should not need to read everything.
-->

- Documentation map: `Documentation/system/documentation-index.md`
- Workflow: `Documentation/system/development-workflow.md`
- Architecture: `Documentation/system/system-architecture.md`
- SwiftUI: `Documentation/system/swiftui-view-guidelines.md`
- Testing: `Documentation/system/testing-strategy.md`
- Git and review: `Documentation/system/git-and-review-workflow.md`

## Persistence Rules

- Persisted schema changes are product changes.
- Do not treat app-data resets as the default answer to schema evolution.
- If a persisted model is durable, on `main`, spec-referenced, UI-visible, or reused across features, plan migrations.
- `DEBUG`-only local store reset tooling is allowed only as an explicit developer convenience.
- No silent destructive fallback outside `DEBUG`.

## Rule

If you are about to add project policy to this file, put it in a canonical document instead and link it here.
