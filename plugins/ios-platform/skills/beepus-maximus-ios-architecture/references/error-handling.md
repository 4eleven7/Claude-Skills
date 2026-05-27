# Error Handling

## Typed Throws

Use typed throws for domain errors:

```swift
enum SleepError: Error, LocalizedError {
    case invalidDuration
    case trackingAlreadyActive
}

func startTracking() throws(SleepError) {
    guard !isTracking else {
        throw .trackingAlreadyActive
    }
}
```

Use untyped `throws` only when the caller does not benefit from a concrete error type:

- Forwarding an external framework error unchanged
- Wrapping multiple unrelated error domains at a boundary
- Low-level glue where the domain-specific type would add noise without better handling

## Domain-Specific Error Types

- Use a dedicated error enum per feature or subsystem when the caller can react meaningfully.
- Add `LocalizedError` only when user-facing or developer-facing descriptions matter.
- Do not collapse everything into generic `Error` too early.
- Do not silently swallow errors.

```swift
enum ServiceError: LocalizedError, Sendable {
    case operationFailed(String)

    var errorDescription: String? {
        switch self {
        case .operationFailed(let msg): return "Operation failed: \(msg)"
        }
    }
}
```

## UI Error Presentation

Views should present typed, already-classified errors. They should not classify raw infrastructure errors inline during rendering.

Pattern:

1. Client or coordinator maps infrastructure failures to domain errors.
2. View stores `@State private var error: FeatureError?`.
3. View presents that typed error explicitly.

```swift
// In the client:
func load() async throws(ProfileError) {
    do {
        items = try await repository.fetchAll()
    } catch {
        throw .dataLoadFailed
    }
}

// In the view:
@State private var error: ProfileError?

var body: some View {
    ContentView()
        .task {
            do {
                try await profile.load()
            } catch {
                self.error = error
            }
        }
}
```

## Debug Descriptions

Add `@DebugDescription` and `CustomDebugStringConvertible` to:

- Domain value types
- SwiftData model types
- Error types with associated values
- Enums with associated values where default output is poor

Skip it for:

- Trivial enums without associated values
- Types where the default debug output is already sufficient

### Best Practices

- Put the identifying value first.
- Truncate UUIDs where full output adds noise.
- Keep descriptions concise but useful.
- Include the state that actually helps debug the type.

```swift
@DebugDescription
struct SleepSession: CustomDebugStringConvertible {
    let id: UUID
    let startTime: Date
    let endTime: Date?

    var debugDescription: String {
        "SleepSession(id: \(id.uuidString.prefix(8)), start: \(startTime), end: \(endTime?.description ?? "nil"))"
    }
}
```

## Debugging Philosophy

### Preserve valid source data

When output looks wrong, challenge the app's interpretation, reconciliation, and presentation logic before deleting or filtering upstream records. Treating valid upstream data as bad data hides the real bug and destroys future product value. Default to preserving source data and fixing the interpretation layer.

### Verify blockers against live state

Before remediating or reporting a build or runtime blocker, re-read the current source file and verify the offending code still exists in the live workspace. In a dirty workspace, failures can come from stale state or already-removed lines.

## Debugger Breakpoints

Prefer Xcode breakpoints and structured debug logging over source-level trap calls.

- Use normal or conditional breakpoints in Xcode when you need execution to pause.
- Use symbolic breakpoints for framework or runtime entry points.
- Add temporary `logger.debug` or `debugDescription` output when you need state captured without stopping the process.

Do not leave source-level trap calls in production code. They turn debugging helpers into startup or runtime crashes when the wrong build or environment hits them.
