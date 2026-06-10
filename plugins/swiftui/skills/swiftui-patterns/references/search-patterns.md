# Search Patterns (HIG)

## Core Rule

Search should feel instant and forgiving. Show results as the user types, tolerate typos, and remember recent searches.

## SwiftUI Search

```swift
@State private var searchText = ""

NavigationStack {
    ContentList(searchText: searchText)
        .searchable(text: $searchText, prompt: "Search recipes")
}
```

### Search with Suggestions

```swift
.searchable(text: $searchText) {
    ForEach(suggestions, id: \.self) { suggestion in
        Text(suggestion)
            .searchCompletion(suggestion)
    }
}
```

### Search with Scopes

```swift
@State private var scope: SearchScope = .all

.searchable(text: $searchText)
.searchScopes($scope) {
    Text("All").tag(SearchScope.all)
    Text("Recipes").tag(SearchScope.recipes)
    Text("Ingredients").tag(SearchScope.ingredients)
}
```

### Search with Tokens

```swift
@State private var tokens: [SearchToken] = []

.searchable(text: $searchText, tokens: $tokens) { token in
    Label(token.name, systemImage: token.icon)
}
```

## Search Placement

```swift
.searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
// .automatic — system decides
// .navigationBarDrawer — below nav bar
// .navigationBarDrawer(displayMode: .always) — always visible
// .sidebar — in sidebar (NavigationSplitView)
// .toolbar — in toolbar
```

## Search Behaviour

```swift
.searchToolbarBehavior(.minimize)  // Compact button that expands on tap
```

## HIG Guidance

### Results
- Show results as the user types (live filtering)
- Highlight matching text in results
- Show the number of results
- Provide "No results" feedback with suggestions ("Try a different search term")

### Recent Searches
- Show recent searches when the field is activated but empty
- Allow clearing individual items and all history
- Limit to 5-10 recent items

### Suggestions
- Show type-ahead suggestions ranked by relevance
- Include search completions from your data
- Show trending or popular searches if applicable

### Scoped Search
- Offer scopes when content has clear categories
- Default to "All" — don't force users to pick a scope
- Show scope chips above results

### Empty State

```swift
if searchResults.isEmpty {
    ContentUnavailableView.search(text: searchText)
    // Or custom:
    ContentUnavailableView(
        "No Results",
        systemImage: "magnifyingglass",
        description: Text("Try adjusting your search or filters.")
    )
}
```

## What NOT to Do

- Don't require tapping "Search" to show results — filter live
- Don't clear the search field when the user navigates to a result
- Don't show an empty screen while searching — show a spinner or skeleton
- Don't make the search bar hard to find — follow platform conventions
- Don't limit search to exact matches — be fuzzy and forgiving
