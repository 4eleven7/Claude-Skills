<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name where applicable. -->

# Modern API Guidelines

## Purpose

Prefer modern Apple APIs and language features when they make [YourApp] code simpler, clearer, or safer.

Do not churn working code just to look modern. But do not write new code against stale APIs by default either.

## Swift And Foundation

- Prefer Swift concurrency over GCD for new async work
- Prefer `FormatStyle` display formatting over legacy formatter classes in normal app code
- Prefer `.formatted(...)` over `String(format:)` for user-facing numeric text
- Prefer Swift-native string APIs such as `replacing(_:with:)` where they express the intent clearly
- Prefer `URL.documentsDirectory` and `appending(path:)` over older path-building patterns
- Prefer `localizedStandardContains()` for user-input filtering
- Prefer static member lookup where Swift makes it clear and concise

Use legacy formatter classes or older APIs only when:

- an API explicitly requires them
- a cached formatter object is the correct performance tool
- the modern alternative is materially worse for the job

## SwiftUI

- Prefer `foregroundStyle()` over `foregroundColor()` for new code
- Prefer `clipShape(.rect(cornerRadius:))` over `cornerRadius()`
- Prefer the modern `Tab` API over `tabItem()`
- Do not use the deprecated one-parameter `onChange`
- Prefer `Button` over `onTapGesture()` for interactive controls
- Buttons with images still need explicit text for accessibility
- Prefer `Task.sleep(for:)` over nanosecond-based sleep APIs
- Do not reach for `UIScreen.main.bounds`; use layout-relative APIs
- Prefer `.bold()` over `fontWeight(.bold)` when it expresses the same thing
- Prefer `.scrollIndicators(.hidden)` over older indicator flags
- Prefer `containerRelativeFrame()` and `visualEffect()` when they replace `GeometryReader` cleanly
- Prefer modern scroll APIs such as `ScrollPosition` and `defaultScrollAnchor` when they fit

## Rule

When a modern API exists and is the better fit, use it. When it is not the better fit, say why and use the older API intentionally instead of cargo-culting the new one.

## Related Docs

- `Documentation/system/swift-coding-guidelines.md`
- `Documentation/system/swiftui-view-guidelines.md`
