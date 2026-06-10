---
name: explain
description: Explain how code works with summaries, diagrams, analogies, and annotated snippets. Use when the user asks "how does X work?" or wants a codebase walkthrough.
---

# Explain Code

## Routing

Use for explanation only. Use `deep-investigate` for root-cause investigation, `code-review` for defect findings, `hypothesis-debug` for debugging and fixing, and `implement` when code should change.

## Process

1. **Read** — Target file(s) and their key dependencies
2. **Summarise** — 2-3 sentences on WHAT it does and WHY it exists
3. **Diagram** — ASCII box diagram of components and data flow
4. **Analogy** — Relate to an everyday experience (cooking, mail, traffic, etc.)
5. **Key code** — 2-3 annotated snippets showing the important parts
6. **Offer depth** — "Want me to go deeper on any of these?"

## Output Format

```
## How [Component] Works

**Summary:** [2-3 sentences — what and why]

**Architecture:**
┌─────────┐    ┌──────────┐    ┌─────────┐
│  Input   │───>│ Process  │───>│ Output  │
└─────────┘    └──────────┘    └─────────┘

**Think of it like:** [Real-world analogy]

**Key code:**
[Annotated snippets with // <-- callouts]

**Want me to explain any of these in more detail?**
- [Topic 1]
- [Topic 2]
```

## Rules

- Use simple ASCII boxes for diagrams — no mermaid/graphviz
- Match analogy complexity to code complexity
- Define jargon before using it
- Start high-level, offer to go deeper — don't dump everything at once
- Don't paste raw code without annotation
