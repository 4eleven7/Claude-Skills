---
name: swiftui-microinteractions
description: "Use when designing, reviewing, or implementing iOS microinteractions, toggles, confirmations, pull-to-refresh, input validation, interactive polish, or signature product moments."
---

# SwiftUI Microinteractions

A microinteraction is a contained product moment built around a single use case: toggling a setting, completing a task, validating input, refreshing data. Users rarely think about them consciously — but they feel when they're missing or wrong.

Every microinteraction has four parts: **Trigger**, **Rules**, **Feedback**, **Loops & Modes**.

---

## Responsibility

### What this skill owns
- The Trigger/Rules/Feedback/Loops design framework applied to SwiftUI
- Signature moment identification and implementation
- Progressive reduction (retiring scaffolding over time)
- iOS-native interaction patterns and their SwiftUI implementations
- Microinteraction audit checklist

### What this skill does NOT own
- Animation implementation details (see `delight.md` in swiftui-mastery)
- Haptic API reference (see `haptics`)
- SF Symbol effect catalogue (see `sf-symbols`)
- Full UX flow design (see `workflow-audit`)

---

## The Four Parts

### 1. Trigger

The trigger initiates the microinteraction. It can be **manual** (user-initiated) or **system** (condition-met).

**Manual triggers** in SwiftUI:
- Tap: `Button`, `onTapGesture`, `Toggle`
- Long press: `.contextMenu`, `onLongPressGesture`
- Swipe: `.swipeActions`, `DragGesture`
- Pull: `.refreshable`
- Scroll: `ScrollViewReader`, `scrollPosition`

**System triggers** in SwiftUI:
- Data arrival: `.onChange(of:)`, `.task`
- Time elapsed: `TimelineView`, `.onReceive(timer)`
- State threshold: computed property triggers view update
- App lifecycle: `.onAppear`, `scenePhase`

**Rules for triggers:**
- A trigger must communicate three things: that it exists, what it does, and its current state
- Hidden gesture triggers (swipe, long press) must be paired with a visible alternative
- Trigger prominence should match action importance — destructive actions need prominent, deliberate triggers
- Disabled triggers must look visually distinct from enabled ones

```swift
// GOOD — trigger communicates state and affordance
Button {
    toggleFavourite()
} label: {
    Image(systemName: isFavourite ? "heart.fill" : "heart")
        .foregroundStyle(isFavourite ? .red : .secondary)
        .contentTransition(.symbolEffect(.replace))
}
.sensoryFeedback(.impact(flexibility: .soft), trigger: isFavourite)

// BAD — invisible trigger, no state indication
Text("Item")
    .onTapGesture { toggleFavourite() }
```

### 2. Rules

Rules define what happens once triggered. They are the invisible logic users never see but immediately feel when wrong.

**Rule design principles:**
- Match platform conventions — a toggle should toggle, a swipe-to-delete should delete
- Constrain inputs to prevent errors (character limits, value ranges, format masks)
- Handle edge cases explicitly: empty, maximum, repeated trigger, interruption
- Simple rules produce complex-feeling interactions; complex rules produce confusion

**Common iOS rule patterns:**

| Interaction | Rule | SwiftUI Implementation |
|---|---|---|
| Toggle | Binary state flip, immediate | `Toggle(isOn: $value)` |
| Stepper | Increment/decrement within range | `Stepper(value: $count, in: 1...99)` |
| Swipe delete | Threshold-based commit | `.swipeActions { Button(role: .destructive) }` |
| Pull refresh | Pull past threshold, then release | `.refreshable { await reload() }` |
| Text input | Validate on change or on commit | `.onChange(of: text) { validate() }` |
| Undo | Time-windowed reversal | `UndoManager` or custom timer-based undo |

**Edge cases to define for every microinteraction:**
- What happens on double-tap / rapid repeated trigger?
- What happens if the user triggers during an in-progress animation?
- What happens at the boundary values (0, max, empty)?
- What happens on interruption (app background, navigation away)?

### 3. Feedback

Feedback communicates the rules to the user. It answers: "What is happening right now?"

**Feedback must be:**
- **Immediate** — under 100ms for direct manipulation
- **Proportional** — scale to event significance (see Feedback Proportionality in `delight.md`)
- **Contextual** — use existing elements when possible, not separate notifications
- **Honest** — no fake progress bars or deceptive loading indicators

**iOS feedback channels (in order of subtlety):**

1. **Visual state change** — colour, opacity, symbol replacement (most subtle)
2. **Haptic** — `.sensoryFeedback` (physical confirmation)
3. **Animation** — `.symbolEffect`, `.transition`, `.matchedGeometryEffect` (spatial)
4. **Sound** — system sounds via `AudioServicesPlaySystemSound` (rare, use sparingly)

**SwiftUI feedback patterns:**

```swift
// Inline validation — feedback at the source
TextField("Email", text: $email)
    .textContentType(.emailAddress)
    .overlay(alignment: .trailing) {
        if !email.isEmpty {
            Image(systemName: isValidEmail ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(isValidEmail ? .green : .red)
                .contentTransition(.symbolEffect(.replace))
        }
    }

// Progress — honest, determinate when possible
ProgressView(value: uploadProgress) {
    Text("Uploading...")
}

// Success confirmation — replace the trigger with the result
Button {
    save()
} label: {
    Label(
        didSave ? "Saved" : "Save",
        systemImage: didSave ? "checkmark" : "square.and.arrow.down"
    )
    .contentTransition(.symbolEffect(.replace))
}
.sensoryFeedback(.success, trigger: didSave)
```

**Feedback anti-patterns:**
- Toast/snackbar for every action — use inline feedback instead
- Modal alert for non-critical confirmation — use inline state change
- No feedback on destructive actions — always confirm irreversible operations
- Identical feedback for success and failure — differentiate clearly

### 4. Loops and Modes

Loops define how the microinteraction behaves over time. Modes are temporary states where behaviour changes.

**Progressive reduction** — the most valuable loop pattern for iOS apps:

```swift
// Use TipKit to retire guidance after demonstrated competence
struct SwipeToDeleteTip: Tip {
    @Parameter
    static var deleteCount: Int = 0

    var title: Text { Text("Swipe to Delete") }
    var message: Text? { Text("Swipe left on any item to delete it.") }

    var rules: [Rule] {
        // Show only until the user has deleted 3 items
        #Rule(Self.$deleteCount) { $0 < 3 }
    }
}

// Track competence
func didDelete() {
    SwipeToDeleteTip.deleteCount += 1
}
```

**Loop patterns for iOS:**

| Pattern | Behaviour | Implementation |
|---|---|---|
| Progressive reduction | Retire hints after N uses | TipKit with parameter-based rules |
| Adaptive defaults | Learn user preferences | Store last-used values, suggest them first |
| Streak tracking | Reward consistency | Counter with milestone celebrations |
| Notification decay | Reduce alerts if ignored | Track dismissal count, reduce frequency |
| Onboarding sequence | First-run only | `@AppStorage("hasCompletedOnboarding")` |

**Mode rules:**
- Minimise modes — they violate "same action = same result"
- If you must use modes, make the current mode highly visible
- Edit mode is the most common iOS mode — use `.environment(\.editMode)`
- Prefer undo over mode-switching where possible

---

## Signature Moments

A signature moment is a microinteraction so distinctive it becomes part of your app's identity. Not every interaction should be one — pick 1-2 per app.

**Criteria for a signature moment:**
- Happens on a **frequent, visible action** — not buried in settings
- Is **functional first**, delightful second — never sacrifice usability
- Would be **missed if removed** — it's not decoration
- **Aligns with brand personality** — a health app's signature moment differs from a game's

**Where to invest in Atlas:**
- The moment a workout/log entry is saved (the daily touch-point)
- Streak or milestone recognition (the reward loop)

**Implementation approach:**
```swift
// Signature moment = haptic + visual + timing working together
// Example: logging completion
struct LogCompleteMoment: View {
    let trigger: Bool

    var body: some View {
        Image(systemName: "checkmark.circle.fill")
            .font(.system(size: 48))
            .symbolEffect(.bounce.up.byLayer, value: trigger)
            .foregroundStyle(.green)
            .sensoryFeedback(.success, trigger: trigger)
    }
}
```

**Restraint rule:** If everything is a signature moment, nothing is. One per app, two maximum.

---

## Microinteraction Audit

When reviewing any interactive SwiftUI view, check each element:

| Question | If No | Fix |
|---|---|---|
| Does the trigger show its current state? | Users can't tell if it's on/off/loading | Add distinct visual states |
| Is there feedback within 100ms of the action? | Users question whether their tap registered | Add `.sensoryFeedback` or visual state change |
| Does feedback scale match event significance? | Small actions feel dramatic or big actions feel trivial | Apply feedback proportionality from `delight.md` |
| Are edge cases handled (empty, max, double-tap)? | Interaction breaks under real use | Define behaviour for every boundary |
| Does the interaction evolve for returning users? | Day-100 users still see day-1 hints | Add TipKit with competence-based retirement |
| Is there a visible alternative for gesture triggers? | Users can't discover the functionality | Add a button or menu item alongside the gesture |
| Can the user undo or recover? | Users afraid to act | Add undo support or confirmation for destructive actions |

---

## Common iOS Microinteractions

Quick reference for standard patterns — don't reinvent these:

| Interaction | SwiftUI | Feedback |
|---|---|---|
| Pull to refresh | `.refreshable` | System spinner, haptic on release |
| Swipe actions | `.swipeActions` | Reveal animation, haptic on threshold |
| Context menu | `.contextMenu` | System preview, haptic on appear |
| Toggle | `Toggle(isOn:)` | System animation, haptic on change |
| Delete confirmation | `.confirmationDialog` | System presentation |
| Search | `.searchable` | System search bar animation |
| Share | `ShareLink` | System share sheet |
| Picker | `Picker` / `.pickerStyle` | Selection haptic per item |

For custom interactions beyond these, apply the Trigger/Rules/Feedback/Loops framework before writing code.

---

## Hero Transition Decision: matchedTransitionSource vs matchedGeometryEffect

| Use | API | Why |
|---|---|---|
| Cross-screen zoom (push, sheet, fullScreenCover) on iOS 18+ | `.matchedTransitionSource(id:in:)` on source + `.navigationTransition(.zoom(...))` on destination | System runs the zoom transition; respects Reduce Motion; works across `NavigationStack` and modal presentations |
| Same-screen morph between two states of the same logical view | `.matchedGeometryEffect(id:in:)` on both endpoints inside a single hierarchy, animated by a parent state change | One view is replaced by another with shared geometry interpolation |

Rule: if the transition crosses a presentation boundary (push or modal), use `matchedTransitionSource`. If both endpoints exist in the same view hierarchy and you toggle which one renders, use `matchedGeometryEffect`. Don't combine them on the same element.
