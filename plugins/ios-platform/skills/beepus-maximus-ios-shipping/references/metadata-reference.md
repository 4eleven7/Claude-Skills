# App Store Metadata Reference

## Required Fields

| Field | Limit | Notes |
|---|---|---|
| App Name | 30 chars | Visible on App Store. Cannot include price or "free" |
| Subtitle | 30 chars | Below app name. Summarise value proposition |
| Description | 4000 chars | First 3 lines visible before "more". Lead with value |
| Keywords | 100 chars | Comma-separated, no spaces after commas. No duplicates of app name |
| What's New | 4000 chars | Required for updates. User-facing language |
| Support URL | URL | Must be live and reachable |
| Privacy Policy URL | URL | Required. Must be live |
| Copyright | Text | "YYYY Your Name" or "YYYY Company Name" |
| Category | Selection | Primary + optional secondary category |

## Screenshot Dimensions

### Required Device Classes

| Device | Dimensions (portrait) | Dimensions (landscape) |
|---|---|---|
| iPhone 6.9" | 1320 x 2868 | 2868 x 1320 |
| iPhone 6.7" | 1290 x 2796 | 2796 x 1290 |
| iPhone 6.5" | 1242 x 2688 | 2688 x 1242 |
| iPhone 5.5" | 1242 x 2208 | 2208 x 1242 |
| iPad Pro 13" | 2064 x 2752 | 2752 x 2064 |
| iPad Pro 12.9" | 2048 x 2732 | 2732 x 2048 |

- Minimum 2 screenshots per device class
- Maximum 10 screenshots per device class
- PNG or JPEG, no alpha channel
- Must represent actual app functionality

### App Preview Videos

- 15-30 seconds
- Same resolution as screenshots for that device
- No purchase prompts in video
- Plays automatically (muted) on App Store page

## Age Rating Questionnaire

| Content Type | Options |
|---|---|
| Cartoon or Fantasy Violence | None / Infrequent / Frequent |
| Realistic Violence | None / Infrequent / Frequent |
| Sexual Content | None / Infrequent / Frequent |
| Profanity or Crude Humour | None / Infrequent / Frequent |
| Alcohol, Tobacco, or Drug Use | None / Infrequent / Frequent |
| Simulated Gambling | None / Infrequent / Frequent |
| Horror/Fear Themes | None / Infrequent / Frequent |
| Medical/Treatment Information | Yes / No |
| Contests | Yes / No |
| Unrestricted Web Access | Yes / No |

**Result:** 4+ / 9+ / 12+ / 17+ rating based on responses.

## Export Compliance

### Decision Tree

```
Does your app use encryption?
├── No → Select "No" (done)
├── Yes, only standard HTTPS/TLS
│   └── Exempt → Select "Yes, but exempt" (done)
└── Yes, custom encryption
    ├── Available in France? → May need authorisation
    └── Available in other restricted countries? → May need ERN
```

Standard HTTPS/TLS for API calls is **exempt** — select "Yes" then "Only uses standard encryption" or "Yes, it's exempt."

Custom encryption (AES for local data, custom protocols) may require:
- Export Compliance documentation
- ERN (Encryption Registration Number) from BIS
- French authorisation (if available in France)

## App Review Information

### What to Include

```
Demo Account:
Username: demo@example.com
Password: TestAccount123!

Notes:
- The "Scan" feature requires a physical barcode (see attached photo)
- Health data sync requires HealthKit authorisation (tap "Connect" on the Dashboard tab)
- Push notifications are used for daily reminders (configure in Settings > Notifications)
```

### Attachments

Upload screenshots or documents for features that:
- Require specific hardware (Bluetooth device, barcode)
- Need specific location (geofenced features)
- Require specific account state (subscription, completed onboarding)
- Use background features not visible during normal review

## WWDC25 Changes

- **Draft Submissions**: Save and preview submissions before submitting
- **Accessibility Labels**: New metadata field for accessibility features
- **Tags**: Categorise app features for discoverability
- **Offer Codes**: Enhanced offer code management for subscriptions
