<!-- EXAMPLE TEMPLATE: Replace [YourApp] and [Your Name] with your project-specific values. -->

# Swift Coding Guidelines

## Purpose

Define the house style for Swift code in [YourApp].

This document covers code shape, naming, organization, access control, and coding defaults. SwiftUI-specific structure and performance rules live in `Documentation/system/swiftui-view-guidelines.md`.

## Naming

- Types and protocols: `UpperCamelCase`
- Functions, variables, properties: `lowerCamelCase`
- Boolean properties: use `is`, `has`, or `should`
- Acronyms follow Apple conventions: `URLSession`, `HTTPClient`, `urlSession`

## File Headers

All new Swift files use the standard Xcode header with the project owner as author:

```swift
//
//  FileName.swift
//  Project Name
//
//  Created by [Your Name] on DD/MM/YYYY.
//
```

Use `[Your Name]` as the author for all new files.

## File Organization

Default order:

1. Imports, alphabetized
2. Primary type declaration
3. Stored properties and wrappers
4. Computed properties
5. Primary methods or `body`
6. Private extensions and protocol conformances

Example:

```swift
import Foundation
import SwiftUI

struct ProfileView: View {
    @State private var isEditing = false
    @Environment(\.dismiss) private var dismiss

    let profile: UserProfile

    var displayName: String { profile.name }

    var body: some View {
        Text(profile.debugDescription)
    }
}

private extension ProfileView {
    func reset() {}
}
```

## Access Control

- Default properties and helpers to `private`
- Feature code stays `internal`
- Do not use `public` in feature code
- Use `public` only in Swift Packages where the API truly crosses a module boundary
- Mark feature clients and view models `@MainActor` explicitly

## Documentation

- Document public package APIs with `///`
- Skip documentation for self-explanatory internals
- Use `// MARK: -` to break up larger files

## Brace Style

Use K&R style:

```swift
var isEmpty: Bool { items.count == 0 }

func reset() { count = 0 }

func configure() {
    setupUI()
    loadData()
}
```

## Default Prohibitions

- Do not use `ObservableObject` or `@Published` in new app code; use `@Observable`
- Do not force unwrap
- Do not use callbacks for new async work; use `async/await`
- Do not use `AnyView` unless an API boundary leaves no practical alternative
- Do not use singletons for feature state
- Do not put business logic in SwiftUI views
- Do not commit warnings
- Do not commit secrets

## Related Docs

- `Documentation/system/error-and-debugging-guidelines.md`
- `Documentation/system/modern-api-guidelines.md`
- `Documentation/system/swiftui-view-guidelines.md`
- `Documentation/system/build-and-validation-commands.md`
