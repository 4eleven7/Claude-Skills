---
name: clarify-spec
description: Identify ambiguous or missing specification details and resolve them through targeted questions before implementation.
---

# Clarify Spec — Interactive Spec Gap-Filling

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Clarify Spec workflow. Your job is to systematically identify underspecified, ambiguous, or missing areas in a feature specification and resolve them through targeted questions — before implementation begins.

**This skill modifies specifications only. It never writes implementation code.**

## When to Use

- Before `implement` skill on a new or complex spec
- When `project-scope` skill flags a spec as needing work before implementation
- When the user wants to harden a draft spec before approving it
- When `docs-audit` skill reports underspecification findings

## Required Reading

Before starting, read ALL of:

1. The target specification in the project specifications or requirements documents
2. the project specification template, if one exists — what a complete spec looks like
3. the project product principles or decision criteria — non-negotiable product principles
4. the project lessons or known-issues document — past mistakes that may apply
5. the project scope/status document — dependency and status context

## Process

### Phase 1: Identify the Spec

If the user provided a feature name, find the matching spec in the project specifications or requirements documents.

If ambiguous, list candidates and ask. Do not guess.

Read the spec fully before proceeding.

### Phase 2: Taxonomy Scan

Scan the spec against each concern area. For each area, classify as **Complete**, **Partial**, or **Missing**.

| Concern Area | What to Check |
|---|---|
| **Functional Scope** | Are all user-visible behaviours described? Is the boundary between in-scope and out-of-scope clear? |
| **Domain & Data Model** | Are all entities and types defined? Are relationships and cardinality explicit? Are persistence implications stated? |
| **Interaction & UX** | Are entry points, flows, and exit points described? Are state transitions (loading, empty, error, success) covered? |
| **Business Rules** | Are constraints and invariants explicit? Are they testable? Do any rules contradict each other? |
| **Edge Cases** | Are boundary conditions covered? What happens with empty data, max data, concurrent access, offline state? |
| **Dependencies** | Are spec dependencies listed? Are they implemented (check `current-scope.md`)? Are integration points described? |
| **Non-Functional** | Performance expectations? Data volume assumptions? Background behaviour? Permission requirements? |
| **Terminology** | Are all domain terms in the glossary? Could any term be interpreted differently by a different reader? |
| **Acceptance Criteria** | Does every user scenario have at least one criterion? Is every criterion testable with a concrete input/output? |
| **Completion Signals** | How do we know the feature is done? Are success criteria measurable? |

### Phase 3: Prioritize Gaps

From the scan, collect all gaps. Prioritize by impact on implementation:

1. **Blocking** — Cannot implement without an answer (missing data model, contradictory rules, undefined core behaviour)
2. **Risky** — Could implement with an assumption, but wrong assumption = rework (ambiguous edge cases, unclear business rules)
3. **Nice to have** — Would improve spec quality but implementation can proceed (terminology polish, additional test cases, non-functional details)

If no blocking or risky gaps exist → report "Spec is ready for implementation" and suggest `implement` skill. Done.

### Phase 4: Clarification Questions

Ask questions **one at a time**, in priority order (blocking first, then risky). Maximum 5 questions per session.

Each question must include:

1. **The gap** — What is underspecified (quote the relevant spec section if it exists)
2. **Why it matters** — What goes wrong if this is not resolved before implementation
3. **Recommendation** — Your best-guess answer based on project context, existing patterns, and product principles
4. **Options** — 2-4 concrete choices when applicable

Format:

```
### Question N of M

**Gap:** [what is missing or ambiguous]
**Section:** [spec section this affects, or "New section needed"]
**Impact:** [Blocking | Risky]

**Why this matters:** [what goes wrong without an answer]

**Recommendation:** [your suggested answer and reasoning]

**Options:**
| Option | Description | Trade-off |
|--------|-------------|-----------|
| A | [option] | [pro/con] |
| B | [option] | [pro/con] |
| C | [recommendation — marked] | [pro/con] |
```

**Wait for the user's answer before asking the next question.**

### Phase 4.5: Draft Missing Sections (Spec Generation Mode)

**Trigger:** During Phase 3, if any concern area was classified as **Missing** (not Partial — entirely absent), activate this phase. Skip if all gaps are Partial or Nice-to-have.

For each Missing section:

1. **Read the specification template** (the project specification template, if one exists) to understand what belongs in the section
2. **Gather context** — Read existing spec sections, related specs in the project specifications or requirements documents, and the codebase for existing patterns
3. **Draft the section** — Write a concrete first draft following the template structure. Use existing project patterns as the basis. Mark assumptions with `[ASSUMED]` inline.
4. **Present the draft** to the user:

```
### Draft Section: [Section Name]

**Status:** This section was entirely missing. Here is a proposed draft based on [context sources].

[Draft content with [ASSUMED] markers on any assumptions]

**Assumptions made:**
1. [Assumption] — based on [evidence]
2. [Assumption] — based on [evidence]

Accept this draft? (yes / yes with changes / reject and I'll ask questions instead)
```

5. **Wait for approval** before writing the section into the spec

**Rules for drafting:**
- Only draft sections classified as Missing, not Partial
- Keep drafts concrete and testable — no placeholder prose
- Mark every assumption explicitly
- If a section requires domain knowledge you do not have, fall back to Phase 4 questions instead
- Maximum 2 drafted sections per session — if more are missing, draft the highest-priority ones and flag the rest for a follow-up pass

After drafted sections are accepted (or rejected), continue to Phase 5 for any remaining questions from Phase 4.

### Phase 5: Integrate Answers

After each answer:

1. Update the spec in-place with the resolved information
2. Place content in the correct section per the specification template
3. Preserve the spec's existing structure and voice
4. If the answer creates a new business rule or edge case, add it to the appropriate section
5. Do NOT rewrite sections that don't need changes

After all questions are resolved:

1. Bump the spec version (minor bump, e.g. 1.0 → 1.1)
2. Update **Last Updated** to today's date
3. If the spec was `Draft` and all blocking gaps are resolved, ask if status should move to `Approved`

### Phase 6: Summary

Present:

1. **Spec updated** — name, old version → new version
2. **Questions resolved** — count and brief summary of each
3. **Gaps remaining** — any nice-to-have items not addressed
4. **Spec readiness** — ready for implementation, or needs another pass?

## Managed Files

- the target specification or requirements document (the target spec)

## Red Flags — STOP

| Rationalization | Reality |
|---|---|
| "The spec looks fine to me" | Run the taxonomy scan. Humans miss gaps that systematic checking catches. |
| "I'll ask all 5 questions at once" | One at a time. Each answer may change the next question. |
| "I'll just fill in reasonable defaults" | Defaults are assumptions. Assumptions become bugs. Ask. |
| "This gap is obvious, I'll infer the answer" | Present the inference as a recommendation and let the user confirm. |
| "The spec needs a complete rewrite" | Clarify is surgical. If the spec needs rewriting, that is a different task. |

## Next Steps

After clarification is complete, suggest the appropriate next action:

| Situation | Suggested Skill | Why |
|---|---|---|
| Spec is now approved and ready | `implement` skill | Start building |
| Want to validate spec quality further | `docs-audit` skill | Cross-artifact consistency check |
| Spec has drifted from existing code | `sync-spec` skill | Reconcile with reality first |
| Multiple specs need clarification | `clarify-spec` skill again | Run on the next spec |
| Gap is deferred — worth revisiting later | `idea-seed` skill | Capture the idea with a trigger condition so it surfaces when relevant work begins |
| Artifact state is confusing or unclear | `forensics` skill | Investigate what happened before trying to clarify |

## Rules

- Never write implementation code — this skill updates specifications only
- Ask one question at a time — answers inform subsequent questions
- Maximum 5 questions per session — if more gaps exist, note them for a follow-up pass
- Always present a recommendation with each question — do not ask open-ended questions
- Integrate answers immediately into the spec — do not batch updates
- Preserve the spec's existing structure and voice
- Do not inflate the spec — keep it short, concrete, and testable
- If a gap is truly blocking and the user cannot answer, mark it `NEEDS CLARIFICATION` in the spec and move on
