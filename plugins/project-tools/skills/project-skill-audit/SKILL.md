---
name: project-skill-audit
description: Use when auditing, deduplicating, renaming, removing, or improving project skill catalogs.
---

# Project Skill Audit

Audit the project’s real recurring workflows before recommending skills. Prefer evidence from repo docs, memory, past sessions, current local skills, and repeated validation flows over brainstorming.

## Responsibility

**Owns:** Finding stale, missing, overlapping, too-specific, or too-generic skills and recommending the smallest useful skill changes.

**Does NOT own:** Creating every suggested skill automatically, rewriting global instructions, or inventing project needs without evidence.

## Evidence Order

Use the strongest available evidence first:

1. Project instructions: repo instructions, README, workflow docs, architecture docs, validation docs.
2. Existing project-local skills: `.agents/skills`, `skills`, plugin skill folders, or runtime-provided skill directories.
3. Runtime memory: the configured memory directory for the current agent runtime, if one exists.
4. Session summaries or rollout summaries, if present.
5. Raw session logs only when summaries do not contain enough evidence.

Do not bulk-read all sessions or memories. Search by repo name, current `cwd`, feature names, validation commands, recurring file paths, and repeated failure terms.

## Workflow

1. Map the current project: repo root, project instructions, skill directories, and validation commands.
2. Inventory existing skills and classify each by workflow, trigger boundary, and current usefulness.
3. Search memory/session evidence for recurring patterns:
   - repeated validation sequences
   - repeated failure modes
   - repeated ownership or architecture confusion
   - repeated user corrections
   - repeated context the agent had to rediscover
4. Compare recurring patterns with existing skills.
5. Prefer updating an existing skill when it is already the right bucket but has weak triggers, stale paths, missing guardrails, or incomplete validation.
6. Recommend a new skill only when the workflow is distinct enough that expanding an existing skill would make it vague.

## Recommendation Rules

Recommend **update existing** when:

- A skill is close but missing modern paths, commands, trigger phrases, or failure shields.
- A skill body and runtime metadata drift from each other.
- The skill is too broad and needs a sharper trigger boundary.
- The skill is too specific and should be generalized.

Recommend **create new** when:

- A repeated workflow is not covered by any existing skill.
- Success depends on concrete local commands, repo paths, ownership rules, or validation steps.
- The workflow has enough shape to be reusable, not just a one-off bug.

Recommend **delete or merge** when:

- A skill duplicates another skill with weaker guidance.
- The trigger is vague enough to cause accidental loading.
- The skill encodes stale implementation details instead of durable workflow guidance.

## Output Shape

```markdown
## Existing Skills
| Skill | Workflow | Assessment |

## Suggested Updates
| Skill | Problem | Highest-value change |

## Suggested New Skills
| Skill | Trigger | Core workflow | Evidence |

## Delete or Merge
| Skill | Reason | Safer destination |

## Priority
1. [Highest-value change] - [why]
```

## Failure Shields

- Do not recommend a skill from a topic alone. Require a repeated workflow, validation flow, failure mode, or recurring context burden.
- Do not recommend a duplicate when a focused update would work.
- Do not turn project-specific conventions into global skills.
- Do not preserve implementation details, hooks, or local scripts unless they are the core reusable workflow.
- If evidence is thin, say so and mark the recommendation as low confidence.
