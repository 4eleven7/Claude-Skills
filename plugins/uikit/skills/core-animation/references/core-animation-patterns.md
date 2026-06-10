# Core Animation Patterns

## Layer Types

| Layer | Use |
|---|---|
| `CALayer` | Base — background colour, border, shadow, corner radius |
| `CAShapeLayer` | Vector paths (bezier curves, custom shapes) |
| `CAGradientLayer` | Linear/radial gradients |
| `CATextLayer` | Rendered text (non-interactive) |
| `CAEmitterLayer` | Particle effects |
| `CAReplicatorLayer` | Repeated sublayer copies with transforms |
| `CAScrollLayer` | Scrollable sublayer content |

## CABasicAnimation

```swift
let animation = CABasicAnimation(keyPath: "opacity")
animation.fromValue = 1.0
animation.toValue = 0.0
animation.duration = 0.3
animation.fillMode = .forwards
animation.isRemovedOnCompletion = false
layer.add(animation, forKey: "fade")
```

**Important:** Animations are visual only — they don't change the model value. Set the final value on the layer too:
```swift
layer.opacity = 0.0  // Set model value
layer.add(animation, forKey: "fade")  // Add visual animation
```

## CAKeyframeAnimation

```swift
let animation = CAKeyframeAnimation(keyPath: "position")
animation.values = [
    CGPoint(x: 0, y: 0),
    CGPoint(x: 100, y: -50),
    CGPoint(x: 200, y: 0),
]
animation.keyTimes = [0, 0.5, 1.0]
animation.duration = 1.0
animation.timingFunctions = [
    CAMediaTimingFunction(name: .easeIn),
    CAMediaTimingFunction(name: .easeOut),
]
layer.add(animation, forKey: "bounce")
```

## CAAnimationGroup

```swift
let fade = CABasicAnimation(keyPath: "opacity")
fade.toValue = 0.0

let scale = CABasicAnimation(keyPath: "transform.scale")
scale.toValue = 0.5

let group = CAAnimationGroup()
group.animations = [fade, scale]
group.duration = 0.3
layer.add(group, forKey: "dismissGroup")
```

## CATransaction (Control Implicit Animations)

```swift
// Disable implicit animation
CATransaction.begin()
CATransaction.setDisableActions(true)
layer.position = newPosition
CATransaction.commit()

// Custom duration for implicit animation
CATransaction.begin()
CATransaction.setAnimationDuration(0.5)
layer.backgroundColor = UIColor.red.cgColor
CATransaction.commit()
```

## CAShapeLayer

```swift
let shapeLayer = CAShapeLayer()
shapeLayer.path = UIBezierPath(roundedRect: bounds, cornerRadius: 16).cgPath
shapeLayer.fillColor = UIColor.blue.cgColor
shapeLayer.strokeColor = UIColor.white.cgColor
shapeLayer.lineWidth = 2
view.layer.addSublayer(shapeLayer)

// Animate the path
let animation = CABasicAnimation(keyPath: "strokeEnd")
animation.fromValue = 0
animation.toValue = 1
animation.duration = 1.0
shapeLayer.add(animation, forKey: "drawLine")
```

## UIBezierPath Recipes

### Common Shapes

```swift
// Circle
let circle = UIBezierPath(arcCenter: center, radius: 40, startAngle: 0, endAngle: .pi * 2, clockwise: true)

// Rounded rectangle with specific corners
let rounded = UIBezierPath(
    roundedRect: bounds,
    byRoundingCorners: [.topLeft, .topRight],
    cornerRadii: CGSize(width: 16, height: 16)
)

// Oval
let oval = UIBezierPath(ovalIn: CGRect(x: 0, y: 0, width: 100, height: 60))

// Capsule (pill shape)
let capsule = UIBezierPath(roundedRect: CGRect(x: 0, y: 0, width: 120, height: 44), cornerRadius: 22)
```

### Custom Shapes

```swift
// Star
func starPath(center: CGPoint, points: Int, outerRadius: CGFloat, innerRadius: CGFloat) -> UIBezierPath {
    let path = UIBezierPath()
    let angleIncrement = .pi * 2 / CGFloat(points * 2)
    for i in 0..<(points * 2) {
        let radius = i.isMultiple(of: 2) ? outerRadius : innerRadius
        let angle = angleIncrement * CGFloat(i) - .pi / 2
        let point = CGPoint(x: center.x + cos(angle) * radius, y: center.y + sin(angle) * radius)
        i == 0 ? path.move(to: point) : path.addLine(to: point)
    }
    path.close()
    return path
}

// Arrow (right-pointing)
func arrowPath(in rect: CGRect) -> UIBezierPath {
    let path = UIBezierPath()
    let midY = rect.midY
    let shaftHeight = rect.height * 0.4
    let headStart = rect.width * 0.6
    path.move(to: CGPoint(x: rect.minX, y: midY - shaftHeight / 2))
    path.addLine(to: CGPoint(x: headStart, y: midY - shaftHeight / 2))
    path.addLine(to: CGPoint(x: headStart, y: rect.minY))
    path.addLine(to: CGPoint(x: rect.maxX, y: midY))
    path.addLine(to: CGPoint(x: headStart, y: rect.maxY))
    path.addLine(to: CGPoint(x: headStart, y: midY + shaftHeight / 2))
    path.addLine(to: CGPoint(x: rect.minX, y: midY + shaftHeight / 2))
    path.close()
    return path
}

// Speech bubble
func speechBubblePath(in rect: CGRect, tailSize: CGFloat = 12) -> UIBezierPath {
    let bubbleRect = CGRect(x: rect.minX, y: rect.minY, width: rect.width, height: rect.height - tailSize)
    let path = UIBezierPath(roundedRect: bubbleRect, cornerRadius: 12)
    // Tail
    let tailPath = UIBezierPath()
    tailPath.move(to: CGPoint(x: rect.midX - tailSize, y: bubbleRect.maxY))
    tailPath.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
    tailPath.addLine(to: CGPoint(x: rect.midX + tailSize, y: bubbleRect.maxY))
    tailPath.close()
    path.append(tailPath)
    return path
}

// Checkmark
func checkmarkPath(in rect: CGRect) -> UIBezierPath {
    let path = UIBezierPath()
    path.move(to: CGPoint(x: rect.width * 0.2, y: rect.height * 0.5))
    path.addLine(to: CGPoint(x: rect.width * 0.4, y: rect.height * 0.75))
    path.addLine(to: CGPoint(x: rect.width * 0.8, y: rect.height * 0.25))
    return path
}
```

### Bezier Curves

```swift
let path = UIBezierPath()
path.move(to: CGPoint(x: 0, y: 100))

// Quadratic curve (one control point)
path.addQuadCurve(to: CGPoint(x: 200, y: 100), controlPoint: CGPoint(x: 100, y: 0))

// Cubic curve (two control points)
path.addCurve(to: CGPoint(x: 400, y: 100),
              controlPoint1: CGPoint(x: 250, y: -50),
              controlPoint2: CGPoint(x: 350, y: 200))
```

### Path Animation (Morph Between Shapes)

```swift
let shapeLayer = CAShapeLayer()
shapeLayer.path = circlePath.cgPath

let morph = CABasicAnimation(keyPath: "path")
morph.fromValue = circlePath.cgPath
morph.toValue = squarePath.cgPath
morph.duration = 0.5
morph.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
shapeLayer.path = squarePath.cgPath  // Set model value
shapeLayer.add(morph, forKey: "morph")
```

**Tip**: For smooth morphing, both paths should have the same number of control points.

---

## CAGradientLayer

### Linear Gradient (Basic)

```swift
let gradient = CAGradientLayer()
gradient.frame = view.bounds
gradient.colors = [UIColor.blue.cgColor, UIColor.purple.cgColor]
gradient.startPoint = CGPoint(x: 0, y: 0)
gradient.endPoint = CGPoint(x: 1, y: 1)
view.layer.insertSublayer(gradient, at: 0)
```

### Multi-Stop Gradient

```swift
let gradient = CAGradientLayer()
gradient.frame = view.bounds
gradient.colors = [
    UIColor.systemRed.cgColor,
    UIColor.systemOrange.cgColor,
    UIColor.systemYellow.cgColor,
    UIColor.systemGreen.cgColor,
]
gradient.locations = [0.0, 0.33, 0.66, 1.0]
gradient.startPoint = CGPoint(x: 0, y: 0)
gradient.endPoint = CGPoint(x: 1, y: 0)  // Horizontal
view.layer.insertSublayer(gradient, at: 0)
```

### Radial Gradient

CAGradientLayer supports radial gradients via the `type` property.

```swift
let gradient = CAGradientLayer()
gradient.type = .radial
gradient.frame = view.bounds
gradient.colors = [UIColor.white.cgColor, UIColor.systemBlue.cgColor]
gradient.startPoint = CGPoint(x: 0.5, y: 0.5)  // Centre
gradient.endPoint = CGPoint(x: 1.0, y: 1.0)    // Edge reach
view.layer.insertSublayer(gradient, at: 0)
```

### Conic Gradient

```swift
let gradient = CAGradientLayer()
gradient.type = .conic
gradient.frame = view.bounds
gradient.colors = [
    UIColor.systemRed.cgColor,
    UIColor.systemYellow.cgColor,
    UIColor.systemGreen.cgColor,
    UIColor.systemCyan.cgColor,
    UIColor.systemBlue.cgColor,
    UIColor.systemRed.cgColor,  // Close the loop
]
gradient.startPoint = CGPoint(x: 0.5, y: 0.5)
gradient.endPoint = CGPoint(x: 0.5, y: 0.0)
view.layer.insertSublayer(gradient, at: 0)
```

### Gradient Types Reference

| Type | `startPoint` | `endPoint` | Effect |
|---|---|---|---|
| `.axial` (default) | Start of line | End of line | Linear gradient along a line |
| `.radial` | Centre of inner circle | Corner controlling outer circle radius | Circular gradient from centre outward |
| `.conic` | Centre of rotation | Controls start angle | Sweep around a centre point |

### Animated Gradient

```swift
let colorChange = CABasicAnimation(keyPath: "colors")
colorChange.fromValue = [UIColor.systemBlue.cgColor, UIColor.systemPurple.cgColor]
colorChange.toValue = [UIColor.systemPurple.cgColor, UIColor.systemPink.cgColor]
colorChange.duration = 2.0
colorChange.autoreverses = true
colorChange.repeatCount = .infinity
gradient.add(colorChange, forKey: "colorShift")
```

### Gradient as Text Mask

```swift
let gradientLayer = CAGradientLayer()
gradientLayer.frame = label.bounds
gradientLayer.colors = [UIColor.systemBlue.cgColor, UIColor.systemPink.cgColor]
gradientLayer.startPoint = CGPoint(x: 0, y: 0.5)
gradientLayer.endPoint = CGPoint(x: 1, y: 0.5)
label.layer.mask = gradientLayer

// Update gradient frame on layout changes
override func layoutSubviews() {
    super.layoutSubviews()
    gradientLayer.frame = label.bounds
}
```

### Gradient with Shape Mask

```swift
let gradient = CAGradientLayer()
gradient.frame = view.bounds
gradient.colors = [UIColor.systemIndigo.cgColor, UIColor.systemTeal.cgColor]

let maskLayer = CAShapeLayer()
maskLayer.path = starPath(center: CGPoint(x: 50, y: 50), points: 5, outerRadius: 40, innerRadius: 20).cgPath
gradient.mask = maskLayer

view.layer.addSublayer(gradient)
```

## UIViewPropertyAnimator (iOS 10+)

```swift
let animator = UIViewPropertyAnimator(duration: 0.3, curve: .easeInOut) {
    view.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
}
animator.addCompletion { position in
    if position == .end { /* animation finished */ }
}
animator.startAnimation()

// Interactive (scrubbing)
animator.fractionComplete = 0.5  // 50% through
animator.pauseAnimation()
animator.continueAnimation(withTimingParameters: nil, durationFactor: 1.0)
```

## UIView.animate

```swift
UIView.animate(withDuration: 0.3, delay: 0, options: .curveEaseInOut) {
    view.alpha = 0
    view.transform = CGAffineTransform(translationX: 0, y: -20)
} completion: { _ in
    view.removeFromSuperview()
}

// Spring animation
UIView.animate(withDuration: 0.5, delay: 0, usingSpringWithDamping: 0.7,
               initialSpringVelocity: 0.5) {
    view.transform = .identity
}
```

## SwiftUI Bridging (UIViewRepresentable)

```swift
struct AnimatedUIKitView: UIViewRepresentable {
    var isExpanded: Bool

    func makeUIView(context: Context) -> UIView { UIView() }

    func updateUIView(_ uiView: UIView, context: Context) {
        // iOS 17+: coordinate with SwiftUI animation
        context.animate {
            uiView.transform = isExpanded
                ? CGAffineTransform(scaleX: 1.2, y: 1.2)
                : .identity
        }
    }
}
```

## CADisplayLink (Frame-Synced Updates)

```swift
let displayLink = CADisplayLink(target: self, selector: #selector(step))
displayLink.add(to: .main, forMode: .common)

@objc func step(_ link: CADisplayLink) {
    let elapsed = link.targetTimestamp - link.timestamp
    // Update per-frame logic
}

// Clean up
displayLink.invalidate()
```
