---
name: ios-hig-quick
description: Quick Apple HIG decision frameworks for common iOS design choices: navigation, sheets, tabs, modals, and platform pattern choices.
---

# iOS HIG Quick — Decision Frameworks

Fast decision trees for common Apple Human Interface Guidelines choices.
Not a HIG replacement — a decision accelerator.

For full HIG details, invoke the `axiom-hig` or `axiom-hig-ref` Axiom skills.

---

## 1. Navigation Pattern

```
Is it hierarchical drill-down?          → NavigationStack
Is it peer content categories?          → TabView
Is it master-detail with sidebar?       → NavigationSplitView
Is it a modal task?                     → Sheet
Is it a full-screen immersive task?     → FullScreenCover
```

| Pattern             | Use When                | Max Depth   | Example                 |
|---------------------|-------------------------|-------------|-------------------------|
| NavigationStack     | Linear drill-down       | 3-4 levels  | Settings → Detail       |
| TabView             | 3-5 peer sections       | 1 level     | Home / Search / Profile |
| NavigationSplitView | Content browser         | 2-3 columns | Mail / Notes            |
| Sheet               | Self-contained task     | 1-2 levels  | Add item, edit form     |
| FullScreenCover     | Immersive content       | 1 level     | Camera, media player    |

---

## 2. Sheet vs Push

```
Is the user performing a self-contained task?   → Sheet
  Is the task short (< 3 fields)?               → Sheet with .medium detent
  Is the task longer?                            → Sheet with .large detent
Is the user drilling into detail?                → Push (navigationDestination)
Does it need to return a value to the parent?    → Sheet with binding
Is it a confirmation/destructive action?         → ConfirmationDialog, not sheet
```

Rules:
- Sheets interrupt flow — use only when the task is logically separate
- Push preserves context — user knows where they are in the hierarchy
- If the user might want to reference the parent while editing → push, not sheet

---

## 3. List Container

```
Is it a scrollable list of homogeneous items?    → List
Is it a settings/preferences screen?             → Form
Is it a free-form scrollable layout?             → ScrollView + LazyVStack
Is it a grid of items?                           → LazyVGrid
Does the list need sections?                     → List with Section
Does it need swipe actions?                      → List (not ScrollView)
Does it need pull-to-refresh?                    → List or ScrollView with .refreshable
```

| Container               | Built-in Features                          |
|-------------------------|--------------------------------------------|
| List                    | Separators, swipe actions, edit mode, sections |
| Form                    | Grouped inset style, toggles, pickers      |
| ScrollView + LazyVStack | Full layout control, no separators         |
| LazyVGrid               | Multi-column, adaptive sizing              |

---

## 4. Feedback Type

| Situation               | Feedback        | API                                                        |
|-------------------------|-----------------|------------------------------------------------------------|
| Button tap              | Light haptic    | `.sensoryFeedback(.impact(flexibility: .soft), trigger:)`  |
| Toggle change           | Selection       | `.sensoryFeedback(.selection, trigger:)`                   |
| Success completion      | Success haptic  | `.sensoryFeedback(.success, trigger:)`                     |
| Error/failure           | Error haptic    | `.sensoryFeedback(.error, trigger:)`                       |
| Destructive action      | Warning haptic  | `.sensoryFeedback(.warning, trigger:)`                     |
| Long press activate     | Heavy haptic    | `.sensoryFeedback(.impact(weight: .heavy), trigger:)`      |
| Inline validation error | Red text + shake | No haptic needed                                          |
| Network loading         | ProgressView    | No haptic                                                  |
| Background completion   | Banner/toast    | Optional success haptic                                    |

Rules:
- Never double-up haptics (e.g. haptic + sound for same event)
- System controls (Toggle, Picker) provide their own feedback — don't add more
- Haptics are silent in the Simulator; test on device

---

## 5. Empty State Design

```
Is it a first-run empty?
  → ContentUnavailableView with:
    - SF Symbol icon
    - Title explaining what will appear
    - Action button to create first item

Is it a search with no results?
  → ContentUnavailableView.search

Is it a filtered view with no matches?
  → ContentUnavailableView with:
    - Explain the filter
    - Button to clear filters

Is it an error state?
  → ContentUnavailableView with:
    - Error icon
    - Specific error description (not "Oops!")
    - Retry button
```

Rules:
- Always provide an action — never a dead end
- Icon + title + description + action button is the full pattern
- Keep descriptions to one sentence

---

## 6. Tab Bar Rules

```
Maximum tabs:        5 (system adds "More" for overflow — avoid it)
Each tab:            Independent NavigationStack
Tab icons:           SF Symbols, filled variant for selected
Tab labels:          Short nouns ("Home", "Search", "Profile"), not verbs
Badge (count):       .badge(count)
Badge (dot):         .badge("")
Tab bar visibility:  Don't hide during drill-down (system handles this)
```

Anti-patterns:
- Tabs that navigate to the same destination
- Using a tab for a single action (use toolbar button instead)
- More than 5 tabs on iPhone
- Verbs as tab labels ("Search" is a noun here, "Go Search" is not)

---

## 7. Typography Hierarchy

| Level          | Style          | Weight      | Colour       | Use For              |
|----------------|----------------|-------------|--------------|----------------------|
| Screen title   | `.largeTitle`  | `.bold`     | `.primary`   | Navigation title     |
| Section header | `.headline`    | `.semibold` | `.primary`   | Section labels       |
| Body content   | `.body`        | `.regular`  | `.primary`   | Main text            |
| Supporting     | `.subheadline` | `.regular`  | `.secondary` | Subtitles            |
| Metadata       | `.footnote`    | `.regular`  | `.secondary` | Timestamps, counts   |
| Fine print     | `.caption`     | `.regular`  | `.tertiary`  | Legal, disclaimers   |

Rules:
- Use Dynamic Type — never hardcode font sizes
- Maximum 2-3 font weights per screen
- Prefer semantic styles over custom sizes
- Test with the largest accessibility text size

---

## 8. Colour Selection

```
Is it text?               → .primary / .secondary / .tertiary (semantic)
Is it a tappable control? → .tint() (one accent colour per screen)
Is it a status indicator?  → Palette: positive / caution / negative
Is it a background?        → .background / .groupedBackground / materials
Is it a chart/badge?       → Palette role appropriate to data meaning
Is it decorative?          → Neutral palette shades
```

Rules:
- Never use colour as the only differentiator (accessibility)
- Always pair colour with shape, icon, or label
- Test in both light and dark mode
- Use semantic colours so the system handles appearance changes

---

## 9. Touch Target Sizing

```
Minimum:            44 x 44 pt  (Apple HIG mandate)
Comfortable:        48 x 48 pt
Large/accessibility: 60 x 60 pt
```

If the visible element is smaller than 44pt, expand the hit area:
```swift
.frame(minWidth: 44, minHeight: 44)
.contentShape(.rect)
```

Rules:
- Adjacent interactive elements must NOT have overlapping hit areas
- Bottom-of-screen actions need larger targets (thumb reach)
- Icon-only buttons always need explicit frame expansion
- Test with "Show Pointer" accessibility option

---

## 10. When to Use Confirmation

```
Is the action destructive?                → ConfirmationDialog with red button
Is the action irreversible?               → ConfirmationDialog with consequence
Is the action expensive (time/money)?     → Confirmation with summary
Is the action easily undoable?            → No confirmation — provide undo
Is it a routine action?                   → No confirmation (don't interrupt flow)
```

ConfirmationDialog rules:
- Title: state what will happen, not a question
- Destructive button: `.destructive` role, verb label ("Delete", "Remove")
- Always include a "Cancel" button (system provides one by default)
- Never use alerts for choices with more than 2 options — use ConfirmationDialog

---

## Quick Reference: Common Mistakes

| Mistake                              | Fix                                          |
|--------------------------------------|----------------------------------------------|
| Alert for multi-option choice        | ConfirmationDialog                           |
| Sheet for simple drill-down          | NavigationLink / navigationDestination        |
| Custom back button                   | Use system back button                       |
| Hiding tab bar manually              | Let the system manage it                     |
| Hardcoded font sizes                 | Use semantic text styles                     |
| Color-only status indicators         | Add icon or label                            |
| Tiny tap targets (< 44pt)           | Expand with frame + contentShape             |
| Confirm on every action              | Only destructive/irreversible actions        |
| "Are you sure?" title               | State the consequence: "Delete 3 items?"     |
| ScrollView when List works           | Use List for separators, swipe, edit mode    |

---

## Shortest-Path Recommendations

When you face a common design decision and need a fast answer:

| Decision | Shortest Path |
|---|---|
| How to navigate to detail? | `navigationDestination(for:)` push |
| How to present a creation form? | Sheet with `.medium` detent |
| How to present settings? | Form with Section groups |
| How to confirm a delete? | ConfirmationDialog with `.destructive` role |
| What haptic on button tap? | `.sensoryFeedback(.impact(flexibility: .soft), trigger:)` |
| What empty state? | `ContentUnavailableView` with SF Symbol + action |
| How many tabs? | 4-5 nouns, each with own NavigationStack |
| What font for metadata? | `.footnote` + `.secondary` colour |
| What animation for toggle? | `.spring(duration: 0.3, bounce: 0)` |
| Touch target too small? | `.frame(minWidth: 44, minHeight: 44).contentShape(.rect)` |

---

## Gotchas

- **Sheet on iPad**: Sheets present as popovers on iPad by default, not bottom sheets. Use `.presentationDetents` AND test on iPad simulator.
- **ConfirmationDialog title visibility**: The title is hidden on iPhone (only message shown) but visible on iPad (shown as popover title). Write it anyway for iPad and accessibility.
- **Tab bar hiding**: Don't use `.toolbar(.hidden, for: .tabBar)` on push — the system hides/shows the tab bar correctly during navigation. Fighting it causes flicker.
- **Haptics in Simulator**: `.sensoryFeedback` is silent in Simulator. Always test haptics on a physical device.
- **Dynamic Type extremes**: At the largest accessibility text sizes, horizontal layouts break. Always test with `AX5` size category. Prefer vertical stacking that adapts.
- **ContentUnavailableView placement**: It should be the ONLY content in its parent container. Mixing it with other views causes layout issues.
- **ConfirmationDialog from toolbar**: When presenting from a toolbar button, attach the dialog to the toolbar item, not the parent view, for correct iPad popover positioning.
