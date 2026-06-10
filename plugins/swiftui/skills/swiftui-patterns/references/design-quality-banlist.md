# SwiftUI Anti-Slop Banlist

Concrete, enforceable bans on patterns that make SwiftUI output look AI-generated. Every banned pattern includes why it fails and exactly what to do instead.

## The AI Slop Test

Before diving into individual bans, apply this meta-test to every screen you build or review:

**If you showed this interface to someone and said "AI made this," would they believe you immediately?** If yes, that's the problem. A distinctive interface should make someone ask "how was this made?" — not "which AI made this?"

The bans below are the specific fingerprints that trigger instant recognition. But the test above is the gate. If a screen passes every individual ban but still *feels* AI-generated — uniform, safe, predictable — it fails the slop test.

## Required Reading

Before applying these rules, read the canonical docs they extend:

- the project SwiftUI design-quality guidelines -- quality gate, anti-patterns, design constraints
- the project SwiftUI polish guidelines -- animation, surfaces, typography polish recipes
- the project colour/design-system guidelines -- palette, shade scale, adaptive helpers

This skill structures that content into a fast-lookup banlist with code pairs.

---

## Category 1: Layout Bans

### BAN: Uniform `.padding()` everywhere

**Why it's a tell:** Every element getting the same 16pt padding screams "I let the AI pick defaults." Real interfaces vary padding by semantic level.

**Replace with:** Vary by semantic level -- section: 24-32, group: 16, element: 8-12.

```swift
// BANNED
VStack {
    header.padding()
    content.padding()
    footer.padding()
}

// CORRECT
VStack(spacing: 0) {
    header
        .padding(.horizontal, 16)
        .padding(.top, 24)
        .padding(.bottom, 8)
    content
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    footer
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
}
```

### BAN: `Spacer()` as primary spacing tool

**Why it's a tell:** Spacer-heavy layouts are brittle and don't communicate intent. Stack spacing parameters produce predictable, maintainable layouts.

**Replace with:** Stack `spacing:` parameters and explicit padding for asymmetric cases.

```swift
// BANNED
VStack {
    Text("Title")
    Spacer().frame(height: 8)
    Text("Subtitle")
    Spacer().frame(height: 16)
    Text("Body")
}

// CORRECT
VStack(spacing: 0) {
    Text("Title")
        .padding(.bottom, 8)
    Text("Subtitle")
        .padding(.bottom, 16)
    Text("Body")
}

// ALSO CORRECT -- when spacing is uniform
VStack(spacing: 12) {
    Text("Title")
    Text("Subtitle")
    Text("Body")
}
```

### BAN: Centre-aligning body text

**Why it's a tell:** Centred body copy is a hallmark of landing pages and AI mockups. Real apps left-align body content.

**Replace with:** `.leading` alignment for body content. Centre only headings and hero text.

```swift
// BANNED
VStack {
    Text("Your daily summary")
        .font(.headline)
    Text("You completed 3 workouts this week and logged 14 meals.")
        .multilineTextAlignment(.center) // body text should not be centred
}

// CORRECT
VStack(alignment: .leading, spacing: 8) {
    Text("Your daily summary")
        .font(.headline)
    Text("You completed 3 workouts this week and logged 14 meals.")
}
```

### BAN: Every card in identical `RoundedRectangle`

**Why it's a tell:** Uniform card wrapping flattens visual hierarchy. Everything looks equally important.

**Replace with:** Vary visual weight between sections. Primary content gets card treatment; secondary content can use plain rows, dividers, or tinted backgrounds.

```swift
// BANNED -- every section looks the same
VStack {
    CardView { summaryContent }
    CardView { detailContent }
    CardView { metadataContent }
}

// CORRECT -- vary visual weight
VStack(spacing: 24) {
    summaryContent
        .padding(16)
        .background(.background, in: .rect(cornerRadius: 12, style: .continuous))
        .cardShadow()

    detailContent
        .padding(.horizontal, 16)
    // no card -- secondary content breathes without a container

    metadataContent
        .font(.caption)
        .foregroundStyle(.secondary)
        .padding(.horizontal, 16)
}
```

### BAN: Generic `ScrollView { VStack }` for settings-like screens

**Why it's a tell:** Reinventing what `Form` and `List` already do, but worse -- missing separators, selection styles, and accessibility traits.

**Replace with:** `Form` or `List` when the content is settings, options, or row-based navigation.

```swift
// BANNED
ScrollView {
    VStack(spacing: 12) {
        SettingsRow(title: "Notifications")
        SettingsRow(title: "Appearance")
        SettingsRow(title: "Privacy")
    }
    .padding()
}

// CORRECT
Form {
    Section {
        NavigationLink("Notifications") { NotificationsView() }
        NavigationLink("Appearance") { AppearanceView() }
        NavigationLink("Privacy") { PrivacyView() }
    }
}
```

### BAN: Identical spacing between all elements

**Why it's a tell:** Uniform spacing removes grouping cues. The eye can't distinguish sections from items.

**Replace with:** Asymmetric spacing -- more space above headers than below. Related elements cluster tighter than unrelated ones.

```swift
// BANNED
VStack(spacing: 16) {
    Text("Section Header")
    ItemRow()
    ItemRow()
    Text("Another Header")
    ItemRow()
}

// CORRECT
VStack(spacing: 0) {
    Text("Section Header")
        .font(.headline)
        .padding(.top, 24)  // generous space above header
        .padding(.bottom, 8) // tight space below header
    ItemRow()
    ItemRow()

    Text("Another Header")
        .font(.headline)
        .padding(.top, 24)
        .padding(.bottom, 8)
    ItemRow()
}
```

### BAN: `VStack { ForEach }` for scrollable content

**Why it's a tell:** Loads every item into memory at once. No cell reuse, no built-in separators, no swipe actions.

**Replace with:** `List` or `LazyVStack` with proper identity.

```swift
// BANNED
ScrollView {
    VStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}

// CORRECT -- when you need List features
List(items) { item in
    ItemRow(item: item)
}

// CORRECT -- when you need custom layout but want laziness
ScrollView {
    LazyVStack(spacing: 0) {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### BAN: Arbitrary spacing values

**Why it's a tell:** Values like 13, 26, 34, or 47 have no relationship to each other. They signal "I picked whatever looked okay at the time."

**Replace with:** Base-4/8 spacing grid. Only use: 4, 8, 12, 16, 20, 24, 32, 40, 48.

```swift
// BANNED
VStack(spacing: 13) {
    header.padding(.horizontal, 19)
    content.padding(.bottom, 26)
    footer.padding(.top, 34)
}

// CORRECT — base-4/8 grid
VStack(spacing: 12) {
    header.padding(.horizontal, 20)
    content.padding(.bottom, 24)
    footer.padding(.top, 32)
}
```

Standard assignments:
- Outer padding: 16-20
- Section gap: 24-32
- Card internal padding: 12-16
- Related element spacing: 4-8

### Named EdgeInsets for Common Contexts

Define named `EdgeInsets` constants for recurring padding contexts. A single `.padding(.cardContent)` replaces chained `.padding()` calls and prevents visual drift across identical component types:

```swift
extension EdgeInsets {
    static let cardContent = EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16)
    static let screenContent = EdgeInsets(top: 16, leading: 20, bottom: 16, trailing: 20)
    static let listCell = EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16)
    static let sectionHeader = EdgeInsets(top: 24, leading: 16, bottom: 8, trailing: 16)
}

// Usage
VStack { content }
    .padding(.cardContent)
```

Use named insets when the same padding appears on 3+ instances of the same component type. Don't pre-define insets for one-off layouts — that's over-abstraction.
- Related element spacing: 4-8

---

## Category 2: Colour Bans

### BAN: `Color(hex:)` scattered through views

**Why it's a tell:** Inline hex colours are unmaintainable, untestable, and ignore dark mode. They signal "I picked this colour in isolation."

**Replace with:** Named palette colours from `colour-system.md`.

```swift
// BANNED
Text("Status: Complete")
    .foregroundStyle(Color(hex: "#34C759"))

Circle()
    .fill(Color(hex: "#FF3B30"))

// CORRECT
Text("Status: Complete")
    .foregroundStyle(.positiveText)

Circle()
    .fill(.negative500)
```

### BAN: `Color.blue` / `.accentColor` as universal interactive colour

**Why it's a tell:** Default system blue on every interactive element is the first thing users notice as "stock iOS."

**Replace with:** `.tint()` with the palette accent colour.

```swift
// BANNED
Button("Save") { save() }
    .foregroundStyle(.blue)

// CORRECT
Button("Save") { save() }
    .tint(.accent500)
```

### BAN: `.opacity(0.5)` as "make it secondary"

**Why it's a tell:** Arbitrary opacity produces inconsistent visual hierarchy and breaks on coloured backgrounds.

**Replace with:** `.secondary` and `.tertiary` foreground styles.

```swift
// BANNED
Text("Last updated 2 hours ago")
    .foregroundStyle(.primary.opacity(0.5))

// CORRECT
Text("Last updated 2 hours ago")
    .foregroundStyle(.secondary)

// CORRECT -- for even less emphasis
Text("Optional metadata")
    .foregroundStyle(.tertiary)
```

### BAN: Hardcoded light-only colours

**Why it's a tell:** White backgrounds and dark text that invert wrong in dark mode. Immediate giveaway.

**Replace with:** Adaptive helpers or semantic colours.

```swift
// BANNED
VStack {
    content
}
.background(Color.white)
.foregroundStyle(Color(hex: "#333333"))

// CORRECT
VStack {
    content
}
.background(.background)
.foregroundStyle(.primary)

// CORRECT -- for tinted surfaces
VStack {
    content
}
.background(Color.positiveFill) // adaptive: light→positive50, dark→positive900
```

### BAN: Full-saturation colours (#FF0000, #00FF00)

**Why it's a tell:** Full-saturation colours vibrate on screen and clash with everything. They scream "I picked the first colour that came to mind."

**Replace with:** calibrated tones from the project palette.

```swift
// BANNED
Circle().fill(Color(hex: "#FF0000")) // pure red
Circle().fill(Color.red)             // system red, also too hot for indicators

// CORRECT
Circle().fill(.negative500) // oklch(0.60, 0.16, 25) -- calibrated red
```

### BAN: Same tint on every icon

**Why it's a tell:** A wall of blue icons removes all meaning from colour. Icons become decoration, not communication.

**Replace with:** Semantic colouring by meaning.

```swift
// BANNED
Label("Heart Rate", systemImage: "heart.fill").foregroundStyle(.blue)
Label("Steps", systemImage: "figure.walk").foregroundStyle(.blue)
Label("Sleep", systemImage: "bed.double.fill").foregroundStyle(.blue)

// CORRECT
Label("Heart Rate", systemImage: "heart.fill").foregroundStyle(.negative500)
Label("Steps", systemImage: "figure.walk").foregroundStyle(.positive500)
Label("Sleep", systemImage: "bed.double.fill").foregroundStyle(.info500)
```

### BAN: `Color.gray` for surfaces

**Why it's a tell:** System gray is flat and has no tonal relationship to your palette. Surfaces look disconnected.

**Replace with:** `.background` materials or neutral palette shades.

```swift
// BANNED
VStack { content }
    .background(Color.gray.opacity(0.1))

// CORRECT
VStack { content }
    .background(.neutral50) // subtle warm tint toward accent hue

// ALSO CORRECT -- system materials
VStack { content }
    .background(.regularMaterial)
```

---

## Category 3: Typography Bans

### BAN: `.font(.system(size: 14))`

**Why it's a tell:** Hardcoded point sizes bypass Dynamic Type, break accessibility, and produce inconsistent hierarchy.

**Replace with:** Semantic text styles.

```swift
// BANNED
Text("Section Header")
    .font(.system(size: 18, weight: .bold))
Text("Body content here")
    .font(.system(size: 14))
Text("Metadata")
    .font(.system(size: 12))

// CORRECT
Text("Section Header")
    .font(.headline)
Text("Body content here")
    .font(.body)
Text("Metadata")
    .font(.caption)
    .foregroundStyle(.secondary)
```

### BAN: Size-only hierarchy

**Why it's a tell:** Varying only font size produces monotone, flat layouts. The eye needs multiple signals to parse hierarchy.

**Replace with:** Weight + colour + spacing hierarchy.

```swift
// BANNED
Text("Title").font(.title)
Text("Subtitle").font(.title3)
Text("Body").font(.body)
// all same colour, same weight -- hierarchy is just size

// CORRECT
Text("Title")
    .font(.title2)
    .fontWeight(.semibold)
    .foregroundStyle(.primary)

Text("Subtitle")
    .font(.subheadline)
    .fontWeight(.medium)
    .foregroundStyle(.secondary)
    .padding(.top, 2)

Text("Body")
    .font(.body)
    .foregroundStyle(.primary)
    .padding(.top, 12) // spacing also signals hierarchy
```

### BAN: `.bold()` on everything

**Why it's a tell:** When everything is bold, nothing is. Visual hierarchy collapses.

**Replace with:** `.fontWeight(.medium)` or `.semibold` -- reserve `.bold` for primary headlines only.

```swift
// BANNED
VStack {
    Text("Title").bold()
    Text("Subtitle").bold()
    Text("Description").bold()
    Text("Metadata").bold()
}

// CORRECT
VStack(alignment: .leading, spacing: 4) {
    Text("Title").fontWeight(.semibold)
    Text("Subtitle").fontWeight(.medium).foregroundStyle(.secondary)
    Text("Description") // regular weight
    Text("Metadata").font(.caption).foregroundStyle(.tertiary)
}
```

### BAN: Every label `.caption`

**Why it's a tell:** Undifferentiated caption text makes every secondary element look identical.

**Replace with:** Differentiate metadata, timestamps, and labels.

```swift
// BANNED
Text("Category: Health").font(.caption)
Text("2 hours ago").font(.caption)
Text("3 items").font(.caption)

// CORRECT
Text("Category: Health")
    .font(.subheadline)
    .foregroundStyle(.secondary)

Text("2 hours ago")
    .font(.caption)
    .foregroundStyle(.tertiary)

Text("3 items")
    .font(.footnote)
    .foregroundStyle(.secondary)
    .monospacedDigit()
```

### BAN: Missing `.monospacedDigit()` on dynamic numbers

**Why it's a tell:** Numbers that cause layout shift when they change look broken.

**Replace with:** Always add `.monospacedDigit()` for counters, timers, and updating values.

```swift
// BANNED
Text("\(count) items")
Text(elapsed, format: .time(pattern: .minuteSecond))

// CORRECT
Text("\(count) items")
    .monospacedDigit()
Text(elapsed, format: .time(pattern: .minuteSecond))
    .monospacedDigit()
    .contentTransition(.numericText())
```

### BAN: Explicit font sizes where semantic styles work

**Why it's a tell:** Breaks Dynamic Type and signals that the developer doesn't understand the type system.

**Replace with:** Semantic text styles. Use the hidden placeholder technique for fixed-width containers (see the project SwiftUI polish guidelines).

```swift
// BANNED
Text("42")
    .font(.system(size: 48, weight: .bold, design: .rounded))
    .frame(width: 120) // hardcoded width

// CORRECT
Text("42")
    .font(.largeTitle)
    .fontWeight(.bold)
    .fontDesign(.rounded)
    .frame(minWidth: Text("000").hidden().font(.largeTitle).fontWeight(.bold).width)
```

### BAN: More than 5 distinct font sizes per screen

**Why it's a tell:** Too many font sizes create visual noise. The eye can't parse the hierarchy when every element is a different size.

**Replace with:** Cap at 5 distinct font sizes per screen. Use weight and colour differentiation instead of adding more sizes.

```swift
// BANNED — 7 different sizes, visual noise
Text("Title").font(.largeTitle)
Text("Section").font(.title)
Text("Heading").font(.title2)
Text("Subheading").font(.title3)
Text("Body").font(.body)
Text("Detail").font(.callout)
Text("Meta").font(.caption)

// CORRECT — 4 sizes, differentiated by weight and colour
Text("Title").font(.title2).fontWeight(.semibold)
Text("Section").font(.headline)
Text("Body").font(.body)
Text("Meta").font(.caption).foregroundStyle(.secondary)
// Use weight (.medium vs .regular) and colour (.primary vs .secondary)
// to create sub-hierarchy within each size level
```

---

## Category 4: Interaction State Bans

### BAN: Happy path only

**Why it's a tell:** Views that only handle the success case crash or show blank screens for real users.

**Replace with:** All states: loading, empty, error, content, pressed.

```swift
// BANNED
var body: some View {
    List(items) { item in
        ItemRow(item: item)
    }
}

// CORRECT
var body: some View {
    Group {
        switch loadState {
        case .loading:
            ProgressView()
        case .empty:
            ContentUnavailableView(
                "No Supplements",
                systemImage: "pill",
                description: Text("Tap + to add your first supplement.")
            )
        case .error(let error):
            ContentUnavailableView(
                "Unable to Load",
                systemImage: "exclamationmark.triangle",
                description: Text(error.localizedDescription)
            )
        case .loaded(let items):
            List(items) { item in
                ItemRow(item: item)
            }
        }
    }
}
```

### BAN: Bare `Text("No items")`

**Why it's a tell:** Lazy, uninformative, and visually broken -- a single line of text floating in empty space.

**Replace with:** `ContentUnavailableView` with icon, description, and action.

```swift
// BANNED
if items.isEmpty {
    Text("No items")
        .foregroundStyle(.secondary)
}

// CORRECT
if items.isEmpty {
    ContentUnavailableView {
        Label("No Workouts", systemImage: "figure.run")
    } description: {
        Text("Start a workout to see your history here.")
    } actions: {
        Button("Start Workout") { startWorkout() }
    }
}
```

### BAN: No press feedback on tappable surfaces

**Why it's a tell:** Tappable areas that don't respond to touch feel dead. Users don't know if their tap registered.

**Replace with:** `ButtonStyle` with scale 0.96.

```swift
// BANNED
VStack { cardContent }
    .onTapGesture { navigate() }

// CORRECT
Button { navigate() } label: {
    VStack { cardContent }
}
.buttonStyle(ScaleButtonStyle()) // scale 0.96, spring duration 0.15

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(duration: 0.15, bounce: 0), value: configuration.isPressed)
    }
}
```

### BAN: Missing loading states

**Why it's a tell:** Content that jumps from nothing to fully loaded feels jarring.

**Replace with:** `ProgressView` or skeleton placeholder views.

```swift
// BANNED
var body: some View {
    if let data = viewModel.data {
        DataView(data: data)
    }
    // else: blank screen
}

// CORRECT
var body: some View {
    if let data = viewModel.data {
        DataView(data: data)
    } else {
        ProgressView()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
```

### BAN: Disabled with no visual distinction

**Why it's a tell:** Disabled controls that look identical to enabled ones confuse users.

**Replace with:** Opacity change + label explaining why the control is disabled.

```swift
// BANNED
Button("Save") { save() }
    .disabled(name.isEmpty)

// CORRECT
Button("Save") { save() }
    .disabled(name.isEmpty)
    .opacity(name.isEmpty ? 0.4 : 1.0)
    .help(name.isEmpty ? "Enter a name to save" : "")
```

### BAN: No swipe actions where domain warrants them

**Why it's a tell:** List rows with no swipe actions feel incomplete on iOS. Users expect them.

**Replace with:** `.swipeActions` for common row operations.

```swift
// BANNED
List(items) { item in
    ItemRow(item: item)
}

// CORRECT
List(items) { item in
    ItemRow(item: item)
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) { delete(item) } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .swipeActions(edge: .leading) {
            Button { archive(item) } label: {
                Label("Archive", systemImage: "archivebox")
            }
            .tint(.info500)
        }
}
```

---

## Category 5: Structure Bans

### BAN: `NavigationView`

**Why it's a tell:** Deprecated since iOS 16. Immediately marks code as outdated.

**Replace with:** `NavigationStack`.

```swift
// BANNED
NavigationView {
    ContentView()
}

// CORRECT
NavigationStack {
    ContentView()
}
```

### BAN: `NavigationLink(destination:)`

**Why it's a tell:** Eager destination initialization. Every row in a list creates its destination view on render.

**Replace with:** `navigationDestination(for:)` with value-based navigation.

```swift
// BANNED
NavigationLink(destination: DetailView(item: item)) {
    ItemRow(item: item)
}

// CORRECT
NavigationLink(value: item) {
    ItemRow(item: item)
}
.navigationDestination(for: Item.self) { item in
    DetailView(item: item)
}
```

### BAN: `AnyView`

**Why it's a tell:** Type-erasing destroys SwiftUI's diffing performance. It's almost never necessary.

**Replace with:** `@ViewBuilder` or concrete return types.

```swift
// BANNED
func makeView() -> AnyView {
    if showDetail {
        return AnyView(DetailView())
    } else {
        return AnyView(SummaryView())
    }
}

// CORRECT
@ViewBuilder
func makeView() -> some View {
    if showDetail {
        DetailView()
    } else {
        SummaryView()
    }
}
```

### BAN: `ZStack` for every visual effect

**Why it's a tell:** Layering everything in ZStacks when `.background` and `.overlay` exist bloats the view tree.

**Replace with:** `.background` and `.overlay` modifiers.

```swift
// BANNED
ZStack {
    RoundedRectangle(cornerRadius: 12, style: .continuous)
        .fill(.background)
    VStack {
        content
    }
    .padding(16)
}

// CORRECT
VStack {
    content
}
.padding(16)
.background(.background, in: .rect(cornerRadius: 12, style: .continuous))
```

### BAN: One-off `CardView` per screen

**Why it's a tell:** Every screen reinventing card styling produces visual inconsistency and duplicated code.

**Replace with:** Shared card styling via a view modifier.

```swift
// BANNED -- each feature has its own CardView
struct HomeCardView<Content: View>: View { ... }
struct ProfileCardView<Content: View>: View { ... }
struct SettingsCardView<Content: View>: View { ... }

// CORRECT -- shared modifier
extension View {
    func cardStyle() -> some View {
        self
            .padding(16)
            .background(.background, in: .rect(cornerRadius: 12, style: .continuous))
            .cardShadow()
    }
}

// Usage
content.cardStyle()
```

### BAN: Wrapping every element in `VStack`

**Why it's a tell:** Redundant nesting when the parent stack already provides layout.

**Replace with:** Let the parent stack provide layout.

```swift
// BANNED
VStack {
    VStack { Text("Title") }
    VStack { Text("Subtitle") }
    VStack { Text("Body") }
}

// CORRECT
VStack(alignment: .leading, spacing: 4) {
    Text("Title")
    Text("Subtitle")
    Text("Body")
}
```

### BAN: `.animation(.default)` without `value:`

**Why it's a tell:** Animates every state change unpredictably. A known SwiftUI footgun.

**Replace with:** `.animation(_:value:)` always.

```swift
// BANNED
content
    .opacity(isVisible ? 1 : 0)
    .animation(.default)

// CORRECT
content
    .opacity(isVisible ? 1 : 0)
    .animation(.spring(duration: 0.3, bounce: 0), value: isVisible)
```

---

## Category 6: Animation Bans

### BAN: `.linear` / `.easeIn` for interactive state changes

**Why it's a tell:** Non-spring animations can't retarget when the user changes intent mid-animation. They feel mechanical.

**Replace with:** `.spring(duration: 0.3, bounce: 0)`.

```swift
// BANNED
withAnimation(.linear(duration: 0.3)) {
    isExpanded.toggle()
}

// CORRECT
withAnimation(.spring(duration: 0.3, bounce: 0)) {
    isExpanded.toggle()
}
```

### BAN: Broad `.animation(.default)`

**Why it's a tell:** Triggers on every state change. Animations fire when you don't expect them.

**Replace with:** Scoped `.animation(_:value:)` or `withAnimation`.

```swift
// BANNED
CardView()
    .animation(.default)

// CORRECT
CardView()
    .animation(.spring(duration: 0.3, bounce: 0), value: viewModel.state)
```

### BAN: Bouncy springs on UI controls

**Why it's a tell:** Bouncy toggles and buttons feel toy-like. Bounce is for playful, non-critical elements only.

**Replace with:** `bounce: 0` for all UI controls.

```swift
// BANNED
Toggle(isOn: $isEnabled) { Text("Enable") }
    .animation(.spring(bounce: 0.4), value: isEnabled)

// CORRECT
Toggle(isOn: $isEnabled) { Text("Enable") }
    .animation(.spring(duration: 0.3, bounce: 0), value: isEnabled)
```

### BAN: Scale on press below 0.95

**Why it's a tell:** Dramatic scale-down looks cartoonish and draws attention to the interaction instead of the content.

**Replace with:** Always 0.96. Never below 0.95.

```swift
// BANNED
.scaleEffect(isPressed ? 0.85 : 1.0)
.scaleEffect(isPressed ? 0.90 : 1.0)

// CORRECT
.scaleEffect(isPressed ? 0.96 : 1.0)
```

### BAN: Dramatic exit animations

**Why it's a tell:** Focus-stealing exits fight for attention when the user is already moving to the next thing.

**Replace with:** Subtle offset(y: -8) + 0.15s duration.

```swift
// BANNED
.transition(.scale(scale: 0.5).combined(with: .opacity))

// CORRECT
.transition(
    .asymmetric(
        insertion: .opacity
            .combined(with: .offset(y: 12))
            .combined(with: .blur(radius: 4)),
        removal: .opacity
            .combined(with: .offset(y: -8))
            .animation(.easeIn(duration: 0.15))
    )
)
```

### BAN: `.drawingGroup()` everywhere

**Why it's a tell:** Preemptive GPU compositing wastes memory and signals "I read one performance article and applied it everywhere."

**Replace with:** Only when stutter is measured. Profile first.

```swift
// BANNED -- applied as a blanket "optimisation"
List(items) { item in
    ItemRow(item: item)
        .drawingGroup()
}

// CORRECT -- only on the specific view that stutters, after profiling
ComplexOverlappingGradients()
    .drawingGroup() // measured 16ms frame drops without this
```

---

## Category 7: Copy Bans

### BAN: "Oops!" / "Something went wrong"

**Why it's a tell:** Vague, patronising, and useless to the user.

**Replace with:** Specific, actionable error messages.

```swift
// BANNED
Text("Oops! Something went wrong.")
Text("An error occurred. Please try again.")

// CORRECT
Text("Unable to load your workout history. Check your connection and pull to refresh.")
Text("This supplement could not be saved. The name field is required.")
```

### BAN: "Submit" / "Continue" generic button labels

**Why it's a tell:** Generic verbs tell the user nothing about what the action does.

**Replace with:** Specific verbs describing the action.

```swift
// BANNED
Button("Submit") { ... }
Button("Continue") { ... }
Button("Done") { ... }

// CORRECT
Button("Add Supplement") { ... }
Button("Start Workout") { ... }
Button("Save Changes") { ... }
```

### BAN: "Elevate" / "Seamless" / "Unleash" / "Next-Gen"

**Why it's a tell:** Marketing fluff that says nothing. Instant credibility loss.

**Replace with:** Direct, clear language that describes what the feature actually does.

```swift
// BANNED
Text("Elevate your health journey with seamless tracking")
Text("Unleash the power of next-gen wellness insights")

// CORRECT
Text("Track supplements, workouts, and meals in one place")
Text("See how your habits change over time")
```

### BAN: Round preview numbers (100, 50.0, 200)

**Why it's a tell:** Real data is never round. Round numbers in previews signal fake data.

**Replace with:** Realistic, varied values.

```swift
// BANNED
#Preview {
    MetricCard(value: 100, unit: "mg")
    MetricCard(value: 50.0, unit: "ml")
    MetricCard(value: 200, unit: "kcal")
}

// CORRECT
#Preview {
    MetricCard(value: 73, unit: "mg")
    MetricCard(value: 42.8, unit: "ml")
    MetricCard(value: 187, unit: "kcal")
}
```

### BAN: "No items" empty states

**Why it's a tell:** Tells the user what's missing without telling them what to do about it.

**Replace with:** Explain what the user can do, not what's absent.

```swift
// BANNED
Text("No items")
Text("Nothing to show")
Text("No data available")

// CORRECT
ContentUnavailableView {
    Label("No Supplements", systemImage: "pill")
} description: {
    Text("Tap + to add your first supplement.")
}
```

### BAN: Sequential IDs in preview data

**Why it's a tell:** IDs like 1, 2, 3 or "item-1", "item-2" are obviously fake.

**Replace with:** Realistic, deterministic preview data.

```swift
// BANNED
let items = [
    Item(id: 1, name: "Item 1"),
    Item(id: 2, name: "Item 2"),
    Item(id: 3, name: "Item 3"),
]

// CORRECT
let items = [
    Item(id: UUID(uuidString: "A1B2C3D4-E5F6-7890-ABCD-EF1234567890")!, name: "Magnesium Glycinate"),
    Item(id: UUID(uuidString: "B2C3D4E5-F6A7-8901-BCDE-F12345678901")!, name: "Vitamin D3"),
    Item(id: UUID(uuidString: "C3D4E5F6-A7B8-9012-CDEF-123456789012")!, name: "Omega-3 EPA/DHA"),
]
```

### BAN: `Text("\(year)")` for year display

**Why it's a tell:** String interpolation with integers triggers locale-aware number formatting. In some locales, the year 2026 renders as "2,026" with a thousands separator.

**Replace with:** `Text(String(year))` or `Text(year, format: .number.grouping(.never))`.

```swift
// BANNED — renders as "2,026" in some locales
Text("\(year)")

// CORRECT
Text(String(year))

// ALSO CORRECT
Text(year, format: .number.grouping(.never))
```

---

## Quick Decision Table: Reflex → Intentional

When you instinctively reach for a generic component, stop and reach for the intentional alternative.

| Reflex (generic) | Intentional (reach for this instead) | When the reflex IS correct |
|---|---|---|
| `List` + `ForEach` for everything | `ScrollView` + `LazyVStack` with cards when content is heterogeneous or visual | Homogeneous row-based content (contacts, messages, settings) |
| `Form` + `Section` for all settings | `ScrollView` + `GroupBox` with materials when the screen needs character | Actual system-settings-style screens with toggles and pickers |
| `LabeledContent` for metrics | Hero typography `.largeTitle` + `.fontDesign(.rounded)` | Key-value pairs in settings or metadata sections |
| `ProgressView` for progress | `Circle().trim(from:to:)` with gradient stroke, or `Gauge` | Indeterminate loading (not goal progress) |
| `Button("Label")` unstyled | `.borderedProminent` + `.controlSize(.large)` for primary actions | Secondary/tertiary actions where prominence would be wrong |
| Default `List` background | Gradients, `.regularMaterial`, tinted containers | Standard drill-down lists where system chrome is expected |
| `Image(systemName:)` same tint everywhere | Semantic colouring per icon meaning (see Colour Bans) | Toolbars where uniform tint is the platform convention |

### Show Data, Don't List It

When data IS the content (fitness metrics, financial stats, progress toward a goal), **visualise it** instead of putting it in a label:

- **Rings and gauges** for progress toward a goal — not `LabeledContent("Steps", value: "8,432")`
- **Sparkline charts** (Swift Charts `LineMark`) for trends over time — not a column of numbers
- **Large hero numbers** with unit labels in `.caption` — not a row of same-sized text
- **Colour-coded bars** for composition (macro nutrients, time splits) — not bullet lists

A `LabeledContent("Steps", value: "8,432")` is information. A large "8,432" in `.title` with a sparkline below it is an *experience*. Choose based on whether the user is scanning for a specific value (label is fine) or needs to understand a pattern (visualise).

---

## Spring Animation Presets

Use the right spring preset for the context. Don't guess — pick from these three:

| Preset | When to use | Example |
|---|---|---|
| `.smooth` (duration: 0.3, bounce: 0) | Routine UI transitions: expanding sections, showing/hiding content, opacity changes | `withAnimation(.smooth) { isExpanded.toggle() }` |
| `.snappy` (duration: 0.2, bounce: 0) | Interactive feedback: button presses, toggle state, drag snapping | `.animation(.snappy, value: isPressed)` |
| `.bouncy` (duration: 0.4, bounce: 0.2) | Delight moments: achievement celebrations, first-time reveals, playful elements | `.animation(.bouncy, value: showBadge)` |

**Rules:**
- `.smooth` is the default. When in doubt, use `.smooth`.
- `.bouncy` on UI controls (toggles, buttons, steppers) is banned — it feels toy-like.
- `.linear` and `.easeIn` are banned for interactive state changes — they can't retarget mid-animation.
- Always specify `value:` with `.animation()`. Never use `.animation(.default)`.

---

## Review Checklist

Run this 15-item check before submitting any SwiftUI work.

1. [ ] No uniform `.padding()` -- spacing varies by semantic level
2. [ ] No `Color(hex:)` or `Color.blue` -- palette colours or semantic styles only
3. [ ] No `.font(.system(size:))` -- semantic text styles only
4. [ ] Typography hierarchy uses weight + colour + spacing, not size alone
5. [ ] All states handled: loading, empty, error, content
6. [ ] Empty states use `ContentUnavailableView` with icon + description + action
7. [ ] Tappable surfaces have press feedback (ButtonStyle or `.sensoryFeedback`)
8. [ ] Dynamic numbers use `.monospacedDigit()`
9. [ ] No `.animation(.default)` without `value:` -- all animations scoped
10. [ ] Springs use `bounce: 0` for UI controls
11. [ ] No `NavigationView` -- `NavigationStack` only
12. [ ] No `AnyView` -- `@ViewBuilder` or concrete types
13. [ ] Button labels are specific verbs, not "Submit" or "Continue"
14. [ ] Preview data uses realistic, varied values
15. [ ] Dark mode works -- no hardcoded light-only colours
16. [ ] Spacing values are from the base-4/8 grid (4, 8, 12, 16, 20, 24, 32, 40, 48)
17. [ ] No more than 5 distinct font sizes per screen
18. [ ] Year values use `String(year)`, not `"\(year)"`

---

## Anti-Rationalisation Table

When tempted to break these rules, check the excuse against this table.

| Excuse | Reality |
|---|---|
| "It's just a prototype" | Prototypes become production. Follow the rules. |
| "The user didn't ask for polish" | Quality is the default, not an add-on. |
| "This is a small change" | Small changes compound. Each one matters. |
| "I'll fix it later" | Later never comes. Do it right now. |
| "It looks fine to me" | You are not the user. Follow the checklist. |
| "The system default is good enough" | System defaults are a starting point, not a finish line. |
| "Nobody will notice" | Developers notice. Designers notice. Users feel it. |
| "I need to ship fast" | Slop ships fast and gets rewritten. Clean code ships once. |

---

## Gotchas

- **Context-dependent bans**: Some banned patterns are correct in specific contexts. `Spacer()` in a toolbar is fine. Uniform `.padding()` on grid items of the same type is fine. `Color.blue` in a chart using Apple's default chart colours is fine. Apply judgment, not blind matching.
- **Preview vs production code**: The banlists apply to production code. Preview code may use `Color.red` or hardcoded values for quick iteration. Don't flag code inside `#Preview` blocks.
- **Existing project patterns**: If the project already uses a pattern that's on the banlist (e.g., `Color(hex:)` in older files), fixing it is a separate refactoring task. Don't block new work because unrelated old code has violations.
- **Over-correction**: Replacing every `.padding()` with explicit directional padding makes code harder to read. The ban is on UNIFORM padding across DIFFERENT semantic levels, not on `.padding()` as a modifier.
- **Copy banlists and domain language**: "Submit" is banned as generic, but "Submit Stool Log" is domain-specific and acceptable. The ban targets generic verbs, not all uses of those words.
- **Dark mode false positives**: Palette colours from `colour-system.md` are already adaptive. Don't double-flag them as "hardcoded light-only." The ban targets literal `Color.white` or `Color(red:green:blue:)`, not palette statics.
