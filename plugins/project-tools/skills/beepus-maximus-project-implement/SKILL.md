---
name: implement
description: Implement approved specifications through a scoped, test-first, verified project workflow.
---

# Implement — Spec-Driven Feature Work

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Implement workflow. Your job is to take a feature from specification to working, verified code. Every implementation traces back to an approved spec.

## Required Reading

Before starting, read ALL of:

1. `the project system/design docsdevelopment-workflow.md` — the canonical workflow
2. the project lessons or known-issues document — past mistakes to avoid
3. The feature's specification in the project specifications or requirements documents
4. the project instructions — doc lookup for task-relevant system docs

Then read the system docs relevant to the feature (architecture, persistence, UI guidelines, etc.) using the project instructions lookup table.

## Process

### Phase 1: Spec Review

Read the specification fully. Check the todo (the project todo/backlog document) for this spec's sub-phases — identify which sub-phase you are implementing. Specs can have multiple sub-phases, and sub-phases tagged `[P2]` or `[deferred]` are out of scope for the current project phase.

Produce a **build brief** — a focused summary that protects context:

1. **Target sub-phase** — which sub-phase of the spec is being implemented (or "single-phase" if no sub-phases)
2. **Core behaviour** — what the feature does (3-5 bullet points)
3. **Acceptance criteria** — how we know it works
4. **Constraints** — what must not happen, architectural boundaries
5. **Persistence implications** — any schema or storage changes? Follow the project persistence or migration policy
6. **Integration points** — what existing systems does this touch?
7. **Spec gaps** — anything ambiguous, missing, or contradictory

If the spec has no gaps, proceed to the Premise Challenge.

**Spec quality gate:** Validate the spec against the quality gate checklist in the project specification template, if one exists. If any gate items fail (missing acceptance criteria, empty edge cases, placeholder text, etc.), flag them as spec gaps.

If the spec has gaps → **STOP. Present the gaps as targeted questions.** Do not guess. Do not proceed with assumptions about ambiguous behaviour. Ask one question at a time, with a recommendation and reasoning for each. For extensive gaps, recommend `clarify-spec` skill to resolve them systematically.

### Phase 1.5: Premise Challenge

Before planning the work, challenge the premises. This catches unnecessary work early.

1. **Is this the right thing to build?** Could a different framing or simpler approach achieve the same goal?
2. **What happens if we do nothing?** Is the current state actually causing real pain, or is this speculative improvement?
3. **What existing code already partially solves this?** Map existing patterns, utilities, and flows that could be reused — the answer may reduce the scope significantly.
4. **Does this align with product principles?** Check against the project product principles or decision criteria — offline-first, migration safety, surgical changes.
5. **Has this been persona-validated?** If this is a user-facing feature and no `user-test` skill has been run for it, suggest: "This is user-facing — consider `user-test` skill before investing build time." This is a suggestion, not a gate.

If the premises hold → proceed to Phase 2.

If a premise is shaky → present the concern to the user before proceeding. A concrete "we could skip this because X already handles it" is more useful than building something unnecessary.

### Phase 2: Audit Existing Code

Before planning, understand what exists:

- What code already exists for this feature area?
- Is there partial implementation? What specifically is missing?
- What patterns does the surrounding code use?
- What dependencies and integration points exist?

If the feature is already complete → do not re-implement. Update docs and mark complete.
If the feature is partial → identify exactly what is missing and implement only that.

### Phase 2.5: Competing Approaches (Optional)

**Trigger:** Activate this phase when the feature involves a non-trivial architectural decision — a new data flow pattern, a novel UI architecture, a persistence strategy with trade-offs, or when the audit reveals multiple viable approaches. Skip for straightforward features where the approach is obvious from existing patterns.

When triggered, spawn **2 subagents in parallel** (model: `sonnet`), each tasked with drafting a different architectural approach:

| Agent | Approach | Bias |
|---|---|---|
| Agent A — Minimal | Smallest change footprint, maximum reuse of existing patterns | Fewer new types, less flexibility, faster to build |
| Agent B — Flexible | More extensible design, anticipates likely next-phase needs from the spec | More new types, more flexibility, higher initial cost |

Each agent receives:
- The build brief from Phase 1
- The audit findings from Phase 2
- The relevant system docs (architecture, persistence, UI guidelines)

Each agent produces:
1. **Approach name** — 2-3 word label
2. **Key types** — New types introduced and their responsibilities
3. **Data flow** — How data moves from storage -> service -> UI
4. **Trade-offs** — What this approach is good at and what it sacrifices
5. **Estimated scope** — Number of new files, modified files, new tests
6. **Risk** — What could go wrong with this approach

Present both approaches side-by-side and **STOP for user selection**. The user picks one (or asks for a hybrid). The selected approach feeds into Phase 3.

If neither approach is satisfactory, the user may ask for a third or provide direction. Do not proceed to Phase 3 until an approach is selected.

### Phase 3: Plan

Present a plan and **STOP for approval**. The plan is how the user controls what gets built. It is never optional.

Structure the plan using the project task-plan template as a guide. Every plan must include:

1. **Current state** — what exists, what is missing, what is wrong
2. **Tasks** — dependency-ordered, with file paths, following the tasks template format (Setup → Tests → Foundation → Logic → Views → Polish)
3. **What will be tested first** — acceptance criteria converted to test descriptions
4. **Verification** — how we prove the work is complete
5. **Documentation updates** — what specs/docs need updating after implementation

Keep the plan short and execution-oriented. This is a scope check, not a dissertation.

**STOP here and wait for user approval before writing any code.**

### Phase 4: Build

After the user approves (or adjusts) the plan:

1. **Write tests first.** Convert acceptance criteria into failing tests. Run them to confirm they fail. This is not optional — tests before implementation, always.
2. **Implement the minimum change** that makes the tests pass. Reuse existing architecture. Prefer concrete implementations over speculative abstractions.
3. **Build and run tests** after each logical chunk of work. Do not batch all verification to the end.
4. **Follow project conventions exactly** — coding guidelines, UI guidelines, naming, architecture boundaries.

**Anti-eagerness guardrails — read these at every phase boundary:**
- Do NOT start the next task in the plan until the current one builds and passes tests.
- Do NOT refactor code you encounter along the way unless it blocks the current task.
- Do NOT "just quickly" add a feature, enhancement, or improvement that is not in the approved plan.
- Do NOT read ahead in the spec for future phases — stay in the current sub-phase.
- If you feel the urge to do "one more thing", STOP. That urge is the signal to check in with the user.

During build, if you discover a spec gap or contradiction:

- **STOP.** Do not guess or work around it.
- Document the gap with what you found and what decision is needed.
- Ask the user for direction.
- Record the gap for spec revision.

### Phase 5: Spec Compliance Check

Before declaring the work complete, verify against the spec:

1. Re-read the specification
2. Walk through each acceptance criterion — is it met? Show evidence.
3. Walk through each constraint — is it respected?
4. Run all tests and confirm they pass (show the output, do not claim "should pass")
5. Build the affected target or project
6. Run the project lint command, if one exists
7. Compare the final behaviour back to the spec

If any criterion is not met → state precisely what remains. Do not mark complete.

**Optional follow-ups** — after Phase 5 passes, these skills are available for deeper quality work:
- `pre-ship` skill — spec compliance + UX flow + visual quality gate
- `code-review` skill — fresh-eyes critique loop to find defects checklists miss
- `code-style` skill — AI tell and house style audit
- `ux-audit` skill — UX flow audit with data wiring and promise verification

These are not mandatory. Use them when the feature warrants it or the user requests them.

### Phase 6: Wrap Up

After verification passes:

1. Update the project todo/backlog document:
   - For single-phase specs: mark `[x]` with completion date
   - For multi-phase specs: mark only the completed sub-phase `[x]` with completion date — do not check other sub-phases
   - If all current-phase sub-phases (those not tagged `[P2]`/`[deferred]`) are now checked, the spec is `Implemented` in scope
   - If some current-phase sub-phases remain unchecked, the spec stays `Partial` in scope
2. Update the project scope/status document if feature status changed (apply the sub-phase rule above)
3. If implementation revealed spec gaps, data model changes, or behaviour divergence, recommend `sync-spec` skill to reconcile the specification
4. Update the project lessons or known-issues document if you learned something worth recording

Present a summary:

1. **What was built** — brief description
2. **Spec compliance** — criterion-by-criterion pass/fail
3. **Files changed** — list with brief description of each change
4. **Tests added/modified** — what is now covered
5. **Follow-up items** — anything deferred, spec gaps documented, polish opportunities noted
6. **Retrospective** — now that the feature is built, reflect on what you learned:
   - What friction did you hit that a different approach would have avoided?
   - What pattern or abstraction turned out to be the wrong fit?
   - What would you do differently if implementing this from scratch?
   - Record any significant architectural insights in the project lessons or known-issues document
   - If a different approach would be materially better (simpler, fewer seams, better testability), note it as a follow-up item — not a from-scratch rebuild

## Completion Criteria

A task is complete **only** if ALL of the following are true:

- Specification is materially implemented
- Code fits the repo architecture cleanly
- Required integration is present
- Tests exist and pass (with evidence — show the output)
- Build succeeds
- Linting passes
- Scope/todo documents are updated

## Session Handoff

If implementation must span multiple sessions:

1. Document current progress in the plan (what is done, what remains)
2. List any decisions made during implementation
3. Note any spec gaps discovered
4. Ensure all work so far builds and passes tests
5. Commit work-in-progress to the feature branch

## Red Flags — STOP

| Rationalization | Reality |
|----------------|---------|
| "Let me just start coding" | Present the plan first. The user controls scope through the plan. |
| "User said don't overthink it" | The plan IS the mechanism for not overthinking — it is a short scope check, not a dissertation. Present it. |
| "I'll plan as I build" | Plans presented after code is written are rationalizations, not plans. |
| "The spec is probably fine" | Read the spec. If it has gaps, ask. Do not guess. |
| "Tests can come after" | Tests come first. If you wrote code before the test, delete it and start with the test. |
| "It should pass" | Run the command. Read the output. Then claim it passes. |
| "It's mostly done, I'll finish quickly" | Present what remains as a plan first. |
| "This is a small fix, not a feature" | Small fixes still need the audit step. Skip the plan only if there is genuinely nothing to decide. |
| "I already know what to build" | You might. The user still needs to approve the scope. |
| "The spec gap is minor, I'll assume X" | Assumptions about behaviour become bugs. Ask. |

## Next Steps

After implementation is complete, suggest the appropriate next action based on what was built:

| Situation | Suggested Skill | Why |
|-----------|-------------------|-----|
| Feature has UI views | `code-style` skill | Catch AI tells and house style drift |
| Feature is user-facing | `pre-ship` skill | Spec compliance + UX flow + visual quality gate |
| Complex logic or architectural changes | `code-review` skill | Fresh-eyes critique finds what checklists miss |
| Spec gaps were discovered during build | `sync-spec` skill | Reconcile the spec with what was actually built |
| Changes touch shared types or multiple packages | `blast-radius` skill | Verify the impact footprint before shipping |
| Everything verified and ready | `ship-it` skill | Commit, PR, monitor, land |
| Idea surfaced during build but out of scope | `idea-seed` skill | Capture the idea with a trigger condition for later |
| User-facing feature, not yet persona-validated | `user-test` skill | Validate resonance with target users before or after building |
| Session getting long, context heavy | `pause-session` skill | Checkpoint progress before `/compact`, then `resume-session` skill |

Typical flow: `clarify-spec` skill → `implement` skill → `code-style` skill → `ux-audit` skill → `pre-ship` skill → `code-review` skill → `blast-radius` skill → `sync-spec` skill → `ship-it` skill

Not every step is needed before `implement` skill either — `clarify-spec` skill is most valuable for new or complex specs. For well-established specs, `implement` skill Phase 1 catches gaps inline.

Not every step is needed every time — use judgement based on the scope and nature of the changes.

## Rules

- Read the specification fully before changing anything
- Audit existing code before implementing
- Reuse existing architecture and patterns
- Avoid duplicate abstractions and speculative architecture
- Keep boundaries clean and modular
- Match project naming/style conventions
- Respect persistence/domain separation
- If a request conflicts with an approved spec, call it out before implementing
- If a document conflicts with the approved spec, the spec wins
- Do not refactor unrelated code
- Do not add comments, docstrings, or type annotations to unchanged code
