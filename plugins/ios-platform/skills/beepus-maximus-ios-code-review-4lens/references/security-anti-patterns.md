# Security Anti-Pattern Detection

Quick-scan patterns for the security dimension of code review. Each entry includes a literal search pattern, what it means, and severity.

## Credential and Secret Storage

| Search Pattern | Anti-Pattern | Severity | Fix |
|---|---|---|---|
| `UserDefaults.standard.set` near `token`, `key`, `secret`, `password`, `credential` | Secrets in UserDefaults — readable in backups, no encryption | Critical | Move to Keychain with explicit `kSecAttrAccessible` |
| `@AppStorage` near `token`, `key`, `secret`, `password` | Secrets in @AppStorage (UserDefaults wrapper) | Critical | Move to Keychain |
| `Info.plist` containing `API_KEY`, `SECRET`, `TOKEN` | Secrets in Info.plist — readable by anyone with the .ipa | Critical | Use build-time injection or Keychain |
| Hardcoded string matching API key patterns (`sk-`, `pk_live_`, `Bearer `) | Hardcoded API key in source | Critical | Use environment config or Keychain |

## Authentication

| Search Pattern | Anti-Pattern | Severity | Fix |
|---|---|---|---|
| `LAContext().evaluatePolicy` without Keychain binding | Biometric auth gate returns a patchable Bool — bypassable via Frida runtime patching | Critical | Bind to Keychain item with `.biometryCurrentSet` access control |
| `evaluatePolicy` result used as sole gate for sensitive operations | Auth result not tied to server-side session | Important | Require server-side session validation after biometric |

## Logging and Privacy

| Search Pattern | Anti-Pattern | Severity | Fix |
|---|---|---|---|
| `print(` or `NSLog(` near `token`, `password`, `secret`, `credential`, `healthKit` | Sensitive data in console logs — visible in device logs | Important | Remove or use `os_log` with `.private` privacy |
| `Logger` without `.private` on user data | PII in structured logs without redaction | Important | Use `Logger.log("\(userData, privacy: .private)")` |

## Network Security

| Search Pattern | Anti-Pattern | Severity | Fix |
|---|---|---|---|
| `http://` in URL strings (non-localhost) | Cleartext HTTP — data visible to network observers | Important | Use `https://` or add ATS exception with justification |
| `NSAllowsArbitraryLoads` = `true` in Info.plist | ATS completely disabled | Important | Remove or scope to specific domains |
| `ServerTrustPolicy` or custom `URLSessionDelegate` disabling cert validation | Certificate validation bypassed | Critical | Remove in production; use only for debug/testing |

## Data Protection

| Search Pattern | Anti-Pattern | Severity | Fix |
|---|---|---|---|
| `kSecAttrAccessible` not set on Keychain operations | Default accessibility may not match security needs | Important | Set explicitly: `.whenUnlockedThisDeviceOnly` for most secrets |
| `SecItemDelete` followed by `SecItemAdd` (delete-then-add pattern) | Race condition window; Keychain item briefly absent | Minor | Use add-or-update pattern: try add, if duplicate then update |
| `kSecAttrAccessibleAlways` or `kSecAttrAccessibleAlwaysThisDeviceOnly` | Deprecated — data accessible when device locked | Important | Use `.afterFirstUnlock` or `.whenUnlocked` variants |

## Keychain Accessibility Quick Reference

| Accessibility Constant | Survives Backup | Survives Device Migration | Background Safe | Use When |
|---|---|---|---|---|
| `.whenUnlocked` | Yes | Yes | No | General secrets, user tokens |
| `.whenUnlockedThisDeviceOnly` | No | No | No | Device-bound secrets, biometric keys |
| `.afterFirstUnlock` | Yes | Yes | Yes | Background fetch tokens, push credentials |
| `.afterFirstUnlockThisDeviceOnly` | No | No | Yes | Device-bound background tokens |

## Usage in 4-Lens Review

This reference supports the **Security Dimension** in Step 6 (Verdict). The reviewing agent should:

1. Run literal searches (grep/rg) for the patterns in column 1
2. Check context — some patterns are legitimate in test code or debug builds
3. Only flag production code paths
4. Use the severity column to classify findings
