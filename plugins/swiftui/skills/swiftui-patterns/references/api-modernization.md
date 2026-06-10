# API Modernization

Deprecated-to-modern API transitions organized by iOS version. When writing new code, use the modern form. When reviewing, flag deprecated usage.

## iOS 15+

| Deprecated | Modern | Notes |
|---|---|---|
| `UIApplication.shared.setAlternateIconName` | `async` variant with `throws` | Use `try await` |
| `.onAppear { Task { } }` | `.task { }` | Auto-cancels on disappear |
| `@AppStorage` with RawRepresentable enum | Conforms automatically in iOS 15 | No manual RawRepresentable needed |
| `AttributedString` via NSAttributedString | `AttributedString` natively | Use `Text(attributedString)` |
| `UIApplication.shared.open(url)` | `await UIApplication.shared.open(url)` | Async open |

## iOS 16+

| Deprecated | Modern | Notes |
|---|---|---|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` | Value-based, programmatic |
| `NavigationLink(destination:)` | `NavigationLink(value:)` + `navigationDestination(for:)` | Decouples link from destination |
| `List { ForEach { NavigationLink { } } }` | `List(selection:)` + `navigationDestination` | Single selection natively |
| `.toolbar { ToolbarItem(placement:) }` | `.toolbar(removing:)` (16.0) | Remove default toolbar items |
| `GeometryReader` for available size | `containerRelativeFrame()` | No layout disruption |
| Custom `LabeledContent` wrappers | `LabeledContent("Label") { value }` | Built-in label-value pair |
| Manual form validation | `.disabled()` + `@FocusState` | Combine with `onSubmit` |
| `ShareSheet` via UIActivityViewController | `ShareLink` | Native SwiftUI sharing |
| Manual photo picker | `PhotosPicker` | HealthKit-style privacy picker |
| Custom gauge views | `Gauge` | Linear, circular, accessory styles |

## iOS 17+

| Deprecated | Modern | Notes |
|---|---|---|
| `ObservableObject` + `@Published` | `@Observable` macro | Finer-grained tracking |
| `@StateObject` | `@State` (with `@Observable`) | View owns the observable |
| `@ObservedObject` | Direct property (with `@Observable`) | No wrapper needed for read-only |
| `@EnvironmentObject` | `@Environment(MyType.self)` | Type-based environment |
| `@Published` property declaration | Just `var` inside `@Observable` | Automatic tracking |
| `.animation(.default)` | `.animation(.default, value:)` | Explicit value binding |
| `withAnimation { }` (unscoped) | `withAnimation(.spring) { }` | Always specify curve |
| `onChange(of:) { newValue in }` | `onChange(of:) { oldValue, newValue in }` | Two-parameter closure |
| `onReceive(publisher)` | `.onChange(of:)` with `@Observable` | No Combine needed |
| `GeometryReader` (reading size) | `onGeometryChange(for:of:action:)` | Non-disruptive geometry reading |
| `UIScreen.main.bounds` | `containerRelativeFrame()` / `visualEffect` | No global screen reference |
| `Binding(get:set:)` in body | `@Bindable` on `@Observable` | Direct binding creation |
| Manual scroll-to with `ScrollViewReader` | `scrollPosition(id:)` | Declarative scroll position |
| `fullScreenCover(isPresented:)` for data | `fullScreenCover(item:)` | Item-based presentation |
| `.foregroundColor()` | `.foregroundStyle()` | Accepts any ShapeStyle |
| `.background(Color.x)` | `.background(.x)` or `.background { }` | ShapeStyle or view builder |
| Custom sensory feedback | `.sensoryFeedback(.impact, trigger:)` | Declarative haptics |
| Manual `#Preview` with `PreviewProvider` | `#Preview { }` macro | Simplified preview syntax |
| `@FetchRequest` (SwiftData) | `@Query` | SwiftData native query |
| `.searchable` with manual tokens | `.searchable(tokens:)` | Built-in token support |

## iOS 18+

| Deprecated | Modern | Notes |
|---|---|---|
| Manual tab bar with selection | `TabView` with `Tab("Title", systemImage:)` | Typed tab construction |
| `TabView` without explicit tabs | `Tab` struct with value | Programmatic tab switching |
| Custom mesh/gradient backgrounds | `MeshGradient` | Hardware-accelerated mesh |
| Manual zoom transitions | `.navigationTransition(.zoom)` | System zoom transition |
| `matchedGeometryEffect` for hero | `.matchedTransitionSource` + `.navigationTransition` | Unified hero transitions |
| Custom floating text field labels | `.writingToolsBehavior(.complete)` | System writing tools |
| Manual entry animation delays | `ForEach(...).animation` with `initialVelocity` | Per-item entry |

## iOS 26+

| Deprecated | Modern | Notes |
|---|---|---|
| Custom blur/material backgrounds | `.glassEffect()` | Liquid Glass material |
| Manual translucency effects | `GlassEffectContainer` + `.glassEffect()` | Grouped glass elements |
| `UIBlurEffect` via representable | `.glassEffect()` | Native SwiftUI glass |
| `.thinMaterial` / `.ultraThinMaterial` | `.glassEffect()` with tint | Liquid Glass replaces most materials |
| `@available(iOS 26, *)` checks | Direct usage (when min target is 26) | No availability needed |
| `ToolbarItem(placement: .bottomBar)` | `BottomBar { }` | Dedicated bottom bar API |
| Custom date/time picker sheets | Inline pickers with glass | System glass integration |

## Migration Strategy

### Priority Order

1. **Navigation** — `NavigationStack` migration unblocks deep linking and state restoration
2. **Observation** — `@Observable` reduces boilerplate and improves performance
3. **Environment** — `@Environment(Type.self)` aligns with `@Observable`
4. **Modifiers** — `foregroundStyle`, `background { }` are drop-in replacements
5. **Presentation** — `sheet(item:)`, `fullScreenCover(item:)` are safer than `isPresented`
6. **Glass** — Liquid Glass adoption when targeting iOS 26+

### Migration Rules

- Migrate one pattern at a time, not the whole file
- Update tests alongside API changes
- Do not mix `ObservableObject` and `@Observable` in the same view hierarchy — pick one per feature
- When migrating `@StateObject` to `@State` + `@Observable`, verify the view still owns the lifecycle
- `@Observable` classes need `@MainActor` when they touch UI state
