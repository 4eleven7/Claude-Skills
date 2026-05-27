# UI Implementation Checklist

Use this before merging SwiftUI work.

- The view follows `Documentation/system/swiftui-view-guidelines.md`
- `body` is pure and cheap
- Expensive sorting, filtering, grouping, and formatter work is outside `body`
- View identity is stable
- Repeated rows or cards do not observe broad shared state unnecessarily
- State ownership is explicit and uses the narrowest sensible owner
- `onAppear` and `onDisappear` are justified, idempotent, and not standing in for startup or model lifecycle
- Previews exist only where they add real signal
- Preview data is deterministic and lightweight
- Interactive controls have accessibility labels
- UI changes preserve important existing interaction patterns unless the spec explicitly changes them
- Colours use semantic names or shared palette, not inline hex — see `swiftui-design-quality.md`
- Spacing varies intentionally between semantic levels (section > group > element)
- Typography hierarchy uses weight and colour, not just size
- All interactive states covered (loading, empty, error, pressed)
- Verification covers the actual risk: targeted tests, build, and manual checks as needed
