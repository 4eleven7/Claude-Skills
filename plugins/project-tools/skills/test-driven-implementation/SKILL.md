---
name: test-driven-implementation
description: Use when implementing specs with significant business logic, persistence, complex rules, or high-risk behaviour where independent behavioural tests should drive the implementation.
---

# Test-Driven Implementation

## Purpose

Implement approved specifications with independent plan review and independent behavioural test authoring before production code is written.

This is not the default implementation path. Use `implement` for ordinary spec-driven work. Use this skill when same-agent tests are likely to mirror the planned implementation instead of testing the requirement.

## Routing

Use this skill when the work includes any of:

- significant business rules or domain logic;
- persistence, schema, migration, or data integrity behaviour;
- complex acceptance criteria with meaningful edge cases;
- high-risk user, security, privacy, money, or data-loss behaviour;
- a bug fix where regression-test quality matters;
- a user request for strict TDD, red-green, independent tests, or test-first implementation.

Use `implement` instead for straightforward features, UI-heavy work with limited logic, or small changes where the independent-agent overhead is not justified.

Use `multi-agent-implementation` for parallel execution of mostly independent implementation tasks. That skill is about task concurrency, not independent test authorship.

## Workflow

1. Read `references/full-guidance.md` before acting.
2. Discover the project's spec, testing, build, lint, and documentation conventions before creating tests.
3. Apply the independent-test workflow only to the current approved scope.
4. Verify red, green, build, lint, and spec compliance before reporting completion.

## References

- `references/full-guidance.md` - complete workflow, prompts, fallback path, and anti-rationalization rules.
