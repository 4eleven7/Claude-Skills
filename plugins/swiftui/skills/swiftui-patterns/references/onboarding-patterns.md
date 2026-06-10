# Onboarding Patterns (HIG)

## Core Rule

Onboarding should get people into the app fast. Most people skip tutorials. Design the app to be self-explanatory first, then add onboarding only for what isn't obvious.

## Decision Tree

```
Does the feature need explanation?
├── No → Skip onboarding entirely (most features)
├── Yes, but it's contextual → Use TipKit (in-context discovery)
└── Yes, it's fundamental to the app experience
    ├── One-time setup required? → Setup assistant (permissions, account)
    └── Novel interaction model? → Brief walkthrough (max 3 screens)
```

## Permission Request Timing

**Never at launch.** Request at the moment the user takes an action that needs the permission.

```
User taps "Track Steps" → HealthKit authorization
User taps camera button → Camera permission
User enables reminders → Notification permission
```

### Pre-Permission Pattern

```swift
// Show context BEFORE the system dialog
struct PermissionExplainer: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "heart.text.square")
                .font(.system(size: 48))
            Text("Health Data Access")
                .font(.title2.bold())
            Text("We use your step count and heart rate to calculate your daily wellness score.")
                .multilineTextAlignment(.center)
            Button("Continue") {
                // NOW show system permission dialog
                requestHealthKitAuth()
            }
            Button("Not Now") { dismiss() }
                .foregroundStyle(.secondary)
        }
    }
}
```

## First-Run Experience Types

### 1. Welcome Screen (Brief Value Prop)
- Max 3 screens, swipeable
- Focus on benefits, not features
- "Get Started" button visible on every screen
- No "Skip" needed if "Get Started" is always available

### 2. Setup Assistant (Required Configuration)
- Account creation, data import, initial preferences
- Show progress (step 1 of 3)
- Allow skipping optional steps
- Offer "Set up later" for non-critical configuration

### 3. Progressive Disclosure (Best Approach)
- No onboarding at all — reveal features as the user encounters them
- Use TipKit for contextual hints
- Use `ContentUnavailableView` for empty states that teach
- Use placeholder content to show what the feature does

## Empty States as Onboarding

```swift
ContentUnavailableView {
    Label("No Workouts Yet", systemImage: "figure.run")
} description: {
    Text("Your workout history will appear here once you complete your first session.")
} actions: {
    Button("Start a Workout") { startWorkout() }
}
```

## What NOT to Do

- Don't show a tutorial on every launch
- Don't require account creation before showing value
- Don't request all permissions at once
- Don't use splash screens as onboarding
- Don't explain standard iOS patterns (swipe, tap, scroll)
- Don't block the app behind a mandatory walkthrough
- Don't show "What's New" on minor updates — only for genuinely useful new features

## "What's New" Pattern

Show only when:
- A major feature was added that changes workflow
- The user hasn't seen this version's announcement yet

```swift
.sheet(isPresented: $showWhatsNew) {
    WhatsNewView(features: [
        Feature(icon: "chart.bar", title: "Health Dashboard", description: "See all your metrics in one place."),
    ])
}
// Track with @AppStorage("lastSeenVersion")
```
