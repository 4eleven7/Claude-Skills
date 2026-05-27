<!-- This is an example template. Replace [YourApp] with your actual app name and adjust feature folders and file paths to match your project. -->

# Reference Features

## Purpose

Point developers and AI agents at real [YourApp] code that demonstrates current patterns.

This replaces fake example features. Real maintained features are more useful than synthetic scaffolding.

## When to Use

- You need a concrete example of a client, repository, or dev-view
- You need a small reference before adding a new feature
- You want to see how services are wired in real code

## Workflow

1. Pick the closest real feature from the table below.
2. Read the feature's client first.
3. Read the related tests before copying any pattern.
4. Copy only the parts that fit the feature you are building.

## Example

| Need | Reference |
|---|---|
| Small feature with local persistence | `[YourApp]/[YourApp]/Features/Settings/` |
| Network-backed feature with local state | `[YourApp]/[YourApp]/Features/Profile/` |
| Feature with service + repository | `[YourApp]/[YourApp]/Features/Notifications/` |
| Aggregator feature with no local `@Model` types | `[YourApp]/[YourApp]/Features/Dashboard/` |

## Notes

- Do not copy a whole feature blindly.
- If a real feature and a template disagree, prefer the real feature only after checking that it still matches the current architecture and workflow docs.
- Start with these files:

| Pattern | File |
|---|---|
| Client facade | `[YourApp]/[YourApp]/Features/Profile/ProfileClient.swift` |
| Repository-backed local feature | `[YourApp]/[YourApp]/Features/Settings/SettingsClient.swift` |
| SwiftUI debug screen | `[YourApp]/[YourApp]/Features/Notifications/NotificationsDevView.swift` |
| Aggregator without persistence | `[YourApp]/[YourApp]/Features/Dashboard/DashboardClient.swift` |
