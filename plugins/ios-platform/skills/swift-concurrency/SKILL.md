---
name: swift-concurrency
description: Use when writing or reviewing async/await, actors, Sendable, task cancellation, isolation, or Swift concurrency migrations.
---

# Swift Concurrency

Review and write Swift concurrency code for correctness, modern API usage, and adherence to data-race safety. Report only genuine problems -- do not nitpick or invent issues.

## Responsibility

**Owns:** Actor isolation, Sendable compliance, async/await patterns, structured concurrency, AsyncStream/AsyncSequence, continuations, Task lifecycle, cancellation, GCD-to-concurrency migration, Swift 6.2 concurrency features, concurrency-related compiler diagnostics, Synchronization framework (Mutex, Atomic).

**Does NOT own:** SwiftUI view architecture, networking layer design, general Swift language features, third-party framework APIs, Metal/GPU concurrency.

## Core Principles

1. **Actor-first** -- Use actors as the default for shared mutable state. Prefer actor isolation over manual locking. Use `Mutex<T>` (Synchronization framework) only when synchronous access is required or actor overhead is measurable.
2. **Structured concurrency preferred** -- Use task groups and `async let` over `Task {}` wherever possible. Structured tasks propagate cancellation and collect errors automatically.
3. **`@unchecked Sendable` is a code smell** -- It silences diagnostics without fixing races. Prefer actors, value types, `sending` parameters, or `Mutex<T>` (which is unconditionally Sendable). The only legitimate use of `@unchecked Sendable` is types with internal locking that are provably thread-safe.
4. **Cancellation must propagate** -- Every long-running or looping async operation must check for cancellation. Store task handles and cancel on teardown.
5. **Bridge at boundaries** -- Use `withCheckedThrowingContinuation` for callback APIs, `AsyncStream` for delegate/multi-value APIs. Resume continuations exactly once on every code path.
6. **Smallest safe fix** -- When fixing concurrency errors, prefer edits that preserve existing behavior while satisfying data-race safety. Do not over-annotate.
7. **Swift 6.2 defaults matter** -- Check whether the module uses default main-actor isolation or approachable concurrency mode before diagnosing. A missing `@MainActor` may be implicit.
8. **No force unwraps after `await`** -- Actor state may have changed during suspension. A `!` after `await` inside an actor is a latent crash.
9. **Reference-first for Swift 6.2 APIs.** Approachable concurrency, `@concurrent`, isolated conformances, and default actor isolation may post-date training data. Always consult the reference files before writing or reviewing Swift 6.2 concurrency code -- never rely on model knowledge alone.

## Review Process

1. Scan for known-dangerous patterns using `references/actors-and-isolation.md` and `references/sendable-and-data-safety.md` to prioritize what to inspect.
2. Check for Swift 6.2 concurrency behavior (default actor isolation, `@concurrent`, caller-actor async, isolated conformances).
3. Validate actor usage for reentrancy and isolation correctness using `references/actors-and-isolation.md`.
4. Ensure structured concurrency is preferred over unstructured where appropriate using `references/structured-concurrency.md`.
5. Verify cancellation is handled correctly in tasks and loops.
6. Validate async stream and continuation usage using `references/async-streams-and-continuations.md`.
7. Check for retain cycles, leaked tasks, and missing weak self using `references/memory-management.md`.
8. Validate AsyncAlgorithms operator usage (if present) using `references/async-algorithms.md`.
9. Check bridging code between sync and async worlds.
10. Validate Synchronization framework usage (Mutex, Atomic) using `references/synchronization-framework.md`.
11. Review any legacy concurrency migrations using `references/migration-patterns.md`.
12. If the project has strict-concurrency errors, map diagnostics to fixes using `references/compiler-diagnostics.md`.
13. If reviewing tests, check async test patterns using `references/testing-concurrency.md`.

If doing a partial review, load only the relevant reference files.

## Core Instructions

- Target Swift 6.2 or later with strict concurrency checking.
- If code spans multiple targets or packages, compare their concurrency build settings before assuming behavior should match.
- Prefer structured concurrency (task groups, `async let`) over unstructured (`Task {}`).
- Prefer Swift concurrency over Grand Central Dispatch for new code. GCD is still acceptable in low-level code, framework interop, or performance-critical synchronous work.
- If an API offers both `async`/`await` and closure-based variants, always prefer `async`/`await`.
- Do not introduce third-party concurrency frameworks without asking first.
- Do not suggest `@unchecked Sendable` to fix compiler errors. Prefer actors, value types, or `sending` parameters instead.

## Output Format

Organize findings by file. For each issue:

1. State the file and relevant line(s).
2. Name the rule being violated.
3. Show a brief before/after code fix.

Skip files with no issues. End with a prioritized summary of the most impactful changes.

Example:

### DataLoader.swift

**Line 18: Actor reentrancy -- state may have changed across the `await`.**

```swift
// Before
actor Cache {
    var items: [String: Data] = [:]
    func fetch(_ key: String) async throws -> Data {
        if items[key] == nil {
            items[key] = try await download(key)
        }
        return items[key]!
    }
}

// After
actor Cache {
    var items: [String: Data] = [:]
    func fetch(_ key: String) async throws -> Data {
        if let existing = items[key] { return existing }
        let data = try await download(key)
        items[key] = data
        return data
    }
}
```

### Summary

1. **Correctness (high):** Actor reentrancy bug on line 18 may cause duplicate downloads and a force-unwrap crash.
2. **Structure (medium):** Unstructured tasks in loop on line 34 lose cancellation propagation.

## Quick Reference

### Actor vs @MainActor Decision

| Scenario | Use |
|----------|-----|
| Shared mutable state, background service | `actor` |
| ViewModel with UI-bound state | `@MainActor` class |
| Pure data model | `struct: Sendable` |
| Simple value protection (sync API) | `Mutex<State>` (Synchronization framework, iOS 18+) |
| High-frequency primitive ops (counter, flag) | `Atomic<T>` (Synchronization framework, iOS 18+) |
| Wrapping non-Sendable state as Sendable | `Mutex<T>` |
| Legacy interop, pre-iOS 18 | `OSAllocatedUnfairLock` |

### Sendable Compliance

| Type | Sendable? |
|------|-----------|
| Struct with all Sendable properties | Yes -- declare conformance |
| Enum with Sendable associated values | Yes -- declare conformance |
| Final class with only `let` Sendable properties | Yes -- declare conformance |
| Class with internal locking | `@unchecked Sendable` (verify safety) |
| Class with mutable `var` and no sync | No -- use actor or restructure |

### Concurrency Keywords (Swift 6.2)

| Keyword | Purpose |
|---------|---------|
| `@concurrent` | Offload async function to concurrent pool |
| `nonisolated` | Opt out of actor isolation |
| `nonisolated(nonsending)` | Stay on caller's executor (explicit) |
| `isolated deinit` | Run deinit on the class's actor |
| `sending` | Transfer ownership across isolation boundary |
| `Task.immediate` | Start task synchronously on current executor |

## References

- `references/actors-and-isolation.md` -- Actor isolation, reentrancy, @MainActor, global actor inference, nonisolated, global/static state protection, isolated deinit.
- `references/structured-concurrency.md` -- Task groups, async let, structured vs unstructured, Task {} dangers, concurrency limits.
- `references/async-streams-and-continuations.md` -- AsyncStream lifecycle, continuation management, checked vs unsafe continuations, bridging patterns.
- `references/async-algorithms.md` -- AsyncAlgorithms operators: debounce, throttle, merge, combineLatest, zip, chain, removeDuplicates, chunks, AsyncChannel, Combine migration mapping.
- `references/memory-management.md` -- Retain cycles in tasks, weak self patterns, async sequence retention, task handle lifecycle, diagnostic checklist.
- `references/sendable-and-data-safety.md` -- Sendable conformance, value types, @unchecked Sendable dangers, transfer patterns.
- `references/migration-patterns.md` -- GCD to async/await, completion handlers to async, DispatchQueue to actor, Swift 6 migration process, project settings, tooling.
- `references/compiler-diagnostics.md` -- Swift 6.2 compiler error to remedy mapping, common error messages and fixes, approachable concurrency mode.
- `references/testing-concurrency.md` -- Race detection, confirmation for async, @MainActor in tests, Swift Testing patterns.
- `references/synchronization-framework.md` -- Synchronization framework: Mutex, Atomic, memory orderings, when to use vs actors, anti-patterns, iOS 18+.
- `references/linting-and-suppression.md` -- SwiftLint concurrency rules, compiler warning fix order, suppression strategies, @preconcurrency, documentation requirements.
