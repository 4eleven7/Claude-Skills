<!-- This is an example template. Replace [YourApp] with your actual app name and adjust package/target names to match your project. -->

# Build And Validation Commands

## Purpose

Define the canonical [YourApp] build, test, lint, and validation commands.

These are the shell-command equivalents. Tooling wrappers may map to them, but this document is the source of truth for what should run.

## Requirements

- iOS 26.1+
- Xcode 26+
- Swift 6

## Zero-Warning Policy

- Fix warnings immediately.
- Do not commit code with warnings.
- If a warning truly cannot be fixed, document why and suppress it narrowly.

## [YourApp] App Commands

### Build

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17' build
```

### Run [YourApp] unit tests

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:[YourApp]Tests test
```

### Run a single test suite or class

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:[YourApp]Tests/{SuiteOrClassName} test
```

### Run the persistence migration guard suite

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:[YourApp]Tests/PersistenceMigrationPlanTests \
  -only-testing:[YourApp]Tests/PersistenceSchemaTests \
  -only-testing:[YourApp]Tests/PersistenceContainerTests \
  test
```

### Run all tests including UI tests

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] -destination 'platform=iOS Simulator,name=iPhone 17' test
```

### Clean

```bash
xcodebuild -project [YourApp]/[YourApp].xcodeproj -scheme [YourApp] clean
```

## SwiftFormat

```bash
bash Scripts/check_swift_format.sh
```

Use standalone SwiftFormat, not just editor integration. It checks the full repo, including UI tests and dev-views.

To apply repo formatting locally:

```bash
bash Scripts/format_swift.sh
```

SwiftFormat owns deterministic, auto-fixable style such as indentation, spacing, wrapping, and import ordering.

## SwiftLint

```bash
swiftlint lint --config .swiftlint.yml --no-cache
```

Use standalone SwiftLint, not just the build phase. The build phase only covers active-target files. Standalone lint covers the full repo, including UI tests and dev-views.

SwiftLint owns correctness, architecture, and non-auto-fixable code quality rules.

## Package Tests

[YourApp] uses Swift Packages for shared infrastructure (e.g., `CoreModels`, `Networking`, `Analytics`).

Example:

```bash
cd [YourApp]/Packages/Networking
xcodebuild test -scheme Networking -destination 'platform=iOS Simulator,name=iPhone 17'
```

Do not guess package scheme names. Use the repo scripts when needed.

## Schema Change Detection

```bash
bash Scripts/check_migration_coverage.sh
```

Warns (does not fail) when persistence surface files change in the current diff without a corresponding change to `PersistenceMigrationPlan.swift`. Run as part of CI checks. See `Documentation/system/release-migration-policy.md` for full context.

## Full Validation

```bash
bash Scripts/check_all_builds.sh
```

This runs:

1. [YourApp] app build
2. [YourApp]Tests
3. Package tests
4. SwiftFormat
5. SwiftLint
6. Feature isolation checks
7. Model registration checks
8. Architecture guardrail checks
9. Schema change detection

## When To Run What

- Small logic fix: targeted tests first, then build if the change touches app code broadly enough to justify it
- UI work: targeted tests if applicable, app build, manual verification, and standalone SwiftFormat/SwiftLint when the surface area is non-trivial
- Wide refactor or pre-push: run `bash Scripts/check_all_builds.sh`
- Persisted-schema change: run the persistence migration guard suite, then `bash Scripts/check_all_builds.sh` before push
- Pre-release: run `bash Scripts/check_all_builds.sh`, generate fixture store, update registry (see `Documentation/system/release-migration-policy.md`)

## Related Docs

- `Documentation/system/testing-strategy.md`
- `Documentation/system/git-and-review-workflow.md`
- `Documentation/system/code-review-standard.md`
