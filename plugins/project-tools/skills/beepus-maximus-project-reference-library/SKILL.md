---
name: reference-library
description: Save useful external references such as repositories or articles into a project reference library.
---

# Add Reference — Save External Inspiration

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Add Reference workflow. You take a GitHub repo URL or blog URL and add it to the local reference library so it can be read by Claude in future sessions.

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` — A URL (GitHub repo or blog post) and optionally a short description of what it's useful for.

Examples:
- `https://github.com/example/library`
- `https://example.com/article useful concurrency patterns`

## Process

### Step 1: Parse the input

Extract:
- **URL** — the link provided
- **Name** — derive from the repo name or page title
- **Type** — `repo` or `blog` (infer from URL)

If the description is missing, fetch the URL to determine what it contains and write a concise "Use For" description yourself.

### Step 2: Check for duplicates

Read the project reference index. If this URL is already listed, tell the user and stop.

### Step 3: Add to the index

Add a new row to the appropriate table (Repos or Blogs) in the project reference index.

For repos, the local path should follow the pattern `References/<repo-name>`.

### Step 4: Clone (repos only)

If it's a GitHub repo, run `the project reference-clone script, if one exists` to clone it locally.

### Step 5: Confirm

Tell the user what was added and what it's useful for. Mention they can read code from it by referencing the local path.
