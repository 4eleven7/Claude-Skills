---
name: changelog
description: Generate user-facing changelogs from git history. Transforms technical commits into clear release notes. Use when preparing releases or summarising recent changes.
---

# Changelog Generator

## Process

1. **Resolve range** — use the user-provided tag, ref, date, or commit range. If none is provided, default to the last reachable tag through `HEAD`.
2. **Scan commits and diffs** — inspect commit subjects first, then use `git show --stat` or focused diffs when the subject is unclear.
3. **Identify user impact** — keep only changes that affect user-visible behavior, reliability, performance, compatibility, onboarding, purchase flow, data safety, or support burden.
4. **Categorise** changes: new, improved, fixed, removed, or internal-only.
5. **Translate** technical commits into user-facing language.
6. **Filter** noise: skip docs-only, formatting, CI, internal refactors, test-only changes, dependency churn with no visible effect, and skill/tooling-only changes unless the release is for developers.
7. **Format** as clean release notes.

## Usage

```
Create a changelog since the last tag
Changelog for commits in the last 2 weeks
Release notes for v2.5.0
release channel What's New for 2.5.0
```

## Range Resolution

Use these commands as appropriate:

```bash
git describe --tags --abbrev=0
git log --oneline <from>..HEAD
git diff --stat <from>..HEAD
```

If there are no tags, ask for a starting ref or use a clearly bounded date range. Do not summarize the entire repository history by default.

## Output Format

```markdown
# [Version or Date Range]

## New
- **[Feature name]**: What it does and why it matters.

## Improved
- **[Area]**: What changed from the user's perspective

## Fixed
- [Description of what was broken, now resolved]
```

## Rules

- Write for users, not developers — no file paths, function names, or internal jargon
- Group related commits into single entries
- Skip commits that don't affect user experience (refactors, CI, docs, formatting)
- Use active voice: "Added X" not "X was added"
- Keep each entry to 1-2 sentences max
- If the commit range has no user-facing changes, say so
- For release channel copy, keep the final text concise and avoid markdown headings unless the user asks for a full changelog
- Do not overpromise. If a commit says "improve sync reliability", write "Improved sync reliability", not "Fixed all sync issues"
