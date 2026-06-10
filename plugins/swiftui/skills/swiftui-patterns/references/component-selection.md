# SwiftUI Component Lookup

## Purpose

Quick reference for iOS 26+ SwiftUI components with HIG-compliant values, common aliases, and concrete best practices. Use this to pick the right component and implement it correctly the first time.

## How to Use

1. **Identify the component** from the user request using the alias table below
2. **Look up best practices** in the Top 20 Quick Reference
3. **For less common components**, read `references/components.md` for the full 50+ reference
4. **Apply rules** — use exact values (44pt targets, spacing scale, etc.), not approximations
5. **Cross-reference** the project SwiftUI view guidelines and the project SwiftUI polish guidelines for project-specific conventions

## Component Alias System

| User says | Maps to |
|---|---|
| popup, modal, bottom sheet, drawer | Sheet / FullScreenCover |
| dialog, confirmation, destructive action | Alert / ConfirmationDialog |
| list, table view, rows, cells | List / Form |
| tabs, tab bar, bottom nav | TabView |
| sidebar, split view, master-detail, two-column | NavigationSplitView |
| nav, navigation, drill-down, push | NavigationStack |
| grid, collection view, tiles, mosaic | LazyVGrid / LazyHGrid / Grid |
| dropdown, select, segmented, wheel | Picker |
| menu, long press menu, right-click | Menu / ContextMenu |
| toolbar, nav bar buttons, top bar | ToolbarItem |
| search, search bar, filter | .searchable modifier |
| empty state, no results, placeholder | ContentUnavailableView |
| loading, spinner, progress bar | ProgressView |
| toggle, switch, checkbox | Toggle |
| slider, range | Slider |
| date, time, calendar | DatePicker |
| text field, input, type text | TextField / TextEditor |
| image from URL, remote image | AsyncImage |
| photo library, camera roll | PhotosPicker |
| expandable, collapsible, accordion | DisclosureGroup |
| share, share sheet | ShareLink |
| inspector, detail panel, side panel | Inspector |

## Top 20 Quick Reference

### List
**Also known as:** table view, rows, cells, UITableView
**When to use:** Displaying scrollable collections of similar items with standard row layout.
**Key rules:**
- Minimum row height: 44pt (system default handles this)
- Use `Section` for grouped content; always provide headers for accessibility
- Prefer `.listStyle(.insetGrouped)` for settings-like screens, `.plain` for data-heavy screens
- Use `.swipeActions` for row actions, not custom gesture hacks
**Common mistake:** Wrapping List in ScrollView — List already scrolls. Double-nesting causes broken layout.

### Form
**Also known as:** settings, preferences, input form
**When to use:** Collecting user input in a structured settings-like layout.
**Key rules:**
- Form is a styled List — don't nest Form inside List or vice versa
- Group related controls in `Section` with descriptive headers and footers
- Use footer text for field explanations, not inline labels
- Toggles, Pickers, and DatePickers auto-adapt their style inside Form
**Common mistake:** Using VStack with manual styling instead of Form for settings screens.

### NavigationStack
**Also known as:** nav, navigation, drill-down, push, UINavigationController
**When to use:** Linear navigation flows where users push/pop views.
**Key rules:**
- Use `navigationDestination(for:)` — never `NavigationLink(destination:)`
- One NavigationStack per tab; never nest stacks
- Use `@State private var path = NavigationPath()` for programmatic navigation
- Set `.navigationTitle()` and `.navigationBarTitleDisplayMode(.inline)` or `.large` explicitly
**Common mistake:** Putting NavigationStack inside a child view instead of at the root of a tab.

### NavigationSplitView
**Also known as:** sidebar, split view, master-detail, two-column, three-column
**When to use:** Multi-column layouts — sidebar + detail on iPad, collapses to stack on iPhone.
**Key rules:**
- Use two-column (sidebar + detail) or three-column (sidebar + content + detail)
- Provide a placeholder view for empty detail column
- Use `.navigationSplitViewColumnWidth(min:ideal:max:)` for column sizing
- On iPhone this collapses to NavigationStack automatically — don't fight it
**Common mistake:** Building separate iPad/iPhone navigation instead of letting NavigationSplitView adapt.

### TabView
**Also known as:** tabs, tab bar, bottom nav, UITabBarController
**When to use:** Top-level app sections (max 5 visible tabs).
**Key rules:**
- Maximum 5 tabs visible; use "More" pattern for overflow (rare — rethink IA first)
- Each tab gets its own NavigationStack
- Use `Tab("Title", systemImage:)` syntax with SF Symbols
- Use `.badge()` for notification counts
- Tab bar is sacred — never hide it except in full-screen experiences
**Common mistake:** Hiding tab bar on push with `.toolbar(.hidden, for: .tabBar)` when it should stay visible.

### Sheet
**Also known as:** modal, bottom sheet, popup, drawer, half-sheet
**When to use:** Presenting focused tasks, creation flows, or supplementary content.
**Key rules:**
- Use `.presentationDetents([.medium, .large])` for resizable sheets
- Custom detent: `.presentationDetents([.fraction(0.4)])` or `.height(300)`
- Add `.presentationDragIndicator(.visible)` when sheet is resizable
- Dismiss with `@Environment(\.dismiss) private var dismiss`
- Provide a clear dismiss affordance (X button or Done) — don't rely solely on swipe
**Common mistake:** Using `.fullScreenCover` when `.sheet` with detents would be less disruptive.

### Alert
**Also known as:** dialog, popup, warning, error dialog
**When to use:** Critical information requiring acknowledgment, or simple yes/no decisions.
**Key rules:**
- Max 2 buttons for simple alerts; use ConfirmationDialog for 3+ options
- Destructive actions: use `.destructive` role, place on the left
- Cancel button: use `.cancel` role, system positions it automatically
- Keep message text short — 1-2 sentences max
**Common mistake:** Using Alert for complex choices — use ConfirmationDialog or Sheet instead.

### ConfirmationDialog
**Also known as:** action sheet, confirmation, destructive action prompt
**When to use:** Confirming destructive actions or choosing from 3+ options.
**Key rules:**
- Always include a `.cancel` role button (system provides one, but be explicit)
- Use `.destructive` role for dangerous actions — it renders red automatically
- Title is shown on iPad (popover style), hidden on iPhone — write it anyway
- Present from the triggering element for correct iPad popover positioning
**Common mistake:** Using Alert with many buttons instead of ConfirmationDialog.

### Menu
**Also known as:** dropdown menu, overflow menu, more menu, ellipsis menu
**When to use:** Exposing secondary actions from a button tap.
**Key rules:**
- Nesting menus creates submenus — limit to 1 level of nesting
- Use `Label("Title", systemImage:)` for menu items with icons
- Primary action: use `Menu("Title") { } primaryAction: { }` to give the button a default tap
- Menus in toolbars get automatic styling
**Common mistake:** Using Menu for navigation — menus are for actions, not destinations.

### ContextMenu
**Also known as:** long-press menu, right-click menu, peek menu
**When to use:** Surfacing secondary actions on long-press of content.
**Key rules:**
- Always a supplement — every action must be reachable another way
- Use `contextMenu { }` modifier on the target view
- Add preview with `contextMenu { } preview: { }` for rich previews
- Keep menu items under 10; group with Divider if needed
**Common mistake:** Putting primary actions only in context menus — users won't discover them.

### ScrollView
**Also known as:** scroll container, scrollable area
**When to use:** Custom scrollable layouts that aren't List-shaped.
**Key rules:**
- Use `.scrollTargetBehavior(.viewAligned)` for paging/snapping
- Use `ScrollViewReader` + `.scrollTo(id:)` for programmatic scrolling
- Combine with `LazyVStack(pinnedViews: [.sectionHeaders])` for sticky headers
- Set explicit axes: `.horizontal`, `.vertical`, or `[.horizontal, .vertical]`
**Common mistake:** Using ScrollView + ForEach for simple lists — use List instead for free cell recycling.

### LazyVGrid
**Also known as:** grid, collection view, tiles, mosaic
**When to use:** Two-dimensional grid layouts with vertical scrolling.
**Key rules:**
- Define columns with `[GridItem]`: `.fixed(size)`, `.flexible(min:max:)`, `.adaptive(minimum:)`
- `.adaptive(minimum: 150)` for responsive column count
- Wrap in ScrollView — LazyVGrid doesn't scroll on its own
- Use `LazyHGrid` for horizontal grids with row definitions
**Common mistake:** Using `Grid` (fixed, non-lazy) when content count is dynamic — use LazyVGrid.

### LazyHGrid
**Also known as:** horizontal grid, horizontal collection
**When to use:** Horizontal scrolling grids (e.g., category rows).
**Key rules:**
- Define rows with `[GridItem]`, wrap in `ScrollView(.horizontal)`
- Same GridItem API as LazyVGrid but for rows
- Set explicit frame height on the ScrollView or the grid clips
**Common mistake:** Forgetting to constrain height, causing the grid to expand vertically.

### Button
**Also known as:** tap target, CTA, action button
**When to use:** Any tappable action trigger.
**Key rules:**
- Minimum touch target: 44x44pt — always, no exceptions
- Use `.buttonStyle(.borderedProminent)` for primary CTA, `.bordered` for secondary
- Use `role: .destructive` for delete/remove actions
- Use `controlSize: .large` for prominent actions, `.small` for inline
- Disable with `.disabled(condition)` — never hide buttons that might exist
**Common mistake:** Custom button styles without 44pt minimum hit area.

### Toggle
**Also known as:** switch, checkbox, on/off
**When to use:** Binary on/off settings.
**Key rules:**
- In Form/List, Toggle auto-styles as a switch on the trailing edge
- Use `.toggleStyle(.switch)` explicitly outside Form if needed
- For checkbox style: `.toggleStyle(.checkbox)` (macOS) — iOS uses switch
- Label is required for accessibility even if visually hidden
**Common mistake:** Using a Button to simulate toggle state instead of actual Toggle.

### Picker
**Also known as:** dropdown, select, segmented control, wheel, menu picker
**When to use:** Selecting one option from a predefined set.
**Key rules:**
- Inside Form: defaults to navigation-push style (shows current value, taps for list)
- `.pickerStyle(.segmented)` for 2-4 visible options inline
- `.pickerStyle(.menu)` for compact dropdown
- `.pickerStyle(.wheel)` only for very specific cases (time-like selection)
- Always provide a label even if visually hidden
**Common mistake:** Using `.wheel` style for short option lists — use `.menu` or `.segmented`.

### Slider
**Also known as:** range slider, scrubber
**When to use:** Selecting a value within a continuous range.
**Key rules:**
- Always provide `in: range` and `step:` for discrete values
- Use `minimumValueLabel` and `maximumValueLabel` for range context
- Provide an accessibility label and value description
- 44pt minimum height for the track hit area
**Common mistake:** No step value, causing overly precise selections users can't control.

### DatePicker
**Also known as:** date selector, calendar picker, time picker
**When to use:** Selecting dates, times, or date-time combinations.
**Key rules:**
- Use `displayedComponents:` to show `.date`, `.hourAndMinute`, or both
- In Form: shows compact inline style by default
- `.datePickerStyle(.graphical)` for full calendar view
- Constrain with `in: range` for valid date ranges
**Common mistake:** Allowing unbounded date ranges when business logic requires constraints.

### ContentUnavailableView
**Also known as:** empty state, no results, placeholder, zero state
**When to use:** When a view has no content to display (empty list, no search results, error).
**Key rules:**
- Use `ContentUnavailableView.search` for empty search results (built-in)
- Custom: provide SF Symbol, title, and description
- Add action button for recovery (e.g., "Add First Item")
- Place as the only content in the parent — don't mix with other views
**Common mistake:** Building custom empty states instead of using this purpose-built component.

### ProgressView
**Also known as:** loading, spinner, progress bar, activity indicator
**When to use:** Indicating loading or operation progress.
**Key rules:**
- Indeterminate: `ProgressView()` — spinning indicator
- Determinate: `ProgressView(value: 0.5)` — progress bar, value 0.0-1.0
- Use `.progressViewStyle(.circular)` or `.linear` explicitly when needed
- Add descriptive label: `ProgressView("Loading data...")`
**Common mistake:** Showing a spinner for < 200ms operations — use `task` with a delay threshold.

## Full Reference

For the complete 50+ component reference including Navigation, Presentation, Content, Controls, Feedback, Menus, Media, and Search categories with full code examples, decision tables, and anti-patterns, read `references/components.md`.

## Shortest-Path Recommendations

When multiple components could work, here are the fastest correct choices:

| Situation | Shortest Path |
|---|---|
| "I need a settings screen" | Form with Section, Toggle, Picker |
| "I need a data list" | List with .insetGrouped, swipeActions |
| "I need a grid of items" | ScrollView + LazyVGrid with .adaptive(minimum:) |
| "I need to collect input" | Sheet with Form inside |
| "I need to show detail" | navigationDestination(for:) push |
| "I need to confirm delete" | ConfirmationDialog with .destructive role |
| "I need empty state" | ContentUnavailableView with icon + description + action |
| "I need tabs" | TabView with NavigationStack per tab |

## Global Rules (Apply to Every Component)

| Rule | Value |
|---|---|
| Minimum touch target | 44x44pt |
| Spacing scale | 4, 8, 12, 16, 24, 32 pt |
| Corner radius style | `.continuous` (never `.circular`) |
| Animation for controls | `.spring(duration: 0.3, bounce: 0)` |
| Animation for content | `.spring(duration: 0.35, bounce: 0.1)` |
| List row minimum height | 44pt |
| List row with subtitle | 60pt typical |
| Tab bar max visible items | 5 |
| Deployment target | iOS 26+ only — no `@available` checks, no deprecated APIs |
| NavigationView | BANNED — use NavigationStack or NavigationSplitView |
| NavigationLink(destination:) | BANNED — use navigationDestination(for:) |

## Gotchas

- **List inside ScrollView**: List already scrolls. Wrapping it causes broken layout and double-bounce. This is the #1 mistake.
- **NavigationStack nesting**: Putting a NavigationStack inside a tab that already has one creates double nav bars. One stack per tab, at the root.
- **Form vs List confusion**: Form is a styled List. Nesting one inside the other breaks layout. Pick one.
- **Sheet detent on iPad**: `.presentationDetents` behave differently on iPad (sheets are popovers by default). Test on both.
- **DisclosureGroup in List**: DisclosureGroup inside List sections can cause unexpected indentation. Test with real content.
- **AsyncImage caching**: AsyncImage has no built-in disk cache. For repeated images, use a caching library or URLCache configuration.
- **Picker style in Form**: Picker auto-adapts its style inside Form (navigation push). If you set `.pickerStyle(.menu)` it overrides this, which may not be what you want.
- **LazyVGrid height**: LazyVGrid inside ScrollView without constrained item heights can cause layout issues. Always set explicit item heights or use GridItem(.fixed()).
