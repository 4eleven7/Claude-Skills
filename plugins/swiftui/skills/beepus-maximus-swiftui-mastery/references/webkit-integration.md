# WebKit Integration (iOS 26+)

SwiftUI-native WebKit integration via `WebView` and `WebPage`.

```swift
import WebKit
```

## WebView Basics

```swift
// Simple URL
WebView(url: URL(string: "https://www.apple.com"))

// With WebPage controller
@State private var page = WebPage()

NavigationStack {
    WebView(page)
        .navigationTitle(page.title)
}
.onAppear {
    page.load(URLRequest(url: URL(string: "https://www.apple.com")!))
}

// Toggle between URLs
@State private var toggle = false
WebView(url: toggle ? URL(string: "https://www.webkit.org") : URL(string: "https://www.swift.org"))
```

## WebPage Configuration

```swift
var config = WebPage.Configuration()
config.loadsSubresources = true
config.defaultNavigationPreferences.allowsContentJavaScript = true
config.websiteDataStore = .default()          // Persistent
config.websiteDataStore = .nonPersistent()    // No persistence

let page = WebPage(configuration: config)
page.customUserAgent = "MyApp/1.0"
```

## Loading Content

```swift
// From URL
page.load(URLRequest(url: url))

// From HTML string
page.load(html: "<h1>Hello</h1>", baseURL: URL(string: "https://example.com")!)

// From Data
page.load(data: htmlData, mimeType: "text/html", characterEncoding: .utf8, baseURL: baseURL)

// Reload / Stop
page.reload(fromOrigin: false)
page.stopLoading()
```

## Navigation

```swift
// Back/forward
let canGoBack = !page.backForwardList.backList.isEmpty
if let backItem = page.backForwardList.backItem {
    page.load(backItem)
}

// Observe navigation events
.onChange(of: page.currentNavigationEvent) { _, event in
    if let event {
        switch event.state {
        case .started: isLoading = true
        case .finished, .failed: isLoading = false
        default: break
        }
    }
}
```

### Custom Navigation Decisions

```swift
struct MyNavigationDecider: WebPage.NavigationDeciding {
    func decidePolicyFor(navigationAction: WebPage.NavigationAction) async -> WebPage.NavigationPreferences? {
        // Return nil to cancel navigation
        if navigationAction.request.url?.host == "blocked.com" { return nil }
        var prefs = WebPage.NavigationPreferences()
        prefs.allowsContentJavaScript = true
        return prefs
    }

    func decidePolicyFor(navigationResponse: WebPage.NavigationResponse) async -> Bool {
        true // Allow response
    }
}

let page = WebPage(configuration: config, navigationDecider: MyNavigationDecider())
```

## JavaScript Execution

```swift
// Basic
let title = try await page.callJavaScript("document.title")

// With arguments
let script = """
function find(selector) { return document.querySelector(selector)?.textContent; }
return find(selector);
"""
let result = try await page.callJavaScript(script, arguments: ["selector": ".heading"])

// In specific frame
let html = try await page.callJavaScript("document.body.innerHTML", in: frameInfo)

// Isolated world
let value = try await page.callJavaScript(script, contentWorld: .defaultClient)
```

## View Modifiers

```swift
WebView(url: url)
    .webViewBackForwardNavigationGestures(.disabled)   // Swipe navigation
    .webViewMagnificationGestures(.enabled)             // Pinch zoom
    .webViewLinkPreviews(.disabled)                     // Long-press previews
    .webViewTextSelection(.enabled)                     // Text selection
    .webViewContentBackground(.color(.systemBackground))
    .webViewElementFullscreenBehavior(.enabled)          // Video fullscreen
    .findNavigator(isPresented: $searchVisible)          // In-page text search
```

## Advanced

```swift
// Screenshot
let image = try await page.snapshot(WKSnapshotConfiguration())

// PDF generation
let pdfData = try await page.pdf(configuration: WKPDFConfiguration())

// Web archive
let archiveData = try await page.webArchiveData()
```

### Custom URL Scheme Handler

```swift
struct MySchemeHandler: URLSchemeHandler {
    func start(task: URLSchemeTask) {
        let response = URLResponse(url: task.request.url!, mimeType: "text/html",
                                   expectedContentLength: -1, textEncodingName: "utf-8")
        task.didReceive(response)
        task.didReceive(Data("<h1>Custom</h1>".utf8))
        task.didFinish()
    }
    func stop(task: URLSchemeTask) { }
}

var config = WebPage.Configuration()
config.setURLSchemeHandler(MySchemeHandler(), forURLScheme: "myapp")
```
