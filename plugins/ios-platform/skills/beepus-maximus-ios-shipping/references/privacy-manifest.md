# Privacy Manifest

## PrivacyInfo.xcprivacy

Required for iOS 17+. Must be included in the app target (not just a framework).

### File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- Required Reason APIs declared here -->
    </array>
</dict>
</plist>
```

### Required Reason API Categories

Declare every Required Reason API your app (or its dependencies) uses:

| Category | Common APIs | Common Reasons |
|---|---|---|
| File timestamp | `NSFileCreationDate`, `NSFileModificationDate`, `getattrlist` | `DDA9.1` (display to user), `C617.1` (inside app container) |
| System boot time | `systemUptime`, `mach_absolute_time` | `35F9.1` (measure elapsed time) |
| Disk space | `volumeAvailableCapacityForImportantUsage` | `E174.1` (check before write), `85F4.1` (display to user) |
| User defaults | `UserDefaults` | `CA92.1` (read/write within app), `1C8F.1` (third-party SDK) |
| Active keyboards | `activeInputModes` | `3EC4.1` (customise app behaviour) |

### Checking Third-Party SDKs

Third-party SDKs must include their own `PrivacyInfo.xcprivacy`. If they don't, you must declare their API usage in your app's manifest.

```bash
# Find all privacy manifests in your project
find . -name "PrivacyInfo.xcprivacy" -exec echo {} \;

# Check if a framework includes a privacy manifest
unzip -l MyFramework.xcframework/ios-arm64/MyFramework.framework/MyFramework | grep Privacy
```

### Tracking Domains

If `NSPrivacyTracking` is `true`, list all domains used for tracking:

```xml
<key>NSPrivacyTrackingDomains</key>
<array>
    <string>analytics.example.com</string>
    <string>ads.example.com</string>
</array>
```

These domains are blocked when the user denies ATT permission.

### Privacy Nutrition Labels

The Nutrition Label in App Store Connect must match your actual data collection. Categories:

- **Contact Info**: name, email, phone, address
- **Health & Fitness**: health, fitness
- **Financial Info**: payment, credit info
- **Location**: precise, coarse
- **Sensitive Info**: racial, political, religious, sexual, biometric, genetic
- **Contacts**: contacts list
- **User Content**: emails, texts, photos, videos, gameplay, customer support
- **Browsing History**: web browsing
- **Search History**: in-app search
- **Identifiers**: user ID, device ID
- **Purchases**: purchase history
- **Usage Data**: product interaction, advertising data
- **Diagnostics**: crash data, performance data

For each collected data type, declare:
1. Whether it's linked to user identity
2. Whether it's used for tracking
3. The purpose (app functionality, analytics, developer advertising, third-party advertising, product personalisation)

## Purpose Strings

Every permission request needs a purpose string in Info.plist:

| Permission | Key | Example |
|---|---|---|
| Camera | `NSCameraUsageDescription` | "Take photos to add to your entries" |
| Photos (add) | `NSPhotoLibraryAddUsageDescription` | "Save charts to your photo library" |
| Photos (read) | `NSPhotoLibraryUsageDescription` | "Choose photos for your profile" |
| Location (in use) | `NSLocationWhenInUseUsageDescription` | "Show nearby clinics on the map" |
| Location (always) | `NSLocationAlwaysAndWhenInUseUsageDescription` | "Track your runs in the background" |
| Microphone | `NSMicrophoneUsageDescription` | "Record voice notes for your diary" |
| Face ID | `NSFaceIDUsageDescription` | "Unlock your private entries with Face ID" |
| Health | `NSHealthShareUsageDescription` | "Read your weight and heart rate data" |
| Health (write) | `NSHealthUpdateUsageDescription` | "Save your workout data to Health" |
| Tracking | `NSUserTrackingUsageDescription` | "Show you relevant recommendations based on your activity" |

**Rules:**
- Be specific about *why*, not just *what*
- Name the feature, not the permission
- Don't say "to improve your experience" — say what actually happens
- Keep it under 2 sentences
