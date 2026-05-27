# Engineering Process

Consolidated engineering process: code review, git workflow, development workflow, coding standards, and modern API preferences.

## Code Review Standard

A review is not a summary of the diff. It is a search for defects, regressions, architectural violations, missing tests, and unnecessary complexity.

### Review Priorities (in order)

1. **Correctness** and behavioural regressions
2. **Data integrity**, persistence safety, and architecture violations
3. **Performance** and update-frequency risk
4. **Test coverage** and verification gaps
5. **Code clarity** and maintainability

### What Reviewers Check

**Correctness:**
- Does the implementation match the approved spec?
- Are edge cases and failure paths handled?
- Did the change accidentally alter an existing interaction pattern?

**Architecture:**
- Does the change violate feature boundaries?
- Did a feature import another feature's types?
- Did anyone create a new production `ModelContainer`?
- Did data access stay behind the canonical data client?

**Performance:**
- Is new work happening in hot paths?
- Are SwiftUI views doing expensive work in `body`?
- Did the change broaden observation or invalidation scope unnecessarily?

**Testing:**
- Are the right layers tested?
- Are tests deterministic?
- Is the change relying on previews instead of real verification?

### Author Expectations

- Keep diffs surgical.
- Avoid speculative abstractions.
- Call out tradeoffs and risks explicitly.
- Mention any missing verification instead of hoping nobody notices.

## Definition of Done

A change is not done until:

- Behaviour matches the spec or agreed request
- Targeted tests pass when behaviour matters
- Build passes when the touched surface justifies it
- Lint and guardrail checks are clean when the change is broad enough
- Warnings are resolved
- Documentation or specs are updated if the contract changed
- Known risks and untested areas are disclosed

## Git Workflow

### Branch Rules

- Branch from `main`.
- Keep one feature or fix per branch.
- Keep branches short-lived.

### Commit Message Format

```text
[FEATURE] TYPE: description

[optional body]

[optional footer]
```

**Types:** `FEAT`, `FIX`, `REFACTOR`, `TEST`, `DOCS`, `CHORE`

**Rules:**
- Type is uppercase.
- Subject line is imperative.
- Subject line has no trailing period.
- Subject line stays under 50 characters.
- Body explains what changed and why, not how.
- Reference issues with `Fixes #123` or `Closes #456` when applicable.

**Examples:**

```text
[SLEEP] FEAT: Add sleep duration calculation

Calculate total sleep time excluding interruptions.
Uses HealthKit data when available, falls back to manual entry.
```

```text
[SLEEP] FIX: Prevent crash when sleep session has no end time

Guard against nil end date in duration calculation.
Fixes #42
```

### Pull Request Structure

Title: Start with a verb. Be specific and technical.

Description structure:
1. Summary
2. Technical Details
3. Risk Areas
4. Testing
5. Follow-ups

### Review Handoff

Before requesting review:
- Describe the behavioural change, not just files touched.
- Call out known risks.
- Call out any spec deviation explicitly.
- Call out missing tests or manual-only verification.

### Pre-Push Checklist

```bash
the project full build validation command
```

## Development Workflow

```
Specification --> Implementation Plan --> Tests --> Feature Implementation --> Verification
```

### 1. Write or update the specification

Describe behaviour, business rules, edge cases, and acceptance criteria. Keep implementation details out of the spec. Get the spec to `Approved` before substantial work.

### 2. Create a brief implementation plan

Audit the current code first. List dependencies, affected features, and integration points. Output: what will be tested first, what production files will change, what verification will prove the work is complete.

### 3. Write tests first

Convert acceptance criteria and edge cases into failing tests. Prefer unit tests for logic and state derivation. Add integration tests when persistence or multiple layers interact. Add UI tests only when they cover specified user-visible behaviour that lower layers cannot.

### 4. Implement the feature

Make the minimum production change required to pass the tests. Reuse existing architecture. Prefer concrete implementations over protocols and scaffolding.

### 5. Verify specification compliance

Run targeted tests. Build the app target. Run lint and guardrail checks when broad enough. Compare final behaviour back to the spec. Update documentation when the contract changed.

## Swift Coding Standards

### Naming

- Types and protocols: `UpperCamelCase`
- Functions, variables, properties: `lowerCamelCase`
- Boolean properties: use `is`, `has`, or `should`
- Acronyms follow Apple conventions: `URLSession`, `HTTPClient`, `urlSession`

### File Headers

```swift
//
//  FileName.swift
//  Project Name
//
//  Created by Dan Love on DD/MM/YYYY.
//
```

### File Header Rules

- Never use "Claude" or "AI" as the author.
- For new files, detect project name in order: sibling Swift files in the same directory, then `.xcodeproj`/`.xcworkspace` name, then ask the user.
- When editing an existing file, preserve the existing author and project name. Do not change them without an explicit request.

### File Organisation

1. Imports, alphabetised
2. Primary type declaration
3. Stored properties and wrappers
4. Computed properties
5. Primary methods or `body`
6. Private extensions and protocol conformances

### Access Control

- Default properties and helpers to `private`.
- Feature code stays `internal`.
- Do not use `public` in feature code.
- Use `public` only in Swift Packages where the API crosses a module boundary.
- Mark feature clients and view models `@MainActor` explicitly.

### Documentation

- Document public package APIs with `///`.
- Skip documentation for self-explanatory internals.
- Use `// MARK: -` to break up larger files.

### Default Prohibitions

- Do not use `ObservableObject` or `@Published` in new app code; use `@Observable`.
- Do not force unwrap.
- Do not use callbacks for new async work; use `async/await`.
- Do not use `AnyView` unless an API boundary leaves no practical alternative.
- Do not use singletons for feature state.
- Do not put business logic in SwiftUI views.
- Do not commit warnings.
- Do not commit secrets.

## Engineering Discipline

### Verification Loop

When planning multi-step work, use the verification loop format to make each step auditable:

```
1. [Step description] → verify: [how you confirm it worked]
2. [Next step] → verify: [check]
```

Every step must have a concrete verification check before moving on.

### Orphan Cleanup

Remove imports, variables, and functions that your changes made unused. Do not remove pre-existing dead code unless explicitly asked.

### Complexity Self-Test

Before finalising a change, ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify before committing.

## Modern API Preferences

Prefer modern Apple APIs when they make code simpler, clearer, or safer. Do not churn working code just to look modern.

### Swift and Foundation

- Prefer Swift concurrency over GCD for new async work.
- Prefer `FormatStyle` over legacy formatter classes.
- Prefer `.formatted(...)` over `String(format:)` for user-facing numeric text.
- Prefer `URL.documentsDirectory` and `appending(path:)` over older path-building patterns.
- Prefer `localizedStandardContains()` for user-input filtering.

### SwiftUI

- Prefer `foregroundStyle()` over `foregroundColor()`.
- Prefer `clipShape(.rect(cornerRadius:))` over `cornerRadius()`.
- Prefer the modern `Tab` API over `tabItem()`.
- Do not use the deprecated one-parameter `onChange`.
- Prefer `Button` over `onTapGesture()` for interactive controls.
- Prefer `Task.sleep(for:)` over nanosecond-based sleep APIs.
- Do not reach for `UIScreen.main.bounds`; use layout-relative APIs.
- Prefer `containerRelativeFrame()` and `visualEffect()` when they replace `GeometryReader` cleanly.
- Prefer modern scroll APIs (`ScrollPosition`, `defaultScrollAnchor`) when they fit.

### Rule

When a modern API exists and is the better fit, use it. When it is not the better fit, say why and use the older API intentionally.
