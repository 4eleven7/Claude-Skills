---
name: ios-tooling
description: Use when building, running, testing, profiling, debugging, documenting, or releasing iOS/macOS apps with command-line tooling.
---

# iOS Tooling

Consolidated skill for the full iOS/macOS development toolchain: build, run, test, debug, profile, and release.

## Responsibility

**Owns:**

- Build, run, test, and debug workflows (simulator, device, macOS)
- Xcode security build-setting audits and hardening workflows
- XcodeBuildMCP tool orchestration and session management
- Simulator and device lifecycle (boot, install, launch, erase, configure)
- LLDB debugging via MCP (attach, breakpoints, stack, variables)
- UI automation (tap, swipe, type, screenshot, snapshot hierarchy)
- xctrace Time Profiler recording and CLI-only analysis
- Apple documentation lookup via xcdocs CLI
- App Store change-summary generation from git history
- macOS SwiftPM app packaging, signing, and notarisation
- Build validation commands, linting, and zero-warning enforcement

**Does NOT own:**

- What to build (feature design, product decisions)
- How to write views, models, or test assertions
- Design system rules or UI style guidelines
- Architecture patterns (see ios-architecture skill)

## Core Principles

1. **Apple Xcode security guidance wins.** For Xcode security settings, Enhanced Security, analyzer checks, C/C++ hardening flags, pointer authentication, memory tagging, runtime restrictions, and build-setting interpretation, read `references/apple-xcode-security-settings/` first.
1. **Tools serve workflows** -- use XcodeBuildMCP tools instead of raw `xcodebuild`/`simctl` unless a tool gap exists.
2. **CLI-first** -- every action (build, profile, docs lookup, packaging) must work without opening Xcode or Instruments.
3. **Automate the build-run-debug loop** -- set session defaults once, then iterate with build_run_sim, snapshot_ui, and log capture.
4. **Verify UI-affecting work on a device or simulator.** After UI changes, build and run, capture screenshot plus hierarchy, then perform the relevant tap/swipe/type flow. Code that compiles but cannot be interacted with is not done.
5. **Profile before optimising** -- record with xctrace, symbolicate, rank hotspots, then act on data.
6. **Zero-warning policy** -- fix warnings immediately; never commit code with warnings.

## Workflow Quick Reference

| Task | Tool / Command |
|---|---|
| Discover projects and schemes | `discover_projs`, `list_schemes` |
| Set session context | `session_set_defaults` (project, scheme, simulator) |
| Build + run on simulator | `build_run_sim` |
| Run unit tests | `test_sim` or `test_device` |
| Inspect UI hierarchy | `snapshot_ui` then `tap` / `swipe` / `type_text` |
| Verify UI changes | build/run, screenshot, hierarchy snapshot, touch interaction, issue report |
| Audit Xcode security settings | `references/apple-xcode-security-settings/`, then build-setting inspection and validation |
| Capture logs | `start_sim_log_cap` / `stop_sim_log_cap` |
| Attach debugger | `debug_attach_sim`, set breakpoints, inspect variables |
| Record Time Profiler | `xcrun xctrace record --template 'Time Profiler'` |
| Look up Apple API docs | `xcdocs search --json --omit-content`, then `xcdocs get --json` |
| Generate App Store change-summary | collect release changes from git history, triage, draft bullets |
| Package macOS SwiftPM app | the project packaging/signing scripts, if present |
| Full build validation | the project full build validation command, if present |
| Lint | the project formatter/lint command, if present |

## References

- [references/apple-xcode-security-settings/](references/apple-xcode-security-settings/) -- Apple-authoritative Xcode security settings, Enhanced Security, compiler/static-analyzer hardening, entitlement/catalog guidance, and build-setting filtering script.
- [references/apple-device-interaction/device-interaction.md](references/apple-device-interaction/device-interaction.md) -- Apple-authoritative device/simulator interaction workflow: run, screenshot, hierarchy, touches, and reporting.
- [references/xcode-mcp-tools.md](references/xcode-mcp-tools.md) -- Complete XcodeBuildMCP tool reference (40+ tools by category)
- [references/debug-agent-workflow.md](references/debug-agent-workflow.md) -- Step-by-step build, run, interact, and log capture recipe
- [references/ui-automation-workflow.md](references/ui-automation-workflow.md) -- UI automation execution model, targeting, tool parameters, verification, gesture presets, keycodes
- [references/profiling.md](references/profiling.md) -- xctrace CLI recording, ASLR-aware symbolication, helper scripts
- [references/apple-docs-cli.md](references/apple-docs-cli.md) -- xcdocs search and get commands, JSON shapes, recommended flow
- [references/release-workflows.md](references/release-workflows.md) -- App Store change-summary and macOS SwiftPM packaging/signing/notarisation
- [references/build-performance.md](references/build-performance.md) -- Build Timeline, type-checking warnings, compilation caching, explicitly built modules, compilation mode
- [references/build-validation.md](references/build-validation.md) -- Canonical build/test/lint commands, when-to-run-what matrix
