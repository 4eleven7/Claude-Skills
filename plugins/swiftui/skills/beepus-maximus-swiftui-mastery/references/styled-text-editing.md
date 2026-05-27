# Styled Text Editing

Rich text editing with `TextEditor`, `AttributedString`, and `AttributedTextSelection`.

## TextEditor with AttributedString

```swift
@State private var text = AttributedString("Editable styled text...")

TextEditor(text: $text)
```

## Text Selection

```swift
@State private var text: AttributedString = "Select text to format"
@State private var selection = AttributedTextSelection()

TextEditor(text: $text, selection: $selection)
```

## Formatting Selected Text

```swift
@Environment(\.fontResolutionContext) private var fontResolutionContext

// Toggle bold
func toggleBold() {
    text.transformAttributes(in: &selection) {
        let font = $0.font ?? .default
        let resolved = font.resolve(in: fontResolutionContext)
        $0.font = font.bold(!resolved.isBold)
    }
}

// Toggle italic
func toggleItalic() {
    text.transformAttributes(in: &selection) {
        let font = $0.font ?? .default
        let resolved = font.resolve(in: fontResolutionContext)
        $0.font = font.italic(!resolved.isItalic)
    }
}

// Toggle underline
func toggleUnderline() {
    text.transformAttributes(in: &selection) {
        $0.underlineStyle = ($0.underlineStyle != nil) ? nil : .single
    }
}

// Set colour
func setColor(_ color: Color) {
    text.transformAttributes(in: &selection) {
        $0.foregroundColor = color
    }
}
```

## Reading Selection State

```swift
// Get attributes at cursor position
let attrs = selection.typingAttributes(in: text)
let currentColor = attrs.foregroundColor ?? .primary

// Get selection indices
let indices = selection.indices(in: text)
```

## Selection Affinity

```swift
TextEditor(text: $text, selection: $selection)
    .textSelectionAffinity(.upstream)
```

## Selection Replacement

```swift
// Replace with plain text
text.replaceSelection(&selection, withCharacters: "replacement")

// Replace with attributed text
let styled = AttributedString("bold replacement")
text.replaceSelection(&selection, with: styled)
```

## Custom Formatting Definition

Constrain what formatting is available:

```swift
struct MyTextFormatting: AttributedTextFormattingDefinition {
    typealias Scope = AttributeScopes.SwiftUIAttributes
    // Define constraints on allowed fonts, colours, styles
}

TextEditor(text: $text, selection: $selection)
    .textFormattingDefinition(MyTextFormatting.self)
```

## AttributedString Properties

```swift
var text = AttributedString("Styled")
text.font = .headline
text.foregroundColor = .blue
text.backgroundColor = .yellow
text.underlineStyle = .single
text.underlineColor = .red
text.strikethroughStyle = .single
text.strikethroughColor = .green
text.inlinePresentationIntent = .stronglyEmphasized  // Bold
text.inlinePresentationIntent = .emphasized           // Italic
```

## Text Alignment & Layout

```swift
text.alignment = .center  // .left, .right, .center

text.lineHeight = .exact(points: 32)
text.lineHeight = .multiple(factor: 2.5)
text.lineHeight = .loose

text.writingDirection = .leftToRight
text.writingDirection = .rightToLeft
```

## DiscontiguousAttributedSubstring

Work with non-contiguous selections:

```swift
let range1 = text.range(of: "first")!
let range2 = text.range(of: "second")!
let rangeSet = RangeSet([range1, range2])
var substring = text[rangeSet]
substring.backgroundColor = .yellow

// Convert back
let combined = AttributedString(substring)
```

## Markdown in Text Views

```swift
Text("This is **bold** and *italic* text")
Text("Visit [Apple](https://www.apple.com)")

// With AttributedString
Text(AttributedString("Styled in SwiftUI"))
```

**Markdown limitations:** No line breaks, lists, block quotes, code blocks, tables, or images.

## Complete Example

```swift
struct RichTextEditor: View {
    @State private var text: AttributedString = "Edit me..."
    @State private var selection = AttributedTextSelection()
    @Environment(\.fontResolutionContext) private var ctx

    var body: some View {
        VStack {
            TextEditor(text: $text, selection: $selection)

            HStack {
                Button("B") { toggleBold() }.bold()
                Button("I") { toggleItalic() }.italic()
                Button("U") { toggleUnderline() }.underline()
                ColorPicker("", selection: colorBinding)
            }
        }
    }

    private func toggleBold() {
        text.transformAttributes(in: &selection) {
            let font = $0.font ?? .default
            $0.font = font.bold(!font.resolve(in: ctx).isBold)
        }
    }

    private func toggleItalic() {
        text.transformAttributes(in: &selection) {
            let font = $0.font ?? .default
            $0.font = font.italic(!font.resolve(in: ctx).isItalic)
        }
    }

    private func toggleUnderline() {
        text.transformAttributes(in: &selection) {
            $0.underlineStyle = ($0.underlineStyle != nil) ? nil : .single
        }
    }

    private var colorBinding: Binding<Color> {
        Binding(
            get: { selection.typingAttributes(in: text).foregroundColor ?? .primary },
            set: { color in
                text.transformAttributes(in: &selection) { $0.foregroundColor = color }
            }
        )
    }
}
```
