# Lens 1: Reuse — Swift/SwiftUI Patterns

## What to Search For

Before flagging new code as duplicative, search these locations in order:

### 1. ViewModifiers and View Extensions

Common reuse candidates in Swift projects:

```swift
// DUPLICATED — inline card styling repeated across views
VStack { content }
    .padding(16)
    .background(.background, in: .rect(cornerRadius: 12, style: .continuous))
    .shadow(color: .black.opacity(0.08), radius: 8, y: 4)

// REUSE — if a .cardStyle() modifier already exists
VStack { content }
    .cardStyle()
```

**Search**: `grep -r "func.*-> some View" --include="*.swift"` in shared/extension directories. Also check for `ViewModifier` conformances.

### 2. EnvironmentValues and EnvironmentKeys

New `@Environment` keys that duplicate existing ones:

```swift
// DUPLICATED — new EnvironmentKey for something that already exists
@Environment(\.customDismiss) private var dismiss

// REUSE — SwiftUI already provides this
@Environment(\.dismiss) private var dismiss
```

**Search**: `grep -r "EnvironmentKey" --include="*.swift"` and `grep -r "EnvironmentValues" --include="*.swift"`.

### 3. Formatters

Date and number formatters are the most common duplication:

```swift
// DUPLICATED — creating a formatter inline
Text(date.formatted(.dateTime.month().day()))

// REUSE — if the project has a shared formatter
Text(date.formatted(.appRelativeDate))
```

**Search**: `grep -r "DateFormatter\|\.formatted\|NumberFormatter\|FormatStyle" --include="*.swift"` in shared/utility directories.

### 4. Palette Colours and Design Tokens

New colour definitions that duplicate the palette:

```swift
// DUPLICATED — inline colour that matches an existing palette entry
Color(red: 0.2, green: 0.78, blue: 0.35)

// REUSE — palette colour
.positive500
```

**Search**: Check `colour-system.md` and any `Color+` extensions or asset catalogs.

### 5. Model Extensions

Computed properties or methods on models that already exist:

```swift
// DUPLICATED — formatting a model's display name inline
Text("\(user.firstName) \(user.lastName)")

// REUSE — if the model already has a displayName property
Text(user.displayName)
```

**Search**: Read the model file for existing computed properties before adding formatting logic in views.

### 6. Error Handling Patterns

Duplicated error mapping or alert presentation:

```swift
// DUPLICATED — manual error-to-alert mapping
.alert("Error", isPresented: $showError) {
    Button("OK") {}
} message: {
    Text(errorMessage)
}

// REUSE — if the project has a shared error presentation modifier
.errorAlert($error)
```

**Search**: `grep -r "\.alert\|AlertState\|errorAlert" --include="*.swift"` for existing error presentation patterns.

## High-Yield Duplication Patterns

These patterns are the most frequently duplicated in SwiftUI codebases:

| Pattern | Where to Check |
|---------|---------------|
| Card/container styling | Shared ViewModifier or View extension |
| Section header styling | Existing header view or modifier |
| Loading/empty/error states | Shared state enum or view |
| List row layout | Existing row components |
| Navigation bar configuration | Shared toolbar modifiers |
| Sheet presentation boilerplate | Shared sheet routing |
| Button styles | Existing ButtonStyle conformances |
| Date/number display formatting | Shared FormatStyle extensions |
| Haptic feedback calls | Shared haptic helper |
| Confirmation dialog patterns | Shared destructive action modifier |

## What NOT to Flag

- **Test helpers that mirror production code** — tests may intentionally create independent helpers for isolation
- **Preview-specific utilities** — preview code prioritises iteration speed over reuse
- **Similar but semantically different code** — two views may look alike but serve different domains; don't force unification
- **Standard library one-liners** — `items.filter { $0.isActive }` doesn't need a custom extension just because it appears twice
