# Agent Harness Audit

Convert agent friction into repo-local context, tools, guardrails, and verification loops. The goal is not more instructions. The goal is making the next agent able to see the system, act on it, and prove the outcome without human narration.

This is a harness skill, not a debugging skill. If there is an actual bug to fix, use this skill only to expose the missing evidence path, then run `hypothesis-debug` with that evidence.

## Responsibility

**Owns:** Diagnosing missing agent capabilities and routing fixes to docs, skills, scripts, tests, lints, UI automation, logs, traces, metrics, or observability.

**Does NOT own:** Debugging or fixing the underlying product bug, replacing product judgment, changing architecture without approval, building broad observability platforms by default, or adding prose when mechanical enforcement is available.

## When to Use

Use this skill when any of these happen:

- An agent keeps rediscovering the same context.
- A bug cannot be reproduced by the agent.
- A fix cannot be verified without the user saying what happened.
- The agent needs logs, screenshots, stack traces, timing, metrics, or field diagnostics but has no path to collect them.
- A rule lives only in a chat thread, memory, stale docs, or a human's head.
- Review comments repeatedly correct the same taste, architecture, naming, reliability, or validation issue.
- A workflow requires copy-pasting external state into the agent.

Do not use this skill just because the bug is on iOS. For normal iOS debugging, use `ios-debugging`, `ios-tooling`, `hang-diagnostics`, and `hypothesis-debug`. Use this skill when the debugging loop itself is blocked because the agent cannot see, reproduce, measure, or verify the behaviour.

## Core Pattern

For each failure, ask:

1. **What was invisible?** Code path, UI state, logs, metric, trace, product rule, dependency, environment, or field behaviour.
2. **What should expose it?** Repo doc, skill, script, test, lint, UI automation, debugger workflow, log capture, signpost, trace, MetricKit payload, or dashboard/export.
3. **Can it be enforced mechanically?** Prefer tests, lints, schema checks, structural checks, scripts, and CI over prose.
4. **Can the next agent verify it?** Require a command, trace, screenshot, log query, test, performance metric, or explicit blocker.
5. **Where should the durable fix live?** Put the smallest useful artifact in the right layer.

## Routing Matrix

| Failure | Better Harness Fix |
|---|---|
| Agent missed project rule | Short `AGENTS.md` pointer plus canonical repo doc |
| Agent followed stale docs | `project-state-audit` or `spec-workflow`; add freshness/cross-link checks if recurring |
| Agent violated architecture | Structural test, dependency lint, or explicit boundary check |
| Agent guessed data shape | Boundary parser/schema validation test |
| Agent cannot reproduce UI bug | UI automation path with snapshot/screenshot verification |
| Agent cannot inspect runtime state | LLDB workflow, breakpoint recipe, or targeted debug command |
| Agent cannot see logs | Structured logging plus capture command |
| Agent cannot prove timing | Signpost, performance test, or `xctrace` profile |
| Agent cannot diagnose field issue | MetricKit/Organizer ingestion path |
| Agent repeats bad style/taste | Skill update if judgment-based; lint if mechanically detectable |
| Agent performs manual checklist badly | Script or CI job with clear remediation output |

## iOS Harness Signals

Expose only the signals needed for the failure. Heavy profiling is wrong for a simple state bug.

| Signal | Expose | Use When |
|---|---|---|
| App logs | `OSLog` / `Logger`, stdout/stderr, simulator log capture | State transitions, errors, reproduction evidence |
| UI state | Accessibility hierarchy snapshots, screenshots, screen recordings | Visual or navigation bugs, before/after proof |
| Debugger | LLDB attach, breakpoints, stack traces, variables, watchpoints | Runtime state is ambiguous or print-debugging would be slow |
| Timing | `os_signpost`, `XCTOSSignpostMetric`, launch/build timing | Slow paths, performance regressions, acceptance thresholds |
| Profiling traces | `xctrace` Time Profiler, System Trace, App Launch, Swift Concurrency, Animation Hitches | CPU hotspots, blocked threads, launch cost, actor contention, frame hitches |
| Memory | Memory Graph, Allocations, Leaks, VM Tracker, `leaks`, MetricKit memory metrics | Retain cycles, heap growth, jetsam risk |
| Field diagnostics | MetricKit, Xcode Organizer exports | Real-user crashes, hangs, launch issues, disk writes, energy, memory |
| Runtime diagnostics | Sanitizers, malloc environment variables, SwiftUI `_printChanges()` | Races, unsafe memory, redraw causes, allocation stacks |

Use existing iOS skills instead of duplicating their workflows:

- `ios-tooling` for build/run/test, simulator logs, UI automation, LLDB attach, and `xctrace`.
- `ios-debugging` for LLDB, sanitizers, SwiftUI `_printChanges()`, memory graph, leaks, and Jetsam.
- `hang-diagnostics` for hangs, System Trace, Time Profiler, MetricKit hang diagnostics, and watchdog terminations.
- `swiftui-performance-audit` or SwiftUI-specific skills for redraw, layout, and interaction performance.

## iOS Decision Tree

```
What was the agent unable to prove?
|
+-- What happened in the app?
|   +-- Add/use structured logs and simulator log capture.
|
+-- What is on screen?
|   +-- Add/use UI snapshot, screenshot, or screen recording verification.
|
+-- Why is this runtime state wrong?
|   +-- Use LLDB breakpoints, stack traces, variables, and watchpoints.
|
+-- How long did it take?
|   +-- Add/use os_signpost, XCT performance metrics, or xctrace.
|
+-- Why is it slow or hung?
|   +-- Time Profiler for busy CPU; System Trace for blocked threads.
|
+-- Why does animation stutter?
|   +-- Animation Hitches trace, then inspect frame lifetime, commits, renders, GPU.
|
+-- Why is memory growing?
|   +-- Memory Graph first; Allocations/Leaks/VM Tracker if growth persists.
|
+-- Does it only happen in the field?
    +-- MetricKit or Organizer export; route stack/metric payloads into repo-visible reports.
```

## Workflow

### 1. Capture the Failure

Write one sentence:

```markdown
Agent failed because it could not [see/reproduce/verify/enforce] [specific thing].
```

Do not generalize. "Needs better observability" is useless. "Cannot verify whether onboarding first frame renders under 800 ms" is actionable.

### 2. Pick the Smallest Harness Fix

Choose one primary fix:

- **Knowledge fix:** `AGENTS.md` pointer, canonical doc, spec, reference, lesson, or skill update.
- **Executable fix:** script, test, lint, schema validation, structural dependency check, CI job.
- **Runtime visibility fix:** logs, debugger recipe, UI automation, screenshot/video capture.
- **Performance fix:** signpost, XCTest metric, `xctrace` profile, MetricKit/Organizer ingestion.
- **Cleanup fix:** recurring docs audit, skill audit, quality grade, dead-code scan, or improvement backlog item.

If the fix would introduce a new architecture, production telemetry pipeline, or cross-project pattern, stop and ask for approval.

### 3. Prefer Enforcement Over Instructions

Use this order:

1. Test, lint, schema, structural rule, or script.
2. Tool workflow with clear command and expected output.
3. Skill update with failure shields.
4. Repo doc.
5. `AGENTS.md` pointer to the doc.

Do not stuff detailed rules into `AGENTS.md`. It should be a map, not a manual.

### 4. Define Agent-Visible Verification

Every harness fix needs proof:

| Fix Type | Verification |
|---|---|
| Doc/spec update | Cross-link exists; stale/conflicting doc removed or marked |
| Skill update | Pressure scenario now routes to correct behaviour |
| Script/lint/test | Command fails on known-bad case and passes on fixed case |
| UI automation | Snapshot/screenshot/video proves the target state |
| Logs | Captured output includes the event and correlation fields |
| Signpost/timing | Metric has threshold and before/after evidence |
| Trace/profile | Trace covers the workload and identifies app frames |
| MetricKit/Organizer | Payload/export is reachable to the agent and tied to version/build |

### 5. Route Durable Learnings

Use one destination:

| Destination | Use For |
|---|---|
| Existing skill | Reusable workflow, tool usage, or rationalization blocker |
| Project doc/spec | Product rules, architecture, contracts, source of truth |
| Test/lint/script | Mechanically checkable invariant |
| Improvement backlog | Useful but out-of-scope harness work |
| Memory/lesson | Non-obvious user correction or tool gotcha not derivable from repo |

### 6. Continue With The Owning Workflow

After the harness gap is closed or a usable evidence path exists, hand off to the skill that owns the actual work:

| Situation | Next Skill |
|---|---|
| Bug, failing test, crash, regression, or unexpected behaviour needs fixing | `hypothesis-debug` |
| Read-only causal investigation is still needed | `deep-investigate` |
| iOS runtime inspection is needed during debugging | `ios-debugging` as supporting context |
| iOS build/run/log/profile tools are needed | `ios-tooling` as supporting context |
| Hang, watchdog, or responsiveness issue | `hang-diagnostics` as supporting context, then `hypothesis-debug` for the fix |
| Spec/docs drift caused the failure | `spec-workflow` or `project-state-audit` |
| Mechanical guardrail needs implementation | `small-change` or `implement`, depending on scope |

For bugs, the default sequence is:

```markdown
1. Use `agent-harness-audit` to expose the missing signal or verification path.
2. Run `hypothesis-debug` using that signal as reproduction/evidence.
3. If `hypothesis-debug` finds another missing signal, return to `agent-harness-audit` for that specific gap.
```

## Output Shape

```markdown
## Harness Gap
[One sentence naming what was invisible or unenforceable.]

## Fix
[Smallest harness change and where it belongs.]

## iOS Signals
[Logs/UI/LLDB/signpost/xctrace/MetricKit/etc. used or explicitly not needed.]

## Verification
[How the next agent proves the fix.]

## Next Skill
[`hypothesis-debug`, `deep-investigate`, `ios-tooling`, etc. and why.]

## Residual Risk
[Blocked unknowns, scope expansion, or field-only limits.]
```

## Failure Shields

- Do not propose "add observability" without naming the exact signal, owner, and verification command.
- Do not add a skill when a lint, test, or script can enforce the rule.
- Do not add production MetricKit or analytics plumbing for a local-only bug unless field data is required.
- Do not require `xctrace` for correctness bugs that logs, UI snapshots, or LLDB can prove faster.
- Do not keep debugging inside this skill. Once the agent can reproduce or inspect the bug, switch to `hypothesis-debug`.
- Do not treat screenshots as proof of data correctness. Use logs, state inspection, or tests for data.
- Do not treat simulator performance as device truth. Use physical device traces for device-sensitive timing, memory, energy, animation, camera, graphics, and thermal issues.
- Do not use private or temporary diagnostics such as SwiftUI `_printChanges()` in shipping code.
- Do not leave a harness artifact unowned. Every doc, script, lint, or telemetry path needs a clear maintenance location.

## Example

Failure:

```markdown
Agent failed because it could not verify whether tapping "Save" persisted the edited profile or only updated the screen.
```

Fix:

- Add a UI automation path that edits the field, taps Save, relaunches, and snapshots the persisted value.
- Add structured logs around the save boundary with profile ID and result.
- Add a targeted persistence test if the bug was in model/storage logic.

Verification:

- UI snapshot after relaunch shows the saved value.
- Log capture includes `profile.save.succeeded`.
- Persistence test fails on the known-bad path and passes after the fix.
