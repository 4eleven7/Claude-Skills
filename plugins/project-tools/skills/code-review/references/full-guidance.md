# Code Review — Fresh-Eyes Critique Loop

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Code Review workflow. Your job is to find defects by spawning a fresh-eyes reviewer subagent, then implementing fixes and iterating until findings degrade to nitpicks.

This is not a summary of the diff. It is a search for things that are wrong.

This is also the catalog's code-review-and-quality workflow. Review every material change across correctness, readability, architecture, security, performance, and verification quality. Do not create a parallel review workflow unless the trigger is genuinely narrower than code review.

For Swift or SwiftUI diffs that need reuse, quality, efficiency, and clarity lenses, use `references/swift-review-lenses/overview.md` and the lens files in that directory as supporting review prompts. Do not route to a separate Swift-specific code-review skill.

## Freshness Rule

Base all findings on current source code only. Do not read or reference files in `.agents/`, `scratch/`, or prior audit/review reports. If you recall information from a previous session, verify it against the current file before citing it.

## Required Reading

Before starting, read:

1. the project code-review standard — the review bar
2. the project coding guidelines — house style
3. the project UI guidelines — UI rules (if UI is in scope)
4. the project design-quality guidelines — anti-patterns (if UI is in scope)
5. the project lessons or known-issues document — past mistakes

## Scope Detection

Determine what to review from context:

- If the user names specific files → review those
- If recent git changes exist on the current branch → review the changed files
- If unclear → ask which files or feature to review

Collect the file list and read every file in scope before proceeding.

## Process

### Round 0: Blast-Radius Context

Before spawning the reviewer, build a lightweight impact map of the changes. This gives the reviewer context about what the code affects beyond the files being reviewed.

1. **Identify changed types and functions** — From the files in scope, list the public/internal types, protocols, and functions that were modified or added.

2. **Trace 1-hop dependents** — For each changed type/function, grep the codebase for references outside the changed files. Note:
   - Which packages import or reference the changed types
   - Which UI or integration points display data from changed models/services
   - Which tests cover the changed behaviour

3. **Summarize as blast-radius context** — Produce a compact summary to inject into the reviewer prompt:

```
Blast-radius context for this review:
- Changed types: [Foo, BarProtocol, BazClient]
- Packages affected: [PackageA, PackageB]
- Dependent UI/integration points: [FooView, BarListView]
- Test coverage: [FooTests covers Foo; BarProtocol conformers untested]
- Risk signals: [protocol change with 3 conformers; schema or contract change in Foo]
```

This context helps the reviewer assess whether changes are safe beyond the files they can see. It is informational — the reviewer still reviews the code on its merits.

### Round 1: Spawn Reviewer

Launch a subagent with `subagent_type: "general-purpose"` and this prompt structure:

```
You are a senior reviewer for this project's language and platform doing a fresh-eyes code review.
You have never seen this code before. You are looking for defects, not compliments.

Review priority (in order):
1. Correctness and behavioural regressions
2. Data integrity, persistence/storage safety, architecture violations
3. Performance and update-frequency risk
4. Test coverage and verification gaps
5. Code clarity and maintainability

For UI code, also check:
- presentation purity (no expensive work, no side effects)
- state ownership (narrowest owner, no mystery state)
- invalidation scope (broad observation in repeated UI elements)
- identity stability (ForEach IDs, conditional view swapping)
- AI tells (uniform padding, Color.blue, .system(size:), centre-aligned content text)

Project rules:
- Use the project's preferred observation/state model
- No force unwraps in production code
- Use the project's preferred async style
- Business logic outside presentation code
- Feature code stays internal, helpers are private
- Use the project's design tokens and spacing scale

Files to review:
<include the full content of each file>

Project context:
<include relevant spec excerpts if a specification exists>

Blast-radius context:
<include the blast-radius summary from Round 0>
Use this to assess whether changes to shared types, protocols, or models
are safe for their dependents. Flag concerns about untested dependents
or breaking changes to public API.

Output format:
Present findings in a single scannable table — do NOT use bulleted lists or headed sections for individual findings:

| # | Severity | File:Line | Finding | Why It Matters | Fix | Effort |
|---|----------|-----------|---------|----------------|-----|--------|

Severity: MUST FIX | SHOULD FIX | NITPICK
Effort: S (minutes) | M (under an hour) | L (hours)

Group rows by severity within the table. If you find nothing wrong, say so — do not invent findings.
End with a one-line verdict: "PASS", "PASS WITH NITPICKS", or "NEEDS WORK".
```

### Round 2: Triage Findings

When the reviewer returns:

1. **Read every finding.** Do not skip any.
2. **Validate each finding** against the actual code. Subagents can hallucinate line numbers or misread context. If a finding is wrong, discard it and note why.
3. **Classify surviving findings:**
   - **MUST FIX** — correctness, data integrity, spec violation, crash risk
   - **SHOULD FIX** — performance, missing tests, architecture drift, unclear code
   - **NITPICK** — style preference, minor naming, cosmetic

Present the validated findings to the user in a table:

```
| # | Severity | File:Line | Finding | Fix |
|---|----------|-----------|---------|-----|
```

**STOP and wait for user approval before implementing fixes.**

### Round 3: Implement Fixes

After user approves (or adjusts):

1. Fix MUST FIX items first, then SHOULD FIX, then approved NITPICKs
2. Make changes surgically — only touch what was approved
3. Follow project conventions exactly
4. Do NOT refactor unrelated code
5. Do NOT add comments or annotations to unchanged code

### Round 4: Re-review

After fixes are implemented, spawn a **new** reviewer subagent with the updated files. The new reviewer must not see the previous findings — it is a fresh pair of eyes.

Use the same prompt structure as Round 1, but add:

```
This code has been through one round of review and fixes.
Your job is to find anything that was missed or introduced by the fixes.
Be thorough but calibrated — do not re-litigate style choices that are consistent with the project.
```

### Round 5: Converge or Iterate

Evaluate the new findings:

- If all findings are NITPICK → **declare convergence**. Present remaining nitpicks to the user as optional. Done.
- If MUST FIX or SHOULD FIX findings remain → go back to Round 3.
- **Maximum 3 iterations.** If findings have not converged after 3 rounds, present the remaining issues and let the user decide.

### Final Report

```
## Code Review — [Scope]

### Rounds: N
### Verdict: [PASS | PASS WITH NITPICKS | NEEDS WORK]

### Findings Fixed
| # | Severity | Finding | Round Fixed |
|---|----------|---------|-------------|

### Remaining Nitpicks (optional)
- [nitpick with file:line]

### Review Coverage
- Files reviewed: N
- Total findings: N (N fixed, N nitpicks remaining)
```

## Next Steps

After the review converges, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| Reviewer found spec gaps | `spec-workflow` skill | Reconcile the spec before shipping |
| All findings resolved, code is ready | `pr-shipping` skill | Commit, PR, monitor, land |
| Review revealed UX concerns | `pre-ship` skill | Address UX/visual issues the reviewer flagged |
| Findings are minor and isolated | `small-change` skill | Quick targeted fix with verification, no full `implement` skill cycle |
| Review surfaced an idea for later | `capture-idea` skill | Capture it with a trigger condition |

## Rules

- The reviewer subagent must never see the fix plan — it reviews code, not intentions
- Each round uses a fresh subagent — no context carries over between reviewers
- Validate every finding before acting on it — subagents make mistakes
- Never implement fixes without user approval
- Never refactor beyond the approved findings
- If a finding conflicts with an approved spec, flag it but do not change the code
- If the reviewer finds a spec gap, note it separately — do not fix spec-level issues in a review pass
