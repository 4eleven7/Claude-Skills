# Build and Validation Commands

Canonical build, test, lint, and validation commands. These are the source of truth for what should run.

## Requirements

- iOS 26.0+
- Xcode 26+
- Swift 6

## Zero-Warning Policy

- Fix warnings immediately.
- Do not commit code with warnings.
- If a warning truly cannot be fixed, document why and suppress it narrowly.

## App Build

```bash
xcodebuild -project <App>/<App>.xcodeproj -scheme <App> \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```

## Tests

### Unit tests only

```bash
xcodebuild -project <App>/<App>.xcodeproj -scheme <App> \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:<App>Tests test
```

### Single test suite or class

```bash
xcodebuild -project <App>/<App>.xcodeproj -scheme <App> \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:<App>Tests/{SuiteOrClassName} test
```

### All tests (including UI tests)

```bash
xcodebuild -project <App>/<App>.xcodeproj -scheme <App> \
  -destination 'platform=iOS Simulator,name=iPhone 17' test
```

## Clean

```bash
xcodebuild -project <App>/<App>.xcodeproj -scheme <App> clean
```

## Linting

### Formatter

```bash
[project Swift formatter command]
[project Swift formatter check command]
```

The formatter owns deterministic, auto-fixable style (indentation, spacing, wrapping, import ordering).

### Linter

```bash
[project Swift lint command]
```

Use the project lint command directly when one exists, not only build-phase checks. Build phases can cover only active-target files. Linters own correctness, architecture, and non-auto-fixable code quality rules.

## Package Tests

Swift Packages have their own test targets:

```bash
cd Packages/<PackageName>
xcodebuild test -scheme <PackageName> \
  -destination 'platform=iOS Simulator,name=iPhone 17'
```

Do not guess package scheme names. Use repo scripts when available.

## When to Run What

| Scenario | What to run |
|---|---|
| Small logic fix | Targeted tests first; build if change touches app code broadly |
| UI work | Targeted tests, app build, manual verification, SwiftFormat/SwiftLint |
| Wide refactor or pre-push | Full validation script (if available) or build + all tests + lint |
| Persisted-schema change | Migration guard suite, then full validation |

## Related Docs

- Project testing strategy documentation
- Git and review workflow documentation
- Code review standards
