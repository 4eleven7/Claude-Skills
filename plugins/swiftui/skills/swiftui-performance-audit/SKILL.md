---
name: swiftui-performance-audit
description: Use when diagnosing SwiftUI jank, slow rendering, high CPU/memory, identity churn, layout thrash, or update storms.
---

# SwiftUI Performance Audit

Diagnose SwiftUI performance from code first, then ask for runtime profiling evidence when code review cannot explain the symptom.

## Responsibility

**Owns:** SwiftUI invalidation, identity, body cost, layout cost, image rendering, broad observation, update storms, and profiling guidance.

**Does NOT own:** General app hangs outside SwiftUI, networking performance, persistence query design beyond UI-facing fetch cost, or speculative optimization without symptoms.

## Intake

Collect the smallest useful packet:

1. Target view or feature.
2. Symptom: slow render, janky scroll, high CPU, memory growth, hang, or excessive updates.
3. Reproduction steps.
4. Device/simulator, OS version, Debug/Release, and data volume.
5. Any profiling evidence: Instruments trace, screenshots, logs, or before/after metrics.

If code is available, start with code review. If not, ask for the target view and data-flow slice.

## Code-First Review

Check these first:

1. **Broad observation:** list rows or child views read a large `@Observable`, environment model, or store when they only need a few values.
2. **Unstable identity:** `ForEach` over indices, `id: \.self` for mutable values, or `UUID()` allocated during rendering.
3. **Heavy body work:** sorting, filtering, grouping, date/number formatter creation, image decoding, I/O, or allocation in `body`.
4. **Layout thrash:** nested `GeometryReader`, preference-key feedback loops, deep layout hierarchies, or frequent geometry state writes.
5. **Image cost:** large images rendered without downsampling or decoded on the main thread.
6. **Animation cost:** broad animations or transitions applied to large subtrees.
7. **Excess state writes:** `onChange`, scroll handlers, timers, or publishers assigning equivalent values repeatedly.

Use `swiftui-patterns/references/performance.md` for detailed examples and remediation patterns.

## Profiling Guidance

Ask for runtime evidence when:

- Code review finds several plausible causes but no clear winner.
- The issue only appears on device, with real data, or in Release.
- The user asks for proof instead of code-level suspicion.

Prefer:

- Instruments SwiftUI template for body/update cost and invalidation.
- Time Profiler for CPU-heavy work.
- Allocations/Memory Graph for memory growth.
- Hangs diagnostics when the UI becomes unresponsive.

Tell the user to profile the same interaction before and after fixes. Without comparable captures, do not claim performance improved.

## Remediation Priority

1. Narrow dependencies and observation fan-out.
2. Stabilize identity.
3. Move heavy work out of `body`.
4. Downsample or cache image work outside the render path.
5. Simplify layout and geometry feedback.
6. Reduce redundant state writes.
7. Use `equatable()` only when equality is cheaper than recomputing the subtree and inputs are truly value-semantic.

## Output Shape

```markdown
## Performance Audit
| Issue | Evidence | Impact | Fix |

## Likely Root Cause
[Most likely cause and why]

## Validation
[How to prove the fix worked]

## Confidence
[High / Medium / Low] - [code-backed, trace-backed, or assumption-backed]
```

## Rules

- Do not optimize code with no symptom, hot path, or evidence.
- Do not treat simulator performance as representative of device performance.
- Do not cache derived state in `@State` without explicit invalidation logic.
- Do not add `EquatableView` or `.equatable()` before fixing broad observation and unstable identity.
- Report uncertainty directly when profiling evidence is missing.
