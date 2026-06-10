# App Store Release

Pre-flight checklist, rejection prevention, and submission workflow for App Store review.

## Responsibility

**Owns:** App Store submission preparation, metadata requirements, privacy manifests, age ratings, export compliance, rejection diagnosis, appeal writing, TestFlight beta management.

**Does NOT own:** Code quality (see swiftui-patterns, ios-architecture), testing (see swift-testing), CI/CD pipeline details (see ios-tooling), monetisation implementation (see storekit for StoreKit 2 implementation patterns).

## Core Principles

1. **Test on device before submitting.** Simulator misses real-world issues (performance, cellular, permissions, entitlements).
2. **Privacy manifest is mandatory.** iOS 17+ requires `PrivacyInfo.xcprivacy` declaring Required Reason APIs and tracking domains.
3. **No placeholder content.** App Review will reject screenshots with "Lorem ipsum", debug UI, or test data.
4. **Account deletion is required.** If users can create an account, they must be able to delete it from within the app.
5. **Sign in with Apple required.** If you offer third-party sign-in (Google, Facebook), you must also offer Sign in with Apple.
6. **Demo credentials in review notes.** If your app requires login, provide a test account in the App Review Information section.
7. **Every submission is a fresh review.** Even "just a bug fix" gets full review. Don't assume previous approval means automatic pass.

## Pre-Flight Checklist

### 1. Build Configuration

- [ ] Archive built with Release configuration
- [ ] Correct bundle ID and version/build numbers
- [ ] App icon set includes all required sizes (no alpha channel)
- [ ] Launch screen configured (no static image on iOS 14+)
- [ ] Deployment target matches intended audience
- [ ] No debug code, `#if DEBUG` guards in place
- [ ] No internal/enterprise distribution profile — use App Store profile
- [ ] Tested on physical device (not just simulator)

### 2. Privacy

- [ ] `PrivacyInfo.xcprivacy` present and accurate
- [ ] Required Reason APIs declared with correct reasons (UserDefaults, file timestamp, disk space, system boot time, etc.)
- [ ] Tracking domains listed if using ATT
- [ ] Purpose strings for all requested permissions (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, etc.)
- [ ] Privacy Nutrition Label matches actual data collection
- [ ] Privacy policy URL is live, accessible, and accurate
- [ ] `NSUserTrackingUsageDescription` present if requesting ATT
- [ ] Third-party SDK privacy manifests included

### 3. Metadata

- [ ] App name: 30 characters max
- [ ] Subtitle: 30 characters max
- [ ] Description: accurate, no competitor mentions, no pricing in description
- [ ] Keywords: 100 characters max, comma-separated, no spaces after commas
- [ ] Screenshots: correct dimensions for each device class
  - iPhone 6.9": 1320 x 2868 or 2868 x 1320
  - iPhone 6.7": 1290 x 2796 or 2796 x 1290
  - iPad 13": 2064 x 2752 or 2752 x 2064
- [ ] App Preview videos (optional): 15-30 seconds, correct resolution
- [ ] What's New text: describes changes, user-facing language
- [ ] Support URL is live
- [ ] Copyright: "YYYY Your Name or Company"

### 4. Account & Authentication

- [ ] Sign in with Apple offered if third-party login exists
- [ ] Account deletion available in-app (not just "email us")
- [ ] Demo credentials in App Review Information
- [ ] Guest mode or skip option if not all features require login

### 5. App Review Information

- [ ] Contact information (name, phone, email)
- [ ] Demo account credentials (username + password)
- [ ] Notes for reviewer explaining non-obvious features
- [ ] Attachment for any features that need special hardware or location

### 6. Content Completeness

- [ ] No placeholder text or images
- [ ] No broken links or dead-end screens
- [ ] All features mentioned in metadata are functional
- [ ] Error states show user-friendly messages (not stack traces)
- [ ] Empty states have guidance and actions
- [ ] No references to beta, test, or debug

### 7. Regional & Compliance

- [ ] Age rating questionnaire completed accurately
- [ ] Export compliance: correctly declared encryption usage
  - Standard HTTPS only → "No" for encryption
  - Custom encryption or non-exempt → may need export documentation
- [ ] GDPR compliance for EU users (if applicable)
- [ ] EU Digital Services Act (DSA) compliance (if applicable)

### 8. In-App Purchases (if applicable)

- [ ] All IAP products created in App Store Connect
- [ ] IAP products in "Ready to Submit" or "Approved" status
- [ ] Restore purchases button accessible
- [ ] Transaction.finish() called for all transactions
- [ ] Subscription management accessible (links to Settings)
- [ ] Price displayed before purchase
- [ ] Terms of service and privacy links on paywall

## Rejection Diagnosis

### Reading the Rejection Message

1. **Identify the guideline number** — it tells you exactly what rule was violated
2. **Check if it's a binary reject** (automated) or **metadata reject** (human review)
3. **Binary rejects** need a new build. **Metadata rejects** can be fixed without rebuilding.

### Top 10 Rejection Reasons

| Guideline | Issue | Fix |
|---|---|---|
| 2.1 | App Completeness — crashes, placeholders, broken features | Fix crashes, remove placeholders, test on device |
| 2.3 | Metadata — screenshots don't match, inaccurate description | Update screenshots, align description with reality |
| 4.0 | Design — copycat, minimum functionality, web wrapper | Add native features, differentiate from competitors |
| 4.2 | Minimum Functionality — too simple, web wrapper | Add meaningful native functionality |
| 4.3 | Spam — duplicate of existing app, template app | Differentiate substantially |
| 5.1.1 | Data Collection — missing privacy policy, undeclared data | Add privacy policy, update Privacy Manifest |
| 5.1.2 | Data Use — using data beyond stated purpose | Align usage with declared purposes |
| 3.1.1 | IAP Required — digital content sold outside IAP | Use StoreKit for digital goods |
| 4.8 | Sign in with Apple — missing when third-party login exists | Add Sign in with Apple |
| 2.5.1 | Software Requirements — using private APIs | Remove private API usage |

### Response Strategy

1. **Don't argue** — acknowledge the concern
2. **Be specific** — explain exactly what you changed
3. **Include screenshots** — show the fix
4. **Resubmit quickly** — long delays may trigger re-review of other areas

### When to Appeal

Appeal when:
- The rejection is based on a misunderstanding of your app's function
- The guideline was applied incorrectly
- Similar apps are approved with the same feature

Don't appeal when:
- The rejection is technically correct
- You can fix the issue faster than arguing
- The reviewer's concern is legitimate even if the guideline is debatable

## TestFlight Management

### Beta Testing Workflow

1. Upload build via Xcode or `xcodebuild -exportArchive`
2. Wait for processing (5-30 minutes)
3. Add compliance information if prompted
4. Distribute to internal testers (automatic) or external testers (requires beta review)
5. Monitor crash reports in App Store Connect → TestFlight → Crashes
6. Collect feedback from TestFlight feedback tool

### External Testing

- Requires beta app review (usually 24-48 hours)
- Limited to 10,000 testers per app
- Builds expire after 90 days
- Include "What to Test" instructions for each build

## Pressure Defense

**"It's just a bug fix, it'll sail through review"**
Every submission gets a full review. A "simple" bug fix can trigger rejection if the reviewer notices an unrelated issue (missing privacy manifest, stale screenshots, broken deep link).

**"We can fix the metadata after approval"**
Metadata rejects don't need a new build, but they do need another review cycle (24-72 hours). Get screenshots, descriptions, and privacy labels right the first time.

**"Skip TestFlight, push straight to review"**
TestFlight external beta catches device-specific crashes, permission flow bugs, and real-network issues that local testing misses. The 24-48 hour beta review is cheaper than a rejection and resubmit cycle.

## References

- `references/privacy-manifest.md` — PrivacyInfo.xcprivacy structure, Required Reason API categories, tracking domain declaration
- `references/metadata-reference.md` — Complete metadata field specifications, screenshot dimensions, character limits
- `references/rejection-patterns.md` — Detailed guideline-specific rejection patterns and remediation steps
