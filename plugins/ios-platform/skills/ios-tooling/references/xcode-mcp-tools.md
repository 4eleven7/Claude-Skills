# XcodeBuildMCP Tool Reference

Prefer XcodeBuildMCP over raw `xcodebuild`, `xcrun`, or `simctl`. If a capability seems missing, search for hidden tools or ask the user to enable additional workflows via `manage_workflows`.

## Session Defaults

Before calling any other tools, call `session_show_defaults` to inspect current state, then fill in missing values.

| Tool | Description |
|---|---|
| `session_set_defaults` | Set session defaults (project/workspace path, scheme, simulator ID, configuration). Call at least once. |
| `session_show_defaults` | Show current session defaults. |
| `session_clear_defaults` | Clear all session defaults. |

Parameters for `session_set_defaults`:
- `projectPath` or `workspacePath` -- path to .xcodeproj or .xcworkspace
- `scheme` -- the Xcode scheme to use
- `simulatorId` -- UUID of the target simulator
- `configuration` -- e.g. `"Debug"` or `"Release"` (optional)
- `useLatestOS` -- `true` to auto-select the latest OS version (optional)

## Project Discovery

| Tool | Description |
|---|---|
| `discover_projs` | Scan a directory (defaults to workspace root) to find .xcodeproj and .xcworkspace files. |
| `list_schemes` | List Xcode schemes for the current project/workspace. |
| `show_build_settings` | Show build settings for the active scheme. |
| `get_app_bundle_id` | Extract bundle ID from a built .app (iOS). |
| `get_mac_bundle_id` | Extract bundle ID from a built macOS .app. |

## Simulator -- Build, Run, Test

| Tool | Description |
|---|---|
| `boot_sim` | Boot an iOS simulator by UUID. |
| `list_sims` | List all iOS simulators with state (Booted/Shutdown) and UDIDs. |
| `open_sim` | Open the Simulator.app window. |
| `build_sim` | Build the current scheme for iOS Simulator. |
| `build_run_sim` | Build and immediately run on the booted simulator. |
| `test_sim` | Run tests on the iOS simulator. |
| `get_sim_app_path` | Get the file-system path to the built .app on the simulator. |
| `install_app_sim` | Install an .app onto the simulator (without launching). |
| `launch_app_sim` | Launch an already-installed app on the simulator. |
| `launch_app_logs_sim` | Launch app on the simulator with log capture enabled. |
| `stop_app_sim` | Stop the running app on the simulator. |
| `record_sim_video` | Record a video of the simulator screen. |

## Simulator Management

| Tool | Description |
|---|---|
| `erase_sims` | Erase (factory-reset) a simulator. |
| `set_sim_location` | Set the simulator's GPS location (latitude, longitude). |
| `reset_sim_location` | Reset the simulator location to default. |
| `set_sim_appearance` | Set simulator appearance (light/dark). |
| `sim_statusbar` | Configure the simulator status bar (network, time, battery). |

## Device

| Tool | Description |
|---|---|
| `list_devices` | List connected physical devices. |
| `build_device` | Build for a connected device. |
| `test_device` | Run tests on a connected device. |
| `get_device_app_path` | Get the path to the built .app for device. |
| `install_app_device` | Install an .app onto the device. |
| `launch_app_device` | Launch an app on the device. |
| `stop_app_device` | Stop a running app on the device. |

## macOS

| Tool | Description |
|---|---|
| `build_macos` | Build a macOS target. |
| `build_run_macos` | Build and run a macOS app. |
| `test_macos` | Run tests for a macOS target. |
| `get_mac_app_path` | Get the path to the built macOS .app. |
| `launch_mac_app` | Launch a macOS app. |
| `stop_mac_app` | Stop a running macOS app. |

## Logging

| Tool | Description |
|---|---|
| `start_sim_log_cap` | Start capturing logs from the simulator (pass bundle ID). |
| `stop_sim_log_cap` | Stop simulator log capture and return captured output. |
| `start_device_log_cap` | Start capturing logs from a connected device. |
| `stop_device_log_cap` | Stop device log capture. |

Tip: set `captureConsole: true` when launching to include stdout/stderr in log capture.

## Debugging (LLDB)

| Tool | Description |
|---|---|
| `debug_attach_sim` | Attach LLDB to a running app on the simulator. |
| `debug_breakpoint_add` | Add a breakpoint (by symbol, file:line, or address). |
| `debug_breakpoint_remove` | Remove a breakpoint. |
| `debug_continue` | Continue execution after hitting a breakpoint. |
| `debug_detach` | Detach the debugger from the process. |
| `debug_lldb_command` | Run an arbitrary LLDB command (e.g. `po`, `expr`, `register read`). |
| `debug_stack` | Get the current backtrace / call stack. |
| `debug_variables` | Get variables in the current stack frame. |

## UI Automation

| Tool | Description |
|---|---|
| `snapshot_ui` | Print the view hierarchy with precise coordinates (x, y, width, height) for all visible elements. Use before tapping or swiping. |
| `screenshot` | Capture a screenshot of the simulator. |
| `tap` | Tap a coordinate or element (prefer `id` or `label`; fall back to coordinates). |
| `long_press` | Long press at coordinates. |
| `swipe` | Swipe between two points. |
| `touch` | Touch down / touch up at coordinates (low-level). |
| `type_text` | Type text into the focused field. |
| `button` | Press a simulator hardware button (Home, Lock, etc.). |
| `gesture` | Fire a gesture preset (scroll, edge swipe, etc.). |
| `key_press` | Press a single key by keycode. |
| `key_sequence` | Press a sequence of keys by their keycodes. |

Workflow: call `snapshot_ui` to discover element labels/coordinates, then `tap`/`swipe`/`type_text` to interact, then `screenshot` for visual confirmation.

## SwiftPM

| Tool | Description |
|---|---|
| `swift_package_build` | Build a SwiftPM target. |
| `swift_package_clean` | Clean SwiftPM build artifacts. |
| `swift_package_list` | List running SwiftPM processes. |
| `swift_package_run` | Run a SwiftPM target. |
| `swift_package_stop` | Stop a running SwiftPM process. |
| `swift_package_test` | Run SwiftPM target tests. |

## Scaffolding and Utilities

| Tool | Description |
|---|---|
| `scaffold_ios_project` | Scaffold a new iOS project from a template. |
| `scaffold_macos_project` | Scaffold a new macOS project from a template. |
| `clean` | Clean build products for the current scheme. |

## Diagnostics

| Tool | Description |
|---|---|
| `doctor` | Show MCP environment info (paths, Xcode version, available tools). |
| `manage_workflows` | Enable or disable tool groups. Only simulator tools are enabled by default; some workflows are mandatory. |
