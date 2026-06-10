# UI Automation Workflow

Operational guide for driving an iOS Simulator app through XcodeBuildMCP UI automation tools. Covers the execution model, targeting strategy, verification, timing, and error recovery.

## Execution Model

XcodeBuildMCP UI tools are **fire-and-forget**. A `tap` confirms the HID event was dispatched to the simulator, not that the app processed it. A tap can land before a view is interactive or during a transition.

**Consequence:** always verify outcomes separately with `snapshot_ui` or `screenshot`. Never assume an action succeeded just because the tool call returned.

## Targeting Strategy

Prefer selectors over coordinates. Selectors survive layout changes and work across device sizes.

| Priority | Method | When to use |
|---|---|---|
| 1st | `tap(id:)` | Element has an `accessibilityIdentifier` (shown as `AXUniqueId` in `snapshot_ui`) |
| 2nd | `tap(label:)` | Element has a stable, unique `accessibilityLabel` (shown as `AXLabel`) |
| 3rd | `tap(x:, y:)` | No identifier or label; or multiple elements share the same label |

When `tap(label:)` matches multiple elements, fall back to coordinates from `snapshot_ui`.

## Reading `snapshot_ui` Output

`snapshot_ui` returns the accessibility tree with coordinates. Key fields per element:

| Field | Meaning | Use for |
|---|---|---|
| `AXLabel` | Visible text or accessibility label | `tap(label:)` targeting |
| `AXUniqueId` | Accessibility identifier set in code | `tap(id:)` targeting (most reliable) |
| `AXFrame` | `{x, y, width, height}` in screen points | Coordinate-based `tap(x:, y:)` — tap the centre: `x + width/2, y + height/2` |
| `AXValue` | Current value of inputs, toggles, sliders | Verifying state after interaction |
| `AXEnabled` | Whether the element accepts interaction | Check before tapping; disabled elements ignore taps |

## Tool Reference

### `snapshot_ui`

Inspect the full view hierarchy. No parameters. Call before any interaction to discover targets, and after interactions to verify results.

### `tap`

| Parameter | Type | Notes |
|---|---|---|
| `id` | String | AXUniqueId — preferred |
| `label` | String | AXLabel — use when id unavailable |
| `x`, `y` | Int | Fallback coordinates |
| `preDelay` | Number (seconds) | Wait before tapping |
| `postDelay` | Number (seconds) | Wait after tapping |

Provide either `id`, `label`, or `x`+`y` — not combinations.

### `swipe`

| Parameter | Type | Notes |
|---|---|---|
| `x1`, `y1` | Int (required) | Start point |
| `x2`, `y2` | Int (required) | End point |
| `duration` | Number (seconds) | Swipe speed |
| `delta` | Number | Distance in pixels |
| `preDelay` / `postDelay` | Number (seconds) | Timing control |

### `gesture`

Preset gestures — prefer over manual `swipe` coordinates.

| Parameter | Type | Notes |
|---|---|---|
| `preset` (required) | Enum | See table below |
| `duration` | Number (seconds) | Gesture speed |
| `delta` | Number | Distance in pixels |
| `preDelay` / `postDelay` | Number (seconds) | Timing control |
| `screenWidth` / `screenHeight` | Int | Override auto-detected screen size |

**Presets:**

| Preset | Use case |
|---|---|
| `scroll-up` | Scroll content up (finger moves up) |
| `scroll-down` | Scroll content down (finger moves down) |
| `scroll-left` | Horizontal scroll left (carousels, tab bars) |
| `scroll-right` | Horizontal scroll right |
| `swipe-from-left-edge` | Back navigation |
| `swipe-from-right-edge` | Forward navigation |
| `swipe-from-top-edge` | Pull down (dismiss, refresh) |
| `swipe-from-bottom-edge` | Swipe up (home indicator, reveal) |

### `type_text`

| Parameter | Type | Notes |
|---|---|---|
| `text` (required) | String | Text to type into the focused field |

Tap a text field first to focus it before calling `type_text`.

### `long_press`

| Parameter | Type | Notes |
|---|---|---|
| `x`, `y` (required) | Int | Coordinates |
| `duration` (required) | Number (ms) | Hold duration in **milliseconds** (not seconds) |

### `touch`

Low-level touch down/up. Use for custom gestures that `tap`/`swipe`/`gesture` can't express.

| Parameter | Type | Notes |
|---|---|---|
| `x`, `y` (required) | Int | Coordinates |
| `down` | Bool | Send touch-down event |
| `up` | Bool | Send touch-up event |
| `delay` | Number (seconds) | Delay between down and up |

### `button`

Press a simulator hardware button.

| Parameter | Type | Notes |
|---|---|---|
| `buttonType` (required) | Enum | `apple-pay`, `home`, `lock`, `side-button`, `siri` |
| `duration` | Number (seconds) | Hold duration |

### `key_press`

| Parameter | Type | Notes |
|---|---|---|
| `keyCode` (required) | Int (0-255) | HID keycode — see keycode table below |
| `duration` | Number (seconds) | Hold duration |

### `key_sequence`

| Parameter | Type | Notes |
|---|---|---|
| `keyCodes` (required) | [Int] | Array of HID keycodes |
| `delay` | Number (seconds) | Delay between key presses |

### `screenshot`

| Parameter | Type | Notes |
|---|---|---|
| `returnFormat` | Enum | `path` (default) or `base64` |

### `record_sim_video`

| Parameter | Type | Notes |
|---|---|---|
| `start` | Bool | Begin recording |
| `stop` | Bool | Stop recording and write file |
| `fps` | Int (1-120) | Frames per second (default: 30) |
| `outputFile` | String | Path to write MP4 |

Call with `start: true` to begin, then `stop: true` when done.

## Verification Patterns

| Method | When to use |
|---|---|
| `snapshot_ui` | Check element existence, labels, values, enabled state — structured and parseable |
| `screenshot` | Visual confirmation — layout, colours, content rendering, animation results |

**After navigation:** re-run `snapshot_ui` — the previous hierarchy is stale.

**After typing:** `snapshot_ui` to verify the field's `AXValue` matches expected text.

**After toggling:** `snapshot_ui` to check the element's `AXValue` changed.

## Timing and Sequencing

- Use `preDelay` / `postDelay` on `tap`, `swipe`, and `gesture` to add fixed delays around actions without separate sleep calls.
- After triggering navigation or a modal, call `snapshot_ui` to wait for the new screen — if the expected element isn't present, wait briefly and retry.
- After dismissing a keyboard, add a short `preDelay` on the next tap to let the layout settle.
- Animations typically complete within 0.3-0.5s. A `postDelay: 0.5` after navigation taps is usually sufficient.

## Error Recovery

When an interaction doesn't produce the expected result:

1. **Screenshot** — `screenshot` to see the actual screen state visually.
2. **Re-inspect** — `snapshot_ui` to check what elements are present.
3. **Diagnose:**
   - **Wrong timing** — the target wasn't ready. Add `preDelay` or re-run `snapshot_ui` first.
   - **Wrong selector** — the element's id/label changed after a state update. Re-read `snapshot_ui` output.
   - **Blocked by alert/modal** — a system alert or sheet is covering the target. Dismiss it first.
   - **Element not hittable** — it may be offscreen. Use `gesture(preset: "scroll-down")` to bring it into view.
4. **Retry** the action with corrected parameters.

## HID Keycode Reference

### Common Keys

| Key | Code | | Key | Code |
|---|---|---|---|---|
| Enter / Return | 40 | | Tab | 43 |
| Space | 44 | | Backspace | 42 |
| Escape | 41 | | Delete (fwd) | 76 |
| Up arrow | 82 | | Down arrow | 81 |
| Left arrow | 80 | | Right arrow | 79 |

### Letters and Numbers

- **Letters:** a = 4, b = 5, c = 6, ... z = 29 (sequential)
- **Numbers:** 1 = 30, 2 = 31, ... 9 = 38, 0 = 39
