# Release Workflows

## App Store Changelog

Generate user-facing release notes from git history.

### 1) Collect Changes

Use the project change-summary or release-note helper if one exists; otherwise inspect the relevant git commit range directly.

Pass a specific tag or commit range if needed.

Falls back to full history if no tags exist.

### 2) Triage for User Impact

- Scan commits and touched files to identify user-visible changes.
- Group by theme: **New**, **Improved**, **Fixed**.
- Deduplicate overlapping commits.
- Drop internal-only work (build scripts, refactors, dependency bumps, CI).

### 3) Draft App Store Notes

- Write short, benefit-focused bullets for each user-facing change.
- Use clear verbs and plain language; avoid internal jargon.
- Target 5-10 bullets unless the user specifies otherwise.

### 4) Validate

- Every bullet must map back to a real change in the commit range.
- Check for duplicates and overly technical wording.
- Ask for clarification if any change is ambiguous or internal-only.

### Output Format

- Optional title: "What's New" or product name + version.
- Bullet list only; one sentence per bullet.
- Respect storefront character limits if provided.

### Resources

- Use the project release-note guidelines when present.
- Use git history to collect commits and touched files since the last relevant tag.

---

## macOS SwiftPM App Packaging

Build, package, sign, and distribute a SwiftPM-based macOS app without an Xcode project.

### Bootstrap

1. Copy `assets/templates/bootstrap/` into a new repo.
2. Rename `MyApp` in `Package.swift`, `Sources/MyApp/`, and `version.env`.
3. Customise `APP_NAME`, `BUNDLE_ID`, and version numbers.

### Build and Test

```bash
swift build
swift test
```

### Package

```bash
the project package script
```

Creates a signed .app bundle with resources, Info.plist, and entitlements.

### Run (Development)

```bash
the project compile-and-run script   # preferred: kill, package, launch
the project launch script            # launch an already-packaged .app
```

### Sign, Notarise, and Release

```bash
the project signing/notarization script   # notarise, staple, zip
the project appcast script        # generate Sparkle appcast entry
```

Then create a git tag and upload the zip/appcast to a GitHub release.

### Template Scripts

| Script | Purpose |
|---|---|
| `package_app.sh` | Build binaries, create .app bundle, copy resources, sign. |
| `compile_and_run.sh` | Dev loop: kill running app, package, launch. |
| `build_icon.sh` | Generate .icns from an Icon Composer file (requires Xcode). |
| `sign-and-notarize.sh` | Notarise, staple, and zip a release build. |
| `make_appcast.sh` | Generate Sparkle appcast entries for updates. |
| `setup_dev_signing.sh` | Create a stable dev code-signing identity. |
| `launch.sh` | Simple launcher for a packaged .app. |
| `version.env` | Version file consumed by packaging scripts. |

### Notes

- Edit the template scripts directly for entitlements and signing configuration.
- Remove Sparkle steps if you do not use Sparkle for updates.
- `BUILD_NUMBER` in `version.env` must increase for each update (Sparkle relies on `CFBundleVersion`).
- For menu bar apps, set `MENU_BAR_APP=1` when packaging to emit `LSUIElement` in Info.plist.
