# Delight

Moments of joy that transform functional UI into memorable experiences. Delight enhances usability — it never obscures it.

## Delight Principles

### Amplifies, Never Blocks
- Delight moments < 1 second
- Never delay core functionality for delight
- Make delight skippable or passive
- Respect the user's task focus

### Appropriate to Context
- Match delight to the emotional moment (celebrate success, empathise with errors)
- Don't be playful during critical operations
- Health apps ≠ games — calibrate personality to domain
- Financial data → confidence and clarity, not whimsy

### Compounds Over Time
- Vary responses (not the same animation every time)
- Reveal deeper layers with continued use
- First-time actions get special treatment
- Repeated success gets lighter acknowledgement

### One Per Screen
- Pick ONE delight moment per screen. If everything is special, nothing is.
- Layer 4 from `animation-strategy.md` — reserve for meaningful moments.

## Haptic Feedback

The most underused delight tool on iOS. Haptics create a physical connection between user and interface.

### Built-in Haptic Patterns

```swift
// Success — task completed
.sensoryFeedback(.success, trigger: didComplete)

// Error — something went wrong
.sensoryFeedback(.error, trigger: didFail)

// Warning — caution needed
.sensoryFeedback(.warning, trigger: showWarning)

// Impact — physical interaction (toggle, snap, drop)
.sensoryFeedback(.impact(flexibility: .soft), trigger: didToggle)
.sensoryFeedback(.impact(weight: .heavy), trigger: didDrop)

// Selection — picker/wheel change
.sensoryFeedback(.selection, trigger: selectedItem)

// Increase/decrease — value changed
.sensoryFeedback(.increase, trigger: value)
```

### When to Use Haptics

| Action | Haptic | Why |
|---|---|---|
| Toggle switch | `.impact(flexibility: .soft)` | Physical snap feeling |
| Delete item | `.impact(weight: .medium)` | Confirms destructive action |
| Pull-to-refresh release | `.impact(flexibility: .rigid)` | Snap into refresh |
| Save complete | `.success` | Confirms completion |
| Validation error | `.error` | Alert without alarm |
| Picker scroll | `.selection` | Detent feedback |
| Achievement unlocked | `.success` | Celebration moment |
| Slider value change | `.selection` | Continuous feedback |
| Swipe action threshold | `.impact(flexibility: .rigid)` | Confirms commitment |
| Long press recognised | `.impact(weight: .heavy)` | Confirms activation |

### When NOT to Use Haptics
- Scrolling (system handles this)
- Every tap (overwhelming)
- Background operations completing
- Navigation transitions
- Keyboard typing (system handles this)

## SF Symbol Effects

Symbol effects add personality to icons without custom animation code.

```swift
// One-time bounce on trigger
Image(systemName: "star.fill")
    .symbolEffect(.bounce, value: didEarn)

// Layered bounce (parts animate separately)
Image(systemName: "star.fill")
    .symbolEffect(.bounce.up.byLayer, value: didEarn)

// Pulse while active
Image(systemName: "antenna.radiowaves.left.and.right")
    .symbolEffect(.pulse, isActive: isSyncing)

// Variable colour (fill level)
Image(systemName: "wifi")
    .symbolEffect(.variableColor.iterative, isActive: isConnecting)

// Replace transition
Image(systemName: isPlaying ? "pause.fill" : "play.fill")
    .contentTransition(.symbolEffect(.replace))

// Disappear/appear
Image(systemName: "bell.fill")
    .symbolEffect(.disappear, isActive: isMuted)
```

### Effect Selection Guide

| Moment | Effect |
|---|---|
| Achievement / reward | `.bounce.up.byLayer` |
| Active process | `.pulse` |
| Connecting / syncing | `.variableColor.iterative` |
| State toggle | `.contentTransition(.symbolEffect(.replace))` |
| Muted / disabled | `.disappear` |
| Attention needed | `.bounce` (once, on trigger) |
| Download progress | `.variableColor.cumulative` |

## Empty State Personality

Empty states are onboarding opportunities. Make them welcoming, not dead-end.

```swift
// FUNCTIONAL (minimum bar)
ContentUnavailableView(
    "No Workouts Yet",
    systemImage: "figure.run",
    description: Text("Your workout history will appear here.")
)

// DELIGHTFUL (adds warmth)
ContentUnavailableView {
    Label("Ready When You Are", systemImage: "figure.run")
        .symbolEffect(.pulse, isActive: true)
} description: {
    Text("Your first workout will appear here. Every journey starts with a single step.")
} actions: {
    Button("Start Workout") { showWorkout = true }
        .buttonStyle(.borderedProminent)
}
```

Guidelines:
- Use a relevant SF Symbol, not a generic one
- Write copy specific to the feature, not generic
- Include a clear action when the user can fix it
- Consider a subtle symbol effect to add life

## Success Celebrations

Scale celebration to significance:

### Small Success (save, add, toggle)
```swift
// Haptic only — no visual celebration needed
.sensoryFeedback(.success, trigger: didSave)
```

### Medium Success (complete task, send message)
```swift
// Haptic + symbol effect + content transition
Image(systemName: "checkmark.circle.fill")
    .symbolEffect(.bounce.up, value: didComplete)
    .foregroundStyle(.green)
    .sensoryFeedback(.success, trigger: didComplete)

Text(didComplete ? "Saved" : "Save")
    .contentTransition(.numericText())
```

### Large Success (milestone, streak, first-time achievement)
```swift
// Haptic + staggered entrance + prominent visual
VStack(spacing: 16) {
    Image(systemName: "trophy.fill")
        .font(.system(size: 48))
        .symbolEffect(.bounce.up.byLayer, value: showCelebration)
        .foregroundStyle(.yellow)

    Text("7-Day Streak!")
        .font(.title.bold())

    Text("You've logged every day this week.")
        .foregroundStyle(.secondary)
}
.sensoryFeedback(.success, trigger: showCelebration)
```

## Milestone Recognition

Track and celebrate user milestones:

```swift
// First-time actions
if isFirstWorkout {
    // Special treatment — welcoming, encouraging
    Text("First workout complete!")
}

// Streak tracking
if streak.isMultipleOf(7) {
    // Weekly milestone — celebrate
}

// Round numbers
if totalWorkouts.isMultipleOf(10) {
    // "10 workouts!" — acknowledge growth
}
```

Celebration frequency: more frequent early (1st, 5th, 10th), less frequent later (every 50, every 100). Don't celebrate the 347th workout.

## Contextual Touches

Small details that show care:

```swift
// Time-aware greetings
var greeting: String {
    let hour = Calendar.current.component(.hour, from: .now)
    switch hour {
    case 5..<12: return "Good morning"
    case 12..<17: return "Good afternoon"
    case 17..<22: return "Good evening"
    default: return "Hello"
    }
}

// Relative dates feel more personal
Text(date, format: .relative(presentation: .named))
// "Today", "Yesterday", "Last Monday"

// Smart defaults based on time
// Morning → suggest morning routine
// Evening → suggest reflection/journaling
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---|---|---|
| Haptic on every tap | Overwhelming, loses meaning | Reserve for significant actions |
| Celebration for routine actions | Feels patronising | Haptic only for small wins |
| Generic empty states | Missed opportunity | Feature-specific copy + icon |
| Same celebration every time | Gets stale | Vary by milestone type |
| Delight during errors | Tone-deaf | Empathy for errors, joy for success |
| Custom sound on every action | Annoying | System haptics, sounds only for key moments |
| Animation that delays the task | User is blocked | Keep delight under 1 second |
| Forced celebration (modal) | Can't skip | Inline celebration, auto-dismiss |

## Review Checklist

- [ ] Every user action has appropriate haptic feedback
- [ ] Success uses right scale (haptic only → visual → celebration)
- [ ] Empty states have personality and clear next action
- [ ] SF Symbol effects used for state changes and achievements
- [ ] At most one delight moment per screen
- [ ] First-time actions get special treatment
- [ ] Celebrations don't block interaction
- [ ] Haptics respect system settings (handled automatically by `.sensoryFeedback`)
- [ ] Reduced motion respected (symbol effects handle this automatically)
- [ ] Copy is specific to the feature, not generic
