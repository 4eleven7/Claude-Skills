# Testing Strategy

Tests should prove behaviour users or callers depend on. Do not add tests that only mirror implementation details.

## Test Types

| Type | Use for |
|---|---|
| Unit tests | Pure logic, mapping, validation, edge cases |
| Integration tests | Persistence, networking boundaries, migrations, multiple components |
| UI tests | Critical user journeys and accessibility identifiers |
| Manual checks | Visual polish, platform interactions, flows not covered by automation |

## TDD Preference

For logic bugs and behaviour changes:

1. Add or update the failing test first.
2. Implement the smallest fix.
3. Rerun the targeted test.
4. Run broader checks if the touched code is shared or risky.

## Fixtures

- Use deterministic fixture data.
- Avoid real network, clock, random, location, sensor, or account dependencies.
- Keep large fixtures justified and documented.
