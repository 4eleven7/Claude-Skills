---
name: session-distill
description: Use when distilling a session, saving learnings, capturing durable corrections, extracting lessons, updating project memory, or improving future agent behaviour.
---

# Session Distill

Review the current conversation to extract durable lessons and route each to the right knowledge layer. Each session should make future sessions easier.

## Responsibility

**Owns:** Identifying non-obvious learnings, classifying them, routing to the correct destination, writing them.
**Does NOT own:** The content of the knowledge layers themselves (follows existing format and conventions).

## Step 1: Detect Destinations

Read the available destinations:

1. **Project instructions** — the project instructions or the project instructions (project instructions, conventions, architecture decisions)
2. **Lessons** — the project lessons or known-issues document (past mistakes, corrections, gotchas)
3. **Auto memory** — `the runtime memory directory` (user preferences, API quirks, tool pitfalls)
4. **Skills** — the installed skills directory (existing skills that could be improved)
5. **Improvement backlog** — `.improvements.md` (actionable code improvements for later)

Read project instructions, lessons.md, and MEMORY.md to understand what's already documented.

## Step 2: Scan for Lessons

Scan the full conversation with this priority:

1. **Corrections** — Where the user interrupted, said "no", "actually", "stop", redirected, or manually fixed something. Highest-value lessons.
2. **Repeated guidance** — Instructions the user gave more than once.
3. **Failure modes** — Approaches that failed, with what worked instead. Trace back to the information source that led to the error.
4. **Preferences** — Formatting, naming, style, or tool choices the user expressed.
5. **Domain knowledge** — Facts or conventions the agent needed but did not have.
6. **Skill gaps** — Where an existing skill gave bad guidance or missed an edge case.
7. **Improvement opportunities** — Out-of-scope improvements noticed during work: code that could be refactored, missing tests, performance issues. Include findings from code review or simplification that were skipped for this session.

## Step 3: Filter

Keep only lessons that are:
- **Stable** — likely to remain true across future sessions
- **Non-obvious** — a future agent would not already know this
- **Actionable** — can be expressed as a rule or instruction
- **Not already documented** — absent from project instructions, lessons.md, and MEMORY.md
- **Still a concern** — not already fixed by changes made in this session

Discard anything session-specific, speculative, one-off, or already resolved by code changes. If no lessons survive, tell the user and stop.

## Step 4: Route Each Lesson

Assign each to exactly one destination:

| Destination | Criteria |
|---|---|
| **Project instructions** | Intentional project decisions: conventions, architecture, build setup, module boundaries |
| **the project lessons or known-issues document** | Past mistakes, corrections, gotchas, things that burned time |
| **Auto memory** | Discovered knowledge: API quirks, compiler gotchas, tool pitfalls, user preferences |
| **Existing skill** | Lesson improves a skill's instructions, adds a missing edge case, corrects its workflow |
| **Improvement backlog** | Actionable improvement to existing code — not a lesson, a thing to *do* later |
| **No destination** | Does not clearly fit. Drop it. Routing a weak lesson is worse than losing it. |

### Tiebreakers

- Skill vs. project instructions — prefer the skill. Better scoped, loaded only when relevant.
- project instructions vs. memory — intentional decisions → project instructions. Discovered knowledge → memory.
- project instructions vs. lessons.md — conventions/rules → project instructions. Mistakes/gotchas → lessons.md.
- Lesson vs. improvement — knowledge to remember → lesson. Work to do later → improvement.

## Step 5: Present Routing Plan

Show a table before making changes:

```
| # | Rec | Lesson | Destination | Action |
|---|-----|--------|-------------|--------|
| 1 | Yes | Always use X for... | Project instructions | Append to ## Section |
| 2 | Yes | persistence gotcha with... | lessons.md | Add entry |
| 3 | Yes | User prefers short commits | Auto memory | Create memory file |
| 4 | No  | Refactor the settings client | Improvement backlog | Note for later |
```

Mark a lesson as "No" when routing is uncertain or the lesson is borderline.

Ask the user: **Approve all**, **Approve recommended** (only "Yes" rows), or **Reject all**.

## Step 6: Execute

Apply approved changes in order:

1. **Project instructions / lessons.md** — Read the target, find the right section, append or update in place. Match tone and format.
2. **Auto memory** — Follow the memory system conventions (frontmatter with name/description/type, update MEMORY.md index).
3. **Skill updates** — Edit the skill's SKILL.md directly. Keep changes focused.
4. **Improvements** — Run the `/improvement-backlog` skill to note each item.

## Writing Guidelines

- Use imperative mood and short declarative sentences
- Match the tone of the target file
- Omit rationale unless the rule would seem arbitrary without it
- Never include temporary state or session-specific details
- State the rule, not the instance
- For lessons.md: lead with what went wrong and what to do instead
- For memory: concise, operational, organized by topic
