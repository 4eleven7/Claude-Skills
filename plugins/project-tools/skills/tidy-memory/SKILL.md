---
name: tidy-memory
description: Use when auditing, shrinking, organizing, compacting, trimming, or deduplicating agent memory or project memory that has become stale or too large.
---

# Tidy Memory

Restructure an overgrown memory directory so MEMORY.md returns to a pure index under 200 lines.

## Responsibility

**Owns:** Auditing memory for staleness, verbosity, duplicates; restructuring into separate files; rebuilding the index.
**Does NOT own:** Creating new memories (that's the auto-memory system's job).

## Step 1: Locate and Measure

Find the memory directory at `the runtime memory directory`.

Measure:
- Read `MEMORY.md` and count lines
- List all `.md` files in the directory (excluding `MEMORY.md`)
- Read each memory file

Report current state: total MEMORY.md lines, number of separate files, whether MEMORY.md contains inline content.

## Step 2: Classify Every Entry

Walk through MEMORY.md and each memory file. Classify each entry:

| Classification | Criteria | Action |
|---|---|---|
| **Extract** | Inline content in MEMORY.md that should be a separate file | Move to own file, leave pointer |
| **Stale** | Derivable from current codebase | Remove |
| **Verbose** | Valid but uses more tokens than necessary | Compress |
| **Duplicate** | Same info in multiple places or already in project instructions | Deduplicate |
| **Merge** | Multiple small entries on same topic | Combine into one file |
| **Keep** | Valid, concise, non-derivable, already in separate file | No change |
| **Orphaned** | Memory file not referenced from MEMORY.md | Add pointer or remove if stale |

### Staleness Heuristics

**Likely stale:**
- Documents which files or functions exist (readable from code)
- Lists all locations that need updating (findable via grep)
- Describes architecture visible from module/directory structure
- Records a bug fix already in the codebase
- Documents API signatures or method names (readable from source)

**NOT stale:**
- Records a non-obvious gotcha or workaround (compiler bug, surprising framework behavior)
- Captures a decision rationale not visible in code
- Documents cross-cutting conventions not enforced by tooling
- Records user preferences or feedback
- Stores external references or credentials

### Compression Heuristics

**Can compress:**
- Explains a general programming concept instead of project-specific guidance
- Includes lengthy workaround steps when a one-liner suffices
- Repeats the same pattern across multiple bullets
- Contains code examples that restate what the text already says

## Step 3: Present the Cleanup Plan

Show a table before making changes:

```
| # | Entry/Section | Classification | Action | Est. Lines Saved |
|---|---------------|----------------|--------|------------------|
| 1 | <Section A> (8 lines) | Extract | Move to section_a.md | 7 |
| 2 | <Section B> (3 lines) | Stale | Remove — derivable from source | 3 |
| 3 | <Section C> (22 lines) | Verbose | Compress to 5 lines | 17 |
```

Include totals:
- Current MEMORY.md lines
- Projected MEMORY.md lines after cleanup
- Number of new files to create
- Number of entries to remove

Ask the user to approve, reject, or modify individual items.

## Step 4: Execute

Apply in this order:

1. **Create new memory files** with proper frontmatter:
   ```markdown
   ---
   name: {{descriptive name}}
   description: {{one-line description for relevance matching}}
   type: {{user|feedback|project|reference}}
   ---
   {{content}}
   ```

2. **Compress** verbose entries. Reword for brevity — every fact must survive.

3. **Remove** stale and duplicate entries.

4. **Fix orphaned files** — add missing pointers or remove stale orphans.

5. **Rebuild MEMORY.md** as a pure index: one line per file with brief description, organized by topic.

## Rules

- Never discard information the user hasn't approved removing.
- User preferences and feedback are always **Keep** regardless of age.
- Compression must preserve every fact. Reword, don't summarize.
- The rebuilt MEMORY.md must stay under 200 lines.
- File names should be descriptive snake_case (e.g., `swift_compiler_bugs.md`, `swiftdata_gotchas.md`).
