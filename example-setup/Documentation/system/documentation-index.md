<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust document references to match your project structure. -->

# Documentation Index

## Purpose

This is the canonical map of [YourApp] documentation.

Start here before coding if you are not already certain which document governs the task. `AGENTS.md` and `CLAUDE.md` are entrypoints for agent runtime behaviour only. Stable project policy lives here and in the linked documents.

## Start Here

- Read `Documentation/lessons.md` at session start.
- Read the approved feature spec in `Documentation/specifications/` before changing feature behaviour.
- Use `Documentation/system/build-and-validation-commands.md` for canonical build, test, lint, and verification commands.
- Use `Documentation/system/development-workflow.md` for the implementation workflow.

## Task Map

| Task | Read First |
|---|---|
| Building or changing SwiftUI views | `Documentation/system/swiftui-view-guidelines.md` + `Documentation/system/swiftui-polish-guidelines.md` + `Documentation/system/swiftui-design-quality.md` + `Documentation/system/colour-system.md` + `Documentation/system/ui-implementation-checklist.md` |
| Adding or modifying language generation | `Documentation/system/apple-intelligence-language-generation.md` |
| Creating or extending a feature | `Documentation/system/development-workflow.md` + `Documentation/templates/feature-template.md` + `Documentation/templates/tasks-template.md` + `Documentation/templates/reference-feature.md` |
| Building a dev-view | `Documentation/templates/dev-view-template.md` + `Documentation/system/fixture-and-mock-data-guidelines.md` |
| Writing or changing tests | `Documentation/system/testing-strategy.md` + `Documentation/system/fixture-and-mock-data-guidelines.md` |
| Modifying persistence or SwiftData | `Documentation/system/persistence-policy.md` + `Documentation/system/swiftdata-migrations.md` + `Documentation/system/persistence-and-swiftdata.md` |
| Cutting a release or verifying upgrade paths | `Documentation/system/release-migration-policy.md` + `Documentation/system/git-and-review-workflow.md` |
| Wiring services or app composition | `Documentation/system/service-composition-di.md` + `Documentation/system/system-architecture.md` |
| Checking architecture boundaries | `Documentation/system/system-architecture.md` + `Documentation/system/modules-and-dependencies.md` |
| Validating project artifact consistency | `/analyze` command |
| Hardening a spec before implementation | `/clarify` command |
| Checking product principles | `Documentation/system/product-principles.md` |
| Applying Swift coding standards | `Documentation/system/swift-coding-guidelines.md` + `Documentation/system/modern-api-guidelines.md` + `Documentation/system/error-and-debugging-guidelines.md` |
| Preparing a commit or PR | `Documentation/system/git-and-review-workflow.md` + `Documentation/system/code-review-standard.md` |

## Architecture

- `Documentation/system/system-architecture.md`
- `Documentation/system/modules-and-dependencies.md`
- `Documentation/system/persistence-policy.md`
- `Documentation/system/swiftdata-migrations.md`
- `Documentation/system/service-composition-di.md`
- `Documentation/system/persistence-and-swiftdata.md`
- `Documentation/system/release-migration-policy.md`
- `Documentation/system/healthsignals-system-architecture.md`
- `Documentation/system/apple-intelligence-language-generation.md`

## Coding Standards

- `Documentation/system/swift-coding-guidelines.md`
- `Documentation/system/error-and-debugging-guidelines.md`
- `Documentation/system/modern-api-guidelines.md`
- `Documentation/system/swiftui-view-guidelines.md`
- `Documentation/system/swiftui-polish-guidelines.md`
- `Documentation/system/swiftui-design-quality.md`
- `Documentation/system/colour-system.md`
- `Documentation/system/ui-implementation-checklist.md`

## Testing And Quality

- `Documentation/system/testing-strategy.md`
- `Documentation/system/code-review-standard.md`
- `Documentation/system/fixture-and-mock-data-guidelines.md`

## Workflow And Delivery

- `Documentation/system/development-workflow.md`
- `Documentation/system/build-and-validation-commands.md`
- `Documentation/system/git-and-review-workflow.md`

## Principles

- `Documentation/system/product-principles.md`

## Templates

- `Documentation/templates/feature-template.md`
- `Documentation/templates/dev-view-template.md`
- `Documentation/templates/specification-template.md`
- `Documentation/templates/tasks-template.md`
- `Documentation/templates/reference-feature.md`

## Rule

If `AGENTS.md`, `CLAUDE.md`, or an old example conflicts with one of the canonical documents above, the canonical document wins.
