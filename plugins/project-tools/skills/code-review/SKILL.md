---
name: code-review
description: Use when reviewing code changes for defects, regressions, missing tests, risky design decisions, security issues, performance problems, or overall quality before shipping.
---

# Code Review — Fresh-Eyes Critique Loop

## Purpose

Review code changes for defects, regressions, missing tests, and risky design decisions before shipping.

## Routing

Use this as the repository's code-review-and-quality workflow. It owns multi-axis code review: correctness, readability, architecture, security, performance, and test quality.

Use this skill only when the request matches the frontmatter description. If a narrower framework, platform, testing, debugging, or workflow skill clearly owns the request, use the narrower skill instead. Use `code-simplification` when the main issue is complexity reduction after behavior is already correct.

Before assuming project-specific setup, look for the expected docs, scripts, folders, tools, or memory files in the repository. If the required setup is missing and the workflow cannot proceed without it, ask the user for the location or permission to create it.

## Workflow

1. Read the relevant sections of `references/full-guidance.md` before acting.
2. Load any additional reference files listed below that match the task.
3. Apply the smallest workflow path that satisfies the request.
4. Verify with the appropriate build, test, lint, review, screenshot, or source check before reporting completion.

## References

- `references/full-guidance.md` - complete workflow, examples, checklists, and detailed rules moved from the original entrypoint.
- `references/swift-review-lenses/lens-clarity.md`
- `references/swift-review-lenses/lens-efficiency.md`
- `references/swift-review-lenses/lens-quality.md`
- `references/swift-review-lenses/lens-reuse.md`
- `references/swift-review-lenses/overview.md`
- `references/swift-review-lenses/security-anti-patterns.md`
