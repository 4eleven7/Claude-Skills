<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust commit tag examples to match your features. -->

# Git And Review Workflow

## Purpose

Define how [YourApp] changes are committed, validated, and prepared for review.

This document covers branch hygiene, commit messages, pull request structure, and the required verification before handoff.

## Branch Rules

- Branch from `main`
- Keep one feature or fix per branch
- Keep branches short-lived

## Commit Message Format

```text
[<feature>] <type>: <description>

[optional body]

[optional footer]
```

### Types

- `FEAT`
- `FIX`
- `REFACTOR`
- `TEST`
- `DOCS`
- `CHORE`

### Rules

- Type is uppercase
- Subject line is imperative
- Subject line has no trailing period
- Subject line stays under 50 characters
- Body explains what changed and why, not how
- Reference issues with `Fixes #123` or `Closes #456` when applicable

### Examples

```text
[AUTH] FEAT: Add token refresh logic

Refresh expired tokens automatically before API calls.
Falls back to re-authentication when refresh fails.
```

```text
[AUTH] FIX: Prevent crash when session token is nil

Guard against nil token before making authenticated request.
Fixes #42
```

## Pull Request Rules

### Title

- Start with a verb
- Be specific and technical
- Do not use vague titles like `Updates` or `Improvements`

### Description

Use this structure:

1. Summary
2. Technical Details
3. Risk Areas
4. Testing
5. Follow-ups

Call out:

- architectural impact
- tradeoffs
- assumptions
- performance or memory impact if relevant
- anything not tested

If the PR touches persisted models, migration plans, or store lifecycle, answer the checklist in `Documentation/system/persistence-policy.md` explicitly in the PR description.

## Review Handoff

Before requesting review:

- describe the behavioural change, not just files touched
- call out known risks
- call out any spec deviation explicitly
- call out missing tests or manual-only verification
- for persistence-affecting changes, call out schema impact, migration decision, reset behaviour, and doc/spec updates explicitly

Use `Documentation/system/code-review-standard.md` as the bar for what reviewers should inspect.

## Pre-Push Checklist

Run this for broad changes or before pushing:

```bash
bash Scripts/check_all_builds.sh
```

At minimum, ensure the change has appropriate targeted verification. See `Documentation/system/build-and-validation-commands.md` for the command set.

### Why standalone format and lint matter

The build phase only covers the active scheme's files. Standalone SwiftFormat and SwiftLint cover the full repo, including dev-views and test targets.

## Release Tagging

[YourApp] uses annotated git tags to mark App Store and TestFlight releases.

### Tag Format

```
release/X.Y.Z
```

Where `X.Y.Z` matches the version submitted to App Store Connect.

### Rules

- Tags are annotated, not lightweight. Include the schema version: `git tag -a release/X.Y.Z -m "Release X.Y.Z — SchemaVN"`.
- Tags are immutable. Never delete or move a release tag.
- Every release tag must have a corresponding fixture store and registry entry for migration testing.
- Tag after committing the fixture store and registry update, before submitting the archive.

For the full release workflow, fixture store requirements, and migration enforcement, see `Documentation/system/release-migration-policy.md`.

## Related Docs

- `Documentation/system/build-and-validation-commands.md`
- `Documentation/system/code-review-standard.md`
- `Documentation/system/release-migration-policy.md`
