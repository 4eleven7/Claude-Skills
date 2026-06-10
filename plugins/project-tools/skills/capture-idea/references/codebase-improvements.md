# Improvement Backlog

Capture improvement opportunities discovered during work and implement them when ready. Two modes: **note** (capture) and **implement** (process the backlog).

## Responsibility

**Owns:** Maintaining a persistent backlog of actionable improvements, validating them before implementation.
**Does NOT own:** Actually implementing the improvements (produces a plan, then delegates to normal implementation workflow).

---

## Mode 1: Note an Improvement

### Step 1: Identify

Gather from context or user request:

- **What**: One-line summary
- **Where**: File path(s) or area of the codebase
- **Why**: Brief rationale — what's the benefit?
- **Category**: One of `refactor`, `performance`, `reliability`, `readability`, `testing`, `docs`, `dx` (developer experience), or `feature`

### Step 2: Append

Read `.improvements.md` if it exists. Create it with this header if it doesn't:

```markdown
# Improvements

Out-of-scope improvement opportunities captured during work sessions. Review periodically and pull items into active work when appropriate.
```

Entry format:

```markdown
### [one-line summary]

- **Category**: [category]
- **Where**: `[file path or area]`
- **Why**: [brief rationale]
- **Noted**: [YYYY-MM-DD]
```

Append at the end. Do not duplicate — if a similar improvement exists, update it instead.

### Step 3: Confirm

Tell the user the improvement was noted and where the file is.

---

## Mode 2: Implement Improvements

### Step 1: Read the Backlog

Read `.improvements.md`. If it doesn't exist, tell the user and stop.

### Step 2: Validate Against Current Codebase

Improvements go stale. For each entry, check:

1. **Files exist** — Do the referenced paths still exist?
2. **Problem persists** — Read the code. Is the issue still present?
3. **Not already addressed** — Check `git log` for recent changes that may have resolved it.

Classify each:
- **Active** — Still relevant
- **Stale** — No longer applicable
- **Unclear** — Needs user input

### Step 3: Report

Present a summary:

```
## Improvement Backlog Status

### Active (N)
- [summary] — [why still relevant]

### Stale (N)
- [summary] — [why stale]

### Unclear (N)
- [summary] — [what's ambiguous]
```

If more than 10 active improvements, suggest splitting into multiple sessions.

Ask the user:
1. Which active improvements to implement (default: all)
2. Whether to remove stale entries
3. Resolution for unclear items

### Step 4: Plan

Design an implementation plan for confirmed improvements:

- **Synergies** — Group improvements touching the same files
- **Dependencies** — Order so foundational changes come first
- **Conflicts** — Flag contradictions

Include a step to clean up `.improvements.md`: remove implemented and stale entries. Delete the file if all entries are resolved.

## Rules

- Keep entries concise — 3-5 lines max. These are backlog items, not specs.
- Do not act on improvements when noting them — only record.
- Do not create `the project root` if it doesn't exist — ask the user where to put the file.
- When noting proactively (during other work), briefly mention it to the user and offer to note it. Do not note silently.
- **Grounding rule:** Improvements must be grounded in session observations — things you actually encountered during work (friction, bugs, code smell, missing tests). Do not suggest speculative "wouldn't it be nice" improvements that weren't triggered by real experience in the current session.
