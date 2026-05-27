<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and adjust principles to match your product's domain and requirements. -->

# Product Principles

## Purpose

Non-negotiable product principles that govern [YourApp] feature design and implementation decisions. Specs, plans, and implementations are checked against these principles.

This is a gate document — if a proposed feature or approach conflicts with a principle, it must be flagged and resolved before proceeding.

## Principles

### 1. Offline-First

Core functionality must work without a network connection. Core features such as local data access, user entries, and primary UI must never depend on network availability. Cloud sync, if added later, is additive — not required.

### 2. Migration Safety

User data is never lost. Schema changes require versioned migrations. Destructive fallbacks are prohibited outside `DEBUG` builds. Every persistence change is a product change that demands the same rigour as a feature.

**Canonical policy:** `Documentation/system/persistence-policy.md`

### 3. Spec-First

Behaviour is defined in a specification before code is written. The spec is the source of truth for what the feature does and why. Implementation without an approved spec is not permitted for feature work. If a spec and code disagree, one of them is wrong — resolve the conflict, do not ignore it.

### 4. Test-First

Tests are written before implementation code. Acceptance criteria from the spec are converted to failing tests, then implementation makes them pass. Code that is not tested is not verified.

### 5. iOS 26.1 Only

[YourApp] targets iOS 26.1 exclusively. No `@available` checks, no backwards compatibility, no multi-platform targets. This simplifies every decision — use the latest APIs directly.

### 6. Surgical Changes

Prefer the minimum change that achieves the goal. Do not refactor unrelated code, add speculative abstractions, or build for hypothetical future requirements. Three similar lines of code are better than a premature abstraction.

### 7. Authored, Not Generated

Code and UI should look intentionally designed, not AI-generated. This means semantic spacing hierarchies (not uniform padding), domain-specific naming (not generic "data"/"manager"/"handler"), OKLCH colour palette (not hex literals), and interaction states for every user-facing surface.

**Canonical guidelines:** `Documentation/system/swiftui-design-quality.md`

### 8. Single Source of Truth

Every piece of project knowledge has exactly one canonical location. Specs live in `Documentation/specifications/`. Architecture rules live in `Documentation/system/`. Scope and progress live in `Documentation/current-scope.md` and `Documentation/todo/current-todo.md`. Do not duplicate authoritative information across documents.

## How This Document Is Used

- `/implement` checks the plan against these principles before building
- `/clarify` references principles when evaluating spec completeness
- `/analyze` checks specs for principle violations
- `/review` flags code that contradicts principles

## Versioning

| Version | Date | Change |
|---|---|---|
| 1.0 | 22 March 2026 | Initial principles extracted from project documentation |

## Rule

This document states principles, not implementation details. If a principle needs elaboration, link to the canonical system document — do not expand this file into an architecture guide.
