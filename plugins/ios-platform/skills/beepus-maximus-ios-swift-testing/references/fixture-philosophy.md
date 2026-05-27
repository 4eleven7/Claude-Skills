# Fixture Philosophy

The goal is predictable behaviour, easy debugging, and low-noise setup.

## Determinism Rules

Prefer deterministic data over generated randomness in all test and preview contexts.

### Fixed dates

Use fixed dates when date logic matters. Never rely on `Date()` or `Date.now` in assertions.

```swift
// Bad -- non-deterministic
let entry = Entry(date: Date())

// Good -- fixed and explicit
let entry = Entry(date: Date(timeIntervalSince1970: 1_700_000_000))
```

### Explicit calendars, locales, and time zones

Set these explicitly when boundary logic matters. Never rely on the device's current settings.

```swift
// Bad -- depends on device locale/calendar/timezone
let formatted = date.formatted()

// Good -- explicit and reproducible
var calendar = Calendar(identifier: .gregorian)
calendar.timeZone = TimeZone(identifier: "UTC")!
calendar.locale = Locale(identifier: "en_US_POSIX")
let startOfDay = calendar.startOfDay(for: fixedDate)
```

### Fixed UUIDs

Use fixed UUIDs when identity or ordering matters. Never use `UUID()` in test data where the UUID drives assertions or sort order.

```swift
// Bad -- random each run
let item = Item(id: UUID(), name: "Widget")

// Good -- fixed and inspectable
let item = Item(id: UUID(uuidString: "00000000-0000-0000-0000-000000000001")!, name: "Widget")
```

### Minimum viable fixtures

Keep fixtures as small as possible while still proving the behaviour. Do not construct rich objects when a simple literal suffices.

## Preview Data

- Keep preview data lightweight
- Do not hit network, HealthKit, or app boot code from previews
- Prefer direct sample values or `.mock` / `.mockList`
- Preview only the major visual states that matter
- If a preview truly needs persistence, keep it in-memory and preview-local

## Test Fixtures

- Place fixtures close to the tests that use them unless there is real shared reuse
- Prefer explicit literals when they make the assertion clearer
- Use builders only when raw literals become noisy
- Keep fixture helpers deterministic by default
- Use in-memory persistence for integration tests unless the test specifically needs something narrower

## Deterministic Mocks

- Make synthetic data obviously synthetic -- use clearly fake names, dates, and values that cannot be confused with real data
- Do not hide important defaults -- if a default value drives behaviour, make it visible at the call site
- Keep the values that drive assertions explicit -- the reader should see why the assertion passes or fails without jumping to a factory
- Use named fixtures for scenario-level meaning, not vague `sample1`, `sample2`

```swift
// Bad -- vague, hides what matters
let sample1 = makeMeal()
let sample2 = makeMeal()

// Good -- scenario is clear from the name
let breakfastWithHighProtein = Meal(name: "Eggs and bacon", protein: 35, calories: 450)
let dinnerLowCalorie = Meal(name: "Garden salad", protein: 8, calories: 150)
```

## Dev-View Data

- Seed only the data needed to exercise the feature
- Make reset behaviour explicit
- Keep debug-only data and helpers inside debug-only code
- If the dev-view runs inside the app, use the app's existing client or context
- Use isolated in-memory containers only when no app-owned container exists in that flow

## Reuse Threshold

Do not build shared fixture infrastructure for one caller.

Extract shared fixtures only when:

- Multiple tests or previews need the same scenario
- The shared helper stays simpler than repeating the literals

**Rationale:** Premature abstraction in test helpers makes tests harder to read. A test that constructs its own data inline is self-documenting. Extract only when duplication creates a real maintenance burden across 2+ call sites.
