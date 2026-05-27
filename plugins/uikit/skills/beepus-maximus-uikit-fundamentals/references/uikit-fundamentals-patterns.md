# UIKit Fundamentals Patterns

## UIViewController Lifecycle

```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // One-time setup: add subviews, configure data sources
        // Trait collection and geometry are NOT final here
        setupViews()
        configureDataSource()
    }

    override func viewIsAppearing(_ animated: Bool) {
        super.viewIsAppearing(animated)
        // Called after viewWillAppear — traits and geometry ARE final
        // Use for layout adjustments, scroll position, trait-dependent config
        updateLayoutForCurrentTraits()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // View is on screen — start animations, analytics, timers
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // About to leave — pause work, save state
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // Off screen — stop timers, release expensive resources
    }
}
```

### viewIsAppearing vs viewWillAppear

| Aspect | viewWillAppear | viewIsAppearing |
|--------|---------------|-----------------|
| Available since | iOS 2 | iOS 13 (back-deployed) |
| Trait collection | May not be final | Final |
| View geometry | May not be final | Final |
| Use for | Legacy code | Layout adjustments, trait checks |

**Rule:** Default to `viewIsAppearing` for any code that reads geometry or traits.

## UIView Hierarchy

```swift
// Adding subviews
view.addSubview(childView)                    // adds to end
view.insertSubview(childView, at: 0)          // adds at index
view.insertSubview(childView, belowSubview: other) // z-order

// Removing
childView.removeFromSuperview()

// Layout passes (order):
// 1. updateConstraints() — bottom-up
// 2. layoutSubviews()   — top-down
// 3. draw(_:)           — top-down (only if needed)

// Force layout
view.setNeedsLayout()          // schedule
view.layoutIfNeeded()          // execute now (animate with this)

// Force constraint update
view.setNeedsUpdateConstraints()
view.updateConstraintsIfNeeded()
```

### Layout Pass Best Practices

- Override `layoutSubviews()` for manual frame calculations (rare with Auto Layout)
- Override `updateConstraints()` only for batch constraint changes — call `super` last
- Never call `setNeedsLayout()` inside `layoutSubviews()` — infinite loop

## Responder Chain

```
First Responder (e.g., UITextField)
    → superview
    → ... (superview chain)
    → UIViewController.view
    → UIViewController
    → parent UIViewController (if child VC)
    → UIWindow
    → UIApplication
    → UIApplicationDelegate
```

```swift
// Become first responder (e.g., show keyboard)
textField.becomeFirstResponder()

// Resign (e.g., dismiss keyboard)
textField.resignFirstResponder()
// Or dismiss keyboard from anywhere:
view.endEditing(true)

// Send action up responder chain
UIApplication.shared.sendAction(#selector(resign), to: nil, from: nil, for: nil)
```

## Trait Collections (iOS 17+)

```swift
class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // iOS 17+ trait change registration (replaces traitCollectionDidChange)
        registerForTraitChanges(
            [UITraitUserInterfaceStyle.self,
             UITraitHorizontalSizeClass.self]
        ) { (self: MyViewController, previousTraitCollection: UITraitCollection) in
            self.updateAppearance()
        }
    }

    private func updateAppearance() {
        let isDark = traitCollection.userInterfaceStyle == .dark
        let isCompact = traitCollection.horizontalSizeClass == .compact
        // Update views based on traits
    }
}
```

### Size Classes

| Device / Orientation | Horizontal | Vertical |
|---------------------|-----------|---------|
| iPhone portrait | .compact | .regular |
| iPhone landscape (small) | .compact | .compact |
| iPhone landscape (large) | .regular | .compact |
| iPad full screen | .regular | .regular |
| iPad slide over | .compact | .regular |
| iPad 1/3 split | .compact | .regular |
| iPad 1/2+ split | .regular | .regular |

```swift
// Adapt layout based on size class
if traitCollection.horizontalSizeClass == .compact {
    // Single column layout
} else {
    // Multi-column layout
}
```

## Appearance Customization

```swift
// Per-instance
navigationBar.tintColor = .systemBlue
navigationBar.barTintColor = .systemBackground

// Global appearance proxy
UINavigationBar.appearance().tintColor = .systemBlue

// Conditional appearance (iOS 15+)
let appearance = UINavigationBarAppearance()
appearance.configureWithOpaqueBackground()
appearance.backgroundColor = .systemBackground
navigationBar.standardAppearance = appearance
navigationBar.scrollEdgeAppearance = appearance
```

## Common Mistakes

1. **Geometry code in viewDidLoad** — view size isn't final yet. Use `viewIsAppearing`.
2. **Forgetting `super` calls** — always call `super` in lifecycle overrides.
3. **Strong reference cycles in trait registration** — the closure captures `self`; use `[weak self]` if the registration outlives the VC (rare since the VC owns the registration).
4. **Checking device idiom instead of size class** — size classes adapt to multitasking; device idiom doesn't.
5. **Using deprecated `traitCollectionDidChange`** — use `registerForTraitChanges` on iOS 17+.
