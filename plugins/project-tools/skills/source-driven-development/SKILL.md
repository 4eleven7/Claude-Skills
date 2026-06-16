---
name: source-driven-development
description: Use when framework, SDK, API, dependency, or platform-specific code must be grounded in current official documentation instead of memory or stale examples.
---

# Source-Driven Development

## Routing

Use this skill when correctness depends on current external or platform documentation. Use `evaluate-findings` when validating a specific review claim, `skill-research` when creating durable skill content from sources, and the relevant platform skill for implementation details.

## Overview

Do not implement framework-specific behavior from memory. Versioned APIs move, examples rot, and agents confidently repeat stale patterns. Source-driven development turns the docs into an input to the implementation, not a citation added afterward.

## When to Use

- Writing or reviewing code that depends on Apple SDKs, web frameworks, package APIs, cloud SDKs, CLIs, or third-party libraries.
- Modernizing code where deprecations, availability, or migration guidance matter.
- Creating examples that future projects may copy.
- Resolving disagreement between existing code, examples, and current documented behavior.
- Answering "is this API correct/current/supported?"

Do not use for pure local logic, renames, formatting, or code whose correctness is independent of external API behavior.

## Workflow

1. **Detect the exact dependency.** Read the project manifest, package file, Xcode project, lockfile, or code import to identify the framework, SDK, package, and version or platform target.
2. **Fetch the authoritative source.** Prefer official docs, SDK documentation, release notes, migration guides, standards documents, or first-party repositories. For Apple APIs, prefer `xcdocs`, local SDK docs, or developer.apple.com over blogs.
3. **Extract only the relevant rule.** Pull the signature, availability, deprecation note, lifecycle requirement, security rule, or recommended pattern needed for the current change.
4. **Compare with local code.** If the docs conflict with existing conventions, surface the conflict before changing patterns. Do not silently modernize a codebase-wide convention during a narrow task.
5. **Implement or review against the source.** Use the documented API shape and constraints. Flag anything that remains inferred.
6. **Cite the evidence.** In the final answer, include the source names or URLs used. Add code comments only when the source explains a non-obvious constraint the next maintainer must preserve.

## Source Priority

| Priority | Source |
|---|---|
| 1 | Official SDK/framework documentation for the detected version or platform target |
| 2 | Official release notes, migration guides, standards, or first-party repositories |
| 3 | Local generated docs, headers, symbol graphs, or installed SDK interfaces |
| 4 | Reputable third-party analysis only to find the official source, never as primary authority |

Never treat Stack Overflow, tutorials, AI answers, or old sample projects as authoritative.

## Conflict Handling

When current docs and local code disagree, report:

```markdown
## Source Conflict
- Local pattern: [what the repo does]
- Current source: [what the official source says]
- Risk: [what breaks if we choose wrong]
- Recommendation: [smallest safe action]
```

If the task is narrow, prefer local consistency unless the current source shows the local pattern is deprecated, broken, insecure, or unavailable for the project target.

## Common Mistakes

| Mistake | Fix |
|---|---|
| "I know this API" | Read the source anyway when the API/version matters. |
| Fetching a docs homepage | Fetch the specific API, migration, or release-note page. |
| Citing a blog as proof | Use the blog only to locate the official source. |
| Updating every old pattern nearby | Keep the change scoped unless the user approved modernization. |
| Hiding uncertainty | Mark unverified assumptions explicitly. |

## Verification

- [ ] The framework, SDK, package, or platform target was identified from project evidence.
- [ ] The source used is official or explicitly marked as lower authority.
- [ ] The implementation or review finding matches the sourced API behavior.
- [ ] Conflicts between source guidance and local conventions were surfaced.
- [ ] The final answer cites the source evidence or states what could not be verified.
