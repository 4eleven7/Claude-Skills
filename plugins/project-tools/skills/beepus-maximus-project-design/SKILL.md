---
name: design
description: Design gate before implementation. Explores intent, proposes approaches, and produces an approved spec before any code is written. Use before any creative work — features, components, behaviour changes.
---

# Design Before Code

Turn ideas into approved designs through collaborative dialogue. No code until the design is approved.

## Hard Gate

Do NOT write implementation code, scaffold projects, or invoke implementation skills until you have presented a design and the user has approved it. This applies to every task regardless of perceived simplicity.

## Process

1. **Explore context** — Read relevant files, docs, recent commits
2. **Ask clarifying questions** — One at a time. Prefer multiple-choice. Focus on purpose, constraints, success criteria.
3. **Propose 2-3 approaches** — With trade-offs and your recommendation
4. **Present design** — In sections, get approval after each. Scale detail to complexity.
5. **Write spec** — Save to `the project specifications or requirements documents<feature>-specification.md`
6. **User approves spec** — Wait for explicit approval before proceeding

## Understanding the Idea

- Check project state first (files, docs, recent commits)
- Assess scope early: if the request covers multiple independent subsystems, flag it. Help decompose before diving into details.
- For large projects, identify independent pieces, their relationships, and build order. Brainstorm the first sub-project through the normal flow.
- Check for an `.improvements.md` backlog — surface any relevant improvement opportunities that relate to the feature being designed
- Ask one question per message
- Focus on: what is this for, what are the constraints, how do we know it works

## Exploring Approaches

- Always propose 2-3 approaches with trade-offs
- Lead with your recommendation and explain why
- Be honest about complexity and risk

## Presenting the Design

- Present once you believe you understand what's needed
- Scale each section to its complexity — a sentence if obvious, a paragraph if nuanced
- Ask after each section whether it looks right
- Cover: architecture, components, data flow, error handling, testing strategy
- Go back and revise if something doesn't land

## Design Principles

- **YAGNI** — Remove speculative features ruthlessly
- **Isolation** — Each unit has one job, well-defined interfaces, testable independently
- **Follow existing patterns** — Explore current structure before proposing changes
- **Targeted improvement** — If existing code has problems that affect the work, include fixes in the design. Don't propose unrelated refactoring.

### Product-Level Heuristics

Apply these when evaluating approaches that involve user-facing features:

- **Trojan Horse** — Wrap complex technology in familiar UI patterns. Users don't want to interact with algorithms — they want experiences that feel natural. Ask: "What's the simplest, most familiar way users can interact with this capability?"

- **Vanity Mirror** — When a feature produces user insights or shareable content, frame it as identity expression, not app usage stats. "You're a morning person who peaks at 7am" beats "You logged 12 sessions this week." Celebrate who the user is, not what they did in the app.

- **Comfort Trap** — Consistency is a competitive moat. Every interaction should follow the same logic and feel like it belongs to the same family. Predictable patterns become second nature — switching costs increase. Design consistency isn't about aesthetics alone — it's about creating habits.

## Writing the Spec

Specs go to the project's specifications directory (e.g., the project specifications or requirements documents) following the project's existing spec format. Read an existing spec in that directory to match the style.

The spec should be a standalone document that someone could implement without the conversation context.

## After Approval

Transition to implementation planning. The design phase is done — next is breaking the spec into implementation tasks.

## Key Rules

- One question at a time
- Multiple choice when possible
- 2-3 approaches before settling
- Present design incrementally, get approval per section
- Spec is a standalone document
- No code until approved
