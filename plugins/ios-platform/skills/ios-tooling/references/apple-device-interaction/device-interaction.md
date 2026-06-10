# Apple Device Interaction Guidance, Localized

Use this reference when verifying UI-affecting work on a simulator or device.

This is adapted from Apple's `device-interaction` agent skill. Keep the verification contract; map tool names to whichever simulator/device automation tools are actually available in the current agent runtime.

## Trigger

Use after implementing a UI-affecting feature, when the user asks whether something works on device/simulator, when touch interaction is suspicious, or when visual layout might be broken.

Do not use for unit-test-only changes, build-only requests, code review without runtime verification, or changes that cannot affect UI.

## Verification Contract

1. Build and run the app on the selected simulator or device.
2. Capture a screenshot.
3. Capture the UI hierarchy or accessibility snapshot.
4. Verify visible layout quality: no overlapping text, clipped controls, unreadable contrast, missing images, wrong state, or broken Dynamic Type-sensitive layout.
5. Interact with the feature using taps, swipes, typing, hardware buttons, or gestures as needed.
6. Report whether the implementation works, and name any UI issue that appears caused by code.
7. End or release any long-running simulator/device session when finished.

## Tool Mapping

Prefer the local iOS tooling stack:

- Build/run: `build_run_sim`, `test_sim`, `test_device`, or the project build command.
- Screenshot: simulator/device screenshot tool when available.
- Hierarchy: `snapshot_ui` or equivalent accessibility/UI hierarchy capture.
- Interaction: `tap`, `swipe`, `type_text`, hardware-button tools, or equivalent.
- Logs: simulator/device log capture when debugging runtime failures.

If Apple-specific tools such as `DeviceInteractionStartSession`, `DeviceInteractionInstallAndRun`, or `DeviceEventSynthesize` are unavailable, do not invent them. Use the closest available XcodeBuildMCP or runtime tool and preserve the same verification steps.

## Touch Targeting

When hierarchy output includes element frames and centers, tap the calculated center point rather than hand-estimated coordinates.

Example hierarchy shape:

```text
UIView {{100, 200}, {50, 30}}, center: {125.0, 215.0}
  UIButton "Login" {{110, 205}, {30, 20}}, center: {125.0, 215.0}
```

Use `{125.0, 215.0}` for the tap.

## Reporting Standard

Report UI problems bluntly and specifically:

- What failed.
- Where it appeared.
- Which screenshot/hierarchy evidence supports it.
- Whether the likely cause is implementation code, missing data, environment, or tooling.

Do not call UI work done just because it built successfully.
