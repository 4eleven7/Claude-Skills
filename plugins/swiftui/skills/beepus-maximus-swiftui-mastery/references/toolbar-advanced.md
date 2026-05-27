# Advanced Toolbar Features

## Customizable Toolbars

User-customizable toolbars where items can be added, removed, and rearranged:

```swift
ContentView()
    .toolbar(id: "main-toolbar") {
        ToolbarItem(id: "tag") { TagButton() }
        ToolbarItem(id: "share") { ShareButton() }
        ToolbarSpacer(.fixed)
        ToolbarItem(id: "more") { MoreButton() }
    }
```

- `toolbar(id:)` — creates customizable toolbar with unique identifier
- Each item MUST have its own `id`
- `ToolbarSpacer(.fixed)` — fixed-width space
- `ToolbarSpacer(.flexible)` — pushes items apart

## System-Defined Items

Reposition built-in toolbar items:

```swift
.toolbar {
    DefaultToolbarItem(kind: .search, placement: .bottomBar)
    DefaultToolbarItem(kind: .sidebar, placement: .navigationBarLeading)
}
```

## Search Toolbar Behavior

```swift
.searchable($searchText)
.searchToolbarBehavior(.minimize)  // Compact button that expands on tap
```

Saves space on smaller screens. The search field renders as a button-like control.

## Large Subtitle Placement

Custom content in the navigation bar subtitle area:

```swift
.toolbar {
    ToolbarItem(placement: .largeSubtitle) {
        CustomLargeNavigationSubtitle()
    }
}
```

Takes precedence over `.navigationSubtitle(_:)`.

## Matched Transition Source

Smooth transitions from toolbar items to presented views:

```swift
@Namespace private var namespace
@State private var isPresented = false

NavigationStack {
    DetailView()
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Show", systemImage: "globe") { isPresented = true }
            }
            .matchedTransitionSource(id: "world", in: namespace)
        }
        .sheet(isPresented: $isPresented) {
            SheetView()
                .navigationTransition(.zoom(sourceID: "world", in: namespace))
        }
}
```

## Shared Background Visibility

Control glass background on individual toolbar items:

```swift
.toolbar(id: "main") {
    ToolbarItem(id: "status", placement: .principal) {
        BuildStatus()
    }
    .sharedBackgroundVisibility(.hidden)  // Remove glass background
}
```

## Platform Notes

| Platform | Guidance |
|---|---|
| iPhone | Bottom bar placement useful; `.minimize` saves space |
| iPad/Mac | Customizable toolbars most valuable for productivity apps |
| Mac | Users expect toolbar customization in complex apps |
