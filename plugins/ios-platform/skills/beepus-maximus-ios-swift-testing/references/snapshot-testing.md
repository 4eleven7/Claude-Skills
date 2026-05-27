# Snapshot Testing

Visual regression testing using [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing) by Point-Free. Snapshot tests generate reference images on the first run and fail automatically when rendered output drifts.

## When to Use

- Catching unintended visual regressions across device sizes, dark mode, and Dynamic Type
- Verifying layout-heavy views where unit tests cannot cover visual correctness
- Replacing manual visual QA with automated pixel-level comparison

When NOT to use: for logic, state, or behaviour — use unit tests for those.

## Basic Pattern

```swift
import Testing
import SnapshotTesting
@testable import SettingsFeature

@Suite struct SettingsViewTests {
    @Test func settingsLayout() {
        let controller = SettingsViewController(viewModel: .stub())
        assertSnapshot(of: controller, as: .image(on: .iPhone13))
    }
}
```

First run generates a reference image in `__Snapshots__/`. Subsequent runs compare against it.

## Device Matrix

A single-device snapshot misses constraint breakage on smaller screens. Parameterise across devices and traits:

```swift
enum DeviceVariant: String, CaseIterable, Sendable {
    case iPhoneSE, iPhone16, iPhone16Dark, iPad

    var config: ViewImageConfig {
        switch self {
        case .iPhoneSE: .iPhoneSe
        case .iPhone16, .iPhone16Dark: .iPhone13
        case .iPad: .iPadMini
        }
    }

    var traits: UITraitCollection {
        switch self {
        case .iPhone16Dark: UITraitCollection(userInterfaceStyle: .dark)
        default: UITraitCollection()
        }
    }
}

@Suite struct ProfileViewTests {
    @Test(arguments: DeviceVariant.allCases)
    func profileLayout(variant: DeviceVariant) {
        let controller = ProfileViewController(viewModel: .stub())
        assertSnapshot(
            of: controller,
            as: .image(on: variant.config, traits: variant.traits),
            named: variant.rawValue
        )
    }
}
```

## Named References

Use `named:` to produce self-documenting filenames instead of opaque numbered suffixes:

```swift
// Wrong — generates testBannerStates.1.png, testBannerStates.2.png
assertSnapshot(of: emptyController, as: .image(on: .iPhone13))
assertSnapshot(of: fullController, as: .image(on: .iPhone13))

// Right — generates bannerStates.emptyCart.png, bannerStates.fiveItems.png
assertSnapshot(of: emptyController, as: .image(on: .iPhone13), named: "emptyCart")
assertSnapshot(of: fullController, as: .image(on: .iPhone13), named: "fiveItems")
```

## Inline Snapshots for Text/JSON

For non-image assertions, use `assertInlineSnapshot` to embed expected values directly in the test source:

```swift
import InlineSnapshotTesting

@Test func serializesEvent() {
    let event = AnalyticsEvent.addToCart(itemId: "SKU-1042", price: 29.99)
    let json = EventSerializer().toJSON(event)

    assertInlineSnapshot(of: json, as: .lines) {
        """
        {
          "event": "add_to_cart",
          "item_id": "SKU-1042",
          "price": 29.99
        }
        """
    }
}
```

The expected value is auto-populated on first run. Changes are visible in code review without opening separate reference files.

## Multiple State Previews

Snapshot every meaningful state of a view — not just the happy path:

```swift
@Test func paymentStatusStates() {
    let states: [(name: String, status: PaymentStatus)] = [
        ("success", .success(amount: 49.99)),
        ("pending", .pending),
        ("failedDeclined", .failed(.cardDeclined)),
        ("failedNetwork", .failed(.networkUnavailable)),
        ("loading", .loading),
    ]

    for (name, status) in states {
        let controller = PaymentStatusViewController(status: status)
        assertSnapshot(of: controller, as: .image(on: .iPhone13), named: name)
    }
}
```

## Rules

- Record new snapshots with `isRecording: true` or by running the test with no existing reference
- Commit reference images to source control so CI can compare against them
- Review snapshot diffs carefully — pixel drift from OS updates or font rendering changes may require re-recording
- Keep snapshot tests separate from unit tests — they are slower and require a host app
- Use `.precision(0.99)` if minor anti-aliasing differences cause false failures across machines
