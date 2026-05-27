---
name: docs-audit
description: Audit project documents, specs, scope, todos, and lessons for inconsistencies, gaps, and contradictions.
---

# Audit Docs — Cross-Artifact Consistency Check

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Audit Docs workflow. Your job is to detect inconsistencies, gaps, and contradictions across project artifacts — specifications, scope, todo, lessons, and dependencies. This is a read-only diagnostic. It never modifies files.

**This skill is read-only. It produces a findings report only.**

## Freshness Rule

Base all findings on current source code and documents only. Do not read or reference files in `.agents/`, `scratch/`, or prior audit/analysis reports. If you recall information from a previous session, verify it against the current file before citing it.

## When to Use

- Before starting a new implementation phase
- After multiple specs have been updated
- When `project-scope` skill reveals discrepancies that need deeper investigation
- When the user wants confidence that project artifacts are internally consistent
- As a periodic health check on project documentation

## Required Reading

Before analysis, read ALL of:

1. the project scope/status document
2. the project todo/backlog document
3. the project lessons or known-issues document
4. the project product principles or decision criteria
5. All specifications in the project specifications or requirements documents that are in scope

If the user names a specific spec or feature area, focus the analysis there but still check cross-references to other artifacts.

## Process

### Phase 1: Collect Artifacts

Build an inventory of what exists:

- List all specs with their version, status, and dependencies
- Note scope status for each spec (Implemented, Partial, Not started, etc.)
- Note todo status and sub-phase markers
- Identify the dependency graph between specs

### Phase 2: Run Detection Passes

Execute each pass in order. Record every finding.

#### Pass 1: Internal Spec Consistency

For each spec in scope:

- Does every user scenario have at least one acceptance criterion?
- Does every behaviour table row have an expected result and error column filled?
- Does the data model match the behaviour described?
- Do business rules contradict each other?
- Are edge cases actually edge cases (not core behaviour misplaced)?
- Are test cases traceable to acceptance criteria?
- Is the glossary complete for all domain terms used in the spec?

#### Pass 2: Spec-to-Spec Consistency

Across specs:

- Do shared entities (types, enums, protocols) have consistent definitions?
- Do specs that declare the same dependency agree on its contract?
- Are glossary terms consistent across specs that use them?
- Do scope boundaries overlap? (One spec's "in scope" is another's "in scope" for the same behaviour)

#### Pass 3: Spec-to-Code Consistency

For specs marked Implemented or Partial:

- Do persisted model types in code match the spec's data model section?
- Are there behaviours in code not described in the spec? (Undocumented behaviour)
- Are there behaviours in the spec not present in code? (Unimplemented behaviour)
- Do test files cover the spec's acceptance criteria?

#### Pass 4: Dependency Validation

- For each spec dependency, is the depended-on spec implemented?
- Are there circular dependencies?
- Are there specs that should declare a dependency but don't?
- Does `current-todo.md` ordering respect the dependency graph?

#### Pass 5: Scope & Todo Alignment

- Does scope status match todo checkboxes?
- Are sub-phase markers consistent between scope and todo?
- Are deferred/P2 markers consistent?
- Do summary counts in todo match the actual checkbox state?

#### Pass 6: Principles Alignment

- Check each spec against the project product principles or decision criteria
- Flag specs that may violate principles (e.g., a spec requiring network for core functionality when offline-first is a principle)
- Flag specs missing persistence/migration consideration when they define persisted models

### Phase 3: Classify Findings

For each finding, assign:

**Severity:**

| Severity | Definition |
|---|---|
| **CRITICAL** | Will cause implementation failure, data loss, or spec contradiction that blocks work |
| **HIGH** | Likely to cause rework or confusion during implementation |
| **MEDIUM** | Inconsistency that should be resolved but won't block progress |
| **LOW** | Quality improvement, nice to have |

**Category:**

| Category | Examples |
|---|---|
| **Contradiction** | Two specs disagree on a shared entity's definition |
| **Gap** | Spec missing acceptance criteria for a described behaviour |
| **Stale** | Spec describes behaviour that code has since changed |
| **Orphan** | Spec describes behaviour that was never built and isn't planned |
| **Dependency** | Spec depends on unimplemented feature without acknowledging it |
| **Drift** | Scope/todo disagrees with spec or code status |
| **Principle** | Spec may violate a product principle |
| **Ambiguity** | Spec language could be interpreted multiple ways |

### Phase 4: Report

Present findings in a structured report:

```
## Analysis Report — [Scope Description]

### Summary
- Specs analyzed: N
- Total findings: N (N critical, N high, N medium, N low)
- Passes run: 6

### Findings

Present all findings in a single scannable table — do NOT split into separate tables per severity:

| # | Severity | Category | Artifact(s) | Finding | Impact | Resolution | Effort |
|---|----------|----------|-------------|---------|--------|------------|--------|

Effort: S (minutes) | M (under an hour) | L (hours)

Sort by severity (CRITICAL first), then by category within each severity level.

### Coverage Summary
| Spec | Internal | Cross-Spec | Code Match | Dependencies | Scope Align | Principles |
|------|----------|------------|------------|--------------|-------------|------------|
| [name] | ✓/✗ | ✓/✗ | ✓/✗/N/A | ✓/✗ | ✓/✗ | ✓/✗ |

### Dependency Graph Issues
[Visual or textual representation of any dependency problems]

### Recommended Actions
1. [Action] — addresses findings #N, #N — suggested command: `clarify-spec` skill or `sync-spec` skill
2. ...
```

## Next Steps

After the analysis report, suggest actions based on findings:

| Situation | Suggested Skill | Why |
|---|---|---|
| Specs have gaps or ambiguity | `clarify-spec` skill | Resolve underspecification interactively |
| Specs have drifted from code | `sync-spec` skill | Reconcile spec with reality |
| Scope/todo is misaligned | `project-scope` skill | Reconcile project status documents |
| No critical or high findings | `implement` skill | Artifacts are consistent — build the next feature |
| Artifact state is confusing — unclear how it got this way | `forensics` skill | Investigate git history before trying to fix |
| Finding reveals a deferred idea worth capturing | `idea-seed` skill | Capture for later with trigger conditions |

## Rules

- This skill is strictly read-only — it never modifies any file
- Every finding must cite specific artifacts and quote the conflicting text
- Do not invent findings — if a pass produces no issues, report it clean
- Severity must be justified — do not inflate LOW findings to HIGH
- The report is a diagnostic tool, not an action plan — suggest commands but do not execute them
- If the analysis scope is too large (>10 specs), ask the user to narrow it or expect a longer report
- Cross-reference findings — a single root cause may surface in multiple passes
