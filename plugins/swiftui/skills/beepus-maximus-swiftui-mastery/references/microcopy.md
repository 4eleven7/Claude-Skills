# Microcopy

Quality standards for every string in the UI. Good copy is invisible — users understand immediately without noticing the words.

## Core Principles

1. **Be specific**: "Add Workout" not "Submit"
2. **Be concise**: cut unnecessary words, but not at the cost of clarity
3. **Be active**: "Save Changes" not "Changes will be saved"
4. **Be human**: "Couldn't connect" not "Network error encountered"
5. **Be helpful**: tell users what to do, not just what happened
6. **Be consistent**: same terms throughout — pick one and stick with it

## Error Messages

**Every error must explain what happened AND what to do about it.**

```swift
// BAD — unhelpful
ContentUnavailableView("Error", systemImage: "exclamationmark.triangle")

// BAD — blames user
Alert("Invalid Input")

// GOOD — explains + guides
ContentUnavailableView {
    Label("Couldn't Load Workouts", systemImage: "wifi.slash")
} description: {
    Text("Check your connection and try again.")
} actions: {
    Button("Retry") { Task { await load() } }
}

// GOOD — inline validation
TextField("Email", text: $email)
if !email.isEmpty && !email.contains("@") {
    Text("Email addresses need an @ symbol")
        .font(.caption)
        .foregroundStyle(.red)
}
```

Rules:
- Never blame the user ("Invalid input" → "This field needs a number")
- Include the specific problem ("Name is required" not "Form incomplete")
- Suggest the fix ("Try a shorter name" not just "Name too long")
- Use sentence case, not SHOUTING

## Empty States

**Every empty state needs: what goes here + why it matters + how to start.**

```swift
// BAD
Text("No items")
    .foregroundStyle(.secondary)

// GOOD
ContentUnavailableView(
    "No Workouts Yet",
    systemImage: "figure.run",
    description: Text("Your workout history will appear here. Start your first workout to begin tracking.")
)

// GOOD — with action
ContentUnavailableView {
    Label("No Supplements", systemImage: "pill")
} description: {
    Text("Track what you take and when.")
} actions: {
    Button("Add Supplement") { showAddSheet = true }
}
```

Empty state types and tone:
| Type | Tone | Example |
|---|---|---|
| First use | Welcoming, guiding | "Your workout history will appear here" |
| User cleared | Light, easy to restart | "No workouts this week" |
| No search results | Helpful, suggest alternatives | "No results for 'xyz'. Try a different search." |
| No permission | Explanatory, actionable | "Calendar access needed to show events" |
| Error | Empathetic, actionable | "Couldn't load data. Pull to refresh." |

## Button Labels

**Specific verbs > generic verbs. Always.**

| Bad | Good | Why |
|---|---|---|
| Submit | Save Changes | Specific action |
| OK | Got It | Acknowledges understanding |
| Cancel | Discard Changes | Honest about consequence |
| Yes / No | Delete Workout / Keep | Describes each choice |
| Continue | Start Workout | Names the destination |
| Done | Save & Close | Clarifies both actions |
| Add | Add Supplement | Names what's being added |
| Delete | Remove from History | Specific and less alarming |

```swift
// BAD — generic
Button("OK") { dismiss() }

// GOOD — specific
Button("Save Changes") { save(); dismiss() }
```

## Confirmation Dialogs

**State the specific action. Explain the consequence. Label buttons with verbs, not "Yes/No".**

```swift
// BAD
Alert("Are you sure?") {
    Button("Yes") { delete() }
    Button("No", role: .cancel) {}
}

// GOOD
.confirmationDialog(
    "Delete \(workout.name)?",
    isPresented: $showDelete
) {
    Button("Delete Workout", role: .destructive) { delete() }
    Button("Cancel", role: .cancel) {}
} message: {
    Text("This will permanently remove the workout and its data.")
}
```

Rules:
- Name the specific item being affected
- Explain what "delete" means (permanent? recoverable?)
- Destructive button uses `.destructive` role
- Don't overuse confirmations — only for irreversible actions

## Loading States

```swift
// BAD — no context
ProgressView()

// GOOD — explains what's loading
ProgressView("Loading workouts…")

// GOOD — time estimate for long operations
ProgressView("Syncing health data…")
    .task {
        // Explain if it takes long
    }
```

Rules:
- Use "Loading [specific thing]…" not just "Loading…"
- Add time estimates for operations over 5 seconds
- Show progress (determinate) when possible
- Offer cancel for operations over 10 seconds

## Success Feedback

```swift
// BAD — no confirmation
// (action happens silently)

// GOOD — brief confirmation
.sensoryFeedback(.success, trigger: didSave)
// Pair with visual confirmation (checkmark, toast, etc.)

// GOOD — for significant actions
// Show inline confirmation that auto-dismisses
```

Rules:
- Small actions → haptic only (save, toggle, add)
- Medium actions → haptic + brief visual (send, complete)
- Large achievements → haptic + celebration UI (milestone, streak)
- Never use alerts for success — they require dismissal

## Navigation & Labels

```swift
// BAD — generic
NavigationLink("Items") { ItemList() }

// GOOD — specific
NavigationLink("Workout History") { WorkoutHistoryView() }

// BAD — jargon
Section("Biometrics") { ... }

// GOOD — plain language
Section("Body Measurements") { ... }
```

## Accessibility Labels

**VoiceOver labels must convey meaning, not describe the icon.**

```swift
// BAD — describes the icon
Button { toggleFavourite() } label: {
    Image(systemName: "heart.fill")
}
.accessibilityLabel("Heart")

// GOOD — describes the action
Button { toggleFavourite() } label: {
    Image(systemName: "heart.fill")
}
.accessibilityLabel(isFavourite ? "Remove from favourites" : "Add to favourites")

// BAD — redundant
Text("Weight").accessibilityLabel("Weight label")

// GOOD — adds context
Text("\(weight, format: .number) kg")
    .accessibilityLabel("\(weight, format: .number) kilograms")
```

## Copy Anti-Patterns

Words and phrases that signal lazy, generic copy:

| Avoid | Why | Alternative |
|---|---|---|
| "Oops!" | Patronising | State the problem directly |
| "Something went wrong" | Vague | Name the specific error |
| "Please try again later" | Unhelpful | Explain when/why to retry |
| "Are you sure?" | Generic | State the action and consequence |
| "Success!" | No context | "Workout saved" or haptic only |
| "Welcome back!" | Filler | Skip it or show useful info |
| "Loading..." | Generic | "Loading workouts…" |
| "N/A" | Ugly | Use em-dash (—) or hide the field |
| "Submit" | Generic | Name the action |
| "Elevate", "Seamless", "Unleash" | Marketing filler | Plain, direct language |

## Review Checklist

- [ ] Error messages explain what happened AND what to do
- [ ] Empty states use `ContentUnavailableView` with guidance
- [ ] Button labels use specific verbs, not "OK/Submit/Continue"
- [ ] Confirmation dialogs name the item and consequence
- [ ] Loading states say what's loading
- [ ] Success uses haptic + brief visual, not alerts
- [ ] Accessibility labels describe actions/meaning, not icons
- [ ] No generic/filler copy (Oops, Something went wrong, etc.)
- [ ] Consistent terminology throughout the app
- [ ] Tone matches context (empathetic for errors, welcoming for empty states)
