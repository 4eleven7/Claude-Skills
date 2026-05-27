# Hang Patterns -- Before/After Fixes

## Pattern 1: Synchronous File I/O

```swift
// HANGS: Data(contentsOf:) blocks main thread
func loadConfig() {
    let data = try! Data(contentsOf: configURL)
    self.config = try! JSONDecoder().decode(Config.self, from: data)
    updateUI()
}
```

```swift
// FIXED: Load on background, update on main
func loadConfig() {
    Task {
        let data = try Data(contentsOf: configURL)
        let config = try JSONDecoder().decode(Config.self, from: data)
        self.config = config  // @MainActor property, hops automatically
        updateUI()
    }
}
```

## Pattern 2: Unfiltered Notification Observer

```swift
// HANGS: Processes every notification on main thread
NotificationCenter.default.addObserver(
    forName: .NSManagedObjectContextDidSave,
    object: nil,
    queue: .main
) { notification in
    self.reloadAllData()  // Expensive, runs for EVERY save
}
```

```swift
// FIXED: Filter to relevant context, debounce
NotificationCenter.default.addObserver(
    forName: .NSManagedObjectContextDidSave,
    object: viewContext,  // Only OUR context
    queue: .main
) { [weak self] _ in
    self?.scheduleReload()  // Debounced, coalesced
}
```

## Pattern 3: Expensive Formatter Creation

```swift
// HANGS: Creates new DateFormatter per cell (called 100+ times during scroll)
func configure(with item: Item) {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    dateLabel.text = formatter.string(from: item.date)
}
```

```swift
// FIXED: Static cached formatter
private static let dateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateStyle = .medium
    f.timeStyle = .short
    return f
}()

func configure(with item: Item) {
    dateLabel.text = Self.dateFormatter.string(from: item.date)
}
```

## Pattern 4: dispatch_sync to Main Thread

```swift
// HANGS: Deadlocks if called from main. Blocks caller otherwise.
func updateBadge(count: Int) {
    DispatchQueue.main.sync {
        badgeView.count = count
    }
}
```

```swift
// FIXED: Always async. If you need the result, use async/await.
func updateBadge(count: Int) {
    Task { @MainActor in
        badgeView.count = count
    }
}
```

## Pattern 5: Semaphore Bridging Async to Sync

```swift
// HANGS: Blocks main thread. If the async work needs main thread, deadlock.
func fetchUser() -> User {
    let semaphore = DispatchSemaphore(value: 0)
    var result: User!
    Task {
        result = await api.fetchCurrentUser()
        semaphore.signal()
    }
    semaphore.wait()  // BLOCKED
    return result
}
```

```swift
// FIXED: Make the caller async. Propagate async up the call chain.
func fetchUser() async -> User {
    await api.fetchCurrentUser()
}

// If you MUST bridge (e.g., UIKit delegate that can't be async):
func fetchUser(completion: @escaping (User) -> Void) {
    Task {
        let user = await api.fetchCurrentUser()
        await MainActor.run { completion(user) }
    }
}
```

## Pattern 6: Lock Contention

```swift
// HANGS: Background thread holds lock during long operation.
// Main thread waits for same lock.
class DataStore {
    private let lock = NSLock()
    private var items: [Item] = []

    func backgroundSync() {
        lock.lock()
        // ... 3 second network + parse operation ...
        items = newItems
        lock.unlock()
    }

    func getItems() -> [Item] {
        lock.lock()         // Main thread BLOCKED here
        defer { lock.unlock() }
        return items
    }
}
```

```swift
// FIXED: Use actor. No manual locking. Reads don't block.
actor DataStore {
    private var items: [Item] = []

    func backgroundSync() async {
        let newItems = await fetchAndParse()
        items = newItems
    }

    func getItems() -> [Item] {
        items  // Fast, no contention with network work
    }
}
```

## Pattern 7: App Launch Hang (Watchdog Risk)

```swift
// HANGS: Synchronous DB migration + network call blocks launch.
// Watchdog kills after ~20 seconds.
func application(_ app: UIApplication,
                 didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    DatabaseManager.shared.runMigrations()  // 5-15 seconds on old devices
    let config = try! RemoteConfig.fetchSync()  // Network, blocks main
    applyConfig(config)
    return true
}
```

```swift
// FIXED: Show UI immediately, defer heavy work.
func application(_ app: UIApplication,
                 didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Show loading UI immediately -- main thread free
    return true
}

// In your root view or scene delegate:
func sceneDidBecomeActive(_ scene: UIScene) {
    Task {
        await DatabaseManager.shared.runMigrations()
        let config = try await RemoteConfig.fetch()
        applyConfig(config)
        // Transition from loading to main UI
    }
}
```

## Pattern 8: Image Processing on Main Thread

```swift
// HANGS: Decoding + resizing a 4K photo on main thread
func displayPhoto(_ url: URL) {
    let data = try! Data(contentsOf: url)
    let image = UIImage(data: data)!
    let resized = image.preparingThumbnail(of: targetSize)!
    imageView.image = resized
}
```

```swift
// FIXED: Decode and resize on background, display on main
func displayPhoto(_ url: URL) {
    Task {
        let data = try Data(contentsOf: url)
        let image = UIImage(data: data)
        let resized = await image?.byPreparingThumbnail(ofSize: targetSize)
        imageView.image = resized  // @MainActor hop
    }
}
```

## Pattern 9: Swift Concurrency -- MainActor Starvation

```swift
// HANGS: Many background tasks all need MainActor, queue builds up.
// Main thread processes them sequentially, each with a hop.
for item in thousandItems {
    Task { @MainActor in
        updateUI(for: item)  // 1000 MainActor hops
    }
}
```

```swift
// FIXED: Batch the work into a single MainActor hop.
Task { @MainActor in
    for item in thousandItems {
        updateUI(for: item)  // One hop, sequential within it
    }
}
```

## Pattern 10: Synchronous UserDefaults for Large Data

```swift
// HANGS: UserDefaults persists to plist file. Large objects = slow write on main.
func save(history: [HistoryEntry]) {
    let data = try! JSONEncoder().encode(history)  // 10MB+
    UserDefaults.standard.set(data, forKey: "history")
    // Synchronous plist write triggered
}
```

```swift
// FIXED: Use file storage for large data, UserDefaults for small preferences only.
func save(history: [HistoryEntry]) {
    Task.detached {
        let data = try JSONEncoder().encode(history)
        try data.write(to: historyFileURL, options: .atomic)
    }
}
```

## Time Profiler Workflow

1. Open Instruments > Time Profiler template
2. Record while reproducing the hang
3. Stop recording
4. In the timeline, drag to select the frozen period
5. In Call Tree, check "Separate by Thread" and "Hide System Libraries"
6. Find main thread -- look for functions with high Self Time
7. The top Self Time functions are your hang cause

## System Trace Workflow

1. Open Instruments > System Trace template
2. Record while reproducing the hang
3. Stop recording
4. Filter to Thread 1 (main thread)
5. Look for red (Blocked) regions in the thread state timeline
6. Click the blocked region to see what's blocking (mutex, semaphore, IPC)
7. The "Blocked by" column shows which thread or resource holds the lock
