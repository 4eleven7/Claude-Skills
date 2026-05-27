---
name: swiftui-mastery
description: Comprehensive SwiftUI skill covering state management, view composition, performance, polish, accessibility, navigation, and iOS 26+ Liquid Glass. Use when building, reviewing, improving, or refactoring any SwiftUI code.
type: super-skill
---

# SwiftUI Mastery

## Responsibility

**Owns:** SwiftUI view code — state management, composition, layout, animation, polish, performance, accessibility, navigation, sheets, lists, scrolling, Liquid Glass adoption, and design quality.

**Does NOT own:** Business logic, networking, persistence (SwiftData/Core Data), Swift concurrency patterns, CI/CD, or App Store submission. Delegate those to domain-specific skills.

## Core Principles

- **Body is a cheap, pure description.** No side effects, no formatters, no sorting, no filtering, no `UUID()` allocation. If it needs a test, it does not belong in `body`.
- **Minimise invalidation scope.** Read only the properties a view needs. Pass narrow values, not whole clients. Use per-item `@Observable` state in lists.
- **Stable identity preserves state.** Use domain IDs in `ForEach`, never `.indices` for dynamic data. Prefer modifier changes over conditional view swapping.
- **State ownership is explicit.** `@State` is `private` and view-local. `@Binding` only when a child writes. `let` for read-only. `@Environment` at container boundaries.
- **Prefer MV over MVVM.** Views orchestrate; models and services own logic. Favour `@State`, `@Environment`, `.task`, `.onChange` for coordination.
- **Extract subviews to narrow dependencies, not to satisfy aesthetics.** Extract when a child has a distinct job, can take narrow inputs, or needs its own preview. Keep tightly coupled markup in the same file.
- **Polish compounds.** Concentric corner radii, staggered entrances, scale-on-press 0.96, `bounce: 0` springs, `.monospacedDigit()`, layered shadows — details that separate good from great.
- **Accessibility is not optional.** `Button` over `onTapGesture`, `@ScaledMetric` for custom values, 44pt minimum hit areas, `ContentUnavailableView` for empty states.
- **Use modern APIs.** `@Observable` over `ObservableObject`, `navigationDestination(for:)` over `NavigationLink(destination:)`, `foregroundStyle` over `foregroundColor`, `.task` over `onAppear` for async work.
- **Reference-first for iOS 26+ APIs.** Liquid Glass, WebView, styled TextEditor, and advanced toolbar APIs may post-date training data. Always consult the relevant reference file before writing or reviewing iOS 26+ code — never rely on model knowledge alone.
- **Spacing is semantic.** Use the scale (4, 8, 12, 16, 24, 32). Section gaps > group gaps > element gaps. No uniform padding everywhere.

## Workflow Decision Tree

### 1) Review existing SwiftUI code
1. Check property wrapper usage → `references/state-management.md`
2. Check view composition and structure → `references/composition-and-structure.md`
3. Check performance patterns → `references/performance.md`
4. Check navigation and sheet wiring → `references/navigation-and-sheets.md`
5. Check list and scroll patterns → `references/list-and-scroll.md`
6. Check accessibility → `references/accessibility-patterns.md`
7. Check animation and polish → `references/polish-and-animation.md`
8. Check design quality (AI tells, spacing, typography) → `references/design-quality.md`
9. Check Liquid Glass usage (if iOS 26+) → `references/liquid-glass.md`
10. Check WebKit integration (if embedding web content) → `references/webkit-integration.md`
11. Check rich text editing patterns (if using TextEditor + AttributedString) → `references/styled-text-editing.md`
12. Check advanced toolbar features (if customizable toolbars) → `references/toolbar-advanced.md`
13. Run against the Review Checklist below

### Preview Generation
16. Write previews with correct context and data → `references/preview-patterns.md`

### 2) Improve existing SwiftUI code
1. Replace deprecated APIs with modern equivalents → `references/api-modernization.md`
2. Audit state management for correct wrapper selection → `references/state-management.md`
3. Extract complex views, stabilise view tree → `references/composition-and-structure.md`
4. Move expensive work out of `body` → `references/performance.md`
5. Add polish: concentric radii, shadows, stagger, content transitions → `references/polish-and-animation.md`
6. Fix design quality issues (spacing, colour, typography, AI slop) → `references/design-quality.md`
7. Plan and add purposeful animation → `references/animation-strategy.md`
8. Improve UX copy (errors, empty states, labels) → `references/microcopy.md`
9. Add delight moments (haptics, celebrations, personality) → `references/delight.md`
10. Harden for edge cases (extreme content, lifecycle, i18n) → `references/hardening.md`
11. Add accessibility where missing → `references/accessibility-patterns.md`

### 3) Implement new SwiftUI feature
1. Design data flow first: who owns each piece of state → `references/state-management.md`
2. Structure views with container/rendering split → `references/composition-and-structure.md`
3. Choose navigation pattern → `references/navigation-and-sheets.md`
4. Wire lists and scrolling → `references/list-and-scroll.md`
5. Plan animation strategy (layers, hero moment, feedback) → `references/animation-strategy.md`
6. Add animations and polish from the start → `references/polish-and-animation.md`
7. Write quality UX copy (errors, empty states, buttons) → `references/microcopy.md`
8. Add delight moments (haptics, symbol effects, celebrations) → `references/delight.md`
9. Apply design quality constraints (AI slop test, intensity) → `references/design-quality.md`
10. Harden for edge cases (extreme content, i18n, lifecycle) → `references/hardening.md`
11. Build with accessibility in mind → `references/accessibility-patterns.md`
12. Gate iOS 26+ features with `#available` → `references/liquid-glass.md`
13. If embedding web content → `references/webkit-integration.md`
14. If rich text editing → `references/styled-text-editing.md`
15. If advanced toolbar customization → `references/toolbar-advanced.md`

## Quick Reference

### Property Wrapper Selection
| Wrapper | Use When |
|---------|----------|
| `@State private` | View-local state (value types or `@Observable` classes the view owns) |
| `@Binding` | Child needs to **modify** parent's state |
| `@Bindable` | iOS 17+: injected `@Observable` needing bindings |
| `let` | Read-only value from parent |
| `var` + `.onChange()` | Read-only value the child reacts to |
| `@Environment` | Shared state or system values at container boundaries |
| `@StateObject` | Legacy: view owns an `ObservableObject` |
| `@ObservedObject` | Legacy: view receives an `ObservableObject` |

### Modern API Replacements
| Deprecated | Modern |
|------------|--------|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` |
| `NavigationLink(destination:)` | `navigationDestination(for:)` |
| `foregroundColor()` | `foregroundStyle()` |
| `.animation(.default)` | `.animation(_:value:)` |
| `ObservableObject` + `@Published` | `@Observable` |
| `@StateObject` | `@State` with `@Observable` |
| `@EnvironmentObject` | `@Environment(MyType.self)` |
| `onAppear` (async work) | `.task` / `.task(id:)` |
| `GeometryReader` (size only) | `onGeometryChange` / `containerRelativeFrame()` |
| `UIScreen.main.bounds` | `containerRelativeFrame()` / `visualEffect()` |
| `Binding(get:set:)` in body | `@State` + `.onChange()` |

### View Ordering Convention (top to bottom)
1. `@Environment` properties
2. `private` / `public` `let`
3. `@State` / other stored properties
4. Computed `var` (non-view)
5. `init`
6. `body`
7. Computed view builders / view helpers
8. Helper / async functions

## Review Checklist

### State Management
- [ ] `@State` properties are `private`
- [ ] `@Binding` only where child modifies parent state
- [ ] iOS 17+: `@Observable` with `@State`, `@Bindable` for injected
- [ ] `@Observable` classes marked `@MainActor` (unless default isolation)
- [ ] `@ObservationIgnored` on property wrappers inside `@Observable`
- [ ] Passed values NOT declared as `@State`
- [ ] No `Binding(get:set:)` in view body — use `.onChange()` instead

### View Structure
- [ ] `body` is pure and cheap — no side effects or heavy work
- [ ] Complex views extracted to subviews with narrow inputs
- [ ] No top-level `if/else` branch swapping — use modifiers
- [ ] Container views use `@ViewBuilder let content: Content`
- [ ] `.compositingGroup()` before `.clipShape()` on layered views
- [ ] Action handlers reference methods, not inline logic
- [ ] Files >300 lines split with extensions and `// MARK:` comments

### Performance
- [ ] No formatters, sorting, filtering, or grouping in `body`
- [ ] Passing only needed values (not large config objects)
- [ ] State updates check for value changes before assigning
- [ ] No object creation in `body`
- [ ] `LazyVStack`/`LazyHStack` for large lists
- [ ] ForEach uses stable identity (not `.indices`)
- [ ] No inline filtering in ForEach
- [ ] No `AnyView` in list rows

### Navigation & Sheets
- [ ] `navigationDestination(for:)` not `NavigationLink(destination:)`
- [ ] `sheet(item:)` preferred over `sheet(isPresented:)` for model data
- [ ] Sheets own their actions and dismiss internally
- [ ] One `NavigationStack` per tab for independent history

### Polish & Animation
- [ ] Nested rounded elements use concentric radii (`outer = inner + padding`)
- [ ] `.continuous` corner style on all `RoundedRectangle`
- [ ] Springs use `bounce: 0` for UI controls
- [ ] `.animation(_:value:)` — never without `value:`
- [ ] Scale-on-press uses `0.96`, never below `0.95`
- [ ] Dynamic numbers use `.monospacedDigit()`
- [ ] Enter animations staggered ~100ms between groups
- [ ] Exit animations shorter and subtler than enter
- [ ] Interactive elements have 44pt minimum hit area
- [ ] Shadows used for depth (not borders), except dividers

### Design Quality
- [ ] Colours use semantic names or shared palette, not inline hex
- [ ] Spacing varies by semantic level (section > group > element)
- [ ] Typography hierarchy uses weight + colour, not size alone
- [ ] All interactive states covered (loading, empty, error, pressed)
- [ ] `ContentUnavailableView` for empty states
- [ ] Previews use `#Preview` macro, not `PreviewProvider`
- [ ] `@Previewable @State` for bindings, not wrapper views
- [ ] Previews wrapped in correct container (NavigationStack for toolbar views, List for row views)
- [ ] Preview data is realistic and varied
- [ ] No filler copy ("Elevate", "Seamless", "Next-Gen")
- [ ] Passes the AI Slop Test (not immediately identifiable as AI-generated)

### Microcopy
- [ ] Error messages explain what happened AND what to do
- [ ] Empty states use `ContentUnavailableView` with guidance and action
- [ ] Button labels use specific verbs, not "OK/Submit/Continue"
- [ ] Confirmation dialogs name the item and consequence
- [ ] Accessibility labels describe actions/meaning, not icons
- [ ] Consistent terminology throughout

### Delight
- [ ] Significant user actions have appropriate haptic feedback
- [ ] SF Symbol effects used for state changes
- [ ] At most one delight moment per screen
- [ ] Celebrations scaled to significance (haptic only → visual → full)

### Hardening
- [ ] All `Text` views handle empty, short, and very long strings
- [ ] Tested at Dynamic Type `.accessibility5` and `.xSmall`
- [ ] Every async operation has loading, loaded, and error states
- [ ] Buttons disabled during async operations
- [ ] Tested in dark mode and RTL layout

### Accessibility
- [ ] `Button` over `onTapGesture` for tappable elements
- [ ] `@ScaledMetric` for custom values scaling with Dynamic Type
- [ ] Related elements grouped with `accessibilityElement(children:)`
- [ ] Custom controls use `accessibilityRepresentation`
- [ ] Buttons with icons include text labels for VoiceOver

### Liquid Glass (iOS 26+)
- [ ] `#available(iOS 26, *)` with material fallback
- [ ] `GlassEffectContainer` wraps grouped glass elements
- [ ] `.glassEffect()` applied after layout/appearance modifiers
- [ ] `.interactive()` only on tappable/focusable elements
- [ ] Consistent shapes and tints across related elements

## References

- `references/state-management.md` — Property wrappers, MV pattern, data flow, view ordering
- `references/composition-and-structure.md` — Container/rendering split, extraction rules, file splitting, UIViewRepresentable
- `references/animation-strategy.md` — When to animate, animation layers, planning checklist, timing reference
- `references/animation-advanced.md` — Transactions, keyframes, Animatable protocol, custom transitions, completion handlers
- `references/polish-and-animation.md` — Concentric radii, shadows, stagger, springs, scale-on-press, pre-ship checklist
- `references/microcopy.md` — Error messages, empty states, button labels, confirmation dialogs, accessibility labels
- `references/delight.md` — Haptics, SF Symbol effects, celebrations, milestones, contextual personality
- `references/hardening.md` — Extreme content, Dynamic Type, i18n, lifecycle, state edge cases
- `references/performance.md` — Code smells, Equatable/POD views, skeleton loading, diagnostic workflow, Instruments guidance
- `references/api-modernization.md` — Deprecated-to-modern API transitions by iOS version (15+, 16+, 17+, 18+, 26+)
- `references/navigation-and-sheets.md` — NavigationStack, sheets, deep linking, coordinator patterns
- `references/list-and-scroll.md` — ForEach identity, lazy loading, scroll patterns, pagination
- `references/accessibility-patterns.md` — Button over tap, ScaledMetric, grouping, VoiceOver
- `references/liquid-glass.md` — Native APIs, GlassEffectContainer, modifier ordering, availability
- `references/design-quality.md` — AI tells, spacing vocabulary, typography hierarchy, visual density, AI slop test, design intensity
- `references/preview-patterns.md` — #Preview macro, @Previewable, contextual embedding, sample data
- `references/adaptive-layout.md` — ViewThatFits, AnyLayout, onGeometryChange, containerRelativeFrame, size class truth table
- `references/component-patterns.md` — Sheet routing, scroll-reveal, tab architecture, app wiring
