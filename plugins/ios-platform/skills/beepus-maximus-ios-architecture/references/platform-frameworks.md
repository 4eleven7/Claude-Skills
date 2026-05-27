# Platform Frameworks

StoreKit 2 subscription patterns, CI/CD with GitHub Actions, and App Store Connect pipeline.

## StoreKit 2 Subscription System

### Intelligence-Based Trial

The trial ends when the AI demonstrates value, not after a fixed time period:

```
Install --> Trial (silent Pro, user does not know)
   |
ANY trigger:
  - 50 AI interactions
  - 3 patterns discovered
  - 21 calendar days
   |
Grace Period (48 hours, gentle inline hints)
   |
Free Tier (rate-limited, inline upgrade cards)

At ANY point: User subscribes --> Pro
```

### TrialManager (Actor-Based State Machine)

```swift
public actor TrialManager {
    public enum TrialState: String, Codable, Sendable {
        case trial      // Full Pro, silently
        case grace      // 48h grace after maturity
        case expired    // Free tier
        case subscribed // Paying user
    }

    public static let interactionThreshold = 50
    public static let patternThreshold = 3
    public static let maxTrialDays = 21
    public static let gracePeriodHours = 48

    @discardableResult
    public func evaluate(
        totalInteractions: Int,
        discoveredPatterns: Int,
        isStoreSubscribed: Bool
    ) -> TrialState {
        if isStoreSubscribed { return .subscribed }
        guard currentState == .trial else { return currentState }
        if checkMaturity(totalInteractions: totalInteractions,
                         discoveredPatterns: discoveredPatterns) {
            return .grace
        }
        return currentState
    }
}
```

### StoreKit 2 Service

```swift
public actor StoreKitSubscriptionService: SubscriptionServiceProtocol {
    public func currentStatus() async -> SubscriptionStatus {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == SubscriptionProductID.proLifetime {
                return SubscriptionStatus(tier: .pro, isActive: true)
            }
            if let exp = transaction.expirationDate, exp > Date() {
                return SubscriptionStatus(tier: .pro, expirationDate: exp, isActive: true)
            }
        }
        return .free
    }

    public func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            guard case .verified(let transaction) = verification else { return false }
            await transaction.finish()
            return true
        case .userCancelled, .pending: return false
        @unknown default: return false
        }
    }
}
```

### Product ID Convention

```swift
public enum SubscriptionProductID {
    public static let proMonthly = "app.myapp.ios.pro.monthly"
    public static let proAnnual = "app.myapp.ios.pro.annual"
    public static let proLifetime = "app.myapp.ios.pro.lifetime"
    public static let allProducts: Set<String> = [proMonthly, proAnnual, proLifetime]
}
```

### Key Principles

- No modal paywalls on first launch. Silent trial is invisible.
- Use StoreKit 2 async API, not `SKPaymentQueue` (StoreKit 1).
- `Transaction.currentEntitlements` replaces receipt validation.
- Do not store subscription state in UserDefaults as source of truth.
- Do not block UI on subscription checks. Default to free.
- Store critical trial state in Keychain (persists across reinstalls).

## CI/CD with GitHub Actions

### Three-Workflow Structure

```
PR opened/updated  -->  test.yml    -->  unit tests + snapshot validation
Push to main       -->  build.yml   -->  archive + upload artifact
Tag v*             -->  release.yml -->  archive + submit to App Store Connect
```

### test.yml -- PR Validation

- **Lint** on `ubuntu-latest` (10x cheaper than macOS runners).
- **Unit tests** on `macos-15` with pinned Xcode version.
- **Snapshot tests** across a matrix: 5 locales (en, ar, de, ja, tr) x 3 devices (SE, Pro, Pro Max) = 15 parallel jobs.
- `fail-fast: false` ensures all jobs complete even if one fails.
- Upload snapshot diffs as artifacts on failure.

### build.yml -- Archive on Main

- Code signing via `fastlane match appstore --readonly`.
- Upload `.ipa` as build artifact.

### release.yml -- App Store Submission

- Triggered by version tags (`v*`).
- Archive, sign, and submit via fastlane.
- Create GitHub Release with release notes.

### Caching

```yaml
# Tuist cache
key: tuist-${{ runner.os }}-xcode16.2-${{ hashFiles('Project.swift', 'Tuist/**') }}

# SPM cache
key: spm-${{ runner.os }}-${{ hashFiles('Tuist/Package.resolved') }}

# Ruby gems cache
key: gems-${{ runner.os }}-${{ hashFiles('Gemfile.lock') }}
```

Include the Xcode version string in every cache key to prevent stale artifacts after runner updates.

### Code Signing

Required GitHub Secrets:

| Secret | Purpose |
|---|---|
| `MATCH_PASSWORD` | Decrypt the match certificates repo |
| `MATCH_GIT_URL` | URL of private git repo with certificates |
| `APP_STORE_CONNECT_API_KEY_ID` | API key ID |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | API key issuer ID |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Base64-encoded `.p8` key content |

Use `--readonly` in CI to prevent creating new certificates.

### Runner Configuration

- Pin to `macos-15` (Sequoia).
- Always pin the full Xcode path: `sudo xcode-select -s /Applications/Xcode_16.2.app/Contents/Developer`.
- Gate macOS jobs behind Linux lint to save costs.

### Makefile Integration

CI calls the same Makefile targets that developers run locally (`make test`, `make snapshots`, `make archive`, `make submit`). When the build command changes, update the Makefile once.

### CI Anti-Patterns

- Do not run `xcodebuild` directly in CI workflow files. Use Makefile targets.
- Do not store certificates in the repository. Use fastlane match.
- Do not skip simulator pinning. Different simulators produce different snapshot pixels.
- Do not rely on the default Xcode version on runners.
- Do not pass secrets as command-line arguments. Use environment variables.
- Do not use `self-hosted` runners without security hardening.

## App Store Connect Pipeline

### fastlane Lanes

- `create_app` -- App Store Connect app registration
- `certificates` -- match-based code signing
- `build` / `archive` -- xcodebuild archive
- `upload` -- App Store Connect upload
- `metadata` -- screenshots and description
- `release` -- submit for review

### Direct Distribution (Developer ID)

For macOS direct distribution: notarisation with `notarytool`, stapling, and GitHub Releases.

### Makefile Targets

```makefile
make setup        # Tuist install + generate
make run          # Build and launch
make test         # Unit tests
make snapshots    # Snapshot tests with locale/device matrix
make archive      # xcodebuild archive
make submit       # fastlane upload to App Store Connect
```
