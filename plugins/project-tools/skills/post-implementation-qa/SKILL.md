---
name: post-implementation-qa
description: Use when implementation is complete and the work needs project-defined validation, diff review, lesson capture, or handoff to commit and PR shipping.
---

# Post-Implementation QA

## Purpose

Run the quality pass after implementation and before commit or PR shipping.

This skill is generic. It must not assume any language, platform, package manager, test runner, simulator, CI system, or task runner until it has discovered that setup in the current repository.

## Routing

- Use `pre-ship` for final product/release acceptance across spec, UX, visual polish, and release risk.
- Use `pr-shipping` for staging, committing, pushing, PR creation, check monitoring, and landing.
- Use `code-review` for a standalone code review without running the full validation pipeline.
- Use the relevant platform, framework, or testing skill for platform-specific validation details.

## Setup Discovery

Before running validation commands, inspect the repo for canonical setup:

1. Read project entry docs: `AGENTS.md`, `README.md`, `docs/`, `Documentation/`, `.github/`, and equivalent repo docs.
2. Inspect build files and scripts: package/project manifests, `Makefile`, `justfile`, `Scripts/`, CI workflows, and task runners.
3. Prefer the exact commands documented by the project or CI.
4. If no command is discoverable, ask the user instead of inventing one.

## Workflow

1. Identify the changed files with `git status --short` and the relevant diff.
2. Discover the smallest project-defined formatter, lint, build, and test commands that prove the changed behaviour.
3. Run format/lint checks when the project defines them.
4. Run targeted tests first when behaviour changed.
5. Run broader build/test validation when the change touches shared code, public contracts, persistence, release paths, or cross-cutting behavior.
6. Review the diff for simplification, correctness, edge cases, security, data safety, and missing tests.
7. Capture durable lessons with `capture-lesson` or `session-distill` when the session produced reusable project knowledge.
8. Hand off to `pr-shipping` if the user wants staging, commit, push, PR creation, or landing.

Each phase gates the next. If validation fails, stop, fix the failure when it is in scope, and rerun the failing check before proceeding.

## Validation Rules

- Do not run broad or destructive commands without discovering that the project expects them.
- Do not fabricate test commands from file extensions or framework guesses.
- Do not skip tests because a command is unknown; report the missing command and ask when validation is required.
- If a formatter changes files, reread the changed files before continuing.
- If tests fail, report the failing command and evidence, then fix or stop according to scope.
- If platform-specific tooling is required, use the relevant platform skill or documented repo tool.

## Review Checklist

- The implementation matches the requested behaviour or approved spec.
- The changed files are scoped to the task.
- New or changed behaviour has appropriate tests.
- Error, empty, permission, and edge states are handled.
- Security, privacy, and data-loss risks are considered.
- The code is no more abstract than the problem requires.
- Documentation or durable project memory is updated when behaviour or project knowledge changed.

## Output

Report:

- validation commands run and their results;
- fixes made during QA;
- skipped checks and why;
- remaining risks or user decisions needed;
- whether the work is ready for `pr-shipping`.
