# Core Patterns

## Struct-Based Suites

Prefer structs over classes for test suites. Use `init()` for setup instead of `setUp()`/`tearDown()`.

```swift
struct PlayerTests {
    let sut: Player

    init() {
        sut = Player(name: "Natsuki Subaru")
    }

    @Test func nameIsCorrect() {
        #expect(sut.name == "Natsuki Subaru")
    }
}
```

- Any type containing `@Test` methods is automatically a test suite. Only add `@Suite` when you need a display name or traits, e.g. `@Suite(.tags(.networking))`.
- All test suite initialisers must accept no parameters.
- Suite initialisers can be marked `async` and/or `throws`.
- You do not need to prefix test methods with `test`. Use `userCanLogOut()` rather than `testUserCanLogOut()`.

## @available

`@available` is supported on individual tests but NOT on test suites. Place it on each test individually.

## Assertions

### #expect

Use `#expect` for assertions. Never use `!` to negate Booleans -- it defeats macro expansion.

```swift
// Bad -- unhelpful failure message
#expect(!isLoggedIn)

// Good -- proper macro expansion
#expect(isLoggedIn == false)
```

Add user-facing messages to `#expect` and `#require` when they provide value:

```swift
#expect(viewModel.names.isEmpty == false, "Names should be full of values.")
```

### #require

Use `#require` for preconditions that must be true before the test is meaningful. It throws on failure, stopping the test immediately.

```swift
@Test func outstandingTasksStringIsPlural() throws {
    let sut = try createTestUser(projects: 3, itemsPerProject: 10)
    try #require(sut.projects.isEmpty == false)
    let rowTitle = sut.outstandingTasksString
    #expect(rowTitle == "30 items")
}
```

`#require` also unwraps optionals:

```swift
let value = try #require(someOptional)
```

### Testing throws

Use `do`/`try`/`catch` with `Issue.record()` for fine-grained error assertions:

```swift
@Test func playingMinecraftThrows() {
    do {
        try game.play()
        Issue.record("Expected an error to be thrown.")
    } catch GameError.notPurchased {
        // success
    } catch {
        Issue.record("Wrong error thrown: \(error)")
    }
}
```

Or use `#expect(throws:)` with a specific error, never broad `Error.self`:

```swift
#expect(throws: GameError.notInstalled) {
    try game.play()
}
```

Assert no throw with `Never.self`:

```swift
#expect(throws: Never.self) {
    try game.play()
}
```

### Return errors from #expect(throws:) (Swift 6.1+)

`#expect(throws:)` and `#require(throws:)` return the thrown error for further validation:

```swift
@Test func playGameAtNight() {
    let error = #expect(throws: GameError.self) {
        try playGame(at: 22)
    }
    #expect(error == .disallowedTime)
}
```

The old trailing-closure form `#expect { ... } throws: { ... }` is deprecated.

## Parameterised Tests

Parameterised tests take at most two argument collections. Two collections form a Cartesian product, not pairwise zipping. For pairwise zipping, use `zip(collection1, collection2)`.

```swift
@Test(arguments: [
    (32, 0), (212, 100), (-40, -40),
])
func fahrenheitToCelsius(values: (input: Double, output: Double)) {
    // test code here
}
```

## withKnownIssue

Wraps code with a known bug. Expects a test failure to occur and fails the test if no issue is recorded.

```swift
withKnownIssue("Bug #42: sorting broken for empty arrays") {
    #expect(sorted == expected)
}
```

Adding `isIntermittent: true` passes if no issue is recorded but marks an expected failure if one occurs.

## Tags

Define custom tags:

```swift
extension Tag {
    @Tag static var networking: Self
}
```

Apply with `@Test(.tags(.networking))` on tests or `@Suite(.tags(.networking))` on suites.

## Raw Identifiers (Swift 6.2+)

Use backtick-quoted natural-language function names instead of camelCase with a separate string:

```swift
@Test
func `Strip HTML tags from string`() {
    // test code
}
```

Do not adopt by surprise -- only suggest or use if already present in the project.

## Exit Tests (Swift 6.2+)

Test code that terminates via `precondition()` or `fatalError()`:

```swift
@Test func invalidDiceRollsFail() async throws {
    await #expect(processExitsWith: .failure) {
        let dice = Dice()
        let _ = dice.roll(sides: 0)
    }
}
```

Must be called with `await` -- runs in a dedicated subprocess.

## Attachments (Swift 6.2+)

Attach debug data to failing tests. Types must conform to `Attachable`. Types that also conform to `Codable` and import Foundation are automatically encodable.

```swift
Attachment.record(result, named: "Character")
```

Supports `String`, `Data`, and `Encodable` out of the box. Image support requires Swift 6.3+.

## Test Scoping Traits (Swift 6.1+)

Provide concurrency-safe shared test configuration via `TestTrait` and `TestScoping`:

```swift
struct DefaultPlayerTrait: TestTrait, TestScoping {
    func provideScope(
        for test: Test,
        testCase: Test.Case?,
        performing function: () async throws -> Void
    ) async throws {
        let player = Player(name: "Natsuki Subaru")
        try await Player.$current.withValue(player) {
            try await function()
        }
    }
}

extension Trait where Self == DefaultPlayerTrait {
    static var defaultPlayer: Self { Self() }
}

@Test(.defaultPlayer) func welcomeScreenShowsName() {
    let result = createWelcomeScreen()
    #expect(result.contains("Natsuki Subaru"))
}
```

Multiple scopes combine: `@Test(.firstScope, .secondScope)`. Later scopes can overwrite earlier values.

## ConditionTrait.evaluate() (Swift 6.2+)

Evaluate condition traits outside of tests:

```swift
let trait = ConditionTrait.disabled(if: TestManager.inSmokeTestMode)
if try await trait.evaluate() {
    print("In smoke test mode")
}
```

## Verification Methods

Use `SourceLocation` and `#_sourceLocation` so failures report the call site, not the helper:

```swift
func verifyDivision(
    _ result: (quotient: Int, remainder: Int),
    expectedQuotient: Int,
    expectedRemainder: Int,
    sourceLocation: SourceLocation = #_sourceLocation
) {
    #expect(result.quotient == expectedQuotient, sourceLocation: sourceLocation)
    #expect(result.remainder == expectedRemainder, sourceLocation: sourceLocation)
}
```

`#require` also accepts `sourceLocation:`.

## CustomTestStringConvertible

Add in test targets only to improve failure output:

```swift
extension GameError: @retroactive CustomTestStringConvertible {
    public var testDescription: String {
        switch self {
        case .notPurchased: "This game has not been purchased."
        case .notInstalled: "This game is not currently installed."
        case .parentalControlsDisallowed: "This game has been blocked by parental controls."
        }
    }
}
```

## Bug Tracking

Use `.bug` trait to link tests to issue trackers:

```swift
@Test("Headings should always be italic", .bug(id: 182))
@Test("Headings should always be italic", .bug("https://github.com/you/repo/issues/182"))
```

## Test Organisation

- Mirror production code folder structure in the test target.
- Place test fixtures in dedicated files. Use Fixtures folders alongside tests when fixtures vary.
- Prefer one behaviour per unit test, but multiple `#expect` lines are fine when needed.
- Convert repetitive tests into parameterised tests where it makes sense.
