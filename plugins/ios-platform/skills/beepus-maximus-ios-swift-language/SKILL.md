---
name: swift-language
description: Reviews and writes code using Swift language features and standard library types — ownership modifiers (borrowing, consuming, inout), noncopyable types (~Copyable), InlineArray, Span, value generics, typed throws. Use when working with Swift 6.2+ language features or performance-critical standard library types.
---

# Swift Language

Review and write code using modern Swift language features and standard library types for correctness and performance.

## Responsibility

**Owns:** Ownership modifiers (borrowing, consuming, inout, consume operator), noncopyable types (~Copyable), InlineArray, Span family (Span, MutableSpan, RawSpan, MutableRawSpan, OutputSpan, UTF8Span), value generics, typed throws, Result builders, property wrappers, macros, Codable protocol patterns (synthesis, CodingKeys, manual implementation, date strategies, error handling), Swift standard library evolution.

**Does NOT own:** Swift concurrency (swift-concurrency skill), Synchronization framework — Mutex/Atomic (swift-concurrency skill), SwiftUI, persistence, networking, Apple framework-specific APIs.

## Core Principles

1. **Let the compiler choose ownership by default.** Only add `borrowing`, `consuming`, or `inout` when profiling shows a benefit or when working with `~Copyable` types (where it's required). Note: `Mutex` and `Atomic` from the Synchronization framework rely on these ownership mechanics internally — see `swift-concurrency` skill's `references/synchronization-framework.md` for usage guidance.
2. **InlineArray for fixed-size, heap-free collections.** Only when the size is known at compile time and the collection is never resized. For everything else, use Array.
3. **Span for safe contiguous memory access.** Replace UnsafeBufferPointer with Span when possible. Let the compiler enforce lifetime safety.
4. **Respect non-escapability.** Spans cannot escape their scope, be captured in closures, or outlive their source. This is a feature, not a limitation.
5. **Value generics enable type-level constants.** `InlineArray<let count: Int, Element>` makes size part of the type — mismatched sizes are compile errors.
6. **Prefer Array unless profiling proves otherwise.** InlineArray, Span, and ownership modifiers are optimisation tools. Don't reach for them prematurely.
7. **Reference-first for Swift 6.2 types.** These features may post-date training data. Always consult reference docs before writing or reviewing code — never rely on model knowledge alone.

## Decision Tree

```
Which Swift language feature?
├─ Codable conformance, JSON encoding/decoding, CodingKeys?
│  └─ → references/codable-patterns.md
├─ Working with ~Copyable type?
│  └─ Required: borrowing/consuming on all methods → references/ownership-modifiers.md
├─ Fixed-size collection, no heap allocation?
│  └─ InlineArray<let count, Element> → references/inline-array-and-span.md
├─ Safe pointer-like access to contiguous memory?
│  ├─ Read-only elements → Span<Element>
│  ├─ Mutable elements → MutableSpan<Element>
│  └─ Raw bytes → RawSpan / MutableRawSpan
│  └─ → references/inline-array-and-span.md
├─ Large value type passed frequently + visible in profiler?
│  ├─ Read-only → borrowing
│  └─ Final use → consuming
│  └─ → references/ownership-modifiers.md
├─ ARC traffic visible in profiler?
│  └─ borrowing for read-only ref types → references/ownership-modifiers.md
└─ Otherwise → Let compiler choose (no annotation needed)
```

## Review Process

1. Check Codable conformance patterns → `references/codable-patterns.md`
2. Check ownership modifier usage → `references/ownership-modifiers.md`
3. Check InlineArray and Span usage → `references/inline-array-and-span.md`
4. Verify Span lifetime safety (no escaping, no post-mutation access)
5. Verify InlineArray is appropriate (truly fixed-size, not frequently copied)
6. Verify ownership modifiers aren't applied to small/trivial types

## References

- `references/codable-patterns.md` — Codable synthesis, CodingKeys, date strategies, error handling, anti-patterns
- `references/ownership-modifiers.md` — borrowing, consuming, inout, ~Copyable types, limitations
- `references/inline-array-and-span.md` — InlineArray, Span family, memory layout, safety constraints
