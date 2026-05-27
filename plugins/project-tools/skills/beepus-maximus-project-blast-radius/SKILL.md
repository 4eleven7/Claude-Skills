---
name: blast-radius
description: Analyze a diff or branch to identify affected files, dependents, tests, and release risk before shipping.
---

# Blast Radius — Pre-Ship Diff Analysis

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Blast Radius workflow. Your job is to trace the impact of uncommitted or branch changes through module boundaries, flag affected features and tests, and risk-rate the change — before it ships.

This is a read-only analysis. It never modifies code.

## Freshness Rule

Base all findings on current source code only. Do not read or reference files in `.agents/`, `scratch/`, or prior audit/analysis reports. If you recall information from a previous session, verify it against the current file before citing it.

## When to Use

- Before `ship-it` skill on a non-trivial change
- When `code-review` skill or `hypothesis-debug` skill suggests impact may be wider than expected
- When a change touches shared types, protocols, or persistence models
- When the user asks "what does this change affect?"

## Process

### Phase 1: Collect the Diff

Determine what changed:

```bash
# If on a feature branch:
git diff main...HEAD --name-only
git diff main...HEAD --stat

# If uncommitted changes:
git diff --name-only
git diff --cached --name-only
```

Read every changed file. Understand what was modified — not just which files, but which types, functions, and protocols were touched.

### Phase 2: Trace Dependencies

For each changed file, trace its impact through the dependency graph:

#### 2a: Direct Dependents (1-hop)

For each changed **type, protocol, or function**, find everything that references it:

| Changed Entity | Search For |
|---|---|
| Struct/Class `Foo` | `Foo` in type annotations, initialisers, extensions |
| Protocol `FooProtocol` | Conformances (`: FooProtocol`), usage as type constraint |
| Function `doThing()` | Call sites across the codebase |
| Persisted model or schema | Queries, repositories, UI that displays it, migration stages |
| Package public API | Importing packages (`import FooPackage`) |
| Enum cases | Switch statements, comparisons |

Use grep/glob to find references. Be thorough — check across package boundaries.

#### 2b: Indirect Dependents (2-hop)

For each 1-hop dependent found, check if it is itself a **shared type or public API**. If so, note its dependents as 2-hop impact. Do not trace further than 2 hops — diminishing returns.

#### 2c: Test Coverage

For each changed file, find its test files:

```bash
# Convention: FooTests tests Foo
# Search for test files that import or reference changed types
```

Classify test coverage:

| Status | Meaning |
|---|---|
| **Covered** | A test file exists and tests the changed behaviour |
| **Partial** | A test file exists but does not cover the specific change |
| **Uncovered** | No test file covers this change |

### Phase 3: Layer Analysis

Map every affected file to its architectural layer:

| Layer | Examples |
|---|---|
| **Model** | persistence models, domain types, enums |
| **Provider/Service** | Data providers, sync services, persistence |
| **Client** | Feature clients, view models |
| **View** | UI views, components |
| **Test** | Unit tests, integration tests |
| **Config** | Package manifests, scripts, CI |

Count how many layers the change spans. More layers = more risk.

### Phase 4: Risk Assessment

Rate the overall change using these signals:

| Risk Signal | Weight |
|---|---|
| Touches persisted models or storage schema | HIGH |
| Changes a protocol that has 3+ conformers | HIGH |
| Modifies a package's public API | HIGH |
| Spans 3+ architectural layers | MEDIUM |
| Changes shared utility types | MEDIUM |
| Has uncovered test paths | MEDIUM |
| Touches only leaf views with no shared state | LOW |
| Adds new code without modifying existing | LOW |
| Only test file changes | LOW |

**Risk rating:**

| Rating | Criteria |
|---|---|
| **LOW** | 1 package, 1-2 layers, no shared types, tests cover the change |
| **MEDIUM** | 2+ packages OR 3+ layers OR partial test coverage OR shared type changes |
| **HIGH** | Persistence schema change OR cross-cutting protocol change OR uncovered critical path |

### Phase 5: Report

Present the blast radius analysis:

```
## Blast Radius — [Branch/Change Description]

### Change Summary
- **Files changed:** N
- **Packages affected:** [list]
- **Layers touched:** [list]
- **Risk rating:** LOW / MEDIUM / HIGH

### Impact Map

#### Direct Changes
| File | What Changed | Package | Layer |
|------|-------------|---------|-------|

#### Affected Components (1-hop)
| File | Why Affected | Package | Layer |
|------|-------------|---------|-------|

#### Ripple Effects (2-hop)
| File | Why Affected | Via |
|------|-------------|-----|
(Only if 2-hop dependents exist)

### Test Coverage
| Changed Behaviour | Test Status | Test File |
|-------------------|------------|-----------|
| [behaviour] | Covered / Partial / Uncovered | [file or "—"] |

### Risk Factors
- [List each risk signal that applies, with specific file:line references]

### Recommendations
- [Specific actions based on findings — e.g., "Add test for X", "Run full suite for package Y", "Review migration plan for schema change Z"]
```

## Integration with Other Commands

This skill provides context to other skills. It does not fix anything itself.

| Situation | Suggested Skill | Why |
|---|---|---|
| Risk is LOW, tests pass | `ship-it` skill | Safe to ship |
| Uncovered test paths found | `patch` skill to add tests | Cover gaps before shipping |
| Risk is HIGH due to persistence | Check the project persistence or migration policy | Migration may be needed |
| Risk is HIGH due to protocol changes | `code-review` skill | Fresh-eyes review on the protocol change |
| Impact is wider than expected | Reconsider the change scope | Maybe split the PR |
| Something looks wrong but unclear what happened | `forensics` skill | Investigate before shipping |

## Red Flags — STOP

| Rationalization | Reality |
|---|---|
| "It's a small change, skip the analysis" | Small changes to shared types have the largest blast radius |
| "The tests will catch it" | Only if the tests exist. This skill tells you if they do. |
| "I only changed one file" | One file can be imported by 20 others. Trace the dependencies. |
| "The 2-hop analysis is overkill" | Skip it only if no 1-hop dependents are shared types. |

## Rules

- This is read-only — never modify code
- Trace dependencies with grep/glob, do not guess
- Always check test coverage for changed behaviours
- Report honestly — if coverage is poor, say so
- Do not trace beyond 2 hops
- If the diff is empty, abort with a message
