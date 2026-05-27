# Debug Agent Workflow

Step-by-step recipe for building, running, interacting with, and debugging an iOS app on the simulator using XcodeBuildMCP.

## 1) Discover the Booted Simulator

- Call `list_sims` and select the simulator with state `Booted`.
- If none are booted, ask the user to boot one (do not boot automatically unless asked).

## 2) Set Session Defaults

Call `session_set_defaults` with:

- `projectPath` or `workspacePath` (whichever the repo uses)
- `scheme` for the current app
- `simulatorId` from the booted device
- Optional: `configuration: "Debug"`, `useLatestOS: true`

## 3) Build and Run

- Call `build_run_sim` to build and launch in one step.
- If the app is already built and only a launch is needed, use `launch_app_sim`.
- If the bundle ID is unknown:
  1. `get_sim_app_path` to find the .app path.
  2. `get_app_bundle_id` to extract the bundle ID.

## 4) Interact with the UI

See [ui-automation-workflow.md](ui-automation-workflow.md) for the full reference: execution model, tool parameters, targeting strategy, gesture presets, keycodes, verification patterns, and error recovery.

**Quick summary:**

1. **Inspect** -- call `snapshot_ui` before interacting to discover element ids, labels, and coordinates.
2. **Tap** -- call `tap` with `id` (best), `label` (good), or `x`+`y` coordinates (fallback).
3. **Type** -- tap a text field first, then call `type_text`.
4. **Gestures** -- call `gesture` with a preset (`scroll-up`, `swipe-from-left-edge`, etc.).
5. **Verify** -- call `snapshot_ui` to check element state, or `screenshot` for visual confirmation.

UI tools are fire-and-forget -- always verify outcomes separately. Re-run `snapshot_ui` after any layout change (navigation, keyboard, alerts).

## 5) Capture and Review Logs

- Start: `start_sim_log_cap` with the app's bundle ID.
- Stop: `stop_sim_log_cap` -- review the output and summarise important lines.
- For console output (stdout/stderr), set `captureConsole: true` and relaunch if required.

## 6) Debugging with LLDB

- Attach: `debug_attach_sim` to connect LLDB to the running process.
- Add breakpoints: `debug_breakpoint_add` (symbol name or file:line).
- When a breakpoint hits: `debug_stack` for backtrace, `debug_variables` for frame locals.
- Run arbitrary LLDB commands: `debug_lldb_command` (e.g. `po someVariable`).
- Continue: `debug_continue`. Detach when done: `debug_detach`.

## Troubleshooting

- **Build fails** -- ask whether to retry with `preferXcodebuild: true`.
- **Wrong app launches** -- confirm the scheme and bundle ID in session defaults.
- **UI elements not hittable** -- re-run `snapshot_ui`; the hierarchy may have changed.
- **No logs captured** -- verify the bundle ID matches the running app.
