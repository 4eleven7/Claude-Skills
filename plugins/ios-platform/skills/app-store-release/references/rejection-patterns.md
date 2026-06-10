# Rejection Patterns

Detailed guideline-specific rejection patterns and remediation.

## Guideline 2.1 — App Completeness

**Trigger:** Crashes, placeholders, broken links, incomplete features.

**Common causes:**
- Crash on specific device/iOS version not tested
- Placeholder images or "Lorem ipsum" text
- Features mentioned in metadata that don't work
- Broken deep links or universal links
- API endpoint down during review

**Remediation:**
1. Test on the exact device/iOS version the reviewer used (check rejection details)
2. Remove all placeholder content
3. Ensure all advertised features are functional
4. Add error handling for API failures (reviewer may test offline)
5. Resubmit with notes explaining what was fixed

## Guideline 2.3 — Metadata

**Trigger:** Screenshots don't match app, inaccurate description, misleading info.

**Common causes:**
- Screenshots from old version
- Description mentions features not yet shipped
- Screenshots show content not in the app
- App name includes price or "free"

**Remediation:**
1. Capture fresh screenshots on current build
2. Align description with actual current features
3. Remove pricing from name/description
4. This is a metadata reject — fix without new build

## Guideline 4.2 — Minimum Functionality

**Trigger:** App is too simple, just a web wrapper, or provides no unique value.

**Common causes:**
- WebView wrapping a mobile website
- Single-feature app with no native integration
- App duplicates built-in iOS functionality without adding value

**Remediation:**
1. Add native features (push notifications, widgets, Siri shortcuts)
2. Integrate with iOS system features (HealthKit, calendar, photos)
3. Add offline functionality
4. Write detailed reviewer notes explaining unique value

## Guideline 5.1 — Privacy

**Trigger:** Missing privacy policy, undeclared data collection, missing purpose strings.

**Common causes:**
- Privacy policy URL returns 404
- Privacy Nutrition Label doesn't match actual collection
- Missing `PrivacyInfo.xcprivacy`
- Purpose string missing for a permission
- ATT not implemented when tracking users

**Remediation:**
1. Ensure privacy policy URL is live and accurate
2. Update Privacy Manifest to declare all APIs
3. Update Nutrition Label to match reality
4. Add purpose strings for every permission
5. Implement ATT if collecting IDFA or cross-app tracking

## Guideline 3.1.1 — In-App Purchase Required

**Trigger:** Digital goods or subscriptions sold outside Apple's IAP system.

**Common causes:**
- External payment link for digital content
- Web-based subscription management
- "Buy on our website" prompt

**Remediation:**
1. Implement StoreKit 2 for all digital goods
2. Remove external payment prompts (unless eligible for reader app exemption)
3. Provide subscription management within the app

## Guideline 4.8 — Sign in with Apple

**Trigger:** Third-party login offered without Sign in with Apple.

**Rule:** If your app uses any third-party or social login service, you must also offer Sign in with Apple as an option.

**Exceptions:**
- Apps using only your own first-party login (email + password)
- Education or enterprise apps using institutional login
- Government or financial apps using government-issued credentials

**Remediation:**
1. Add Sign in with Apple button alongside other login options
2. Ensure it's as prominent as other login options (same size, above fold)

## Guideline 2.5.1 — Software Requirements

**Trigger:** Use of private APIs, undocumented frameworks, or dynamic loading.

**Common causes:**
- Using `dlopen` to load private frameworks
- Accessing private UIKit methods via string selectors
- Third-party SDK using private APIs

**Remediation:**
1. Remove all private API usage
2. Update third-party SDKs to compliant versions
3. If SDK is abandoned, find an alternative
4. Use `nm` or `otool` to check for private symbols in your binary

## Appeal Template

```
Dear App Review Board,

Thank you for reviewing [App Name] (version [X.Y.Z]).

We respectfully appeal the rejection under Guideline [X.X] for the following reason:

[1-2 sentences explaining why the guideline was applied incorrectly or why the app complies]

Specifically:
- [Evidence point 1 — screenshot, technical explanation, or precedent]
- [Evidence point 2]

We have attached [screenshots / documentation] demonstrating compliance.

We appreciate your time and look forward to your reconsideration.

Regards,
[Your Name]
```

**Tips:**
- Be respectful and factual
- Include screenshots showing compliance
- Reference specific guideline text
- If similar apps are approved, mention them (but don't name competitors aggressively)
- Keep it under 500 words
