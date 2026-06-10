# Strategic Refactor

Inspect the repo from first principles, generate multiple refactor candidates, and pick the single refactor that removes the most complexity from the rest of the system.

The winning move is not the prettiest design. It is the change that most reduces what future readers and callers must understand.

Do not ask the user to choose among options. Make the call, explain it, and write an implementation-ready plan.

## Responsibility

**Owns:** Identifying the highest-leverage refactoring opportunity across the codebase.
**Does NOT own:** Executing the refactoring (produces a plan only), surgical single-file refactoring (use the `refactor` skill for that).

## Design Lens

Use these as the primary decision framework:

- Prefer simple mental models over elegant-looking structure
- Prefer deep modules over shallow wrappers
- Prefer interfaces that hide sequencing and policy details
- Prefer fewer concepts and fewer special cases
- Prefer moving complexity behind a stable boundary over redistributing it

Three forms of complexity to identify and reduce:
- **Change amplification**: one logical change requires edits in many places
- **Cognitive load**: a reader or caller must hold too many facts in mind
- **Unknown unknowns**: important behavior is surprising, implicit, or scattered

## Step 1: Establish Scope

Determine scope from context. Default to the workspace root if unspecified.

Infer and state:
- Target directory or feature area
- Hard constraints (e.g., "only look in the Auth feature")
- Soft guidance (e.g., "I think persistence is messy")
- Risk tolerance

Do not ask clarifying questions unless guidance is directly contradictory.

## Step 2: Build a First-Principles Model

Read the codebase systematically:

1. Start with repo instructions, project guidance docs, architecture documentation, and feature specs
2. Identify major entry points and the top 5-10 most-referenced modules
3. Map 3-5 core user-facing flows
4. Collect lightweight evidence:
   - Import/reference frequency
   - File size and directory spread
   - Change frequency from `git log --oneline -30`
   - Co-change evidence (files that always change together)
   - Whether tests exist near the affected code
   - Whether the area is a stable core path or a niche edge

For each important flow or module, ask:
- What does a caller need to know to use this correctly?
- Which sequencing rules or policy choices are pushed onto callers?
- Where are important decisions scattered across multiple files?
- Where does one concept appear under multiple names?
- Where does the interface surface look large relative to the logic it hides?

Output a mental model: core concepts, dependency highlights, major flows, evidence signals, and the most expensive sources of complexity.

## Step 3: Generate Candidates

Generate 2-5 candidates across these refactor classes:

| Class | Pattern |
|-------|---------|
| **Deepen a shallow module** | Thin wrappers, leaky interfaces, APIs requiring callers to coordinate too much |
| **Hide sequencing or policy** | Multi-step flows repeated by callers, orchestration logic spread across services |
| **Consolidate concepts** | Duplicate abstractions, parallel hierarchies, config-driven duplication |
| **Eliminate special-case complexity** | Branch-by-environment forks, one-off conditionals |
| **Remove a layer** | Dead adapters, pass-through services, stale compatibility layers |

For each candidate, capture:
- Candidate name and refactor class
- Files and flows involved
- What complexity exists today and who pays for it
- What knowledge would become hidden after the refactor
- What evidence supports it
- What could make it a trap

Collect negative evidence too:
- What only looks duplicated but is intentionally separate
- What is ugly but already a clean boundary
- What would require a rewrite rather than a refactor

## Step 4: Score Candidates

| Criteria | Weight |
|----------|--------|
| Complexity removed from callers and readers | 25% |
| Information-hiding gain | 20% |
| Cognitive load reduction | 20% |
| Change amplification reduction | 10% |
| Special-case elimination | 10% |
| Blast radius vs. risk | 5% |
| Evidence confidence | 5% |
| Ease of validation/rollback | 5% |

Apply modifiers:
- Small bonus for matching soft user guidance
- Penalty for weak evidence
- Penalty for hidden migration cost (especially persistence schema or storage changes)
- Penalty for speculative architecture
- Penalty when the candidate adds knobs, layers, or concepts
- Penalty when the candidate mostly rearranges code without shrinking interface burden

The winner is the highest-scoring candidate after modifiers.

## Step 5: Present the Winner

Present only the single best refactor:

1. **Current state** — what exists today and why it hurts
2. **Chosen refactor class** — which pattern this follows
3. **Scope** — exact files and flows involved
4. **Why this is the best move** — evidence-based rationale
5. **Complexity dividend** — what callers or future readers will no longer need to know
6. **What stays untouched** — boundary of the change
7. **Implementation sketch** — target module shape, moves, and first 1-2 tests to write
8. **Risks and mitigations** — realistic failure modes
9. **Why not the others** — 1-2 bullets per rejected candidate

If user guidance shaped the outcome, say how.

## Step 6: Write the Plan

After presenting the winner, write an implementation plan to the project refactor plan document with:

- Which complexity is being removed
- Which interface or boundary becomes simpler
- What knowledge moves from callers into the implementation
- Validation steps (tests to write/update, build commands)
- Rollback notes
- persistence migration requirements if applicable

## Anti-Patterns

- **Offering a menu** — Make the call. Do not ask the user to pick.
- **Cosmetic refactors** — Renames and formatting are not winning moves.
- **Shallow abstractions** — Do not add layers that expose nearly as much complexity as they hide.
- **Boiling the ocean** — Avoid repo-wide rewrites disguised as refactors.
- **No evidence** — Every recommendation must cite files, flows, and concrete signals.
- **Complexity shifting** — If complexity just moves to callers, config, or coordination glue, it is not a win.

## Rules

- Filter out any candidate that violates hard user constraints.
- If the best refactor involves persistence schema or storage changes, explicitly call out migration requirements per the project persistence or migration policy.
- Keep the plan surgical enough to land in one PR.
