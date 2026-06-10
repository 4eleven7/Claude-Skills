# Preview Patterns

Rules for writing correct, useful `#Preview` blocks in SwiftUI.

## Basic Syntax

```swift
// Simple preview
#Preview {
    MyView()
}

// Named preview
#Preview("Compact Layout") {
    MyView(style: .compact)
}
```

## @Previewable for Bindings

When a view takes a `Binding` or `@Binding`, define the state inside the preview using `@Previewable`:

```swift
#Preview {
    @Previewable @State var isOn = true
    ToggleRow(isOn: $isOn)
}
```

**Never** create a wrapper view just to hold `@State` for a preview — `@Previewable` exists for this.

## Contextual Embedding Rules

Embed the view in the container it expects at runtime. Without the right container, previews render incorrectly or crash.

### Wrap in NavigationStack when the view uses:
- `.navigationTitle`, `.navigationBarTitleDisplayMode`
- `.toolbar`, `.toolbarRole`, `.toolbarBackground`
- `NavigationLink`
- `.navigationDestination`
- `.customizationBehavior`, `.defaultCustomization`

```swift
#Preview {
    NavigationStack {
        DetailView(item: .sample)
    }
}
```

### Wrap in List when the view:
- Uses `.listItemTint`, `.listRowBackground`, `.listRowInsets`, `.listRowSeparator`
- Has a name ending in "Row" or "Cell"
- Is designed to be a list item

```swift
#Preview {
    List {
        TransactionRow(transaction: .sample)
        TransactionRow(transaction: .sampleLarge)
        TransactionRow(transaction: .sampleEmpty)
    }
}
```

### Wrap in TabView when the view uses:
- `.tabItem`, `.badge`

### Wrap in Form when the view uses:
- `.formStyle`, section headers, or is a settings screen

## Preview Data Best Practices

1. **Use static sample data.** Prefer `static var sample` properties on the model type over constructing ad-hoc instances:

```swift
extension Transaction {
    static var sample: Transaction { ... }
    static var sampleLarge: Transaction { ... }
}

#Preview {
    TransactionRow(transaction: .sample)
}
```

2. **Show variety.** For list-type previews, provide ~5 entries with varied data (short/long text, different states, edge cases):

```swift
#Preview("Multiple Items") {
    List {
        ForEach(Transaction.sampleList) { transaction in
            TransactionRow(transaction: transaction)
        }
    }
}
```

3. **Use realistic values.** Not "Item 1", "Item 2". Use names, amounts, and dates that look like real data.

4. **Preview edge cases separately.** Create named previews for important states:

```swift
#Preview("Empty State") {
    ContentView(items: [])
}

#Preview("Error State") {
    ContentView(loadingState: .failed(SampleError.networkTimeout))
}

#Preview("Very Long Content") {
    TransactionRow(transaction: .sampleWithLongDescription)
}
```

## Multiple Preview Variants

```swift
// Accessibility size
#Preview("AX5") {
    MyView()
        .environment(\.dynamicTypeSize, .accessibility5)
}

// Dark mode
#Preview("Dark") {
    MyView()
        .preferredColorScheme(.dark)
}

// RTL layout
#Preview("RTL") {
    MyView()
        .environment(\.layoutDirection, .rightToLeft)
}
```

## Common Mistakes

1. **Using `PreviewProvider` protocol** — use `#Preview` macro instead.
2. **Creating wrapper views for `@State`** — use `@Previewable @State` instead.
3. **Missing container context** — a toolbar view without `NavigationStack` won't render its toolbar.
4. **Sequential/placeholder data** — "Item 1, Item 2, Item 3" looks artificial. Use realistic sample data.
5. **Only previewing the happy path** — add previews for empty, error, loading, and edge-case states.
6. **Adding `@available` to previews** — not needed unless using `@Previewable` (which requires iOS 17+).
