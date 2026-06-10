# Drag and Drop Patterns (HIG)

## Core Rule

Drag and drop should feel natural and predictable. Show clear visual feedback for what's being dragged, where it can be dropped, and what will happen.

## SwiftUI Drag and Drop

### Basic Draggable

```swift
Text(item.name)
    .draggable(item.name)  // String, Image, URL, or Transferable
```

### Custom Transferable

```swift
struct Recipe: Transferable {
    var name: String
    var ingredients: [String]

    static var transferRepresentation: some TransferRepresentation {
        CodableRepresentation(contentType: .recipe)
        ProxyRepresentation(exporting: \.name)  // Fallback as plain text
    }
}
```

### Drop Target

```swift
List {
    ForEach(items) { item in
        ItemRow(item: item)
    }
}
.dropDestination(for: String.self) { items, location in
    self.items.append(contentsOf: items.map { Item(name: $0) })
    return true
} isTargeted: { isTargeted in
    self.isDropTargeted = isTargeted
}
```

### Reorderable List

```swift
List($items, editActions: .move) { $item in
    ItemRow(item: item)
        .draggable(item)
}
```

### Drop Between Items (Insert Position)

```swift
ForEach(items) { item in
    ItemRow(item: item)
        .dropDestination(for: Recipe.self) { recipes, _ in
            insertBefore(item, recipes: recipes)
            return true
        }
}
```

## HIG Guidance

### Visual Feedback
- Show a translucent preview of the dragged content attached to the finger/pointer
- Highlight valid drop targets with a border or colour change
- Animate items apart to show where the drop will insert
- Use spring loading: hover over a container to open it, then drop inside

### Multi-Item Drag (iPad)
- Allow selecting multiple items, then dragging the group
- Show a badge count on the drag preview: "3 items"
- All selected items should be visually gathered into the drag preview

### Drop Validation
- Reject invalid drops gracefully — animate the item back to its origin
- Only highlight targets that will accept the current drag type
- Provide a + badge when the drop will copy (not move)

## What NOT to Do

- Don't use drag and drop as the only way to perform an action — always provide a menu/button alternative
- Don't forget to handle the "cancel" case (user lifts finger outside a valid target)
- Don't allow dropping into locations that would create invalid state
- Don't forget accessibility — VoiceOver users need an alternative interaction
