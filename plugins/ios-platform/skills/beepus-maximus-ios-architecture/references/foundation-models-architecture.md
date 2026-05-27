# Foundation Models Architecture

On-device language generation using Apple's Foundation Models framework. All generation runs on-device using `SystemLanguageModel.default`. No data leaves the device.

3B parameter model, 2-bit quantized, 4096 token context window (input + output combined). Optimized for summarization, extraction, classification, and generation. Not suited for world knowledge, complex reasoning, math, or translation.

## Three-Part Pattern

Every generation use case follows the same structure:

```
User Input --> LanguageModelSession --> Validated Structured Output
```

| Component | Role |
|---|---|
| **Generation enum** | Holds system instructions, prompt builder, and response parser as static members |
| **Client actor** | Owns the `SystemLanguageModel`, creates a `LanguageModelSession`, calls the generation enum, returns validated output |
| **Pack struct** | `Codable`, `Equatable`, `Sendable` value type with validation and deterministic fallback |

The client actor checks `model.isAvailable` before every call. If the model is unavailable or the session throws, the client returns a deterministic fallback.

## Pack Requirements

Every pack struct must be:

- `Codable` -- for JSON decoding from model output
- `Equatable` -- for change detection
- `Sendable` -- for passing across isolation boundaries
- Has `validated()` -- normalises whitespace, strips punctuation, enforces structural rules
- Has `static func fallback(for:)` -- grammatically correct pack from raw input using string interpolation

| Pack Type | Fallback Pattern |
|---|---|
| `HabitLanguagePack` | `"Completed X"`, `"Started X"`, `"Skipped X"` |
| `ChecklistItemLanguagePack` | `"X"` (completion/present), `"Skipped X"` |
| `InterventionLanguagePack` | `"Took X"`, `"Started taking X"`, `"Skipped X"` |

## Prompt Isolation

System instructions and prompt builders are static members on a dedicated generation enum (e.g. `HabitLanguagePackGeneration`). Prompts are never constructed inline in view or client code. This keeps all prompt text in one place per use case.

```swift
enum HabitLanguagePackGeneration {
    static let instructions = "..."  // System instructions
    static func modelPrompt(for habitName: String) -> String { ... }
    static func parsedPack(from response: String, for habitName: String) -> HabitLanguagePack? { ... }
}
```

## Schema Validation Pipeline

Every response passes through:

1. `String` to `Data` via UTF-8 encoding
2. `JSONDecoder().decode(PackType.self, from:)` for structural parsing
3. `validated()` for semantic rules (prefix checks, count checks, non-empty checks)
4. Normalisation (whitespace trimming, punctuation stripping)

If any step fails, the fallback is returned. Partial results are never used.

### Structural Rules Enforced by Validation

| Rule | Enforced by |
|---|---|
| `completion` is non-empty | `validated()` |
| `present` is non-empty | `validated()` |
| `start` begins with `"Started "` | `validated()` |
| `skip` begins with `"Skipped "` | `validated()` |
| `timelineSentence` is non-empty | `validated()` |
| `completionVariants` has exactly 3 entries | `validated()` |
| All `completionVariants` are non-empty | `validated()` |
| Trailing punctuation stripped | `normalizeRequiredPhrase()` |
| Whitespace trimmed | `normalizeRequiredPhrase()` / `normalizeOptionalPhrase()` |

## Deterministic Fallbacks

Every pack type provides a `static func fallback(for:)` that produces a grammatically correct pack from the raw input using simple string interpolation. Fallbacks are always available, require no model, and produce predictable output.

## Availability Gating

Every client actor checks `model.isAvailable` before creating a session. If the model is not available (device does not support Apple Intelligence, user has not enabled it, or system resources are constrained), the client returns the fallback immediately without attempting generation.

```swift
switch SystemLanguageModel.default.availability {
case .available:
    let session = LanguageModelSession()
    // proceed
case .unavailable(let reason):
    // Return deterministic fallback
    // Possible reasons: device not capable, region not supported, user not opted in
}
```

Supported languages can be checked with `SystemLanguageModel.default.supportedLanguages`.

## Error Handling

Generation calls are wrapped in `do/catch`. Any error from `LanguageModelSession.respond(to:)` results in a fallback return. Errors are not surfaced to the user because the fallback provides a functional experience.

### GenerationError Types

Three errors that must be handled:

```swift
do {
    let response = try await session.respond(to: prompt)
} catch LanguageModelSession.GenerationError.exceededContextWindowSize {
    // Multi-turn transcript grew beyond 4096 tokens
    // Condense transcript and create new session
} catch LanguageModelSession.GenerationError.guardrailViolation {
    // Content policy triggered
    // Show graceful message: "I can't help with that request"
} catch LanguageModelSession.GenerationError.unsupportedLanguageOrLocale {
    // User input in unsupported language
    // Check SystemLanguageModel.default.supportedLanguages
}
```

### Streaming Error Handling

Handle errors during streaming gracefully -- partial results may already be displayed:

```swift
do {
    for try await partial in stream {
        self.itinerary = partial
    }
} catch LanguageModelSession.GenerationError.guardrailViolation {
    self.errorMessage = "Generation stopped by content policy"
} catch LanguageModelSession.GenerationError.exceededContextWindowSize {
    session = LanguageModelSession()
}
```

## Actor Isolation

Client types are `actor`s, ensuring thread-safe access to the language model. Pack structs are `nonisolated`, `Sendable`, and safe to pass across isolation boundaries.

## @Generable Structured Output

`@Generable` enables structured output using constrained decoding. The macro generates a schema at compile-time. During generation, the framework masks out invalid tokens so the model can only produce tokens valid according to the schema. This guarantees structural correctness with zero parsing code.

### Supported Types

- **Primitives**: `String`, `Int`, `Float`, `Double`, `Decimal`, `Bool`
- **Collections**: `[ElementType]` (arrays of any supported type)
- **Composed**: Nested `@Generable` structs, `@Generable` enums with associated values, recursive types

### Basic Usage

```swift
@Generable
struct Person {
    let name: String
    let age: Int
}

let response = try await session.respond(
    to: "Generate a person",
    generating: Person.self
)
let person = response.content // Type-safe Person instance
```

### Enums with Associated Values

```swift
@Generable
struct NPC {
    let name: String
    let encounter: Encounter

    @Generable
    enum Encounter {
        case orderCoffee(String)
        case wantToTalkToManager(complaint: String)
    }
}
```

### @Guide Constraints

`@Guide` constrains generated property values via constrained decoding. The model cannot produce out-of-range values. Supports `description:` (natural language hint), `.range()` (numeric bounds), `.count()` / `.maximumCount()` (array length), and `Regex` (pattern matching).

```swift
@Generable
struct NPC {
    @Guide(description: "A full name")
    let name: String

    @Guide(.range(1...10))
    let level: Int

    @Guide(.count(3))
    let attributes: [String]
}
```

Always validate business logic on the result -- the model may produce semantically wrong but structurally valid output.

### Nested @Generable Types

Every type in the graph must independently conform to `@Generable`:

```swift
// Both types must be @Generable
@Generable struct Itinerary {
    var days: [DayPlan]
}

@Generable struct DayPlan {
    var activities: [String]
}
```

Arrays of non-Generable types compile but fail at runtime. Check all types in the graph.

### Property Declaration Order

Properties are generated in declaration order. This matters for two reasons:

1. **Quality**: Later properties can reference earlier ones. Summaries produce better results when declared last.
2. **Streaming UX**: Users see properties fill in top-to-bottom. Put the most important property first.

```swift
@Generable
struct Itinerary {
    var destination: String // Generated first -- appears immediately when streaming
    var days: [DayPlan]     // Generated second
    var summary: String     // Generated last -- can reference destination and days
}
```

Declaring `summary` last instead of first can drop perceived latency from 2.5s to 0.2s when streaming, because the user sees `destination` almost immediately.

## Streaming with PartiallyGenerated

The `@Generable` macro automatically creates a `PartiallyGenerated` nested type where all properties are optional. They fill in progressively as the model generates tokens.

```swift
let stream = session.streamResponse(
    to: "Craft a 3-day itinerary to Mt. Fuji.",
    generating: Itinerary.self
)

for try await partial in stream {
    self.itinerary = partial // Incrementally updated
}
```

### SwiftUI Integration

```swift
struct ItineraryView: View {
    let session: LanguageModelSession
    @State private var itinerary: Itinerary.PartiallyGenerated?

    var body: some View {
        VStack {
            if let name = itinerary?.name {
                Text(name).font(.title)
            }

            if let days = itinerary?.days {
                ForEach(days, id: \.id) { day in
                    DayView(day: day)
                }
            }

            Button("Generate") {
                Task {
                    let stream = session.streamResponse(
                        to: "Generate 3-day itinerary to Tokyo",
                        generating: Itinerary.self
                    )
                    for try await partial in stream {
                        self.itinerary = partial
                    }
                }
            }
        }
    }
}
```

Use stable identity (`id: \.id`) for arrays in `ForEach`, not index-based identity. Index-based identity causes animations to break as the array grows during streaming.

## Tool Protocol

Tools let the model autonomously call your code to fetch external data. The model decides when and how often to call tools, and can call multiple tools in parallel.

### Protocol Shape

```swift
protocol Tool {
    var name: String { get }
    var description: String { get }
    associatedtype Arguments: Generable
    func call(arguments: Arguments) async throws -> ToolOutput
}
```

### Implementation

```swift
struct GetWeatherTool: Tool {
    let name = "getWeather"
    let description = "Retrieve the latest weather information for a city"

    @Generable
    struct Arguments {
        @Guide(description: "The city to fetch the weather for")
        var city: String
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        let places = try await CLGeocoder().geocodeAddressString(arguments.city)
        let weather = try await WeatherService.shared.weather(for: places.first!.location!)
        let temp = weather.currentWeather.temperature.value
        return ToolOutput("\(arguments.city)'s temperature is \(temp) degrees.")
    }
}

let session = LanguageModelSession(
    tools: [GetWeatherTool()],
    instructions: "Help the user with weather forecasts."
)
```

### ToolOutput Forms

- **Natural language**: `ToolOutput("Temperature is 71 degrees")`
- **Structured**: `ToolOutput(GeneratedContent(properties: ["temperature": 71]))`

### Stateful Tools

Use `class` instead of `struct` when tools need to maintain state across calls. The tool instance persists for the session lifetime:

```swift
class FindContactTool: Tool {
    let name = "findContact"
    let description = "Finds a contact from a specified age generation."
    var pickedContacts = Set<String>()

    @Generable
    struct Arguments {
        let generation: Generation
        @Generable
        enum Generation { case babyBoomers, genX, millennial, genZ }
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        // Fetch contact, filter out already-picked ones
        pickedContacts.insert(pickedContact.givenName)
        return ToolOutput(pickedContact.givenName)
    }
}
```

### Tool Naming

Keep `name` and `description` short -- they are inserted verbatim into the prompt. Longer strings mean more tokens and higher latency. Use verbs: `getWeather`, `findContact`, `fetchPrice`.

### Guarantees

- Valid tool names (no hallucinated tools)
- Valid arguments (constrained via @Generable)
- Structural correctness of arguments

Not guaranteed: that the model will call the tool at all, or that argument values will be semantically correct.

## DynamicGenerationSchema

When the schema is only known at runtime (user-defined forms, level creators, dynamic content), use `DynamicGenerationSchema` instead of `@Generable`:

```swift
let questionProp = DynamicGenerationSchema.Property(
    name: "question", schema: DynamicGenerationSchema(type: String.self)
)
let answersProp = DynamicGenerationSchema.Property(
    name: "answers", schema: DynamicGenerationSchema(
        arrayOf: DynamicGenerationSchema(referenceTo: "Answer")
    )
)

let riddleSchema = DynamicGenerationSchema(
    name: "Riddle", properties: [questionProp, answersProp]
)
let answerSchema = DynamicGenerationSchema(
    name: "Answer", properties: [/* text, isCorrect */]
)

let schema = try GenerationSchema(root: riddleSchema, dependencies: [answerSchema])
let response = try await session.respond(to: "Generate a riddle", schema: schema)
let question = try response.content.value(String.self, forProperty: "question")
```

Use `@Generable` when structure is known at compile-time (type safety, automatic parsing). Use `DynamicGenerationSchema` when structure is only known at runtime. Both use the same constrained decoding guarantees.

## isResponding Property

Gate UI on `session.isResponding` to prevent concurrent requests:

```swift
Button("Generate") {
    Task { result = try await session.respond(to: prompt).content }
}
.disabled(session.isResponding)
```

## Context Window Management

4096 tokens shared across system instructions, user input, and generated output. Roughly 3 characters per token in English, so approximately 12,000 characters or 2,000-3,000 words total.

### Token Budget Awareness

Habit names are typically 2-5 tokens. System instructions and JSON schema are the real budget consumers. Use `includeSchemaInPrompt: false` on subsequent requests to reclaim schema tokens (see Performance Optimizations below).

### Transcript Condensation

When `exceededContextWindowSize` is caught, condense the transcript by keeping instructions (first entry) and recent context (last entry), then create a new session:

```swift
var session = LanguageModelSession()

do {
    let response = try await session.respond(to: prompt)
} catch LanguageModelSession.GenerationError.exceededContextWindowSize {
    session = condensedSession(from: session)
    let response = try await session.respond(to: prompt)
}

func condensedSession(from previous: LanguageModelSession) -> LanguageModelSession {
    let entries = previous.transcript.entries
    guard entries.count > 2 else {
        return LanguageModelSession(transcript: previous.transcript)
    }
    let condensed = [entries.first!, entries.last!]
    return LanguageModelSession(transcript: Transcript(entries: condensed))
}
```

### Preventing Context Overflow

1. Keep prompts concise -- every token adds latency.
2. Use tools for external data instead of embedding it in prompts.
3. Break complex tasks into smaller, focused generations. Multiple focused prompts produce better quality than one massive prompt.

## Sampling and Generation Options

| Goal | Setting | Use Cases |
|------|---------|-----------|
| Deterministic | `GenerationOptions(sampling: .greedy)` | Unit tests, demos, consistency-critical |
| Focused | `GenerationOptions(temperature: 0.5)` | Fact extraction, classification |
| Balanced | Default (temperature 1.0) | General use |
| Creative | `GenerationOptions(temperature: 2.0)` | Story generation, brainstorming |

Greedy determinism only holds for the same model version. OS updates may change output.

## Content Tagging Adapter

Built-in use case optimised for tag generation, entity extraction, and topic detection:

```swift
@Generable
struct TagResult {
    @Guide(.maximumCount(3))
    let topics: [String]
    @Guide(.maximumCount(3))
    let emotions: [String]
}

let session = LanguageModelSession(
    model: SystemLanguageModel(useCase: .contentTagging),
    instructions: "Tag the 3 most important topics and emotions."
)

let response = try await session.respond(to: text, generating: TagResult.self)
```

## Performance Optimizations

### Prewarm Session at Init

Create `LanguageModelSession` before the user taps a button, not in response to the tap. Saves 1-2 seconds off first generation.

```swift
actor GenerationClient {
    private var session: LanguageModelSession?

    init() {
        Task {
            self.session = LanguageModelSession(instructions: "...")
        }
    }

    func generate(prompt: String) async throws -> String {
        guard let session else {
            self.session = LanguageModelSession()
            return try await self.session!.respond(to: prompt).content
        }
        return try await session.respond(to: prompt).content
    }
}
```

### includeSchemaInPrompt: false

For subsequent requests using the same `@Generable` type within a session, skip re-inserting the schema. The model already has it in the transcript. Saves 10-20% of tokens per request.

```swift
// First request -- schema inserted automatically
let first = try await session.respond(
    to: "Generate first person",
    generating: Person.self
)

// Subsequent requests -- skip schema insertion
let second = try await session.respond(
    to: "Generate another person",
    generating: Person.self,
    options: GenerationOptions(includeSchemaInPrompt: false)
)
```

### Property Order for Streaming

Declare the most important property first in `@Generable` structs. With streaming, users see properties fill in top-to-bottom. A title appearing in 0.2s feels faster than waiting 2.5s for full content before seeing anything.

### Foundation Models Instrument

Use `Instruments > Foundation Models` template to profile latency, see token counts (input and output), and identify optimisation opportunities.

## LanguageModelFeedbackAttachment

Report model quality issues to Apple via Feedback Assistant. Create with `input`, `output`, `sentiment` (`.positive` / `.negative`), `issues` (category and explanation), and `desiredOutputExamples`. Encode as JSON and attach to a Feedback Assistant report.

## Diagnostic Decision Tree

When Foundation Models is not working as expected:

```
Problem?
|
+-- Won't start?
|   +-- .unavailable --> Check device (iPhone 15 Pro+), region, Apple Intelligence opt-in
|
+-- Generation fails?
|   +-- exceededContextWindowSize --> Condense transcript, break into smaller prompts
|   +-- guardrailViolation --> Content policy triggered, show graceful message
|   +-- unsupportedLanguageOrLocale --> Check supportedLanguages
|
+-- Output wrong?
|   +-- Hallucinated facts --> Wrong use case (world knowledge vs extraction)
|   +-- Wrong structure --> Use @Generable instead of manual JSON parsing
|   +-- Missing data --> Add Tool for external data
|   +-- Inconsistent output --> Adjust temperature or use .greedy sampling
|
+-- Too slow?
|   +-- Initial delay (1-2s) --> Prewarm session at init
|   +-- Long wait for results --> Stream with streamResponse
|   +-- Large schema overhead --> includeSchemaInPrompt: false
|   +-- Complex prompt --> Break into focused sub-tasks
|
+-- UI frozen?
    +-- Main thread blocked --> Wrap in Task {}
```

80% of Foundation Models problems stem from misunderstanding model capabilities, context limits, or availability requirements -- not framework bugs.

## System Constraints

1. **Apple Intelligence generates display strings only.** It does not decide domain logic, scheduling, automation targets, or any other model property.
2. **It must never generate identifiers.** IDs, keys, enum raw values, and internal model names are always set by application code.
3. **It must not invent data fields.** The output schema is fixed. Any field not in the schema is ignored or causes validation failure.
4. **Output must match a strict JSON schema.** Responses that deviate are caught by `JSONDecoder` and validation.
5. **Results are validated before storage.** Invalid packs are replaced with deterministic fallbacks.
6. **Generation is on-device only.** All calls use `SystemLanguageModel.default`. No network requests.

## Safety Rules

1. **User text is not altered beyond phrasing.** The model rephrases for grammar but does not change the subject.
2. **No fabrication.** The model must not invent data the user did not provide.
3. **No emotionally manipulative language.** No guilt, urgency, or motivational pressure.
4. **Neutral and factual.** Generated strings describe actions, not judgments.
5. **Fallback is always safe.** Deterministic fallback ensures grammatically correct, neutral text.
6. **No trailing punctuation.** All strings normalised to let UI code control formatting.

## Style Rules

- Avoid filler words (`just`, `simply`, `really`).
- Avoid marketing tone or enthusiastic language.
- Prefer clear, concrete verbs over vague ones.
- Maintain grammatical consistency between `verb`, `gerund`, and sentences.
- Keep output neutral and factual.

## On-Device Model Constraints

- **Context window: 4096 tokens.** Shared across system instructions, user input, and generated output. Roughly 3 characters per token in English.
- **Near-deterministic sampling.** Apple uses `TIE_ARGMAX` with `topK: 10` and `temperature: 1.0`. Favours consistency over creativity.
- **Locale-aware system role.** Apple adapts prompts per locale by swapping the system role prefix (e.g. British spelling context for `en_GB`). Use the same pattern if adding locale-aware generation.

## Prompt Minimalism

For simple classification-style tasks (emoji suggestion, tagging), use the narrowest possible prompt. Avoid loaded domain wording unless structurally required. Add local input gating so partial or low-signal input never reaches the model.

## Apple Prompt Patterns (Reference)

Patterns extracted from Apple's own on-device prompts (Writing Tools, Photos Memories, Summarisation):

### Concise System Instructions

Single-sentence system instructions with no preamble: `"Make this text more concise."` Your prompts should be direct imperatives.

### Anti-Hallucination Rules

Apple enforces factual grounding explicitly: `"No Hallucination: Don't add any new facts, numbers, dates or information that is not present in INPUT."` Always include an explicit anti-hallucination rule in every generation prompt.

### Anti-Phrasing Rules

Suppress AI conversational wrapping: `"Avoid starting your response with certain common phrase like 'Sure!', 'Here', 'Of course!'"` and `"Don't include any additional answer or explanation in the OUTPUT."` Add these to prevent the model from wrapping valid JSON in conversational text.

### Content Safety Filtering

Apple's summarisation prompts include: `"Do not summarize if the message contains sexual, violent, hateful or self harm content."` Include safety guardrails where user-provided text is processed.

### Strict Output Format Control

Apple constrains output with word limits, JSON schema enforcement, and anti-phrasing. If your app uses JSON schemas, maintain this and add explicit format constraints.

### Negative Constraints

Apple lists what NOT to generate in detail: no religious/political content, no music references, no time period references, no profanity. Negative constraints are as important as positive instructions. List what generated text must NOT contain.

### Role Assignment with Scope Constraints

When assigning a role, immediately follow with explicit exclusions (what the model must NOT do) and structural categories (what the output should look like). More effective than a broad role alone.

## Adding a New Generation Use Case

1. **Define the pack struct.** `Codable`, `Equatable`, `Sendable`. Include a `validated()` method and a `static func fallback(for:)`.
2. **Define the generation enum.** Static `instructions` string, static `modelPrompt(for:)` builder, static `parsedPack(from:for:)` parser.
3. **Define the client actor.** Holds `SystemLanguageModel.default`, checks `isAvailable`, creates a `LanguageModelSession`, calls the generation enum, catches errors, returns fallback on failure.
4. **Write tests.** Cover fallback contracts, JSON parsing, validation rules, and normalisation. Model-dependent tests are not required because the parsing layer is tested independently.

## Invariants

1. **Every generated string has a deterministic fallback.** The app must function identically without Apple Intelligence.
2. **Generated output is validated before use.** No generated string reaches the UI or persistence layer without passing through `validated()`.
