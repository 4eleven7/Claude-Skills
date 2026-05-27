<!-- This is an example template. Replace [YourApp] with your actual app name and adjust use cases, pack types, and domain examples to match your project. -->

# Foundation Models Language Generation

## Purpose

[YourApp] uses Apple's on-device Foundation Models framework to generate natural language strings from minimal user input. This replaces manual authoring of display text variants, which would require writing dozens of phrasing variants by hand for every item a user creates.

On-device language generation solves three problems:

1. **Consistent phrasing.** Every generated text follows the same grammatical structure regardless of what the user types.
2. **Natural language quality.** Generated strings read like polished copy rather than mechanical templates.
3. **Scalable authoring.** Users create items with a short title. The system produces a full set of display strings without manual effort.

All generation runs on-device using `SystemLanguageModel.default` via the `FoundationModels` framework. No data leaves the device.

---

## Current Implementation

### Architecture Pattern

Every generation use case follows the same three-part structure:

```
User Input → LanguageModelSession → Validated Structured Output
```

Each use case is implemented as:

| Component | Role |
|---|---|
| **Generation enum** | Holds system instructions, prompt builder, and response parser as static members |
| **Client actor** | Owns the `SystemLanguageModel`, creates a `LanguageModelSession`, calls the generation enum, returns validated output |
| **Pack struct** | `Codable`, `Equatable`, `Sendable` value type with validation and deterministic fallback |

The client actor checks `model.isAvailable` before every call. If the model is unavailable or the session throws, the client returns a deterministic fallback.

### Active Use Cases

| Use Case | Generator | Client | Pack |
|---|---|---|---|
| Product description generation | `ProductDescriptionGeneration` | `ProductDescriptionClient` | `ProductDescriptionPack` |
| Notification copy generation | `NotificationCopyGeneration` | `NotificationCopyClient` | `NotificationCopyPack` |
| Task summary generation | `TaskSummaryGeneration` | `TaskSummaryClient` | `TaskSummaryPack` |
| Emoji suggestions | `EmojiSuggestion` | `EmojiSuggestionClient` | `[String]` |

### Composition

`FoundationModelsService` is declared in the `CompositionRoot` alongside other system framework wrappers. Individual client actors are singletons (`static let shared`) that hold their own `SystemLanguageModel.default` reference.

---

## Product Description Packs

### What a Description Pack Contains

A `ProductDescriptionPack` holds all the display strings needed to represent a product across the app.

| Field | Type | Purpose | Example |
|---|---|---|---|
| `headline` | `String` | Short headline for cards and lists | `"Wireless Noise-Cancelling Headphones"` |
| `summary` | `String` | One-sentence description for detail views | `"Premium over-ear headphones with active noise cancellation and 30-hour battery life"` |
| `shortLabel` | `String` | Abbreviated label for compact UI | `"Noise-Cancelling Headphones"` |
| `variants` | `[String]` | Three alternate headline phrasings for variety | `["Wireless ANC Headphones", "Over-Ear Noise Cancelling", "Premium Wireless Headphones"]` |
| `category` | `String?` | Keyword for category lookup | `"audio"` |
| `suggestedEmoji` | `String?` | Single emoji representing the item | `"🎧"` |
| `suggestedSFSymbol` | `String?` | SF Symbol name for UI icon | `"headphones"` |

### How Generation Works

Given user input `"wireless headphones noise cancelling"`, the system:

1. Trims and validates the input string.
2. Checks `model.isAvailable`. If unavailable, returns `fallback(for:)`.
3. Creates a `LanguageModelSession` with system instructions that constrain output to valid JSON matching the pack schema.
4. Sends a prompt containing the product name and generation rules.
5. Parses the JSON response into a `ProductDescriptionPack`.
6. Runs `validated()` which normalizes whitespace, strips trailing punctuation, and enforces structural rules (`variants` must have exactly three entries).
7. If validation fails at any step, returns the deterministic fallback.

### Expected Output

For input `"wireless headphones noise cancelling"`:

```json
{
  "headline": "Wireless Noise-Cancelling Headphones",
  "summary": "Premium over-ear headphones with active noise cancellation and extended battery life",
  "shortLabel": "Noise-Cancelling Headphones",
  "variants": ["Wireless ANC Headphones", "Over-Ear Noise Cancelling", "Premium Wireless Headphones"],
  "category": "audio",
  "suggestedEmoji": "🎧",
  "suggestedSFSymbol": "headphones"
}
```

### Notification Copy Packs

`NotificationCopyPack` is a smaller variant used for push notification text. It contains `title`, `body`, `shortTitle`, and `category`. It omits `variants` and display-oriented fields because notifications have stricter length constraints.

---

## Language Generation Rules

These rules apply to all generators. They are encoded in system instructions and enforced by validation.

### Prompt Rules

1. Use natural English.
2. Keep phrases short. Sentences should read like polished copy, not full paragraphs.
3. `headline` must be concise and descriptive.
4. `summary` must be a single complete sentence.
5. `shortLabel` must be shorter than `headline`.
6. `variants` must contain exactly three short alternate phrasings that are semantically equivalent but phrased differently.
7. Return `null` for `category`, `suggestedEmoji`, or `suggestedSFSymbol` if the model is not confident.
8. Do not include trailing punctuation in any string except `summary`.
9. `suggestedEmoji` must be a single emoji character. Multi-character strings or non-emoji are rejected.
10. `suggestedSFSymbol` must be a valid SF Symbol name from the catalogue. Invalid names are rejected at runtime via `UIImage(systemName:)`.

### Style Rules

- Avoid filler words (`just`, `simply`, `really`).
- Avoid marketing tone or enthusiastic language.
- Prefer clear, concrete descriptors over vague ones.
- Keep output neutral and factual.

### Structural Rules Enforced by Validation

| Rule | Enforced by |
|---|---|
| `headline` is non-empty | `validated()` |
| `summary` is non-empty | `validated()` |
| `shortLabel` is non-empty | `validated()` |
| `variants` has exactly 3 entries | `validated()` |
| All `variants` are non-empty | `validated()` |
| `suggestedEmoji` is a single emoji character (if non-nil) | `validated()` |
| `suggestedSFSymbol` resolves via `UIImage(systemName:)` (if non-nil) | Runtime validation |
| Trailing punctuation is stripped (except `summary`) | `normalizePhrase()` |
| Whitespace is trimmed | `normalizePhrase()` |

If a required field rule fails, the entire generated pack is discarded and the deterministic fallback is returned. If only `suggestedEmoji` or `suggestedSFSymbol` fails validation, the individual field is set to nil and the rest of the pack is kept — icon suggestions are best-effort and do not invalidate the pack.

---

## System Constraints

1. **Apple Intelligence generates display strings only.** It does not decide domain logic, scheduling, or any other model property.
2. **It must never generate identifiers.** IDs, keys, enum raw values, and internal model names are always set by application code.
3. **It must not invent data fields.** The output schema is fixed. Any field not in the schema is ignored or causes validation failure.
4. **Output must match a strict JSON schema.** The system instructions include the exact JSON shape. Responses that deviate are caught by `JSONDecoder` and validation.
5. **Results are validated before storage.** Every pack passes through `validated()` before it is persisted or displayed. Invalid packs are replaced with deterministic fallbacks.
6. **Generation is on-device only.** All calls use `SystemLanguageModel.default`. No network requests are made for language generation.

---

## Implementation Guidelines

### Prompt Isolation

System instructions and prompt builders are static members on a dedicated generation enum (e.g. `ProductDescriptionGeneration`). Prompts are never constructed inline in view or client code. This keeps all prompt text in one place per use case.

### Schema Validation

Every response passes through:

1. `String` -> `Data` via UTF-8 encoding
2. `JSONDecoder().decode(PackType.self, from:)` for structural parsing
3. `validated()` for semantic rules (count checks, non-empty checks)
4. Normalization (whitespace trimming, punctuation stripping)

If any step fails, the fallback is returned. Partial results are never used.

### Deterministic Fallbacks

Every pack type provides a `static func fallback(for:)` that produces a grammatically correct pack from the raw input using simple string interpolation. Fallbacks are always available, require no model, and produce predictable output.

| Pack Type | Fallback Pattern |
|---|---|
| `ProductDescriptionPack` | `"X"` (headline), `"X product"` (summary) |
| `NotificationCopyPack` | `"X"` (title), `"Tap to view X"` (body) |
| `TaskSummaryPack` | `"Completed X"` (past), `"Working on X"` (present) |

### Availability Gating

Every client actor checks `model.isAvailable` before creating a session. If the model is not available (device does not support Apple Intelligence, user has not enabled it, or system resources are constrained), the client returns the fallback immediately without attempting generation.

### Error Handling

Generation calls are wrapped in `do/catch`. Any error from `LanguageModelSession.respond(to:)` results in a fallback return. Errors are not surfaced to the user because the fallback provides a functional experience.

### Actor Isolation

Client types are `actor`s, ensuring thread-safe access to the language model. Pack structs are `nonisolated`, `Sendable`, and safe to pass across isolation boundaries.

---

## Safety and UX Considerations

1. **User text is not altered beyond phrasing.** If the user names a product `"wireless headphones"`, the generated text must still reference wireless headphones. The model rephrases for grammar but does not change the subject.
2. **No fabrication.** The model must not invent products, suggest additional items, or add information the user did not provide.
3. **No emotionally manipulative language.** Output must not use urgency or motivational pressure.
4. **Neutral and factual.** Generated strings describe items objectively rather than making judgments.
5. **Fallback is always safe.** If the model produces anything unexpected, the deterministic fallback ensures the user sees grammatically correct, neutral text.
6. **No trailing punctuation (except summaries).** All non-summary strings are normalized to strip trailing sentence punctuation. This allows UI code to control punctuation and formatting.

---

## Extending to Other Features

The same `structured input -> generation -> validated output` pattern applies to any feature that needs natural language display strings from minimal user input.

### Implementation Pattern

To add a new generation use case:

1. **Define the pack struct.** `Codable`, `Equatable`, `Sendable`. Include a `validated()` method and a `static func fallback(for:)`.
2. **Define the generation enum.** Static `instructions` string, static `modelPrompt(for:)` builder, static `parsedPack(from:for:)` parser.
3. **Define the client actor.** Holds `SystemLanguageModel.default`, checks `isAvailable`, creates a `LanguageModelSession`, calls the generation enum, catches errors, returns fallback on failure.
4. **Write tests.** Cover fallback contracts, JSON parsing, validation rules, and normalization. Model-dependent tests are not required because the parsing layer is tested independently of the model.

---

## Future Expansion

Apple Intelligence usage in [YourApp] can grow while maintaining the same deterministic guarantees:

- **Batch generation.** Generate packs for multiple items in a single session if the API supports it, reducing session creation overhead.
- **Locale-aware generation.** Extend prompts to specify the target language or locale when the app supports localization beyond English.
- **Refinement from usage.** Allow users to edit generated strings. Persist user edits as overrides without discarding the generated pack.
- **Richer structured output.** If the Foundation Models framework adds `@Generable` support, pack structs could adopt it for type-safe generation instead of JSON parsing.
- **Quality feedback loop.** Track how often fallbacks are used versus generated packs to measure model availability and generation success rates.

Any expansion must preserve two invariants:

1. **Every generated string has a deterministic fallback.** The app must function identically without Apple Intelligence.
2. **Generated output is validated before use.** No generated string reaches the UI or persistence layer without passing through `validated()`.

---

## On-Device Model Constraints (Reference)

**Context window: 2048 tokens.** The on-device model has a 2048-token context length shared across system instructions, user input, and generated output. [YourApp] prompts are well within this budget today, but any future expansion (batch generation, richer schemas) must respect this ceiling.

**Near-deterministic sampling.** Apple uses argmax-style sampling with low temperature. This favours consistency over creativity, which validates the expectation of structured, predictable output from every generation call.

**Locale-aware system role.** Apple adapts prompts per locale by swapping the system role prefix. If [YourApp] adds locale-aware generation, this is the pattern to follow: same prompt structure, locale context injected into the system role.

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Initial example template. Foundation Models integration patterns, pack types, validation, and fallback contracts. |
