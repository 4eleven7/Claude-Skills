---
name: capture-lesson
description: Use when a correction, gotcha, near-miss, surprising behavior, or repeated mistake should be captured as durable project knowledge.
---

# Capture Lesson

Capture a mistake, gap, gotcha, or near-miss from the current session with root-cause analysis and route it to the right knowledge layer. This is an immediate capture workflow, not a full session review (use `session-distill` for that).

For non-obvious code or framework quirks, also use `references/record-gotcha.md` for documentation criteria and inline comment format.

## When to Use

- The user says something went wrong, was missed, or shouldn't happen again
- A gap was discovered (missing tests, stale docs, dead infrastructure)
- A near-miss was caught before it caused damage
- The user explicitly asks to record a lesson

## Step 1: Identify What Happened

Scan the recent conversation for the incident. Summarise in one sentence:
- **What** — the concrete thing that went wrong or was missing
- **When it was discovered** — what revealed the problem

If the user asks to avoid repeating a mistake without context, ask: "What specifically should I capture?"

## Step 2: Root-Cause Analysis

Dig one level deeper than the symptom. Ask these questions:

1. **Why did this happen?** — What decision, assumption, or omission led to it?
2. **Why wasn't it caught earlier?** — What guard, test, or review should have caught it?
3. **Is this a pattern?** — Has something similar happened before in this project? Check the project lessons or known-issues document for related entries.
4. **What's the generalizable rule?** — Express as an imperative: "Always X when Y" or "Never X without Y".

## Step 3: Route the Lesson

Each lesson goes to exactly one destination. Pick the best fit:

| Destination | When to use | Format |
|---|---|---|
| the project lessons or known-issues document | Mistakes, corrections, gotchas, things that burned time | `## DATE - Title` with **Mistake**, **Pattern**, **Rule** |
| Auto memory | User preferences, tool quirks, API behaviour, workflow preferences | Memory file with frontmatter |
| Project instructions or repo guidance docs | Project conventions, architecture decisions, build rules | Append to relevant section |
| System doc | Existing doc is incomplete or wrong about this topic | Edit the canonical doc |
| Existing skill | A skill gave bad guidance or missed an edge case | Edit the skill |
| No destination | Already fixed by code changes, not recurring, or too specific | Tell the user and stop |

### Routing Decision Tree

```
Is it a mistake/gotcha that burned time?
  YES → located lessons or known-issues document
  NO ↓
Is it a project convention or architecture decision?
  YES → project instructions
  NO ↓
Is it a discovered fact about a tool, API, or the user's preferences?
  YES → auto memory
  NO ↓
Does an existing doc or skill need correction?
  YES → update that doc/skill
  NO ↓
Was it already fixed and won't recur?
  YES → no destination (tell user, stop)
```

### When NOT to Write a Lesson

- The fix is self-evident from the code change (the diff IS the lesson)
- The rule is already documented — check the located lessons/known-issues document, project instructions, memory, and system docs first
- It's too project-specific to help future sessions (one-off debugging artifact)
- The "lesson" is just "I should have read the docs" — instead, check if the docs are findable

If the lesson is already covered, tell the user: "This is already documented in [location]. No new entry needed."

## Step 4: Present Before Writing

Show the user what you'll write and where, in this format:

```
**Destination:** the project lessons or known-issues document
**Entry:**
## 2026-03-23 - [Title]
**Mistake**: [What happened]
**Pattern**: [The underlying assumption or omission]
**Rule**: [The imperative rule to follow]
```

Wait for approval before writing. If the user says "just do it", write immediately.

## Step 5: Write

1. Read the target file
2. Write the entry matching the target's existing format exactly
3. For the lessons or known-issues document: prepend to the file (newest first), use the **Mistake** / **Pattern** / **Rule** structure unless the existing file uses another convention
4. For memory: follow memory system conventions (frontmatter, update MEMORY.md index)
5. For project instructions or system docs: find the right section, append or update in place

## Writing Rules

- Match the tone and format of the target file exactly
- Use imperative mood: "Always X", "Never Y", not "We should X"
- Be specific: name files, functions, patterns — not vague principles
- One lesson per entry. If there are multiple, write multiple entries.
- Include the date (today's date) for lesson entries
- Keep it short. If the explanation needs more than 4 lines, the rule isn't crisp enough.
