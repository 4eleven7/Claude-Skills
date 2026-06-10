# Codable Patterns

Quick reference for Codable protocol conformance — decision tree, common errors, date handling, and anti-patterns.

## Decision Tree

```
Has your type...
├─ All properties Codable? → Just add `: Codable` (automatic synthesis)
├─ Property names differ from JSON/column keys? → CodingKeys enum
├─ Need to exclude properties? → CodingKeys enum (omit cases) + default values
├─ Enum with raw value? → RawRepresentable + Codable (automatic)
├─ Enum with associated values? → Label all values (auto-synthesis since Swift 5.6)
├─ Structural mismatch (nested/flattened)? → Manual init(from:)/encode(to:)
├─ Needs external data not in payload? → DecodableWithConfiguration (iOS 15+)
└─ GRDB record? → See grdb skill references/records-and-queries.md
```

## Common Error → Fix Table

| Error | Fix |
|---|---|
| `Type 'X' does not conform to 'Decodable'` | A stored property isn't Codable. Make it Codable or exclude via CodingKeys |
| `No value associated with key X` | CodingKeys don't match payload keys |
| `Expected to decode X but found Y` | Type mismatch — check payload structure |
| `keyNotFound` | Key missing — make property optional or provide default |
| Date parsing failed | Configure `dateDecodingStrategy` on decoder |

## CodingKeys

```swift
struct Article: Codable {
    let url: URL
    let title: String
    var localDraft: String = ""  // excluded — needs default

    enum CodingKeys: String, CodingKey {
        case url = "source_link"  // rename
        case title                // same name
        // localDraft omitted — not encoded/decoded
    }
}
```

**Rule:** Excluded properties must have default values or you must write `init(from:)` manually.

## Enum Patterns

```swift
// Raw value — encodes as the raw value itself
enum Status: String, Codable { case active, inactive }

// Associated values — ALWAYS label them
enum Result: Codable {
    case success(data: String, count: Int)  // ✅ {"success":{"data":"x","count":1}}
    case error(code: Int)
}

// ❌ Unlabeled associated values generate _0, _1 keys
enum Bad: Codable { case store(String, Int) }  // {"store":{"_0":"x","_1":1}}
```

## Nested Containers (Flattening)

```swift
// JSON: {"lat": 37.7, "lng": -122.4, "meta": {"elevation": 52}}
// Swift: flat struct with elevation at top level

struct Coordinate: Codable {
    var lat: Double
    var lng: Double
    var elevation: Double

    enum CodingKeys: String, CodingKey { case lat, lng, meta }
    enum MetaKeys: String, CodingKey { case elevation }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        lat = try c.decode(Double.self, forKey: .lat)
        lng = try c.decode(Double.self, forKey: .lng)
        let meta = try c.nestedContainer(keyedBy: MetaKeys.self, forKey: .meta)
        elevation = try meta.decode(Double.self, forKey: .elevation)
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(lat, forKey: .lat)
        try c.encode(lng, forKey: .lng)
        var meta = c.nestedContainer(keyedBy: MetaKeys.self, forKey: .meta)
        try meta.encode(elevation, forKey: .elevation)
    }
}
```

## Date Strategies

```swift
let decoder = JSONDecoder()

// ISO 8601 (preferred) — expects timezone offset
decoder.dateDecodingStrategy = .iso8601
// "2024-02-15T17:00:00+01:00" ✅
// "2024-02-15T17:00:00"       ❌ ambiguous across timezones

// Unix seconds
decoder.dateDecodingStrategy = .secondsSince1970

// Custom formatter — ALWAYS set locale and timezone
let fmt = DateFormatter()
fmt.dateFormat = "yyyy-MM-dd"
fmt.locale = Locale(identifier: "en_US_POSIX")
fmt.timeZone = TimeZone(secondsFromGMT: 0)
decoder.dateDecodingStrategy = .formatted(fmt)
```

**Performance:** Custom closures run for every date. Create formatters once, not per-decode.

## DecodingError Handling

```swift
do {
    let user = try decoder.decode(User.self, from: data)
} catch DecodingError.keyNotFound(let key, let ctx) {
    logger.error("Missing '\(key)' at \(ctx.codingPath)")
} catch DecodingError.typeMismatch(let type, let ctx) {
    logger.error("Type mismatch for \(type) at \(ctx.codingPath)")
} catch DecodingError.valueNotFound(let type, let ctx) {
    logger.error("Null value for \(type) at \(ctx.codingPath)")
} catch DecodingError.dataCorrupted(let ctx) {
    logger.error("Corrupted at \(ctx.codingPath)")
}
```

## Anti-Patterns

| Don't | Why | Do Instead |
|---|---|---|
| `try?` to silence decode errors | Silent data loss, undebuggable | Handle specific DecodingError cases |
| Make properties optional to avoid keyNotFound | Masks structural problems, nil checks everywhere | Fix the model/payload mismatch |
| Build JSON strings manually | Injection risk, escaping bugs | Use JSONEncoder |
| DateFormatter without locale | Fails in non-US locales | `Locale(identifier: "en_US_POSIX")` |
| ISO 8601 dates without timezone | Intermittent bugs across regions | Always include timezone offset |
| New formatter per decode call | Performance — allocation per date | Reuse a shared instance |
| `JSONSerialization` for Codable types | 3x more boilerplate, manual casting | JSONDecoder/JSONEncoder |

## Codable + Sendable

Value types (structs, enums) get automatic Sendable conformance when all properties are Sendable. For Codable types crossing actor boundaries:

```swift
// ✅ Struct — automatically Sendable
struct User: Codable, Sendable {
    let id: UUID
    var name: String
}

// ❌ Class — needs explicit Sendable + immutability or @unchecked
final class UserDTO: Codable, @unchecked Sendable {
    // Must guarantee thread safety manually
}
```

**Prefer structs for Codable types.** They're Sendable by default and have value semantics.

## Testing Codable Types

Round-trip test pattern:

```swift
@Test func userRoundTrips() throws {
    let original = User(id: UUID(), name: "Alice")
    let data = try JSONEncoder().encode(original)
    let decoded = try JSONDecoder().decode(User.self, from: data)
    #expect(decoded == original)
}

@Test func userDecodesFromExternalJSON() throws {
    let json = """
    {"id": "550e8400-e29b-41d4-a716-446655440000", "name": "Bob"}
    """.data(using: .utf8)!
    let user = try JSONDecoder().decode(User.self, from: json)
    #expect(user.name == "Bob")
}
```

Test external payloads with literal JSON to catch schema drift.
