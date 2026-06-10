# Skill Catalog Cleanup Report

Date: 2026-06-10

Scope: `plugins/*/skills/*/SKILL.md`.

## Result

The catalog was reduced from 123 active skills to 105 active skills.

| Plugin | Before | After |
|---|---:|---:|
| `ios-frameworks` | 35 | 35 |
| `ios-platform` | 13 | 11 |
| `swiftui` | 14 | 9 |
| `uikit` | 6 | 6 |
| `project-tools` | 51 | 40 |
| `product` | 4 | 4 |

## Fixed

- Standardized all skill frontmatter to only `name` and `description`.
- Removed duplicate trigger surfaces and merged overlapping skills.
- Renamed vague or runtime-specific skills to clearer action names.
- Moved oversized `SKILL.md` bodies into `references/full-guidance.md`.
- Shortened frontmatter descriptions so they act as routing metadata, not documentation.
- Replaced common Claude/Codex-specific skill boilerplate with runtime-neutral wording.
- Removed legacy slash-command files so the repository is skills-only.
- Updated README and plugin marketplace metadata from the active catalog.
- Added setup-discovery guidance to design memory handling instead of hard-coding `.claude/`.
- Renamed active skill directories to their frontmatter skill names, removing legacy project-branded path slugs.
- Removed copied skill frontmatter from reference files so only active `SKILL.md` files define skills.

## Merged Or Renamed

| Old Skill(s) | New Destination |
|---|---|
| `swiftui-mastery` | `swiftui-patterns` |
| `swiftui-anti-slop` | `swiftui-patterns/references/design-quality-banlist.md` |
| `swiftui-components` | `swiftui-patterns/references/component-selection.md` |
| `implement-component` | `swiftui-patterns/references/implement-component.md` |
| `design-memory` | `swiftui-patterns/references/design-memory.md` |
| `review-ui` | `swiftui-visual-review` |
| `design-screen` | `screen-design-exploration` |
| `workflow-audit` | `ux-audit/references/swiftui-workflow-review.md` |
| `ios-hig-quick` | `platform-hig/references/ios-quick-decisions.md` |
| `code-review-4lens` | `code-review/references/swift-review-lenses/` |
| `patch`, `tweak`, `tdd` | `small-change` |
| `dont-do-that-again`, `weird-findings` | `capture-lesson` |
| `idea-seed`, `improvement-backlog` | `capture-idea` |
| `clarify-spec`, `draft-spec`, `research-questions`, `sync-spec` | `spec-workflow` |
| `pause-session`, `resume-session` | `session-handoff` |
| `change-audit`, `changelog` | `change-summary` |
| `docs-audit`, `project-scope` | `project-state-audit` |
| `learn`, `inspire-skill` | `skill-research` |
| `codex-audit` | `independent-review` |
| `hard-cut` | `breaking-change-guard` |
| `finalize` | `post-implementation-qa` |
| `orchestrate` | `multi-agent-implementation` |
| `workflow-navigator` | `next-step-router` |
| `strategy-audit-loop` | `strategy-audit` |
| `apple-accessibility-auditor` | `accessibility-audit` |
| `shipping` | `app-store-release` |
| `ship-it` | `pr-shipping` |
| `authentication` | `authentication-services` |
| `file-storage` | `ios-file-storage` |
| `haptics` | `apple-haptics` |
| `localization` | `ios-localization` |
| `networking` | `ios-networking` |
| `translation` | `translation-framework` |
| `widgets` | `widgetkit` |
| `debugging` | `ios-debugging` |

## Guardrails Kept

- Framework-specific skills remain separate where merging would hurt correctness: `core-data`, `swiftdata`, `grdb`, `activitykit`, `widgetkit`, `push-notifications`, `metal`, `swiftui-shaders`, `realitykit`, `scenekit`, and `spritekit`.
- Legacy slash-command files were removed; routing now happens through skill names and frontmatter descriptions.
- Full original long-form guidance was preserved in reference files before entrypoints were shortened.

## Validation

Verified final state:

- Active skills: 105.
- Duplicate skill names: 0.
- Missing frontmatter: 0.
- Non-standard frontmatter: 0.
- `SKILL.md` files over 150 lines: 0.
- Frontmatter descriptions over 180 characters: 0.
- Missing `references/...` links from active `SKILL.md` files: 0.
- Invalid plugin JSON files: 0.
- Old skill-name reference filenames under `plugins/*/skills`: 0.
- Project-branded active skill directory names: 0.
- Reference files with copied skill frontmatter: 0.
- Legacy slash-command files: 0.
