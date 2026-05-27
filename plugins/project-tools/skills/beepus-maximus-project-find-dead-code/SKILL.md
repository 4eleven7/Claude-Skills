---
name: find-dead-code
description: Find unused production code with parallel analysis, treating code referenced only from tests as dead. Analysis-only; does not delete code.
---

# Find Dead Code

Identify dead code in a codebase. **Core rule: code only used in tests is still dead code.** Only production usage counts.

## Responsibility

**Owns:** Detecting unused symbols, test-only symbols, vestigial enum cases, orphaned convenience methods, unused model fields.
**Does NOT own:** Fixing or deleting dead code (report only), visibility narrowing suggestions ("unnecessarily public" is a separate concern).

## Step 1: Detect Scope and Test Boundaries

Determine the project structure:

1. Identify source roots — where production code lives (e.g., `Sources/`, `<App>/Features/`, `Packages/`)
2. Identify test roots — `<App>Tests/`, `<App>UITests/`, any `Tests/` directories in packages
3. **Partition the codebase** into analysis units by feature directory or package. Each becomes one agent's scope in Step 3.

If the user specified a scope, restrict analysis to that scope.

### Test File Patterns

Code referenced ONLY from these locations is dead:

| Pattern | Location |
|---------|----------|
| `*Tests.*` | Test targets |
| `*Test.*` | Test targets |
| `Tests/**` | Package test directories |
| `Mock*.*` | Mock files in test targets |
| `*Fixture*.*` | Test fixture files |
| `XCTestCase` subclasses | Anywhere |
| `@Suite` / `@Test` files | test files |
| Preview providers | `#Preview` blocks, `*_Previews` structs |

## Step 2: Quick Wins — Periphery (Optional)

If `periphery` is installed, run it as a fast first pass:

```bash
which periphery && periphery scan --skip-build
```

**Limitation:** Periphery counts test imports as real usage. It cannot detect code only used in tests. Step 3 is required for test-only detection.

If not installed, skip to Step 3. Do not ask the user to install it.

## Step 3: Test-Only Analysis — Parallel Agents

Spawn parallel agents to find code only referenced from tests.

### Agent Strategy

For each feature directory or package identified in Step 1, launch one agent. Each agent receives:

1. Its assigned directory to scan for public/internal symbols
2. The test file patterns from Step 1
3. The full project root path for cross-codebase grep

### Agent Task

Each agent performs:

**a) Find exported/public symbols:**

| Access Level | Patterns |
|-------------|----------|
| `public` | `public func`, `public var`, `public let`, `public class`, `public struct`, `public enum`, `public protocol` |
| `open` | `open class`, `open func`, `open var` |
| `internal` | `func`, `var`, `let`, `class`, `struct`, `enum` (no access modifier, within a module) |

**b) For each symbol, grep across the entire codebase** for references, excluding:
- The definition file itself
- Generated directories and build artifacts
- Build artifacts

**c) Classify each reference** as test or production based on test file patterns.

**CRITICAL — same-module references count as production usage.** A symbol called by another production file within the same module/package is alive. Only report symbols with zero production references from any file.

**d) Report structured results** for each symbol:
- Symbol name, type, definition file and line range
- Number of production references (with file paths)
- Number of test references (with file paths)
- Classification: `dead` (zero prod refs), `test-only` (only test refs), `alive` (has prod refs)

## Step 4: Filter and Classify

Apply these language/framework-specific filters:

1. **Protocol conformances**: Skip symbols that satisfy a protocol requirement — they may be called dynamically through the protocol
2. **UI entry points**: Skip `body` computed properties, `@main` structs, `#Preview` blocks, `View` conformances used in `NavigationStack`/`TabView`
3. **persistence models**: Skip models registered only through framework configuration — they are used by the framework
4. **Codable conformances**: Skip `init(from:)` and `encode(to:)` — called by the framework
5. **@objc and dynamic**: Flag as "likely dead" rather than "definite" — Objective-C runtime may call them
6. **Intent conformances**: Skip framework-discovered intent or extension implementations
7. **Widget/Timeline providers**: Skip framework-discovered provider implementations
8. **Spec references**: Cross-reference against the project specifications or requirements documents — test-only APIs may be planned features

Classify each finding:
- **Definite dead**: zero references outside its definition file
- **Test-only dead**: references exist, but ALL are in test files
- **Likely dead**: uncertain due to protocol conformance, `@objc`, or framework usage

### Common Dead Code Patterns

1. **Test-only state accessors**: Public properties exposing internal state solely for test assertions (e.g., `var currentItems: [Item]`). Production consumers use behavior; only tests peek at state.
2. **Unused Codable fields**: Properties on `Codable` structs that are decoded but never read by production code. When removing, also update migration code.
3. **Vestigial enum cases**: Cases defined but never constructed or matched in production.
4. **Orphaned convenience methods**: Public wrappers calling another method with slightly different parameters where all callers use the underlying method directly.
5. **Dead persisted model fields**: Properties on persisted model types that exist in the schema but are never read or written in production code.

### Adjacent Findings

While scanning, note but do not act on:
- **Bugs near dead code**: Missing calls, wiring gaps, incomplete integrations
- **Unwired features**: Code that is defined and tested but not connected to the rest of the system

## Step 5: Present Findings

Group results by confidence:

### Definite Dead (zero references outside definition)

| File | Symbol | Type | Line Range | Recommendation |
|------|--------|------|------------|----------------|

### Test-Only Dead (referenced only in tests)

| File | Symbol | Type | Test files referencing it | Recommendation |
|------|--------|------|--------------------------|----------------|

### Likely Dead (verify manually)

| File | Symbol | Type | Reason for uncertainty | Recommendation |
|------|--------|------|------------------------|----------------|

Include:
- Total count per category
- Estimated removable lines
- Suggested removal order (leaf dependencies first)

## Rules

- If more than 8 feature directories are identified, ask the user to narrow scope.
- If no dead code is found, report that explicitly.
- Do not modify or delete any code. This skill is analysis-only.
- Same-module internal references count as production usage. Do not report symbols as dead when they are used by other production files within the same module.
