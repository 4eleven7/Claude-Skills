# Auto Layout Patterns

## Anchors API

```swift
let label = UILabel()
label.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(label)

NSLayoutConstraint.activate([
    label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
])
```

### Constraint Pattern

```swift
// Always follow this order:
// 1. Create view
// 2. Set translatesAutoresizingMaskIntoConstraints = false
// 3. Add to superview
// 4. Activate constraints

let button = UIButton(type: .system)
button.translatesAutoresizingMaskIntoConstraints = false
containerView.addSubview(button)

NSLayoutConstraint.activate([
    button.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
    button.bottomAnchor.constraint(equalTo: containerView.safeAreaLayoutGuide.bottomAnchor, constant: -20),
    button.widthAnchor.constraint(greaterThanOrEqualToConstant: 200),
    button.heightAnchor.constraint(equalToConstant: 44), // minimum tap target
])
```

## UIStackView

```swift
let stack = UIStackView(arrangedSubviews: [titleLabel, subtitleLabel, actionButton])
stack.axis = .vertical
stack.spacing = 12
stack.alignment = .leading      // cross-axis alignment
stack.distribution = .fill      // main-axis distribution
stack.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(stack)

NSLayoutConstraint.activate([
    stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
])
```

### Distribution Options

| Distribution | Behavior |
|-------------|----------|
| `.fill` | Fills axis, stretches one view (lowest hugging priority) |
| `.fillEqually` | All arranged subviews same size along axis |
| `.fillProportionally` | Proportional to intrinsic content size |
| `.equalSpacing` | Equal space between views |
| `.equalCentering` | Equal distance between view centers |

### Stack View Tips

- Add spacing after specific views: `stack.setCustomSpacing(24, after: titleLabel)`
- Hide views without removing: `subtitleLabel.isHidden = true` — stack adjusts automatically
- Nested stacks are fine and perform well
- Stack views don't render — zero performance overhead vs manual constraints

## Constraint Priorities

```swift
// Priorities: 1 (lowest) to 1000 (required)
// Built-in constants:
// .required       = 1000
// .defaultHigh    = 750
// .defaultLow     = 250
// .fittingSizeLevel = 50

let widthConstraint = label.widthAnchor.constraint(equalToConstant: 200)
widthConstraint.priority = .defaultHigh  // can break if needed
widthConstraint.isActive = true

// IMPORTANT: Set priority BEFORE activating, or set on a not-yet-active constraint
// Cannot change from/to .required (1000) after activation
```

## Content Hugging & Compression Resistance

```swift
// Content hugging: "don't stretch me beyond my intrinsic size"
// Higher priority = resists stretching more
label.setContentHuggingPriority(.required, for: .horizontal)

// Compression resistance: "don't shrink me below my intrinsic size"
// Higher priority = resists compression more
label.setContentCompressionResistancePriority(.required, for: .horizontal)
```

### Default Priorities

| View | Hugging (H/V) | Compression Resistance (H/V) |
|------|---------------|------------------------------|
| UILabel | 251/251 | 750/750 |
| UIButton | 250/250 | 750/750 |
| UITextField | 250/250 | 750/750 |
| UIImageView | 251/251 | 750/750 |

**Common scenario:** Two labels side by side — the one with lower hugging priority stretches.

```swift
// Title takes only what it needs, detail fills remaining space
titleLabel.setContentHuggingPriority(.defaultHigh, for: .horizontal)
detailLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)
```

## Safe Area & Layout Margins

```swift
// Safe area: avoids system chrome (notch, home indicator, navigation bar)
view.safeAreaLayoutGuide.topAnchor    // below nav bar
view.safeAreaLayoutGuide.bottomAnchor // above home indicator

// Layout margins: readable content width (adapts to device size)
view.layoutMarginsGuide.leadingAnchor
view.layoutMarginsGuide.trailingAnchor

// Customize margins
view.directionalLayoutMargins = NSDirectionalEdgeInsets(
    top: 16, leading: 20, bottom: 16, trailing: 20
)

// Preserve superview margins
view.preservesSuperviewLayoutMargins = true

// Keyboard layout guide (iOS 15+)
view.keyboardLayoutGuide.topAnchor  // tracks keyboard position
```

## Animating Constraints

```swift
// 1. Update constraint constant
bottomConstraint.constant = -100

// 2. Animate layout pass
UIView.animate(withDuration: 0.3) {
    self.view.layoutIfNeeded()
}

// For activating/deactivating constraints:
NSLayoutConstraint.deactivate(collapsedConstraints)
NSLayoutConstraint.activate(expandedConstraints)
UIView.animate(withDuration: 0.3) {
    self.view.layoutIfNeeded()
}
```

## Debugging

### Quick Decision Tree

| Symptom | Technique |
|---|---|
| Constraint error in console, can't identify views | Symbolic breakpoint + constraint identifiers |
| Constraint conflicts shown | Constraint priority resolution (see conflict patterns below) |
| Ambiguous layout (multiple valid solutions) | `_autolayoutTrace` to find missing constraints |
| Views positioned wrong but no errors | Debug View Hierarchy + Show Constraints |

### Symbolic Breakpoint: `UIViewAlertForUnsatisfiableConstraints`

Set once, catches every constraint conflict at the moment it happens — before the system silently breaks a constraint.

**Setup (Xcode):**
1. Breakpoint Navigator (Cmd+7)
2. `+` → Symbolic Breakpoint
3. Symbol: `UIViewAlertForUnsatisfiableConstraints`
4. Optional: add a Sound action + "Automatically continue" for passive monitoring

When the breakpoint fires, use `v` to inspect local state or switch to Debug View Hierarchy.

### Reading Console Error Messages

```
Unable to simultaneously satisfy constraints.
(
    "<NSLayoutConstraint:0x7f8b...  'UIView-Encapsulated-Layout-Width' ... (active)>",
    "<NSLayoutConstraint:0x7f8b...  UILabel:0x7f8b... .width == 300   (active)>",
    "<NSLayoutConstraint:0x7f8b...  UILabel:0x7f8b... .leading == ... + 20   (active)>",
    "<NSLayoutConstraint:0x7f8b...  ... .trailing == UILabel:0x7f8b... .trailing + 20   (active)>"
)
Will attempt to recover by breaking constraint
<NSLayoutConstraint:0x7f8b... UILabel:0x7f8b... .width == 300   (active)>
```

- **Memory addresses** (`0x7f8b...`) identify specific view/constraint instances
- **`(active)`** = constraint is currently enforced
- **Last line** = which constraint the system will break (usually lowest priority)
- **`UIView-Encapsulated-Layout-Width/Height`** = system-generated for cells — usually correct; your constraints are the problem

### Debug View Hierarchy

Xcode's visual constraint inspector. Click the debug bar button or Debug → View Debugging → Capture View Hierarchy.

- **Purple constraints** = satisfied
- **Orange/red constraints** = conflict
- **Show Clipped Content** reveals off-screen views
- Select a view to see all its constraints in the right panel

### `_autolayoutTrace`

```
(lldb) po UIWindow.value(forKeyPath: "keyWindow._autolayoutTrace")
```

Output marks ambiguous views with `*`:

```
*<UIView:0x7f8b...>
|   <UILabel:0x7f8b...>
```

### Constraint & View Identifiers

Name constraints and views so error messages are readable instead of memory addresses.

```swift
let topConstraint = label.topAnchor.constraint(equalTo: view.topAnchor)
topConstraint.identifier = "label-top-to-view"
topConstraint.isActive = true

label.accessibilityIdentifier = "titleLabel"
```

**Before:** `<NSLayoutConstraint:0x7f8b... UILabel:0x7f8b... .width == 300>`
**After:** `<NSLayoutConstraint:0x7f8b... 'profileImageWidth' UILabel:0x7f8b... 'titleLabel' .width == 300>`

---

## Common Conflict Patterns

### Pattern 1: Over-Constraining (leading + trailing + width)

Three horizontal constraints when only two are needed.

```swift
// WRONG — 20 + 300 + 20 = 340 ≠ container width
imageView.widthAnchor.constraint(equalToConstant: 300).isActive = true
imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20).isActive = true
imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20).isActive = true
```

**Fix A** — remove fixed width, let leading + trailing determine it:

```swift
imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20).isActive = true
imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20).isActive = true
```

**Fix B** — lower width priority so it yields to required edges:

```swift
let widthConstraint = imageView.widthAnchor.constraint(equalToConstant: 300)
widthConstraint.priority = .defaultHigh
widthConstraint.isActive = true
```

### Pattern 2: `UIView-Encapsulated-Layout` Cell Conflicts

System sets cell width/height. Fixed-width constraints inside cells fight it.

```swift
// WRONG — fixed width conflicts with system cell width
contentLabel.widthAnchor.constraint(equalToConstant: 320).isActive = true

// CORRECT — relative constraints adapt to cell width
contentLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16).isActive = true
contentLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16).isActive = true
```

### Pattern 3: Missing `translatesAutoresizingMaskIntoConstraints = false`

Autoresizing mask generates constraints that conflict with your explicit ones.

```swift
// WRONG — autoresizing mask constraints conflict
let imageView = UIImageView()
view.addSubview(imageView)
imageView.widthAnchor.constraint(equalToConstant: 100).isActive = true

// CORRECT
let imageView = UIImageView()
imageView.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(imageView)
imageView.widthAnchor.constraint(equalToConstant: 100).isActive = true
```

### Pattern 4: Ambiguous Layout (Missing Constraints)

Not enough constraints for a unique position. `_autolayoutTrace` shows `*`.

Every view needs per axis: 2 constraints (position + size, or two edges, or center + size).

```swift
// WRONG — no horizontal position
imageView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20).isActive = true
imageView.widthAnchor.constraint(equalToConstant: 100).isActive = true
imageView.heightAnchor.constraint(equalToConstant: 100).isActive = true

// CORRECT — add centerX
imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
```

### Pattern 5: Same-Priority Competing Constraints

Two constraints at `.required` that can't both be satisfied.

```swift
// WRONG — width can't be 100 AND >= 150
imageView.widthAnchor.constraint(equalToConstant: 100).isActive = true
imageView.widthAnchor.constraint(greaterThanOrEqualToConstant: 150).isActive = true

// CORRECT — lower the preferred width so the minimum wins
let preferredWidth = imageView.widthAnchor.constraint(equalToConstant: 100)
preferredWidth.priority = .defaultHigh
preferredWidth.isActive = true
imageView.widthAnchor.constraint(greaterThanOrEqualToConstant: 150).isActive = true
```

---

## Common Mistakes

1. **Forgetting `translatesAutoresizingMaskIntoConstraints = false`** — the #1 Auto Layout bug. Views added in code default to `true`.
2. **Adding constraints before adding to superview** — constraints reference the view hierarchy; the view must be in it first.
3. **Activating constraints one at a time** — use `NSLayoutConstraint.activate([...])` for batching.
4. **Using `frame` with Auto Layout** — don't set `frame` on Auto Layout views. Set constraints instead.
5. **`.required` priority everywhere** — use `.defaultHigh` or lower to let constraints break gracefully.
6. **Constraint conflicts from Interface Builder** — IB constraints default to `.required`. Set explicit priorities in IB.
7. **Ignoring console warnings** — constraint warnings compound. Fix every one immediately.
