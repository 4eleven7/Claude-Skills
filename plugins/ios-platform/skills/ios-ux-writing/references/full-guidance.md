# iOS UX Writing

Write clear, purposeful interface copy for iOS apps. Every string the user sees should earn its place.

## Responsibility

**Owns:**
- Alert titles, messages, and button labels
- Error messages and recovery suggestions
- Empty state copy (ContentUnavailableView text)
- Button labels and action descriptions
- Onboarding and tooltip copy
- Accessibility labels and hints
- Notification titles and bodies
- Confirmation dialogs and destructive action copy

**Does NOT own:**
- Visual design decisions (spacing, colour, typography)
- Information architecture or navigation flow
- Marketing copy for App Store (see `app-store-marketing`)
- Technical logging messages

## Voice-First Workflow

### Step 1: Find the Voice

Before writing any copy, establish the product's voice:

1. Check project instructions (the project instructions) or style guides for existing voice definitions
2. If none exist, infer from existing app copy — scan 10-15 strings for patterns
3. If the app is new, define 3-4 personality traits (e.g., "precise, warm, understated, direct")
4. Look for productive tensions between traits — "warm but not chatty" is more useful than "friendly"

### Step 2: Apply the Precedence Chain

**clarity > voice > craft rules**

- **Clarity** always wins. If a sentence is clear but doesn't match the voice, keep it clear.
- **Voice** shapes how things sound. Same information, different personality.
- **Craft rules** (remove filler, avoid repetition) are voice-filtered heuristics, not absolutes.

### Step 3: Adjust Tone as Dials

Each voice quality is a dial you turn up or down per situation:

| Situation | Turn Up | Turn Down |
|---|---|---|
| Celebrating a milestone | Warmth, encouragement | Formality |
| Error state | Clarity, helpfulness | Playfulness |
| Destructive action | Precision, gravity | Casualness |
| Empty state | Helpfulness, invitation | Urgency |
| Permission request | Transparency, respect | Enthusiasm |

## PACE Framework

From WWDC22 "Writing for Interfaces":

- **Purpose**: What is the single most important thing this text must communicate?
- **Anticipation**: After telling a problem, tell how to fix it. After telling success, tell what comes next.
- **Context**: Match density to available attention. A modal can say more than a toast. Write for the device.
- **Empathy**: Plain language, accessibility-first, localization-ready. No jargon, no blame.

## Craft Rules

### Remove Filler — With Care

Test: remove the word. If neither meaning nor intentional tone changes, cut it.

- "just" — usually filler ("Just tap to start" → "Tap to start")
- "simply" — usually filler and often condescending
- "please" — usually filler in UI ("Please enter your name" → "Enter your name")
- "yet" — sometimes load-bearing ("Nothing here yet" — "yet" implies something will appear)

### Avoid Repetition

If the headline and body say the same thing, collapse them:

```
// BAD — says the same thing twice
Title: "No Workouts Found"
Body: "You don't have any workouts yet."

// GOOD — body adds new information
Title: "No Workouts"
Body: "Start a workout to see your history here."
```

### Be Specific

```
// BAD
"Can't open this file"
"An error occurred"
"Item saved"

// GOOD
"Can't open 'Report.pdf' — the file may be corrupted"
"Unable to save: storage is full (42 MB needed)"
"Workout saved to Wednesday, March 25"
```

### Avoid "We"

The app is not a person. Passive or direct constructions are clearer:

```
// BAD
"We're having trouble loading your data"
"We couldn't find any results"

// GOOD
"Unable to load data. Check your connection and try again."
"No results for 'magnesim'. Check the spelling?"
```

### Handle Zero/One/Many

```
// BAD
"0 results found"
"1 items selected"

// GOOD
"No results" / "1 result" / "24 results"
"No items selected" / "1 item selected" / "3 items selected"
```

Test with real values including edge cases: long names, large numbers, empty strings.

## Pattern Library

### Alerts

- Must justify interruption cost — if the user doesn't need to decide, don't use an alert
- Title + buttons should convey the full situation alone (many users skip the body)
- Avoid alerts for: non-essential information, preventable errors, common undoable actions

```
// BAD
Title: "Are you sure?"
Body: "This action cannot be undone."
Buttons: [Cancel] [OK]

// GOOD
Title: "Delete 'Morning Routine'?"
Body: "This removes the routine and its 12 logged entries. This can't be undone."
Buttons: [Keep Routine] [Delete Routine]
```

### Errors

Say what happened → explain why (if helpful) → tell what to do next:

```
// BAD
"Error: Invalid input"
"Oops! Something went wrong."

// GOOD
"Unable to save supplement — the name field is required."
"Can't connect to Health. Open Settings → Privacy → Health to grant access."
```

No jargon. No blaming the user. No interjections ("Oops!", "Uh oh!").

### Destructive Actions

- Name the specific thing being destroyed
- Make consequences explicit with real numbers
- Button labels must be independently clear — no "Confirm" / "Cancel"
- Avoid double-negatives ("Don't cancel subscription" → confusing)

```
// BAD
Buttons: [Cancel] [Confirm]

// GOOD
Title: "Cancel Subscription?"
Body: "You'll lose access to premium features on April 12. Your data will be kept."
Buttons: [Keep Subscription] [Cancel Subscription]
```

### Empty States

Tell what will appear → how to make it happen → include a clear action:

```swift
ContentUnavailableView {
    Label("No Supplements", systemImage: "pill")
} description: {
    Text("Tap + to add your first supplement.")
} actions: {
    Button("Add Supplement") { addSupplement() }
}
```

Match tone to context: first-time empty is inviting; search-empty is helpful; error-empty is reassuring.

### Accessibility Labels

- Describe intent, not appearance ("Close" not "X button")
- Don't include element type — VoiceOver adds "button", "image", etc. automatically
- Update on state change ("Playing" / "Paused", not static "Play/Pause button")
- Match richness to content complexity — a simple icon gets a word; a complex chart gets a sentence
- Use `accessibilityHint` sparingly — only when the action isn't obvious from the label

### Buttons

- Specific verbs always: "Save Changes" not "OK", "Add Supplement" not "Submit"
- Paired choices must be independently clear: "Keep Routine" / "Delete Routine", not "Yes" / "No"
- Destructive buttons use `.destructive` role and name the destruction
- Primary action verb should match the screen's purpose

## Anti-Patterns (BANNED)

| Banned | Why | Replace With |
|---|---|---|
| "Oops!" / "Uh oh!" | Patronising, adds nothing | State the problem directly |
| "Something went wrong" | Vague, unhelpful | Specific error with recovery action |
| "Submit" / "Continue" / "Done" (generic) | Tells user nothing about the action | Specific verb: "Save Changes", "Start Workout" |
| "Elevate" / "Seamless" / "Unleash" / "Next-Gen" | Marketing fluff | Direct description of what it does |
| "Invalid input" / "Error occurred" | Developer speak | Human language: "Name is required" |
| "We're having trouble" | No "we" | "Unable to load data" |
| "0 results found" | Unnatural | "No results" |
| "Are you sure?" as alert title | Wastes the title slot | Restate the action: "Delete 'Morning Routine'?" |
| "Please try again later" | Vague, unhelpful | Specific: "Check your connection and pull to refresh" |
| Exclamation marks in errors | Sounds alarmed | Period or no punctuation |

## Localization Awareness

When writing copy that will be localized:

- Avoid idioms and cultural references ("out of the box", "hit the ground running")
- Allow 30-40% text expansion for translation (German, Finnish are longer than English)
- Use complete sentences — word order changes across languages make fragments unreliable
- Don't embed numbers in strings without proper formatting: `String(localized: "\(count) items")` not `"\(count) items"`
- Test with pseudolocalization to catch truncation and layout issues

## Sources

- Apple HIG Writing guidelines
- WWDC22 "Writing for Interfaces" (PACE framework)
- WWDC24 "Add Personality Through UX Writing" (dial metaphor)
- WWDC25 "Make a Big Impact with Small Writing Changes"
- WWDC19 "Writing Great Accessibility Labels"
- Apple Style Guide
