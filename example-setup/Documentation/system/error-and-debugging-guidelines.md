<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name and swap example error/model names to match your domain. -->

# Error And Debugging Guidelines

## Purpose

Define how [YourApp] models errors and debug output.

The goal is predictable failure handling, typed call sites, and useful debugging output in console logs, `po`, and crash reports.

## Error Handling

### Prefer typed throws

Use typed throws for domain errors:

```swift
enum OrderError: Error, LocalizedError {
    case invalidQuantity
    case alreadySubmitted
}

func submit() throws(OrderError) {
    guard !isSubmitted else {
        throw .alreadySubmitted
    }
}
```

Use untyped `throws` only when the caller does not benefit from a concrete error type, such as:

- forwarding an external framework error unchanged
- wrapping multiple unrelated error domains at a boundary
- low-level glue where the domain-specific type would add noise without better handling

### Prefer domain-specific error types

- Use a dedicated error enum per feature or subsystem when the caller can react meaningfully
- Add `LocalizedError` only when user-facing or developer-facing descriptions matter
- Do not collapse everything into generic `Error` too early
- Do not silently swallow errors

### UI error presentation

Views should present typed, already-classified errors. They should not classify raw infrastructure errors inline during rendering.

Prefer:

- client or coordinator maps infrastructure failures to domain errors
- view stores `@State private var error: FeatureError?`
- view presents that typed error explicitly

## Debug Descriptions

Add `@DebugDescription` and `CustomDebugStringConvertible` to:

- domain value types
- SwiftData model types
- error types with associated values
- enums with associated values where default output is poor

Skip it for:

- trivial enums without associated values
- types where the default debug output is already sufficient

### Best Practices

- Put the identifying value first
- Truncate UUIDs where full output adds noise
- Keep descriptions concise but useful
- Include the state that actually helps debug the type
- Format dates consistently

Example:

```swift
@DebugDescription
struct Order: CustomDebugStringConvertible {
    let id: UUID
    let createdAt: Date
    let total: Decimal

    var debugDescription: String {
        "Order(id: \(id.uuidString.prefix(8)), created: \(createdAt), total: \(total))"
    }
}
```

## Debugger Breakpoints

Prefer Xcode breakpoints and structured debug logging over source-level trap calls.

Useful options:

- set a normal or conditional breakpoint in Xcode when you need execution to pause
- use symbolic breakpoints for framework or runtime entry points
- add temporary `logger.debug` or `debugDescription` output when you need state captured without stopping the process

Do not leave source-level trap calls in [YourApp] code or documentation. They are fragile, easy to forget, and they turn debugging helpers into startup or runtime crashes when the wrong build or environment hits them.

## Debugging Philosophy

### Preserve valid source data

When output looks wrong, challenge [YourApp]'s interpretation, reconciliation, and presentation logic before deleting or filtering upstream records. Treating valid upstream data as bad data hides the real bug and destroys future product value. Default to preserving source data and fixing the interpretation layer.

### Verify blockers against live state

Before remediating or reporting a build or runtime blocker, re-read the current source file and verify the offending code still exists in the live workspace. In a dirty workspace, failures can come from stale state or already-removed lines. If the blocker is a symbol or call site, run a fresh repo search before treating it as the reason verification is blocked.

## Related Docs

- `Documentation/system/swift-coding-guidelines.md`
- `Documentation/system/swiftui-view-guidelines.md`
