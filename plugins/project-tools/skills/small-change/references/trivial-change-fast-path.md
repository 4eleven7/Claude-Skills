# Trivial Change Fast Path

## Portability

This is the canonical workflow. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this as the fast path inside the `small-change` workflow. Handle trivial changes that need no plan, no spec, no subagents — just do it and verify.

Use this for: typo fixes, config changes, renaming, updating a string, adjusting a constant, fixing a comment, toggling a flag, adding a gitignore entry, or any change where the correct action is obvious and the blast radius is negligible.

## Input

Use the user request, selected files, selected text, or current repo context as input. Examples: "fix the typo in the auth service" or "rename `oldName` to `newName` in the auth package".

## Process

### Step 1: Do It

Read the relevant file(s), make the change. No plan, no approval gate.

### Step 2: Verify

Run the minimum verification that proves the change is safe:

| Change Type | Verification |
|-------------|-------------|
| Code change | Build the affected package, module, or target |
| Test file change | Run the affected test suite |
| Config / script change | Run the script or build to confirm no breakage |
| Documentation only | No verification needed |

```bash
# For code changes, at minimum:
[project lint command]
```

### Step 3: Report

```
## Small Change Done

- **Changed:** <file:line — what changed>
- **Verified:** <what was run to confirm>
```

One line per change. No ceremony.

## Scope Triage

Before making the change, assess whether the fast path is the right tool. This triage is mandatory — it keeps trivial edits fast while routing riskier work to the tested path.

### Step 0: Check the Work

Read the relevant file(s) and classify the change:

| Signal | Right Workflow | Why |
|--------|--------------|-----|
| One file, obvious fix, no behaviour change, no tests needed | **Fast path** — proceed | The change is mechanical. Verification (build + lint) is sufficient. |
| Correct fix requires understanding surrounding logic | **Tested path** — continue in `small-change` | Needs an audit step to avoid breaking something. |
| Change has testable behaviour (even if small) | **Tested path** — continue in `small-change` | Write a test first where useful. |
| Touches a shared type, schema, protocol, or persisted model | **Tested path** — continue in `small-change` or escalate to `implement` if scope grows | Shared contracts have dependents and need broader verification. |
| Rename spans multiple files across packages | **Tested path** — continue in `small-change` or escalate to `implement` if scope grows | Multi-file renames need verification across package boundaries. |
| Needs a spec to understand what to build | **`implement` skill** — hand off | This is feature work, not a small change. |
| Needs an architectural decision | **`implement` skill** — hand off | This needs a plan. |

### Handoff Format

If the triage redirects, explain *why* so the user understands the boundary:

```
## Escalating To Tested Path

**Requested:** <what was asked>
**Why not fast path:** <specific reason — e.g., "This touches a shared persisted model with multiple dependents.">
**What tested path adds:** <what the user gains — e.g., "Audit step, test-first verification, migration check.">

Switching to the tested path now.
```

Then continue inside the main `small-change` workflow. Do not ask the user to re-invoke manually.

## Rules

- No plan, no spec review, no competing approaches
- No subagents
- Always verify with at least a build (for code) or lint
- If the change touches tests, run them
- Scope guard is mandatory — do not let a tweak grow into an implementation
- This skill does not update scope/todo documents
