# XCUITest

Write, review, and debug XCUITest UI automation tests. Enforce condition-based waiting, accessibility-first queries, and maintainable page object patterns.

## Responsibility

- **Owns:** XCUIApplication, XCUIElement queries, XCUIElementQuery, waiting patterns, accessibility identifier strategy, page object pattern, recording UI automation, network conditioning, UI test debugging
- **Does NOT own:** Unit tests (Swift Testing skill), SwiftUI view logic, performance profiling (Instruments), snapshot testing

## Core Principles

1. **Wait for conditions, never sleep.** `sleep()` in UI tests is always wrong. It either wastes CI time or creates flaky failures.
2. **Query by accessibility identifier.** Labels change with localisation; identifiers don't.
3. **One assertion per logical check.** UI tests are slow — make failures pinpoint the problem.
4. **UI tests are integration tests.** They prove user flows work end-to-end, not implementation details.
5. **Reset state between tests.** Each test must be independent — no ordering dependencies.

## Quick Reference

### Launching with Arguments / Environment

```swift
let app = XCUIApplication()
app.launchArguments = ["--uitesting", "--reset-state"]
app.launchEnvironment = [
    "UITEST_MOCK_API": "true",
    "UITEST_SCENARIO": "empty-state"
]
app.launch()
```

### Waiting for Existence

```swift
let element = app.staticTexts["Welcome"]
XCTAssertTrue(element.waitForExistence(timeout: 10))
```

### Waiting for Element Properties (enabled, selected, value)

```swift
let button = app.buttons["Submit"]
let predicate = NSPredicate(format: "isEnabled == true")
let expectation = XCTNSPredicateExpectation(predicate: predicate, object: button)
let result = XCTWaiter.wait(for: [expectation], timeout: 10)
XCTAssertEqual(result, .completed)
```

### Tapping, Typing, Swiping

```swift
app.buttons["Save"].tap()
app.textFields["emailField"].tap()
app.textFields["emailField"].typeText("user@example.com")
app.swipeUp()
app.tables.firstMatch.swipeDown()
```

### Querying by Type, Identifier, Predicate

```swift
// By type
let allButtons = app.buttons
let firstCell = app.cells.firstMatch

// By accessibility identifier
let saveButton = app.buttons["saveButton"]

// By predicate
let predicate = NSPredicate(format: "label CONTAINS[c] 'submit'")
let matchingButtons = app.buttons.matching(predicate)

// By element index
let thirdCell = app.cells.element(boundBy: 2)

// Descendant query
let labelInCell = app.cells["profileCell"].staticTexts["nameLabel"]
```

### Handling System Alerts

```swift
// In setUp or the test method — before triggering the alert
addUIInterruptionMonitor(withDescription: "Health Access") { alert in
    let allowButton = alert.buttons["Allow"]
    if allowButton.exists {
        allowButton.tap()
        return true
    }
    return false
}

// IMPORTANT: after the alert would appear, interact with the app to trigger the handler
app.tap()
```

### Taking Screenshots

```swift
let screenshot = app.screenshot()
let attachment = XCTAttachment(screenshot: screenshot)
attachment.name = "After Login"
attachment.lifetime = .keepAlways
add(attachment)
```

## Condition-Based Waiting

### The Right Way vs The Wrong Way

```swift
// WRONG — arbitrary timeout, wastes CI time or flakes
sleep(3)
XCTAssertTrue(app.staticTexts["Welcome"].exists)

// RIGHT — waits up to 10s, returns immediately when found
let welcomeText = app.staticTexts["Welcome"]
XCTAssertTrue(welcomeText.waitForExistence(timeout: 10))
```

### Custom Predicate Wait

```swift
let element = app.buttons["Submit"]
let predicate = NSPredicate(format: "isEnabled == true")
let expectation = XCTNSPredicateExpectation(predicate: predicate, object: element)
let result = XCTWaiter.wait(for: [expectation], timeout: 10)
XCTAssertEqual(result, .completed)
```

### Waiting for Element to Disappear

```swift
let spinner = app.activityIndicators["loadingSpinner"]
let gone = NSPredicate(format: "exists == false")
let expectation = XCTNSPredicateExpectation(predicate: gone, object: spinner)
let result = XCTWaiter.wait(for: [expectation], timeout: 15)
XCTAssertEqual(result, .completed)
```

## Page Object Pattern

Encapsulate screen interactions behind a typed API. Tests read like user stories; locator changes only affect one file.

```swift
// MARK: - Page Object

struct LoginScreen {
    let app: XCUIApplication

    private var emailField: XCUIElement { app.textFields["emailField"] }
    private var passwordField: XCUIElement { app.secureTextFields["passwordField"] }
    private var loginButton: XCUIElement { app.buttons["loginButton"] }
    private var errorBanner: XCUIElement { app.staticTexts["loginErrorBanner"] }

    @discardableResult
    func typeEmail(_ email: String) -> Self {
        emailField.tap()
        emailField.typeText(email)
        return self
    }

    @discardableResult
    func typePassword(_ password: String) -> Self {
        passwordField.tap()
        passwordField.typeText(password)
        return self
    }

    @discardableResult
    func tapLogin() -> HomeScreen {
        loginButton.tap()
        return HomeScreen(app: app)
    }

    func assertErrorVisible(_ message: String) {
        XCTAssertTrue(errorBanner.waitForExistence(timeout: 5))
        XCTAssertEqual(errorBanner.label, message)
    }
}

struct HomeScreen {
    let app: XCUIApplication

    private var welcomeLabel: XCUIElement { app.staticTexts["welcomeLabel"] }

    func assertVisible() {
        XCTAssertTrue(welcomeLabel.waitForExistence(timeout: 10))
    }
}

// MARK: - Test using Page Objects

final class LoginUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    func testSuccessfulLogin() {
        LoginScreen(app: app)
            .typeEmail("user@example.com")
            .typePassword("password123")
            .tapLogin()
            .assertVisible()
    }

    func testInvalidCredentials() {
        let login = LoginScreen(app: app)
        login
            .typeEmail("wrong@example.com")
            .typePassword("bad")
            .tapLogin()
        login.assertErrorVisible("Invalid credentials")
    }
}
```

## Crash Debugging from UI Tests — 6-Step Approach

1. **Read the crash log.** Check the Xcode Report Navigator (Cmd+9) for the crash backtrace. Identify the crashing thread and the faulting frame.
2. **Reproduce with a minimal test.** Strip the failing test to the smallest sequence of actions that triggers the crash. Remove unrelated setup.
3. **Check for race conditions.** UI tests run in a separate process. If the app crashes during a transition, the test may be interacting with a view that has already been deallocated. Add waits before the crashing interaction.
4. **Inspect launch arguments.** Confirm that test-specific launch arguments and environment variables produce valid app state. A misconfigured mock can trigger nil-dereference crashes.
5. **Attach the debugger.** Set a breakpoint on all Objective-C exceptions (`breakpoint set -E objc`) and re-run the test. The debugger stops at the crash site with full stack context.
6. **Check device logs.** Use Console.app or `log show --predicate 'process == "AppName"'` filtered to the crash timestamp. Crash reports often contain more detail than Xcode shows.

## Recording UI Automation

Xcode can record UI interactions and generate XCUITest code:

1. Place cursor inside a test method body
2. Click the red Record button in the debug bar (or Editor > Record UI Test)
3. Interact with the app in the simulator — Xcode generates code live
4. Stop recording and clean up the generated code

**Always clean up recorded code:**
- Replace fragile label-based queries with accessibility identifier queries
- Remove redundant `exists` checks that the recorder adds
- Extract repeated sequences into page object methods
- Replace any generated `sleep()` calls with `waitForExistence(timeout:)`

## Network Conditioning

Test how the app behaves under degraded network conditions:

### Using Network Link Conditioner (Settings > Developer)
- Enable on a physical device or simulator via Settings > Developer > Network Link Conditioner
- Profiles: 100% Loss, Very Bad Network, Edge, 3G, LTE, Wi-Fi
- Useful for manual exploratory testing alongside UI tests

### Using Xcode Test Plans
- Create a `.xctestplan` file
- Under Configuration > Test Execution, set environment variables that your app's network layer respects:
  ```
  UITEST_NETWORK_DELAY=5000
  UITEST_SIMULATE_TIMEOUT=true
  ```
- Run different configurations: fast network, slow network, offline
- Combine with launch arguments to trigger mock network responses

### What to Verify Under Poor Network
- Loading indicators appear promptly
- Timeout errors surface actionable messages
- Retry buttons work and re-trigger the request
- The app does not crash or hang on network failure
- Partial data loads are handled gracefully (not blank screens)

## Common Pitfalls

1. **Using `sleep()` instead of condition-based waits.** CI machines have variable performance. A `sleep(2)` that works locally will flake on a loaded CI runner. Always use `waitForExistence(timeout:)` or `XCTNSPredicateExpectation`.

2. **Querying by label text instead of accessibility identifier.** `app.buttons["Save"]` matches on the label — it breaks when the app is localised to another language. Set `.accessibilityIdentifier("saveButton")` in the view and query by that.

3. **Tests that depend on execution order.** If test B only passes after test A sets up state, both tests are wrong. Each test must launch the app fresh or reset state via launch arguments.

4. **Ignoring animation completion.** Tapping a button that triggers a navigation animation, then immediately querying the destination screen, can fail. Wait for the destination element to exist before asserting.

5. **Not setting `continueAfterFailure = false`.** Without this, a failed assertion lets the test continue, causing cascading failures with misleading error messages. Set it in `setUp`.

6. **Forgetting to interact with the app after `addUIInterruptionMonitor`.** The interruption monitor only fires when XCUITest tries to interact with the app. After setting up a monitor for a system alert, call `app.tap()` or perform another interaction to trigger it.

7. **Hardcoding element indices.** `app.cells.element(boundBy: 3)` breaks when content changes. Prefer accessibility identifiers or predicate queries that match on stable attributes.

8. **Testing implementation details instead of user-visible behaviour.** UI tests should assert what the user sees ("Welcome, Dan" appears), not internal state (a specific view controller was pushed). If you need to verify internal state, use unit tests.

## Review Checklist

When reviewing XCUITest code, verify:

- [ ] No `sleep()` calls anywhere
- [ ] All element queries use accessibility identifiers (not raw labels)
- [ ] `continueAfterFailure = false` is set in setUp
- [ ] Each test is independent — no shared mutable state between tests
- [ ] Page objects are used for screens with more than 2-3 interactions
- [ ] Waits use `waitForExistence(timeout:)` or `XCTNSPredicateExpectation`
- [ ] System alert handling uses `addUIInterruptionMonitor` with a follow-up interaction
- [ ] Screenshots are attached at key checkpoints for debugging failures
- [ ] Launch arguments configure deterministic test state (mock data, skip onboarding)
- [ ] Assertions check user-visible outcomes, not implementation details
