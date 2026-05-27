---
name: ios-tooling
description: Build, run, test, debug, profile, and release iOS/macOS apps using XcodeBuildMCP tools, xctrace profiling, Apple docs CLI, changelog generation, and macOS SwiftPM packaging. Use when performing any build-run-debug loop, simulator/device management, performance profiling, documentation lookup, or release workflow.
---

# iOS Tooling

Consolidated skill for the full iOS/macOS development toolchain: build, run, test, debug, profile, and release.

## Responsibility

**Owns:**

- Build, run, test, and debug workflows (simulator, device, macOS)
- XcodeBuildMCP tool orchestration and session management
- Simulator and device lifecycle (boot, install, launch, erase, configure)
- LLDB debugging via MCP (attach, breakpoints, stack, variables)
- UI automation (tap, swipe, type, screenshot, snapshot hierarchy)
- xctrace Time Profiler recording and CLI-only analysis
- Apple documentation lookup via xcdocs CLI
- App Store changelog generation from git history
- macOS SwiftPM app packaging, signing, and notarisation
- Build validation commands, linting, and zero-warning enforcement

**Does NOT own:**

- What to build (feature design, product decisions)
- How to write views, models, or test assertions
- Design system rules or UI style guidelines
- Architecture patterns (see ios-architecture skill)

## Core Principles

1. **Tools serve workflows** -- use XcodeBuildMCP tools instead of raw `xcodebuild`/`simctl` unless a tool gap exists.
2. **CLI-first** -- every action (build, profile, docs lookup, packaging) must work without opening Xcode or Instruments.
3. **Automate the build-run-debug loop** -- set session defaults once, then iterate with build_run_sim, snapshot_ui, and log capture.
4. **Profile before optimising** -- record with xctrace, symbolicate, rank hotspots, then act on data.
5. **Zero-warning policy** -- fix warnings immediately; never commit code with warnings.

## Workflow Quick Reference

| Task | Tool / Command |
|---|---|
| Discover projects and schemes | `discover_projs`, `list_schemes` |
| Set session context | `session_set_defaults` (project, scheme, simulator) |
| Build + run on simulator | `build_run_sim` |
| Run unit tests | `test_sim` or `test_device` |
| Inspect UI hierarchy | `snapshot_ui` then `tap` / `swipe` / `type_text` |
| Capture logs | `start_sim_log_cap` / `stop_sim_log_cap` |
| Attach debugger | `debug_attach_sim`, set breakpoints, inspect variables |
| Record Time Profiler | `xcrun xctrace record --template 'Time Profiler'` |
| Look up Apple API docs | `xcdocs search --json --omit-content`, then `xcdocs get --json` |
| Generate App Store changelog | collect release changes from git history, triage, draft bullets |
| Package macOS SwiftPM app | the project packaging/signing scripts, if present |
| Full build validation | the project full build validation command, if present |
| Lint | the project formatter/lint command, if present |

## References

- [references/xcode-mcp-tools.md](references/xcode-mcp-tools.md) -- Complete XcodeBuildMCP tool reference (40+ tools by category)
- [references/debug-agent-workflow.md](references/debug-agent-workflow.md) -- Step-by-step build, run, interact, and log capture recipe
- [references/ui-automation-workflow.md](references/ui-automation-workflow.md) -- UI automation execution model, targeting, tool parameters, verification, gesture presets, keycodes
- [references/profiling.md](references/profiling.md) -- xctrace CLI recording, ASLR-aware symbolication, helper scripts
- [references/apple-docs-cli.md](references/apple-docs-cli.md) -- xcdocs search and get commands, JSON shapes, recommended flow
- [references/release-workflows.md](references/release-workflows.md) -- App Store changelog and macOS SwiftPM packaging/signing/notarisation
- [references/build-performance.md](references/build-performance.md) -- Build Timeline, type-checking warnings, compilation caching, explicitly built modules, compilation mode
- [references/build-validation.md](references/build-validation.md) -- Canonical build/test/lint commands, when-to-run-what matrix
