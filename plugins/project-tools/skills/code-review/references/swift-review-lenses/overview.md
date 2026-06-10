# 4-Lens Code Review

Four parallel agents review the same diff through different lenses. Catches code issues that visual review (`swiftui-visual-review`) and linting miss: duplication, unnecessary state, hot-path work, naming drift.

**Report + fix by default.** Unlike `swiftui-visual-review` (report-only), this skill applies fixes directly, skipping false positives.

## Scope Detection

### Diff Command

Determine the diff command based on context:

1. If the user request specifies files or a diff command, use that
2. If there are staged changes (`git diff --cached` is non-empty), use `git diff --cached`
3. If there are unstaged changes (`git diff` is non-empty), use `git diff`
4. If there are commits on the current branch not on main, use `git diff main...HEAD`
5. If none of the above, ask the user what to review

Store the chosen diff command -- each agent runs it independently.

### File Filtering

Only review Swift files (`.swift`). Exclude:
- Generated files (`*.generated.swift`, `*.pb.swift`)
- Package dependency files (`Packages/*/Sources/` outside the project)
- Test files (for Lens 1 reuse search only -- tests ARE reviewed for quality/efficiency/clarity)

## Step 1: Build Review Packet

Before launching agents, prepare a short packet:

1. Review scope and diff command.
2. Intended behavior change, inferred from the request and diff.
3. Behavior that should remain unchanged.
4. Relevant constraints: compatibility, rollout, migration, security, privacy, performance, or test coverage.
5. Project instructions and touched-area docs agents should consider.

If intent is inferred rather than stated, mark it as inferred. Intent uncertainty should become an open question, not a fake finding.

## Step 2: Launch Four Read-Only Review Agents in Parallel

Launch all four agents in a single message when the scope is large enough for parallel review. For a tiny diff, review locally with the same four lenses.

Each agent is read-only. It must not edit files, run `apply_patch`, stage, commit, or perform other state-mutating work. Provide each agent with:
- The diff command to run
- The project root path
- The review packet
- Instructions to read project instructions (the project instructions) and the project Swift coding guidelines for project conventions

### Agent 1: Reuse Review

Read `references/lens-reuse.md` and include its full content in the agent prompt.

For each change in the diff:

1. **Search for existing utilities** that could replace newly written code. Check: extensions on standard types, shared ViewModifiers, EnvironmentValues/EnvironmentKeys, formatters, palette colours, helper views in adjacent files and shared directories.
2. **Flag new code that duplicates existing functionality.** Name the existing function/modifier/extension and its file path.
3. **Flag inline logic that should use an existing utility** -- hand-rolled date formatting when a shared formatter exists, manual colour construction when palette colours exist, custom spacing values when the spacing scale applies.

Output format per finding:
```
[REUSE] file:line — description — existing: path/to/existing:line
```

### Agent 2: Quality Review

Read `references/lens-quality.md` and include its full content in the agent prompt.

For each change in the diff:

1. **Redundant state**: `@State` that duplicates or derives from other state, `@State` on values passed from parent, cached values that could be computed properties
2. **Observation issues**: `@Observable` class missing `@MainActor`, broad observation in repeated views (passing whole `@Observable` object to list rows instead of narrow values), missing `@ObservationIgnored` on property wrappers inside `@Observable`
3. **Parameter sprawl**: view init growing new parameters instead of using a model or environment value
4. **Copy-paste with variation**: near-duplicate view code that should be unified with a shared view or modifier
5. **Leaky abstractions**: views reaching into repository/client internals, business logic in view body, formatting logic in views instead of models
6. **Stringly-typed code**: raw strings where enums, constants, or LocalizedStringKey already exist

Output format per finding:
```
[QUALITY] file:line — description — suggested fix
```

### Agent 3: Efficiency Review

Read `references/lens-efficiency.md` and include its full content in the agent prompt.

For each change in the diff:

1. **Body pollution**: formatter creation, sorting, filtering, grouping, `UUID()` / `Date()` allocation, or any side effect in `body` or view builder computed properties
2. **Query patterns**: `@Query` with filtering that could use a predicate, fetching all records when only a count or subset is needed
3. **Task triggers**: `.task {}` without `id:` that should re-trigger on input change, or `.task(id:)` with an unstable identity causing unnecessary re-runs
4. **Missing concurrency**: sequential `await` calls that could use `async let` or `TaskGroup`
5. **Hot-path allocations**: object creation in high-frequency paths (scroll handlers, animation callbacks, ForEach bodies)
6. **Eager loading**: non-lazy stacks for large collections, loading full objects when only an ID or summary is needed

Output format per finding:
```
[EFFICIENCY] file:line — description — impact: [low/medium/high]
```

### Agent 4: Clarity & Standards Review

Read `references/lens-clarity.md` and include its full content in the agent prompt.

For each change in the diff:

1. **Project conventions** (from project instructions and swift-coding-guidelines.md): import ordering, naming conventions, file structure, error handling patterns, module boundaries
2. **View ordering**: properties not following the convention (Environment > let > State > computed > init > body > view builders > helpers)
3. **Unnecessary complexity**: deep nesting (3+ levels), nested ternaries in view builders, over-abstracted ViewBuilders for one-time use
4. **Naming**: inconsistent naming patterns within the diff, names that don't match their role (e.g., a `manager` that's actually a `repository`)
5. **Dead weight**: unused imports, unreachable branches, commented-out code, properties set but never read
6. **Missing structure**: files >300 lines without `// MARK:` sections, large view bodies without extracted subviews

Output format per finding:
```
[CLARITY] file:line — description — suggested fix
```

## Step 3: Verify Findings Before Reporting

Each agent must verify its findings before including them in its output. False positives erode trust faster than missed issues.

### Verification Rules

Before reporting any finding, the agent must pass it through these checks:

| Finding Type | Verification Required |
|---|---|
| "Unused variable/import" | Search all references across the project. If referenced anywhere (including tests), it's not unused. |
| "Missing validation" | Check whether validation happens at a higher level (caller, middleware, coordinator). Don't flag validation gaps that are handled elsewhere. |
| "Memory leak / retain cycle" | Verify the cleanup location. Check for `deinit`, `task` cancellation, or ownership transfer before claiming a leak. |
| "Performance issue" | Confirm the code runs frequently enough to matter. A one-time init path doesn't need micro-optimization. |
| "Missing error handling" | Check whether the caller handles the error, or whether the API contract guarantees success (e.g., decoding a known-good fixture). |
| "Force unwrap" | Check context: test code with `#require` is fine, production code with `// swiftlint:disable:next` on a known-good value is intentional. |
| "Type assertion" | Distinguish type annotation from forced cast. `as! Type` is a finding; `: Type` is not. |

### Confidence Gate

Each finding must have a confidence level:
- **High** — verified by searching the codebase, confirmed the pattern is genuinely problematic
- **Medium** — likely a real issue but couldn't fully verify (e.g., couldn't trace all call paths)
- **Low** — suspicious pattern but may be intentional or handled elsewhere

**Only High-confidence findings should be auto-fixed.** Medium-confidence findings are reported but not auto-fixed. Low-confidence findings are dropped unless they fall in the Critical severity category.

If a finding may be correct but depends on unclear intent, report it as an open question instead of a defect.

### Severity Calibration

Reserve **Critical** (block merge) exclusively for:
- Security vulnerabilities (hardcoded secrets, injection, insecure storage)
- Crash-path bugs (force unwrap on runtime data, unhandled nil)
- Data corruption or loss (missing migration, unguarded delete, race condition on write)
- Breaking API changes without version bump

Everything else is **Important** or **Minor**, regardless of how "wrong" it looks.

## Step 4: Aggregate, Deduplicate, and Classify

After all four agents complete:

1. Collect all findings
2. Deduplicate: if two agents flag the same line for related reasons, merge into the higher-priority finding
3. Sort by file, then by line number
4. Remove false positives:
   - Preview-only code (`#Preview` blocks) -- skip reuse and efficiency findings
   - Test code -- skip reuse findings (tests may legitimately duplicate production patterns)
   - Intentional patterns documented in project instructions or specs
5. Classify each remaining finding by severity:

### Severity Taxonomy

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Must fix before merge. Data loss, crashes, security holes, broken functionality, persistence bugs without migration. | Apply fix in Step 3. If the fix is non-trivial, flag it clearly for the developer. |
| **Important** | Should fix. Architecture violations, missing error handling, observation bugs, redundant state that will cause UI glitches, test gaps for new logic. | Apply fix in Step 3 when straightforward. Flag for developer review when the fix involves design decisions. |
| **Minor** | Nice-to-have. Naming consistency, MARK sections, single unused import, one-off clarity improvements. | Do not auto-fix. Report only. These must not block a merge. |

## Step 5: Apply Fixes

Run the diff command to get the current state. Apply each valid fix directly:

- **Reuse fixes**: replace inline code with existing utility call
- **Quality fixes**: refactor state, extract shared code, fix observation patterns
- **Efficiency fixes**: move work out of body, add task IDs, switch to lazy loading
- **Clarity fixes**: reorder properties, rename for consistency, add MARK sections

Only edit files -- do not stage, build, or test.

## Step 6: Summary

After fixing, output a severity-classified summary:

```
## 4-Lens Code Review

### Critical (must fix before merge)
- [QUALITY] file:line — @Observable client missing @MainActor — UI state mutations from background

### Important (should fix)
- [REUSE] file:line — replaced inline date formatting with shared .relativeDate formatter
- [EFFICIENCY] file:line — moved DateFormatter out of body into static property

### Minor (nice-to-have, not blocking)
- [CLARITY] file:line — reordered properties to match view ordering convention

### Fixed (applied automatically)
- [QUALITY] file:line — extracted duplicate card layout into shared CardRow view
- [EFFICIENCY] file:line — moved sort out of body into computed property

### Skipped (false positive or intentional)
- [EFFICIENCY] file:line — @Query in ForEach — intentional: each row needs independent query scope

### Already Clean
- Reuse: no duplicated utilities found
```

If no issues found across all four lenses, say so and confirm the code is clean.

## Step 7: Verdict

After the summary, run a final synthesis. This is the merge-readiness assessment that accounts for findings the four lenses produced plus cross-cutting concerns they don't cover.

### Spec Compliance Check

If a feature spec or plan exists (check the project specifications or requirements documents and the user-provided review scope for references):

1. **All plan requirements met?** Cross-reference the spec's acceptance criteria against the diff. Flag missing items.
2. **Implementation matches spec?** Flag deviations -- different data model, missing fields, altered flow.
3. **No scope creep?** Flag work in the diff that goes beyond what the spec calls for. Scope creep is not necessarily bad, but it should be acknowledged.
4. **Breaking changes documented?** If the diff changes public API, persistence schema, or client contracts, confirm the spec or migration docs cover it.

If no spec exists, skip this section and note "No spec referenced."

### Security Dimension

Scan the diff for common vulnerabilities. Flag any of:

- **Hardcoded secrets**: API keys, tokens, passwords, credentials in source files
- **Logging sensitive data**: user health data, PII, or auth tokens written to `os_log`, `print`, or `Logger`
- **Unvalidated input**: user-provided strings used in predicates, file paths, or URL construction without sanitisation
- **Insecure storage**: sensitive data in `UserDefaults` or `@AppStorage` instead of Keychain
- **Overly broad permissions**: requesting location/health/notification permissions beyond what the feature needs
- **Missing transport security**: HTTP URLs where HTTPS is expected, disabled ATS exceptions without justification

If nothing found, state "No security issues identified."

### Merge Readiness Verdict

Output a clear verdict:

```
### Verdict

**Ready to merge?** [Yes / No / With fixes]

**Reasoning:** [1-2 sentences explaining the decision. Reference Critical findings if No, or Important findings if With fixes.]

**Critical count:** N | **Important count:** N | **Minor count:** N
```

Decision logic:
- **Yes** — zero Critical findings, zero or few Important findings that are already auto-fixed
- **With fixes** — zero Critical findings, but Important findings remain that need developer action
- **No** — any Critical finding that was not auto-fixed, or multiple Important findings that compound into a systemic problem

## Rules

### Scope Rules

- **Do not overlap with swiftui-visual-review.** This skill reviews code quality. `swiftui-visual-review` reviews visual design, accessibility, HIG compliance, and anti-slop. Do not flag spacing values, colour choices, animation curves, or typography -- those belong to `swiftui-visual-review`.
- **Do not flag test code for reuse.** Tests may intentionally duplicate patterns for clarity and independence.
- **Preview code gets a pass on efficiency.** `#Preview` blocks exist for iteration speed, not production performance.
- **Respect existing patterns.** If the codebase consistently uses a pattern (even if suboptimal), flag it as a note, not a fix. Changing established patterns is a separate refactoring task.
- **Skip trivial findings.** A single unused import is not worth reporting. A pattern of unused imports across the diff is.

### Reviewer Behaviour

- **Be specific.** Every finding must include file:line and a concrete suggestion. "Consider refactoring" is not a finding.
- **Explain WHY.** State the consequence, not just the rule. "Missing `@MainActor` — mutations from background threads will crash on iOS 26" is better than "Missing `@MainActor`."
- **Acknowledge strengths.** Before listing issues, note what the diff does well — clean architecture, good test coverage, thoughtful naming. A review that only criticises is incomplete.
- **Don't inflate severity.** Nitpicks and style preferences are Minor, not Critical. Reserve Critical for things that will break the app, lose data, or create security holes.
- **Don't flag what you didn't review.** If a file is outside the diff, don't speculate about its quality.
- **Give a clear verdict.** Never end a review without the merge-readiness assessment. Ambiguity is worse than a wrong call — the developer can push back on a clear verdict but can't act on a vague one.
