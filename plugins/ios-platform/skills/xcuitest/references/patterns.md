# XCUITest Patterns Reference

Detailed patterns for common XCUITest scenarios. Use alongside the main skill document.

## System Alert Handling

System alerts (permissions, notifications, Health access) appear as separate processes that XCUITest cannot query directly. Use `addUIInterruptionMonitor`.

### Basic Pattern

```swift
// Register BEFORE the action that triggers the alert
addUIInterruptionMonitor(withDescription: "Location Permission") { alert in
    let allowButton = alert.buttons["Allow While Using App"]
    if allowButton.exists {
        allowButton.tap()
        return true  // handled
    }
    return false  // not our alert
}

// Trigger the permission request
app.buttons["enableLocation"].tap()

// CRITICAL: interact with the app to give XCUITest a chance to process the monitor
app.tap()
```

### Handling Multiple Alert Types

```swift
override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    app.launchArguments = ["--uitesting"]

    // Register monitors for all expected alerts
    addUIInterruptionMonitor(withDescription: "Notifications") { alert in
        if alert.buttons["Allow"].exists {
            alert.buttons["Allow"].tap()
            return true
        }
        return false
    }

    addUIInterruptionMonitor(withDescription: "Health Access") { alert in
        if alert.buttons["Turn On All"].exists {
            alert.buttons["Turn On All"].tap()
            return true
        }
        return false
    }

    app.launch()
}
```

### Denying Permissions

```swift
addUIInterruptionMonitor(withDescription: "Camera Permission") { alert in
    let denyButton = alert.buttons["Don't Allow"]
    if denyButton.exists {
        denyButton.tap()
        return true
    }
    return false
}
```

## Scrolling to Find Elements

### Scroll Until Element Is Visible

```swift
func scrollDownUntilVisible(
    element: XCUIElement,
    in scrollable: XCUIElement,
    maxScrolls: Int = 10
) -> Bool {
    var scrollCount = 0
    while !element.isHittable && scrollCount < maxScrolls {
        scrollable.swipeUp()
        scrollCount += 1
    }
    return element.isHittable
}

// Usage
let targetCell = app.cells["itemCell_42"]
let table = app.tables.firstMatch
XCTAssertTrue(scrollDownUntilVisible(element: targetCell, in: table))
targetCell.tap()
```

### Scroll to a Specific Direction

```swift
// Scroll right in a horizontal collection
let collection = app.collectionViews.firstMatch
collection.swipeLeft()  // swipe left = scroll right

// Scroll with a longer swipe for faster scrolling
let start = collection.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5))
let end = collection.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.5))
start.press(forDuration: 0, thenDragTo: end)
```

### Precise Coordinate-Based Scrolling

```swift
// When swipeUp() scrolls too far, use coordinate-based dragging for finer control
let table = app.tables.firstMatch
let topCoord = table.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.3))
let bottomCoord = table.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
bottomCoord.press(forDuration: 0.1, thenDragTo: topCoord)
```

## Handling Keyboard Dismissal

### Dismiss by Tapping Outside

```swift
// Tap on a non-interactive area to dismiss the keyboard
app.tap()  // taps the centre of the app window
```

### Dismiss with Return Key

```swift
app.textFields["searchField"].typeText("query\n")  // \n sends Return
```

### Dismiss with Toolbar Done Button

```swift
app.toolbars.buttons["Done"].tap()
```

### Check If Keyboard Is Visible

```swift
let keyboard = app.keyboards.firstMatch
if keyboard.exists {
    // keyboard is showing
    app.tap()  // dismiss it
    // wait for it to animate away
    let gone = NSPredicate(format: "exists == false")
    let expectation = XCTNSPredicateExpectation(predicate: gone, object: keyboard)
    XCTWaiter.wait(for: [expectation], timeout: 3)
}
```

## Multi-App Testing

### Opening Safari

```swift
let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
safari.launch()

// Type a URL
safari.textFields["URL"].tap()
safari.textFields["URL"].typeText("https://example.com\n")

// Switch back to the main app
let myApp = XCUIApplication()
myApp.activate()
```

### Opening Settings

```swift
let settings = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
settings.launch()

// Navigate to the app's settings
settings.tables.staticTexts["MyApp"].tap()

// Toggle a setting
settings.switches["notificationsSwitch"].tap()

// Return to the app
let myApp = XCUIApplication()
myApp.activate()
```

### Deep Linking from Safari

```swift
let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
safari.launch()

safari.textFields["URL"].tap()
safari.textFields["URL"].typeText("myapp://deep/link/path\n")

// Handle the "Open in MyApp?" dialog
let openButton = safari.buttons["Open"]
if openButton.waitForExistence(timeout: 5) {
    openButton.tap()
}

// Verify the app opened to the right screen
let myApp = XCUIApplication()
XCTAssertTrue(myApp.wait(for: .runningForeground, timeout: 10))
XCTAssertTrue(myApp.staticTexts["deepLinkContent"].waitForExistence(timeout: 5))
```

## Test Plan Configuration

### Multiple Languages

Create an `.xctestplan` file with configurations for each locale:

```json
{
  "configurations": [
    {
      "name": "English",
      "options": {
        "language": "en",
        "region": "US"
      }
    },
    {
      "name": "Japanese",
      "options": {
        "language": "ja",
        "region": "JP"
      }
    },
    {
      "name": "Arabic (RTL)",
      "options": {
        "language": "ar",
        "region": "SA"
      }
    }
  ]
}
```

This runs the entire test suite once per configuration. Queries using accessibility identifiers survive all locales unchanged.

### Multiple Devices via xcodebuild

```bash
xcodebuild test \
    -project MyApp.xcodeproj \
    -scheme MyAppUITests \
    -testPlan FullSuite \
    -destination 'platform=iOS Simulator,name=iPhone 16' \
    -destination 'platform=iOS Simulator,name=iPad Pro 13-inch (M4)'
```

### Configuration-Specific Environment Variables

In the test plan, set environment variables per configuration:

```json
{
  "name": "Slow Network",
  "options": {
    "environmentVariableEntries": [
      { "key": "UITEST_NETWORK_DELAY", "value": "5000" },
      { "key": "UITEST_SIMULATE_TIMEOUT", "value": "true" }
    ]
  }
}
```

## Screenshot Attachments for Debugging

### Attach Screenshots at Key Points

```swift
func takeScreenshot(name: String) {
    let screenshot = XCUIScreen.main.screenshot()
    let attachment = XCTAttachment(screenshot: screenshot)
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
}

func testCheckoutFlow() {
    // Navigate to cart
    app.tabBars.buttons["cartTab"].tap()
    takeScreenshot(name: "01-Cart")

    // Tap checkout
    app.buttons["checkoutButton"].tap()
    let paymentScreen = app.staticTexts["paymentTitle"]
    XCTAssertTrue(paymentScreen.waitForExistence(timeout: 10))
    takeScreenshot(name: "02-Payment")

    // Complete payment
    app.buttons["payButton"].tap()
    let confirmation = app.staticTexts["orderConfirmed"]
    XCTAssertTrue(confirmation.waitForExistence(timeout: 15))
    takeScreenshot(name: "03-Confirmation")
}
```

### Automatic Screenshot on Failure

```swift
override func tearDownWithError() throws {
    if let failureCount = testRun?.failureCount, failureCount > 0 {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "Failure-\(name)"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    try super.tearDownWithError()
}
```

### Viewing Screenshots

Screenshots appear in the Xcode Test Report (Cmd+9 > select test run). Each attachment is listed under the test method that created it. They are also available in the `.xcresult` bundle for CI inspection:

```bash
xcrun xcresulttool get --path Build/TestResults.xcresult --format json
```

### Full-App vs Screen Screenshots

```swift
// Entire screen (includes status bar, alerts, keyboards)
let fullScreen = XCUIScreen.main.screenshot()

// Just the app window (excludes status bar on some devices)
let appOnly = app.screenshot()

// A specific element
let elementShot = app.tables.firstMatch.screenshot()
```
