---
name: swiftui-harden
description: Use when hardening SwiftUI views against edge cases: long text, empty data, large datasets, errors, Dynamic Type extremes, RTL, concurrency, accessibility, or pre-ship resilience.
---

# SwiftUI Hardening

Systematically stress-test SwiftUI views against real-world conditions that break idealized designs. Views that only work with perfect data are not production-ready.

## Scope Detection

- If the user names specific views or files → harden those
- If $ARGUMENTS is empty → check recent git changes for modified SwiftUI views
- If neither → ask the user what to harden

## Hardening Dimensions

Work through each dimension against the target views. For each, describe what you tested, what broke, and the fix.

### 1. Text & Content Extremes

**Test with:**
- Very long strings (100+ characters in names, titles, descriptions)
- Single character or single word
- Empty string (not nil — an actual `""`)
- Strings with emoji (multi-byte: flags, skin tones, ZWJ sequences)
- Numbers at extremes: 0, 1, 999, 10000, -1, 0.001, `Double.infinity`
- Dates at extremes: distant past, distant future, midnight, timezone boundaries

**Check for:**
- Text truncation: is it intentional or accidental? Does `.lineLimit()` + `.truncationMode()` exist?
- Layout overflow: does a long string push other elements off-screen?
- Number formatting: does `.monospacedDigit()` exist on dynamic numbers? Are large numbers formatted (`10,000` not `10000`)?

```swift
// WRONG — breaks with long text
Text(item.name)
    .frame(width: 200)

// CORRECT — adapts to content
Text(item.name)
    .lineLimit(2)
    .truncationMode(.tail)
```

### 2. Empty & Missing Data

**Test with:**
- Zero items in a list/collection
- nil optionals for every optional property
- A model with all optional fields nil simultaneously
- First launch (no persisted data)

**Check for:**
- Empty state exists and uses `ContentUnavailableView` with an action
- No blank screens — every empty state guides the user
- Optional chaining doesn't silently hide content (a `nil` name shouldn't make an entire row disappear)
- Placeholder/skeleton states for async-loaded content

### 3. Dynamic Type & Accessibility Sizes

**Test at:**
- `xSmall` (smallest standard)
- `xxxLarge` (largest standard)
- `AX1` through `AX5` (accessibility sizes)

**Check for:**
- Layout doesn't clip or overlap at any size
- Horizontal layouts wrap or adapt (HStack → VStack at large sizes using `@Environment(\.dynamicTypeSize)`)
- Fixed-frame views (`frame(width:height:)`) that don't scale — these are almost always wrong
- Icons scale with text or are appropriately sized
- ScrollView wraps content that would overflow

```swift
// WRONG — breaks at AX sizes
HStack {
    Image(systemName: "heart")
    Text("Favourites")
    Spacer()
    Text("12")
}

// CORRECT — adapts layout at large sizes
ViewThatFits {
    HStack { /* full layout */ }
    VStack(alignment: .leading) { /* stacked layout */ }
}
```

### 4. State Transitions & Loading

**Test scenarios:**
- View appears with data not yet loaded (async)
- Data loads and arrives
- Data load fails (network error, permission denied)
- Data was loaded, then refresh fails (stale data + error)
- Data changes while view is visible (background update)
- Rapid state changes (toggle quickly, submit twice)

**Check for:**
- Loading state shows feedback (ProgressView, skeleton, redacted)
- Error state is specific and actionable (not "Something went wrong")
- Double-tap/submit protection on buttons that trigger async work
- No race conditions: `task` cancels on view disappearance
- Stale data + error: does the view show stale data with an error banner, or does it wipe the screen?

### 5. Large Datasets

**Test with:**
- 100+ items in a List
- 1000+ items if the feature could realistically reach that count
- Items with highly varied content lengths

**Check for:**
- `List` or `LazyVStack` (not `VStack` inside `ScrollView` for unbounded data)
- No `.id(UUID())` forcing full list rebuild on every state change
- Scroll performance is smooth — no expensive computations in cell bodies
- Search/filter exists for collections > 20 items

### 6. Concurrency & Task Lifecycle

**Check for:**
- `.task` modifiers cancel when the view disappears (no leaked work)
- `@State` is not mutated from a detached `Task` after view disappears
- No `Task { @MainActor in }` patterns when `.task` would suffice
- `AsyncImage` or custom async loaders handle cancellation
- Refreshable actions complete or cancel cleanly

### 7. Destructive Actions

**Test:**
- Delete, archive, reset, sign out — any irreversible action

**Check for:**
- Confirmation dialog before destructive actions (`.confirmationDialog` or `.alert`)
- Button uses `.destructive` role
- Undo capability where appropriate
- Action is disabled while in-progress (no double-delete)

### 8. Orientation & Size Classes

**Test:**
- Portrait and landscape
- iPad multitasking (slide over, split view)
- If NavigationSplitView: does the sidebar collapse correctly on compact?

**Check for:**
- No hardcoded widths that assume portrait
- Content remains usable in landscape (not just "doesn't crash")
- Safe area insets are respected (no content behind home indicator or notch)

## Report Format

```
## Hardening Report — [View/Feature Name]

### Dimension Results
| # | Dimension | Result | Issues |
|---|-----------|--------|--------|
| 1 | Text & Content Extremes | PASS/FAIL | [count] |
| 2 | Empty & Missing Data | PASS/FAIL | [count] |
| 3 | Dynamic Type | PASS/FAIL | [count] |
| 4 | State Transitions | PASS/FAIL | [count] |
| 5 | Large Datasets | PASS/FAIL | [count] |
| 6 | Concurrency | PASS/FAIL | [count] |
| 7 | Destructive Actions | PASS/FAIL | [count] |
| 8 | Orientation & Size | PASS/FAIL | [count] |

### Issues
- [P0/P1/P2] file:line — description — fix

### Verdict: PRODUCTION-READY / NEEDS HARDENING
```

**Severity:**
- **P0**: Crash, data loss, or broken core flow under realistic conditions
- **P1**: Broken layout or unusable state that real users will hit
- **P2**: Edge case that's unlikely but should be handled

## Rules

- **Report first, then ask.** Present the full report before offering to fix.
- Be concrete — always include file:line references.
- Only flag issues that are reachable in practice. A 10,000-character name is unrealistic for most fields — use domain-appropriate extremes.
- Don't flag preview-only code.
- Don't add hardening for conditions the app architecture prevents (e.g., don't test for nil on a non-optional field).
- When fixing, prefer the smallest change that handles the edge case. Don't restructure a view to handle one overflow.
