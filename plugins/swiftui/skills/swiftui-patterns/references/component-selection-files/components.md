# SwiftUI Component Reference (iOS 26+)

Complete reference for 50+ SwiftUI components. All examples target iOS 26+ — no deprecated APIs, no `@available` checks.

Global constants referenced throughout:
- **Touch target:** 44x44pt minimum
- **Spacing scale:** 4, 8, 12, 16, 24, 32 pt
- **Corner radius:** always `.continuous` style
- **Control animation:** `.spring(duration: 0.3, bounce: 0)`
- **Content animation:** `.spring(duration: 0.35, bounce: 0.1)`

---

# Navigation

## NavigationStack
**Also known as:** nav controller, push navigation, drill-down, UINavigationController
**When to use:** Linear navigation where users push and pop views within a single hierarchy.
**When NOT to use:** Multi-column layouts (use NavigationSplitView), or tab-level switching (use TabView).
**Best practices:**
- Place one NavigationStack at the root of each tab — never nest stacks
- Use `navigationDestination(for:)` registered on the stack, not on child views
- Use `@State private var path = NavigationPath()` for programmatic navigation
- Set `.navigationTitle()` on every pushed view
- Use `.navigationBarTitleDisplayMode(.large)` for root views, `.inline` for pushed views
**Good:**
```swift
struct RootView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            ItemListView()
                .navigationTitle("Items")
                .navigationDestination(for: Item.ID.self) { id in
                    ItemDetailView(itemID: id)
                }
        }
    }
}
```
**Bad:**
```swift
// WRONG: NavigationLink with destination
NavigationLink(destination: DetailView(item: item)) {
    Text(item.name)
}

// WRONG: Nested NavigationStack
NavigationStack {
    NavigationStack { // Double stack — broken navigation
        ContentView()
    }
}
```
**Decision table:**
| Scenario | Recommendation |
|---|---|
| Single-column drill-down | NavigationStack |
| Sidebar + detail | NavigationSplitView |
| Deep linking needed | NavigationStack with NavigationPath |
| Modal flow (e.g., onboarding) | NavigationStack inside Sheet |

## NavigationSplitView
**Also known as:** sidebar, split view, master-detail, two-column, three-column, UISplitViewController
**When to use:** Multi-column layouts on iPad that collapse to stack navigation on iPhone.
**When NOT to use:** Simple linear navigation (use NavigationStack), or when you only need a list-to-detail flow on iPhone.
**Best practices:**
- Always provide a placeholder for the empty detail column
- Use `.navigationSplitViewColumnWidth(min:ideal:max:)` to control column sizes
- Two-column: sidebar + detail. Three-column: sidebar + content + detail
- On iPhone, this automatically collapses — don't add conditional layout logic
- Use `@State private var selectedItem: Item.ID?` to drive selection
**Good:**
```swift
struct AppView: View {
    @State private var selectedCategory: Category.ID?
    @State private var selectedItem: Item.ID?

    var body: some View {
        NavigationSplitView {
            CategoryListView(selection: $selectedCategory)
        } content: {
            ItemListView(categoryID: selectedCategory, selection: $selectedItem)
        } detail: {
            if let selectedItem {
                ItemDetailView(itemID: selectedItem)
            } else {
                ContentUnavailableView("Select an Item", systemImage: "doc")
            }
        }
    }
}
```
**Bad:**
```swift
// WRONG: Manual iPad/iPhone branching
if UIDevice.current.userInterfaceIdiom == .pad {
    NavigationSplitView { ... }
} else {
    NavigationStack { ... }
}
```

## TabView
**Also known as:** tabs, tab bar, bottom navigation, UITabBarController
**When to use:** Top-level app sections (3-5 primary destinations).
**When NOT to use:** Switching between views within a section (use Picker or segmented control), or more than 5 items without very strong justification.
**Best practices:**
- Maximum 5 visible tabs; overflow goes to "More" (but rethink your IA first)
- Each tab contains its own NavigationStack
- Use `Tab("Title", systemImage:)` with SF Symbols
- Use `.badge(count)` for notification indicators
- Never hide the tab bar on push — only hide for immersive full-screen experiences
- Tab selection state: `@State private var selectedTab: TabID`
**Good:**
```swift
struct MainTabView: View {
    @State private var selectedTab: AppTab = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Home", systemImage: "house", value: .home) {
                NavigationStack {
                    HomeView()
                }
            }
            Tab("Search", systemImage: "magnifyingglass", value: .search) {
                NavigationStack {
                    SearchView()
                }
            }
            .badge(3)
        }
    }
}
```
**Bad:**
```swift
// WRONG: NavigationStack wrapping TabView
NavigationStack {
    TabView { ... }
}

// WRONG: Hiding tab bar on push
.toolbar(.hidden, for: .tabBar)
```

## NavigationLink
**Also known as:** push link, detail link
**When to use:** As a tappable element that triggers a `navigationDestination` via a value.
**When NOT to use:** For actions (use Button), external URLs (use `Link`), or with the deprecated `destination:` parameter.
**Best practices:**
- Always use the value-based initializer: `NavigationLink(value:)`
- The corresponding `navigationDestination(for:)` must be registered on an ancestor NavigationStack
- For List rows, NavigationLink auto-adds a disclosure chevron
- Style with `Label` for icon + text combinations
**Good:**
```swift
List(items) { item in
    NavigationLink(value: item.id) {
        ItemRowView(item: item)
    }
}
```
**Bad:**
```swift
// BANNED: destination-based NavigationLink
NavigationLink(destination: DetailView(item: item)) {
    Text(item.name)
}
```

## navigationDestination
**Also known as:** route registration, destination handler
**When to use:** Defining what view to push when a NavigationLink value is provided.
**When NOT to use:** N/A — this is the only way to define push destinations.
**Best practices:**
- Register on the NavigationStack or its direct child, not deep in the hierarchy
- The type in `for:` must conform to `Hashable`
- One registration per type per stack — duplicates cause undefined behavior
- Prefer registering all destinations at the stack root for clarity
**Good:**
```swift
NavigationStack {
    ContentView()
        .navigationDestination(for: Item.ID.self) { id in
            ItemDetailView(itemID: id)
        }
        .navigationDestination(for: Category.ID.self) { id in
            CategoryDetailView(categoryID: id)
        }
}
```
**Bad:**
```swift
// WRONG: Registering deep in child hierarchy
struct ChildView: View {
    var body: some View {
        List { ... }
            .navigationDestination(for: Item.ID.self) { ... } // May not fire reliably
    }
}
```

---

# Presentation

## Sheet
**Also known as:** modal, bottom sheet, popup, drawer, half-sheet, UISheetPresentationController
**When to use:** Focused tasks, creation flows, or supplementary content that doesn't replace the current context.
**When NOT to use:** Critical alerts (use Alert), simple confirmations (use ConfirmationDialog), or full replacement flows (use FullScreenCover).
**Best practices:**
- Use `.presentationDetents([.medium, .large])` for resizable sheets
- Custom detent: `.fraction(0.4)` or `.height(300)`
- Add `.presentationDragIndicator(.visible)` when resizable
- Always provide a visible dismiss button (X or Done) — swipe-to-dismiss is supplementary
- Use `@Environment(\.dismiss) private var dismiss` for programmatic dismissal
- For navigation inside sheets: embed a NavigationStack
**Good:**
```swift
.sheet(isPresented: $showSettings) {
    NavigationStack {
        SettingsView()
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { showSettings = false }
                }
            }
    }
    .presentationDetents([.medium, .large])
    .presentationDragIndicator(.visible)
}
```
**Bad:**
```swift
// WRONG: No dismiss affordance
.sheet(isPresented: $showContent) {
    LongContentView() // User trapped if swipe-to-dismiss is disabled
}

// WRONG: Using fullScreenCover when sheet would suffice
.fullScreenCover(isPresented: $showSettings) {
    SettingsView()
}
```
**Decision table:**
| Scenario | Recommendation |
|---|---|
| Settings / preferences | Sheet with `.medium` / `.large` |
| Creation flow (new item) | Sheet with NavigationStack inside |
| Media viewer / immersive | FullScreenCover |
| Simple info display | Sheet with `.fraction(0.3)` or `.height(200)` |

## FullScreenCover
**Also known as:** full-screen modal, immersive modal, UIModalPresentationStyle.fullScreen
**When to use:** Immersive experiences that fully replace the current context (media viewers, onboarding, camera).
**When NOT to use:** Standard modals or settings — use Sheet instead.
**Best practices:**
- Always provide an explicit close button — no swipe-to-dismiss by default
- Use for media playback, photo viewers, onboarding flows, login screens
- Embed NavigationStack if the flow has multiple steps
- Transitions use a vertical slide by default
**Good:**
```swift
.fullScreenCover(isPresented: $showCamera) {
    CameraView(onDismiss: { showCamera = false })
}
```
**Bad:**
```swift
// WRONG: No way to dismiss
.fullScreenCover(isPresented: $showContent) {
    ContentView() // User is trapped
}
```

## Alert
**Also known as:** dialog, popup, warning, error dialog, UIAlertController
**When to use:** Critical information requiring acknowledgment, or simple binary (yes/no) decisions.
**When NOT to use:** Complex choices with 3+ options (use ConfirmationDialog), data entry (use Sheet), or non-blocking information (use inline messaging).
**Best practices:**
- Maximum 2 buttons for standard alerts
- Use `role: .destructive` for dangerous actions — renders red
- Use `role: .cancel` for cancel — system positions it correctly
- Keep message to 1-2 sentences
- Title should be a clear question or statement, not just "Error"
**Good:**
```swift
.alert("Delete Entry?", isPresented: $showDeleteAlert) {
    Button("Delete", role: .destructive) {
        deleteEntry()
    }
    Button("Cancel", role: .cancel) { }
} message: {
    Text("This action cannot be undone.")
}
```
**Bad:**
```swift
// WRONG: Too many buttons in an alert
.alert("Choose Option", isPresented: $showAlert) {
    Button("Option A") { }
    Button("Option B") { }
    Button("Option C") { }
    Button("Option D") { }
    Button("Cancel", role: .cancel) { }
}
```

## ConfirmationDialog
**Also known as:** action sheet, confirmation sheet, destructive action prompt, UIAlertController(.actionSheet)
**When to use:** Confirming destructive actions or presenting 3+ action choices.
**When NOT to use:** Simple yes/no (use Alert), complex input (use Sheet).
**Best practices:**
- Always include a `.cancel` role button
- Use `.destructive` role for dangerous actions
- Title is visible on iPad (popover), hidden on iPhone — always write a meaningful title
- Present from the triggering view for correct iPad popover anchor
- Keep to under 6 options; use a Sheet for more
**Good:**
```swift
.confirmationDialog("Change Sort Order", isPresented: $showSortOptions, titleVisibility: .visible) {
    Button("By Date") { sort = .date }
    Button("By Name") { sort = .name }
    Button("By Priority") { sort = .priority }
    Button("Cancel", role: .cancel) { }
}
```
**Bad:**
```swift
// WRONG: Using alert for multiple choices
.alert("Sort By", isPresented: $showSort) {
    Button("Date") { }
    Button("Name") { }
    Button("Priority") { }
    Button("Size") { }
    Button("Cancel", role: .cancel) { }
}
```

## Popover
**Also known as:** tooltip, info bubble, floating panel
**When to use:** Brief, non-modal supplementary content anchored to a control — primarily on iPad.
**When NOT to use:** On iPhone (system converts to sheet automatically — be aware of this), or for actions (use Menu).
**Best practices:**
- On iPhone, popovers automatically become sheets — design for both
- Use `.presentationCompactAdaptation(.popover)` to force popover on compact sizes if truly needed
- Anchor to the triggering element with `.popover(isPresented:attachmentAnchor:)`
- Keep content compact — popovers should be glanceable
- Set `.frame(idealWidth:idealHeight:)` on content for sizing hints
**Good:**
```swift
Button("Info") { showInfo = true }
    .popover(isPresented: $showInfo) {
        VStack(alignment: .leading, spacing: 8) {
            Text("Heart Rate Zones")
                .font(.headline)
            Text("Based on your maximum heart rate of 185 BPM.")
                .font(.subheadline)
        }
        .padding()
        .frame(idealWidth: 300, idealHeight: 100)
    }
```

## Inspector
**Also known as:** detail panel, properties panel, side panel, inspector panel
**When to use:** Showing editable properties or details alongside the main content — the SwiftUI equivalent of a trailing sidebar.
**When NOT to use:** Primary navigation (use NavigationSplitView), or on iPhone where screen space is limited (falls back to sheet).
**Best practices:**
- Use `.inspector(isPresented:)` modifier
- Set width with `.inspectorColumnWidth(min:ideal:max:)`
- On compact sizes, inspector becomes a sheet — design content accordingly
- Great for property editors, metadata views, detail panels
**Good:**
```swift
ContentView()
    .inspector(isPresented: $showInspector) {
        PropertyEditorView(item: selectedItem)
            .inspectorColumnWidth(min: 250, ideal: 300, max: 400)
    }
```

---

# Content

## List
**Also known as:** table view, rows, cells, UITableView, collection
**When to use:** Scrollable collections of homogeneous or sectioned rows with system-standard layout.
**When NOT to use:** Custom layouts without standard row behavior (use ScrollView + LazyVStack), or fixed grids (use Grid).
**Best practices:**
- Minimum row height: 44pt (system default)
- Typical row with subtitle: 60pt
- Use `Section` for grouping; provide headers for accessibility
- Use `.listStyle(.insetGrouped)` for settings, `.plain` for feeds/data
- Use `.swipeActions(edge:)` for row actions — leading for primary, trailing for destructive
- Use `.onDelete` for standard delete swipe
- List already scrolls — never wrap in ScrollView
- Use `.listRowSeparator(.hidden)` to remove dividers when needed
**Good:**
```swift
List {
    Section("Recent") {
        ForEach(recentItems) { item in
            NavigationLink(value: item.id) {
                ItemRow(item: item)
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                Button(role: .destructive) { delete(item) } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
        }
    }
}
.listStyle(.insetGrouped)
```
**Bad:**
```swift
// WRONG: List inside ScrollView
ScrollView {
    List { ... } // Broken — List already scrolls
}

// WRONG: Manual row implementation when List suffices
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            HStack { ... }
            Divider()
        }
    }
}
```
**Decision table:**
| Scenario | Recommendation |
|---|---|
| Standard row layout | List |
| Custom card layout | ScrollView + LazyVStack |
| Grid of items | LazyVGrid |
| Settings screen | Form (which is a styled List) |
| Editable/reorderable | List with .onMove and .onDelete |

## Form
**Also known as:** settings, preferences, input form, grouped table
**When to use:** Structured input collection with system-styled sections (settings, preferences, data entry).
**When NOT to use:** Displaying read-only data lists (use List), or custom layouts.
**Best practices:**
- Form is a styled List — never nest Form in List or List in Form
- Group controls in `Section` with headers and explanatory footers
- Toggles, Pickers, DatePickers auto-adapt their style inside Form
- Use `Section` footer for help text, not inline labels
- LabeledContent for read-only key-value pairs inside Form
**Good:**
```swift
Form {
    Section("Notifications") {
        Toggle("Daily Reminder", isOn: $dailyReminder)
        if dailyReminder {
            DatePicker("Reminder Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
        }
    }

    Section {
        Picker("Theme", selection: $theme) {
            ForEach(Theme.allCases) { theme in
                Text(theme.displayName).tag(theme)
            }
        }
    } footer: {
        Text("Changes take effect immediately.")
    }
}
```
**Bad:**
```swift
// WRONG: Building a form manually
VStack {
    HStack {
        Text("Name")
        TextField("Enter name", text: $name)
    }
    Divider()
    // ... more manual rows
}
```

## ScrollView
**Also known as:** scroll container, scrollable area, UIScrollView
**When to use:** Custom scrollable layouts that don't fit the List/Form pattern.
**When NOT to use:** Simple row-based lists (use List), or non-scrollable content.
**Best practices:**
- Specify axis: `.horizontal`, `.vertical`, or `[.horizontal, .vertical]`
- Use `.scrollTargetBehavior(.viewAligned)` for paging/carousel
- Use `.scrollTargetBehavior(.paging)` for full-page paging
- Use `ScrollViewReader` with `.scrollTo(id:anchor:)` for programmatic scrolling
- Pair with LazyVStack for large content — plain VStack loads everything
- Use `.scrollIndicators(.hidden)` only when scroll position is obvious from context
- Use `.contentMargins()` for edge insets instead of padding on children
**Good:**
```swift
ScrollView {
    LazyVStack(spacing: 16, pinnedViews: [.sectionHeaders]) {
        Section {
            ForEach(items) { item in
                CardView(item: item)
            }
        } header: {
            SectionHeader("Results")
        }
    }
    .padding(.horizontal, 16)
}
```
**Bad:**
```swift
// WRONG: Non-lazy VStack with many items
ScrollView {
    VStack {
        ForEach(thousandsOfItems) { item in // Loads ALL at once
            ItemView(item: item)
        }
    }
}
```

## LazyVStack
**Also known as:** lazy vertical list, virtual list
**When to use:** Vertical scrollable content inside ScrollView with lazy loading.
**When NOT to use:** When List provides the UI you need (List handles recycling automatically).
**Best practices:**
- Always wrap in ScrollView
- Use `pinnedViews: [.sectionHeaders]` for sticky headers
- Set `alignment:` and `spacing:` explicitly
- Prefer List when you want standard row styling, swipe actions, or edit mode
**Good:**
```swift
ScrollView {
    LazyVStack(alignment: .leading, spacing: 12) {
        ForEach(entries) { entry in
            EntryCardView(entry: entry)
        }
    }
    .padding(.horizontal, 16)
}
```

## LazyVGrid
**Also known as:** grid, collection view, tiles, mosaic, UICollectionView
**When to use:** Grid layouts with vertical scrolling and dynamic item count.
**When NOT to use:** Fixed/known layouts (use Grid), single-column lists (use List or LazyVStack).
**Best practices:**
- Define columns: `.adaptive(minimum: 150)` for responsive, `.fixed(100)` for exact, `.flexible()` for fractional
- Wrap in ScrollView — LazyVGrid doesn't scroll alone
- Use `spacing:` parameter for inter-item spacing
- Set column spacing in GridItem: `GridItem(.adaptive(minimum: 150), spacing: 12)`
**Good:**
```swift
let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

ScrollView {
    LazyVGrid(columns: columns, spacing: 12) {
        ForEach(photos) { photo in
            PhotoThumbnail(photo: photo)
                .aspectRatio(1, contentMode: .fill)
        }
    }
    .padding(.horizontal, 16)
}
```
**Bad:**
```swift
// WRONG: Hardcoded column count when adaptive works
let columns = [GridItem(.fixed(100)), GridItem(.fixed(100)), GridItem(.fixed(100))]
// Only 3 columns regardless of screen width
```
**Decision table:**
| Scenario | Recommendation |
|---|---|
| Responsive tile count | `.adaptive(minimum:)` |
| Exact column widths | `.fixed(size)` |
| Equal-width columns filling space | `.flexible()` |
| 2 columns always | `[GridItem(.flexible()), GridItem(.flexible())]` |

## LazyHGrid
**Also known as:** horizontal grid, horizontal collection, horizontal tiles
**When to use:** Horizontal scrolling grid with defined rows.
**When NOT to use:** Single horizontal row of items (use ScrollView + LazyHStack).
**Best practices:**
- Define rows with `[GridItem]`, wrap in `ScrollView(.horizontal)`
- Set explicit frame height on the ScrollView or grid content
- Use for category browsers, multi-row carousels
**Good:**
```swift
let rows = [GridItem(.fixed(100)), GridItem(.fixed(100))]

ScrollView(.horizontal) {
    LazyHGrid(rows: rows, spacing: 12) {
        ForEach(categories) { category in
            CategoryCard(category: category)
                .frame(width: 120)
        }
    }
    .padding(.horizontal, 16)
}
.frame(height: 216)
```

## Table
**Also known as:** data table, spreadsheet, UITableView (multi-column)
**When to use:** Multi-column tabular data — primarily iPad and Mac.
**When NOT to use:** On iPhone (collapses to a single column — design for this), or for non-tabular content.
**Best practices:**
- Define columns with `TableColumn("Header", value: \.property)`
- Supports sorting with `@State private var sortOrder: [KeyPathComparator<Item>]`
- On iPhone, Table renders as a single-column List — only the first column shows
- Use for data-heavy, sortable content
**Good:**
```swift
Table(items, sortOrder: $sortOrder) {
    TableColumn("Name", value: \.name)
    TableColumn("Date", value: \.date) { item in
        Text(item.date, style: .date)
    }
    TableColumn("Status", value: \.status.rawValue) { item in
        StatusBadge(status: item.status)
    }
}
.onChange(of: sortOrder) { _, newOrder in
    items.sort(using: newOrder)
}
```

## Grid
**Also known as:** fixed grid, alignment grid, CSS Grid equivalent
**When to use:** Fixed, known-at-compile-time grid layouts where alignment across rows/columns matters.
**When NOT to use:** Dynamic/large datasets (use LazyVGrid), or simple HStack/VStack layouts.
**Best practices:**
- Not lazy — all content is loaded. Use only for small, fixed layouts
- Use `GridRow` for each row
- Use `.gridCellColumns(n)` to span columns
- Use `.gridColumnAlignment()` to align columns
**Good:**
```swift
Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 12) {
    GridRow {
        Text("Name").fontWeight(.semibold)
        Text(item.name)
    }
    GridRow {
        Text("Category").fontWeight(.semibold)
        Text(item.category)
    }
    Divider()
        .gridCellUnsizedAxes(.horizontal)
    GridRow {
        Text("Notes").fontWeight(.semibold)
            .gridColumnAlignment(.top)
        Text(item.notes)
    }
}
```

## GroupBox
**Also known as:** card, container, boxed section
**When to use:** Visually grouping related content with an optional label — card-like container.
**When NOT to use:** In Lists or Forms where Section provides grouping.
**Best practices:**
- Use for dashboard cards, grouped statistics, callout boxes
- Provide a label for context
- Nest GroupBoxes sparingly — one level max
**Good:**
```swift
GroupBox("Today's Summary") {
    VStack(alignment: .leading, spacing: 8) {
        LabeledContent("Steps", value: "8,432")
        LabeledContent("Calories", value: "1,890")
        LabeledContent("Sleep", value: "7h 23m")
    }
}
```

## DisclosureGroup
**Also known as:** expandable, collapsible, accordion, twistie
**When to use:** Showing/hiding content with a tap — expandable sections.
**When NOT to use:** Navigation (use NavigationLink), or multiple exclusive sections (consider custom accordion).
**Best practices:**
- Use `isExpanded` binding for programmatic control
- Works inside List and Form for expandable rows
- Label should clearly indicate what will be revealed
- Don't nest more than 2 levels deep
**Good:**
```swift
DisclosureGroup("Advanced Options", isExpanded: $showAdvanced) {
    Toggle("Auto-Sync", isOn: $autoSync)
    Picker("Sync Frequency", selection: $frequency) {
        Text("Hourly").tag(Frequency.hourly)
        Text("Daily").tag(Frequency.daily)
    }
}
```

## Section
**Also known as:** group, section header, table section
**When to use:** Grouping related content inside List, Form, or LazyVStack with pinned views.
**When NOT to use:** Outside of List/Form/LazyVStack context — use GroupBox or plain VStack with headings.
**Best practices:**
- Always provide header text for accessibility
- Use footer for explanatory text
- In List, Section creates visual grouping with the current list style
- Inside LazyVStack with `pinnedViews: [.sectionHeaders]`, headers stick on scroll
**Good:**
```swift
Section {
    Toggle("Notifications", isOn: $notifications)
    Toggle("Sounds", isOn: $sounds)
} header: {
    Text("Preferences")
} footer: {
    Text("Notifications are sent daily at your preferred time.")
}
```

## OutlineGroup
**Also known as:** tree view, hierarchical list, nested list, file browser
**When to use:** Displaying hierarchical/tree-structured data with expand/collapse.
**When NOT to use:** Flat lists (use List), or shallow grouping (use DisclosureGroup).
**Best practices:**
- Data model must have a `children` property of the same type
- Use inside List for standard styling
- Works with `ForEach`-style iteration
**Good:**
```swift
struct FileItem: Identifiable {
    let id = UUID()
    let name: String
    var children: [FileItem]?
}

List {
    OutlineGroup(fileTree, children: \.children) { item in
        Label(item.name, systemImage: item.children != nil ? "folder" : "doc")
    }
}
```

---

# Controls

## Button
**Also known as:** tap target, CTA, action button, UIButton
**When to use:** Any tappable element that triggers an action.
**When NOT to use:** Navigation (use NavigationLink), links (use Link), or toggles (use Toggle).
**Best practices:**
- Minimum touch target: 44x44pt — always, no exceptions
- `.buttonStyle(.borderedProminent)` for primary CTA
- `.buttonStyle(.bordered)` for secondary actions
- `.buttonStyle(.borderless)` for tertiary/inline actions
- Use `role: .destructive` for delete/remove — system makes it red
- Use `role: .cancel` for cancel actions
- `controlSize`: `.large` for prominent CTAs, `.regular` default, `.small` for inline, `.mini` for tight spaces
- Disable with `.disabled(condition)` — never hide interactive elements
**Good:**
```swift
Button("Save Entry", systemImage: "checkmark") {
    saveEntry()
}
.buttonStyle(.borderedProminent)
.controlSize(.large)

Button("Delete", role: .destructive) {
    showDeleteConfirmation = true
}
```
**Bad:**
```swift
// WRONG: Tiny tap target
Button("X") { dismiss() }
    .font(.caption2) // Way below 44pt
    .frame(width: 20, height: 20)

// WRONG: Custom gesture instead of Button
Text("Tap me")
    .onTapGesture { doAction() } // No accessibility, no button styling
```

## Toggle
**Also known as:** switch, checkbox, on/off, UISwitch
**When to use:** Binary on/off settings.
**When NOT to use:** Choosing between labeled options (use Picker with `.segmented`), or triggering one-time actions (use Button).
**Best practices:**
- In Form/List, auto-styled as trailing switch
- Always provide a label (even if visually hidden) for accessibility
- Use `.toggleStyle(.switch)` explicitly outside Form context
- Use `.tint()` to customize the on-state color
**Good:**
```swift
Toggle("Enable Notifications", isOn: $notificationsEnabled)
    .tint(.green)
```
**Bad:**
```swift
// WRONG: Simulating toggle with button
Button {
    isOn.toggle()
} label: {
    Image(systemName: isOn ? "checkmark.circle.fill" : "circle")
}
```

## Picker
**Also known as:** dropdown, select, segmented control, wheel, menu picker, UISegmentedControl, UIPickerView
**When to use:** Selecting one option from a predefined set.
**When NOT to use:** Binary choices (use Toggle), or actions (use Menu).
**Best practices:**
- Inside Form: navigation-push style by default (current value shown, taps for full list)
- `.pickerStyle(.segmented)` for 2-4 visible options inline
- `.pickerStyle(.menu)` for compact dropdown (5+ options)
- `.pickerStyle(.wheel)` only for time-like continuous selection
- `.pickerStyle(.palette)` for color/icon selection
- Always provide a label
- Tag values must match the selection binding type exactly
**Good:**
```swift
// Segmented for few options
Picker("View Mode", selection: $viewMode) {
    ForEach(ViewMode.allCases) { mode in
        Text(mode.displayName).tag(mode)
    }
}
.pickerStyle(.segmented)

// Menu for many options
Picker("Category", selection: $category) {
    ForEach(Category.allCases) { cat in
        Label(cat.name, systemImage: cat.icon).tag(cat)
    }
}
.pickerStyle(.menu)
```
**Bad:**
```swift
// WRONG: Wheel for a short list
Picker("Size", selection: $size) {
    Text("Small").tag(Size.small)
    Text("Medium").tag(Size.medium)
    Text("Large").tag(Size.large)
}
.pickerStyle(.wheel) // Overkill — use .segmented or .menu
```
**Decision table:**
| Number of options | Style |
|---|---|
| 2-4 | `.segmented` |
| 5-10 | `.menu` |
| 10+ | Default (navigation push inside Form) or `.menu` |
| Time-like values | `.wheel` |
| Colors/icons | `.palette` |

## Slider
**Also known as:** range slider, scrubber, UISlider
**When to use:** Selecting a value within a continuous or stepped range.
**When NOT to use:** Exact numeric input (use TextField with number formatter), or discrete named options (use Picker).
**Best practices:**
- Always provide `in: range` bounds
- Use `step:` for discrete increments
- Use `minimumValueLabel` and `maximumValueLabel` for visual range indication
- Minimum height for track area: 44pt
- Provide accessibility value description with `.accessibilityValue()`
**Good:**
```swift
Slider(value: $waterIntake, in: 0...4000, step: 250) {
    Text("Water (mL)")
} minimumValueLabel: {
    Text("0")
} maximumValueLabel: {
    Text("4L")
}
```
**Bad:**
```swift
// WRONG: No step value for something that should be discrete
Slider(value: $rating, in: 1...5) // User gets 3.7284...
```

## Stepper
**Also known as:** increment/decrement, counter, plus/minus, UIStepper
**When to use:** Incrementing/decrementing a value in small, discrete steps.
**When NOT to use:** Large ranges (use Slider), or free-form input (use TextField).
**Best practices:**
- Use `in: range` to constrain values
- Use `step:` for custom increment size
- Display the current value in the label
- 44pt minimum for each +/- button (system handles this)
**Good:**
```swift
Stepper("Servings: \(servings)", value: $servings, in: 1...20, step: 1)
```

## DatePicker
**Also known as:** date selector, calendar picker, time picker, UIDatePicker
**When to use:** Selecting dates, times, or both.
**When NOT to use:** Date ranges (use MultiDatePicker or custom UI), or relative times ("2 hours ago" — use custom UI).
**Best practices:**
- Use `displayedComponents:` — `.date`, `.hourAndMinute`, or both
- Constrain with `in: range` for valid ranges (e.g., not future dates)
- In Form: compact inline style by default
- `.datePickerStyle(.graphical)` for full calendar view
- `.datePickerStyle(.compact)` for minimal inline display
- `.datePickerStyle(.wheel)` for traditional wheel style
**Good:**
```swift
DatePicker("Entry Date", selection: $entryDate,
           in: ...Date.now,
           displayedComponents: [.date, .hourAndMinute])

// Full calendar for date-focused selection
DatePicker("Start Date", selection: $startDate, displayedComponents: .date)
    .datePickerStyle(.graphical)
```
**Bad:**
```swift
// WRONG: Unbounded date picker for birth date
DatePicker("Birthday", selection: $birthday) // Allows future dates
```

## ColorPicker
**Also known as:** color selector, color well
**When to use:** Letting users choose a custom color.
**When NOT to use:** Choosing from a predefined palette (use Picker with `.palette` or custom grid).
**Best practices:**
- Use `supportsOpacity: false` unless alpha is needed
- Shows a color well that opens the system picker on tap
- Pair with a label describing what the color is for
**Good:**
```swift
ColorPicker("Category Color", selection: $categoryColor, supportsOpacity: false)
```

## TextField
**Also known as:** text input, input field, UITextField
**When to use:** Single-line text input.
**When NOT to use:** Multi-line text (use TextEditor), or secure input (use SecureField).
**Best practices:**
- Use `prompt:` for placeholder text
- Apply `.textContentType()` for autofill (`.name`, `.emailAddress`, `.password`, etc.)
- Use `.keyboardType()` for appropriate keyboard (`.numberPad`, `.emailAddress`, etc.)
- Use `.textInputAutocapitalization(.never)` for emails/URLs
- Use `.submitLabel()` for return key text (`.done`, `.search`, `.next`)
- Use `.onSubmit { }` for return key action
- Use `.focused()` with `@FocusState` for focus management
- In Form, TextField gets standard row styling automatically
**Good:**
```swift
@FocusState private var isNameFocused: Bool

TextField("Entry Name", text: $name, prompt: Text("e.g., Morning Run"))
    .textContentType(.name)
    .submitLabel(.done)
    .focused($isNameFocused)
    .onSubmit { save() }
```
**Bad:**
```swift
// WRONG: No keyboard type for email
TextField("Email", text: $email)
// Missing: .keyboardType(.emailAddress), .textContentType(.emailAddress), .textInputAutocapitalization(.never)
```

## TextEditor
**Also known as:** multiline text, text area, notes field, UITextView
**When to use:** Multi-line text input (notes, descriptions, comments).
**When NOT to use:** Single-line input (use TextField), or rich text editing (use custom solution).
**Best practices:**
- Set a minimum height with `.frame(minHeight: 100)`
- Use `.scrollContentBackground(.hidden)` to customize background
- No built-in placeholder — overlay a conditional placeholder Text
- Use `.lineLimit(5...10)` to constrain visible lines
- Apply `.textContentType()` if content type is known
**Good:**
```swift
ZStack(alignment: .topLeading) {
    TextEditor(text: $notes)
        .frame(minHeight: 100)

    if notes.isEmpty {
        Text("Add notes...")
            .foregroundStyle(.tertiary)
            .padding(.top, 8)
            .padding(.leading, 4)
            .allowsHitTesting(false)
    }
}
```

## SecureField
**Also known as:** password field, PIN field, secret input
**When to use:** Password or sensitive text input that should be obscured.
**When NOT to use:** Non-sensitive input (use TextField).
**Best practices:**
- Use `.textContentType(.password)` for autofill
- Use `.textContentType(.newPassword)` for signup flows
- Pair with a visible "Show Password" toggle if appropriate
**Good:**
```swift
SecureField("Password", text: $password)
    .textContentType(.password)
    .submitLabel(.done)
```

## ShareLink
**Also known as:** share button, share sheet, UIActivityViewController
**When to use:** Sharing content via the system share sheet.
**When NOT to use:** Copying text only (use `.copyable()` or UIPasteboard), or custom sharing UI.
**Best practices:**
- Provide a meaningful `subject:` and `message:` for context
- Item must conform to `Transferable`
- Use `ShareLink(item:)` for single items, `ShareLink(items:)` for multiple
- Style as a toolbar button for standard placement
**Good:**
```swift
ShareLink(item: entryURL, subject: Text("My Entry"), message: Text("Check out this entry"))
    .labelStyle(.iconOnly)
```

## PasteButton
**Also known as:** paste, clipboard
**When to use:** Accepting pasted content with explicit user consent.
**When NOT to use:** Automatic clipboard reading (prohibited without user action).
**Best practices:**
- Specify accepted `payloadType` explicitly
- System shows the paste button style for trust indication
**Good:**
```swift
PasteButton(payloadType: String.self) { strings in
    text = strings.first ?? ""
}
```

---

# Feedback

## ProgressView
**Also known as:** loading spinner, progress bar, activity indicator, UIActivityIndicatorView, UIProgressView
**When to use:** Indicating loading state or operation progress.
**When NOT to use:** Skeleton/shimmer loading patterns (build custom), or instantaneous operations.
**Best practices:**
- Indeterminate: `ProgressView()` — circular spinner
- Determinate: `ProgressView(value: progress, total: 1.0)` — linear bar
- `.progressViewStyle(.circular)` or `.linear` for explicit style
- Add label: `ProgressView("Loading entries...")`
- Don't show for operations under 200ms — use a delay threshold
- Use `.tint()` to customize color
**Good:**
```swift
// Indeterminate
if isLoading {
    ProgressView("Syncing data...")
}

// Determinate
ProgressView(value: uploadProgress, total: 1.0) {
    Text("Uploading")
} currentValueLabel: {
    Text("\(Int(uploadProgress * 100))%")
}
.progressViewStyle(.linear)
```
**Bad:**
```swift
// WRONG: Custom spinner when ProgressView exists
Image(systemName: "arrow.triangle.2.circlepath")
    .rotationEffect(.degrees(rotation))
    .onAppear {
        withAnimation(.linear(duration: 1).repeatForever(autoreverses: false)) {
            rotation = 360
        }
    }
```

## ContentUnavailableView
**Also known as:** empty state, no results, placeholder, zero state, error state
**When to use:** When a view has no content to display — empty collections, no search results, error recovery.
**When NOT to use:** Loading states (use ProgressView), or partial content.
**Best practices:**
- Built-in: `ContentUnavailableView.search` for empty search results
- Custom: provide SF Symbol, title, and description
- Add action button for recovery ("Add First Entry", "Retry")
- Place as the sole content in the parent view — never mix with other content
- Use `.searchSuggestions` on the searchable modifier for search-specific states
**Good:**
```swift
// Empty collection
ContentUnavailableView {
    Label("No Entries", systemImage: "doc.text")
} description: {
    Text("Tap + to add your first entry.")
} actions: {
    Button("Add Entry") { showAddEntry = true }
        .buttonStyle(.borderedProminent)
}

// Empty search
ContentUnavailableView.search(text: searchQuery)
```
**Bad:**
```swift
// WRONG: Custom empty state from scratch
if items.isEmpty {
    VStack {
        Image(systemName: "doc")
            .font(.largeTitle)
        Text("No Items")
            .font(.headline)
        Text("Add some items to get started")
    }
    .foregroundStyle(.secondary)
}
```

## Gauge
**Also known as:** meter, indicator, level display
**When to use:** Displaying a value within a known range — health metrics, battery level, capacity.
**When NOT to use:** Actionable values (use Slider), or progress toward completion (use ProgressView).
**Best practices:**
- Provide `in: range` bounds
- Use `currentValueLabel`, `minimumValueLabel`, `maximumValueLabel`
- Styles: `.automatic`, `.linearCapacity`, `.accessoryCircularCapacity`, `.accessoryLinear`
- Great for watchOS complications and widget-style displays
**Good:**
```swift
Gauge(value: heartRate, in: 40...200) {
    Text("BPM")
} currentValueLabel: {
    Text("\(Int(heartRate))")
} minimumValueLabel: {
    Text("40")
} maximumValueLabel: {
    Text("200")
}
.gaugeStyle(.accessoryCircularCapacity)
.tint(.red)
```

## Label
**Also known as:** icon + text, labeled icon
**When to use:** Pairing an icon with text in a standard layout.
**When NOT to use:** Icon-only or text-only situations.
**Best practices:**
- Use SF Symbols: `Label("Settings", systemImage: "gear")`
- `.labelStyle(.titleAndIcon)` shows both (default varies by context)
- `.labelStyle(.iconOnly)` or `.titleOnly` for compact layouts
- List rows, Menu items, and toolbars adapt label style automatically
**Good:**
```swift
Label("Heart Rate", systemImage: "heart.fill")
    .foregroundStyle(.red)
```

---

# Menus

## Menu
**Also known as:** dropdown menu, overflow menu, more menu, ellipsis menu, popup menu
**When to use:** Exposing secondary actions from a button.
**When NOT to use:** Navigation (menus are for actions, not destinations), or primary actions (use Button).
**Best practices:**
- Use `primaryAction:` for the default tap behavior (menu on long-press)
- Nest one level of submenus max
- Use `Label` for items with icons
- Use `Divider()` to group related items
- In toolbars: `Menu("More", systemImage: "ellipsis.circle") { ... }`
**Good:**
```swift
Menu {
    Button("Edit", systemImage: "pencil") { edit() }
    Button("Duplicate", systemImage: "doc.on.doc") { duplicate() }
    Divider()
    Button("Delete", systemImage: "trash", role: .destructive) { delete() }
} label: {
    Label("Actions", systemImage: "ellipsis.circle")
}
```
**Bad:**
```swift
// WRONG: Menu for navigation
Menu("Go To") {
    Button("Home") { navigate(.home) } // Use NavigationLink or programmatic nav
    Button("Profile") { navigate(.profile) }
}
```

## ContextMenu
**Also known as:** long-press menu, right-click, peek, haptic touch menu
**When to use:** Secondary actions accessible via long-press on content.
**When NOT to use:** Primary actions (users won't discover them), or on controls that already have long-press behavior.
**Best practices:**
- Every action must be reachable another way — context menu is a shortcut only
- Use `preview:` for rich previews on long-press
- Keep items under 10; use Divider for grouping
- Use `role: .destructive` for dangerous actions
**Good:**
```swift
ItemCard(item: item)
    .contextMenu {
        Button("Edit", systemImage: "pencil") { edit(item) }
        Button("Share", systemImage: "square.and.arrow.up") { share(item) }
        Divider()
        Button("Delete", systemImage: "trash", role: .destructive) { delete(item) }
    } preview: {
        ItemPreview(item: item)
            .frame(width: 300, height: 400)
    }
```

## ToolbarItem
**Also known as:** nav bar button, top bar action, toolbar button, UIBarButtonItem
**When to use:** Actions in the navigation bar or bottom toolbar.
**When NOT to use:** Content within the page body.
**Best practices:**
- `.topBarTrailing` for primary action (e.g., Add, Save, Done)
- `.topBarLeading` for secondary/cancel
- `.bottomBar` for actions in bottom toolbar
- `.primaryAction` for the main action (system chooses placement)
- `.confirmationAction` and `.cancellationAction` inside sheets
- Use `.toolbar { }` modifier — one per view, can contain multiple items
**Good:**
```swift
.toolbar {
    ToolbarItem(placement: .topBarTrailing) {
        Button("Add", systemImage: "plus") { addItem() }
    }
    ToolbarItem(placement: .topBarLeading) {
        EditButton()
    }
}

// In a sheet
.toolbar {
    ToolbarItem(placement: .cancellationAction) {
        Button("Cancel") { dismiss() }
    }
    ToolbarItem(placement: .confirmationAction) {
        Button("Save") { save() }
    }
}
```
**Bad:**
```swift
// WRONG: Multiple .toolbar modifiers
.toolbar {
    ToolbarItem(placement: .topBarTrailing) { ... }
}
.toolbar { // Second toolbar modifier — may conflict
    ToolbarItem(placement: .topBarLeading) { ... }
}
```

## ControlGroup
**Also known as:** button group, segmented actions, toolbar group
**When to use:** Grouping related controls visually (e.g., text formatting buttons).
**When NOT to use:** Unrelated actions, or navigation items.
**Best practices:**
- Renders as a connected group of controls
- Use in toolbars for grouped actions (bold/italic/underline)
- Supports Buttons, Toggles, Pickers inside
**Good:**
```swift
ControlGroup {
    Button("Bold", systemImage: "bold") { toggleBold() }
    Button("Italic", systemImage: "italic") { toggleItalic() }
    Button("Underline", systemImage: "underline") { toggleUnderline() }
}
```

---

# Media

## AsyncImage
**Also known as:** remote image, URL image, network image
**When to use:** Loading and displaying images from URLs.
**When NOT to use:** Local assets (use `Image`), or when you need caching control (use a dedicated image loader).
**Best practices:**
- Always handle all phases: empty, success, failure
- Provide a placeholder for loading state
- Set `.frame()` to prevent layout jumps
- AsyncImage has no built-in cache — for heavy image loading, consider a caching layer
- Use `transaction:` parameter for custom load animations
**Good:**
```swift
AsyncImage(url: imageURL) { phase in
    switch phase {
    case .empty:
        ProgressView()
    case .success(let image):
        image
            .resizable()
            .aspectRatio(contentMode: .fill)
    case .failure:
        Image(systemName: "photo")
            .foregroundStyle(.secondary)
    @unknown default:
        EmptyView()
    }
}
.frame(width: 120, height: 120)
.clipShape(.rect(cornerRadius: 12, style: .continuous))
```
**Bad:**
```swift
// WRONG: No placeholder or error handling
AsyncImage(url: imageURL)
    .frame(width: 120, height: 120) // Layout jumps, no loading indicator, no error
```

## PhotosPicker
**Also known as:** image picker, photo library, camera roll, PHPickerViewController
**When to use:** Selecting photos/videos from the user's library.
**When NOT to use:** Displaying a single remote image (use AsyncImage), or taking new photos (use camera APIs).
**Best practices:**
- Use `matching: .images` for photos only, `.videos` for video, `.any(of:)` for mixed
- Use `maxSelectionCount:` to limit selection
- Handle `PhotosPickerItem` with `.loadTransferable(type:)`
- No permissions dialog — PhotosPicker uses out-of-process picker (private by design)
**Good:**
```swift
@State private var selectedPhotos: [PhotosPickerItem] = []

PhotosPicker("Select Photos", selection: $selectedPhotos, maxSelectionCount: 5, matching: .images)

// Loading
.onChange(of: selectedPhotos) { _, newItems in
    for item in newItems {
        item.loadTransferable(type: Data.self) { result in
            // Handle result
        }
    }
}
```

---

# Search

## searchable modifier
**Also known as:** search bar, filter, UISearchController, search field
**When to use:** Adding search/filter functionality to a view.
**When NOT to use:** Simple in-view filtering (a plain TextField may suffice for small lists).
**Best practices:**
- Apply `.searchable(text:placement:)` on the NavigationStack child
- Use `.searchSuggestions { }` for type-ahead suggestions
- Use `.searchScopes { }` for scope tabs (All, Recent, Favorites)
- Filter in `.onChange(of: searchText)` or as a computed property
- Use `ContentUnavailableView.search` when results are empty
- Placement: `.automatic` (default), `.navigationBarDrawer(displayMode: .always)` to always show
- Use `.searchable(text:tokens:)` for tokenized search (tag-based filtering)
**Good:**
```swift
NavigationStack {
    ItemListView(items: filteredItems)
        .navigationTitle("Items")
        .searchable(text: $searchText, prompt: "Search items")
        .searchSuggestions {
            ForEach(suggestions) { suggestion in
                Text(suggestion.name)
                    .searchCompletion(suggestion.name)
            }
        }
        .searchScopes($searchScope) {
            Text("All").tag(SearchScope.all)
            Text("Recent").tag(SearchScope.recent)
            Text("Favorites").tag(SearchScope.favorites)
        }
        .overlay {
            if filteredItems.isEmpty {
                ContentUnavailableView.search(text: searchText)
            }
        }
}
```
**Bad:**
```swift
// WRONG: Custom search bar instead of .searchable
VStack {
    HStack {
        Image(systemName: "magnifyingglass")
        TextField("Search", text: $searchText)
    }
    .padding()
    .background(.quaternary)
    .cornerRadius(10)

    List(filteredItems) { ... }
}
```
**Decision table:**
| Scenario | Recommendation |
|---|---|
| Standard list search | `.searchable(text:)` |
| Always-visible search | `.searchable(text:placement: .navigationBarDrawer(displayMode: .always))` |
| Search with categories | `.searchScopes` |
| Search with tags | `.searchable(text:tokens:)` |
| Simple local filter | TextField if no navigation bar context |
