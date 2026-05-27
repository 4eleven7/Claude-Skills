---
name: research-questions
description: Generate structured research questions for a feature, product area, technology, or decision.
---

# Research Questions — Structured Question Generation

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Generate a structured set of research questions to guide deep technical investigation. This produces questions only, not answers. Use as Phase 0 before the `deep-research` skill to scope what needs investigating.

## When to Use

- Before diving into an unfamiliar technology or framework
- When planning a major architectural decision
- When scoping what to research before using the `deep-research` skill
- When you need to understand the question space before seeking answers

## Process

### Step 1: Understand the Topic

If the topic isn't clear from arguments, ask:

1. What are you trying to build or decide?
2. What do you already have? (Existing code, tools, context)
3. What's the pain point driving this research?
4. How far does it need to scale?

### Step 2: Check for Existing Research

Look for the project research notes folder or similar folders in the project. If prior research exists on this topic, read it to avoid redundant questions.

### Step 3: Write the Research Prompt

Create the file at a project research-questions note for the topic.

Follow this structure exactly:

```markdown
# Research Prompt: <Clear Descriptive Title>

## Objective

1-2 paragraphs. What are we researching and why. State the core question in bold.
Frame it as exploration, not as a spec. Don't prescribe the answer.

## Context

### Current State / Pain Point
What exists today. What's broken or insufficient. Be specific — reference
actual code, tools, numbers. This grounds the research in reality.

### What We Want
Bullet list of desired capabilities. What the end state looks like.
Keep it high-level — the research should figure out HOW.

## Key Questions

### 0. <First Major Topic Area>

0a. **<Specific sub-question>**
    - Concrete question that demands investigation
    - Follow-up angle or related concern
    - "How does X handle this?" type comparative question

0b. **<Next sub-question>**
    - ...

### 1. <Second Major Topic Area>

1a. **<Sub-question>**
    - ...

(Continue with 4-8 sections as the topic demands.)

## Desired Output

What the research should produce — the SHAPE of the answers, not answers themselves.
- Recommendations on approach X vs Y
- Architecture diagram for Z
- Performance analysis at scale
- Trade-off matrix
- Phased roadmap
```

### Step 4: Present and Suggest Next Step

Show the user the file path and a summary of the question areas covered.

Suggest: "Run the `deep-research` skill with this question set to get answers, or refine the questions first."

## Rules

1. **Questions only.** Never include answers, findings, or recommendations. If you know something about the topic, formulate it as a question — don't state it as fact.
2. **Be specific, not vague.** Bad: "How does performance work?" Good: "At 10,000 records with full-text search, what are the real bottlenecks — query compilation, index size, or I/O?"
3. **Ground in context.** Reference the project's actual code, tools, and existing systems. The prompt should feel project-aware, not generic.
4. **Hierarchical questions.** Major sections for broad topic areas. Lettered sub-questions for specific angles. Sub-bullets for follow-ups.
5. **Include "how do others do it" questions.** For every major topic, ask how production systems or industry leaders approach the same problem.
6. **Scale questions.** Always include questions about how the approach scales.
7. **Build-or-borrow questions.** If existing tools could solve part of the problem, ask about them explicitly.
8. **No filler.** Every question should require real investigation to answer. Skip anything answerable with 5 seconds of thought.
