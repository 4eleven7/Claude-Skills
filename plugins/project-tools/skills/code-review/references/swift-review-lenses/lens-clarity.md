# Lens 4: Clarity & Standards — Swift/SwiftUI Patterns

## Project Conventions

Read project instructions (the project instructions) and the project Swift coding guidelines before reviewing. Flag violations of documented conventions. Common areas:

### Import Ordering

Most Swift projects follow: Foundation frameworks first, then third-party, then project modules. Flag imports that break the project's established order.

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Types | UpperCamelCase | `ProfileClient`, `WorkoutSession` |
| Properties/methods | lowerCamelCase | `fetchLatest()`, `isActive` |
| Boolean properties | `is`/`has`/`can`/`should` prefix | `isLoading`, `hasEntries` |
| Protocol names | Noun or `-able`/`-ible` suffix | `Identifiable`, `TaskScheduling` |
| Enum cases | lowerCamelCase | `.inProgress`, `.completed` |
| Constants | lowerCamelCase (not SCREAMING_CASE) | `let maxRetries = 3` |
| Closures/callbacks | `on` prefix for event handlers | `onDismiss`, `onSave` |
| Client/Repository | suffix matches role | `AuthClient`, `ProfileRepository` |

Flag naming that doesn't match the role: a `manager` that's a `client`, a `helper` that's a `repository`, a `handler` that's a `view`.

### Error Handling

Flag error patterns that violate project conventions:
- `try?` silencing errors that should surface to the user
- `try!` in production code (never acceptable outside tests and known-good fixtures)
- Catching generic `Error` when specific error types exist
- Missing `throws` on functions that delegate to throwing calls

## View Ordering Convention

Properties and methods in a SwiftUI view should follow this order:

```
1. @Environment properties
2. private / public let (injected values)
3. @State / @Binding / other stored properties
4. Computed var (non-view)
5. init (if custom)
6. body
7. Computed view builders / @ViewBuilder helpers
8. Helper / async functions
```

Flag when:
- `@State` appears before `@Environment`
- `body` appears before stored properties
- Helper functions are interleaved with view builders
- `init` appears after `body`

## Unnecessary Complexity

### Deep Nesting

```swift
// BAD — 4 levels of nesting
var body: some View {
    if isLoggedIn {
        if hasData {
            if !isError {
                if items.count > 0 {
                    List(items) { ... }
                }
            }
        }
    }
}

// GOOD — early return or guard pattern with Group/content split
var body: some View {
    contentView
}

@ViewBuilder
private var contentView: some View {
    if !isLoggedIn {
        LoginPrompt()
    } else if isError {
        ErrorView()
    } else if items.isEmpty {
        EmptyStateView()
    } else {
        List(items) { ... }
    }
}
```

**Threshold**: Flag nesting deeper than 3 levels in view builders.

### Nested Ternaries in Views

```swift
// BAD — nested ternary in view builder
Text(isActive ? (isPremium ? "Premium Active" : "Active") : "Inactive")
    .foregroundStyle(isActive ? (isPremium ? .accent500 : .positive500) : .secondary)

// GOOD — extract to computed property or switch
private var statusText: String {
    switch (isActive, isPremium) {
    case (true, true): "Premium Active"
    case (true, false): "Active"
    case (false, _): "Inactive"
    }
}

private var statusColor: Color {
    switch (isActive, isPremium) {
    case (true, true): .accent500
    case (true, false): .positive500
    case (false, _): .secondary
    }
}
```

### Over-Abstracted ViewBuilders

```swift
// BAD — ViewBuilder for a one-time-use 3-line view
@ViewBuilder
private var dividerView: some View {
    Divider()
        .padding(.horizontal, 16)
}

// GOOD — inline it, it's 2 lines
Divider()
    .padding(.horizontal, 16)
```

**Threshold**: Flag extracted ViewBuilder properties that contain 3 or fewer modifiers and are used exactly once.

## Naming Consistency

Within a single diff, flag:
- Mixed terminology: `delete` vs `remove` for the same operation
- Mixed patterns: `fetchItems()` alongside `loadEntries()` for parallel operations
- Asymmetric naming: `startTracking()` paired with `endTracking()` (should be `stopTracking()`)

| Start | End | Convention |
|-------|-----|-----------|
| `start` | `stop` | Process lifecycle |
| `begin` | `end` | Transaction/scope |
| `add` | `remove` | Collection membership |
| `create` | `delete` | Persistent entity lifecycle |
| `show` | `hide` | Visibility |
| `open` | `close` | Resource/connection |
| `enable` | `disable` | Feature/capability |

## Dead Weight

### Unused Imports

```swift
// BAD — importing module that's not used in this file
import MapKit  // no MapKit types or functions used

// GOOD — only import what's needed
import SwiftUI
```

Flag when an import has no corresponding type, function, or protocol usage in the file. **Exception**: `@testable import` in test files and umbrella imports like `import UIKit` that provide Foundation.

### Commented-Out Code

```swift
// BAD — dead code left as comments
// func oldImplementation() {
//     let result = legacyAPI.fetch()
//     return result.map { ... }
// }
```

Flag commented-out code blocks (3+ lines). Single-line commented code may be intentional notes -- don't flag those.

### Unreachable Branches

```swift
// BAD — default case that can never execute
enum Status: String, CaseIterable {
    case active, inactive, archived
}

switch status {
case .active: ...
case .inactive: ...
case .archived: ...
default: break  // unreachable — enum is exhaustive
}
```

### Properties Set but Never Read

```swift
// BAD — property assigned but never accessed
@State private var lastRefreshDate: Date = .now

func refresh() async {
    lastRefreshDate = .now  // set
    await client.refresh()
    // lastRefreshDate never read anywhere in the view
}
```

## Missing Structure

### Files Without MARK Sections

**Threshold**: Flag `.swift` files in the diff that are >300 lines and have no `// MARK:` comments.

Suggested MARK structure for views:
```swift
// MARK: - Properties
// MARK: - Body
// MARK: - Subviews
// MARK: - Actions
// MARK: - Helpers
```

For clients/services:
```swift
// MARK: - Public API
// MARK: - Private Implementation
// MARK: - Persistence
```

### Large Body Without Extraction

**Threshold**: Flag `body` properties longer than 60 lines. Suggest extracting logical sections into private computed view properties.

## What NOT to Flag

- **Style preferences** without project convention backing (e.g., trailing closure style, `self.` usage)
- **Single unused imports** in isolation -- only flag if it's a pattern across the diff
- **MARK comments on small files** (<100 lines) -- unnecessary overhead
- **Naming in test files** -- test method names follow `test_whenX_shouldY` patterns that differ from production naming
- **Verbose assertions in tests** -- clarity in tests trumps conciseness
