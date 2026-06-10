# Draft Spec — Interactive Specification Generation

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Draft Spec workflow. Your job is to interview the user about a feature idea and produce a structured specification ready for `implement` skill.

## Required Reading

Before starting, read ALL of:

1. the project specification template, if one exists — the canonical spec format
2. the project specification backlog — ideas waiting for specs
3. the project exploration backlog — exploratory ideas
4. the project lessons or known-issues document — past mistakes to avoid repeating
5. the project product principles or decision criteria — product values and non-negotiables
6. the project scope/status document — what exists and what is planned

## Process

### Phase 1: Identify the Feature

Determine what to specify:

- If the user names a specific feature → use that
- If the user says "from things-to-specify" → present the items from `things-to-specify.md` and let them pick
- If the user says "from things-to-explore" → present the items from `things-to-explore.md` and let them pick
- If unclear → ask what they want to specify

### Phase 2: Interview

Ask **3-5 targeted clarifying questions**, one at a time. Each question should:

1. Be specific, not open-ended
2. Offer 2-3 concrete options with trade-offs where appropriate
3. Include a recommended default with reasoning

Focus questions on the areas that specs most commonly get wrong:

| Area | Example Questions |
|------|------------------|
| **Core behaviour** | "What is the single most important thing a user should be able to do with this?" |
| **Scope boundary** | "Should this include X, or is that a separate feature?" |
| **Data model** | "What data does this need to persist? What is transient?" |
| **Edge cases** | "What happens when [empty state / no data / offline / concurrent edit]?" |
| **Integration** | "Does this depend on or affect any existing features?" |
| **User journey** | "How does the user discover this? What is the entry point?" |

Do NOT ask more than 5 questions. If something is unclear after 5, note it as a spec gap to resolve during implementation.

### Phase 3: Research

Before writing, gather context:

1. **Check existing code** — is there any partial implementation, related model, or relevant protocol?
2. **Check existing specs** — does any other spec define types or behaviours this feature will reuse?
3. **Check lessons** — are there past mistakes relevant to this feature area?
4. **Check product principles** — does this feature align with offline-first, migration safety, etc.?

### Phase 4: Draft

Write the specification using the template from the project specification template, if one exists. Fill every section. If a section genuinely does not apply, write "N/A — [reason]" rather than leaving it blank.

Key sections to get right:

- **User Scenarios** — concrete, testable stories
- **Acceptance Criteria** — each must be verifiable without subjective judgement
- **Data Model** — types, relationships, persistence requirements
- **Behaviour Table** — input → expected result → error, for every interaction
- **Edge Cases** — the situations that cause bugs if not specified
- **Constraints** — what must NOT happen
- **Dependencies** — what this feature requires from other features or systems

### Phase 5: Quality Gate

Before presenting the spec, validate it against the quality gate in the specification template:

- [ ] Every user scenario has at least one acceptance criterion
- [ ] Every behaviour table row has expected result AND error columns filled
- [ ] Data model matches the behaviours described
- [ ] Edge cases are genuine edge cases (not core behaviour misplaced)
- [ ] No placeholder text ("TBD", "TODO", "to be determined")
- [ ] Glossary is complete for all domain terms used
- [ ] Dependencies are listed with their current implementation status
- [ ] Constraints include persistence/migration implications if data is stored

### Phase 6: Present

Present the full draft specification and ask:

```
## Draft Specification — [Feature Name]

[Full spec content]

---

### Spec Quality Gate
- [x] All items passed / [ ] Items that need attention

### Open Questions
- [Any remaining ambiguities from the interview]

### Suggested Next Steps
1. Review and approve this spec
2. Save to `the project specifications or requirements documents[feature-name]-specification.md`
3. Run `spec-workflow` skill if open questions remain
4. Run `implement` skill when ready to build
```

**STOP and wait for user approval before saving.**

### Phase 7: Save

After user approves (or adjusts):

1. Write the spec to `the project specifications or requirements documents[feature-name]-specification.md`
2. If the feature came from `things-to-specify.md` or `things-to-explore.md`, note that it now has a spec (do not remove it — the user manages those lists)
3. Update the project scope/status document if this is a new feature entering scope

## Rules

- Ask questions one at a time — do not dump all 5 at once
- Offer concrete options, not open-ended questions
- Include a recommended default with reasoning for each question
- Fill every section of the template — no blank sections
- Do not assume behaviour the user has not confirmed
- If the feature overlaps with an existing spec, reference it rather than duplicating
- Keep the spec focused — if it is growing beyond one feature, suggest splitting
- The spec is a contract — every acceptance criterion will become a test
