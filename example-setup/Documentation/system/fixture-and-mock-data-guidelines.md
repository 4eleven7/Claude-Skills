<!-- EXAMPLE TEMPLATE: Replace [YourApp] with your project name. Adjust framework-specific references (e.g. HealthKit) to match your domain. -->

# Fixture And Mock Data Guidelines

## Purpose

Define how [YourApp] creates preview data, test fixtures, deterministic mocks, and dev-view seed data.

The goal is predictable behaviour, easy debugging, and low-noise setup.

## Core Rules

- Prefer deterministic data over generated randomness
- Use fixed dates when date logic matters
- Set explicit calendars, locales, and time zones when boundary logic matters
- Use fixed UUIDs when identity or ordering matters
- Keep fixtures as small as possible while still proving the behaviour

## Preview Data

- Keep preview data lightweight
- Do not hit network, framework-specific data sources (e.g. HealthKit), or app boot code from previews
- Prefer direct sample values or `.mock` / `.mockList`
- Preview only the major visual states that matter
- If a preview truly needs persistence, keep it in-memory and preview-local

## Test Fixtures

- Place fixtures close to the tests that use them unless there is real shared reuse
- Prefer explicit literals when they make the assertion clearer
- Use builders only when raw literals become noisy
- Keep fixture helpers deterministic by default
- Use in-memory persistence for integration tests unless the test specifically needs something narrower

## Deterministic Mocks

- Make synthetic data obviously synthetic
- Do not hide important defaults
- Keep the values that drive assertions explicit
- Use named fixtures for scenario-level meaning, not vague `sample1`, `sample2`

## Dev-View Data

- Seed only the data needed to exercise the feature
- Make reset behaviour explicit
- Keep debug-only data and helpers inside debug-only code
- If the dev-view runs inside the app, use the app's existing client or context
- Use isolated in-memory containers only when no app-owned container exists in that flow

## Reuse Threshold

Do not build shared fixture infrastructure for one caller.

Extract shared fixtures only when:

- multiple tests or previews need the same scenario
- the shared helper stays simpler than repeating the literals

## Related Docs

- `Documentation/system/swiftui-view-guidelines.md`
- `Documentation/system/testing-strategy.md`
- `Documentation/templates/dev-view-template.md`
