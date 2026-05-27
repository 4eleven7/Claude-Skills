---
name: monetization-strategy
description: Use when choosing paid, freemium, subscription, consumable, or hybrid monetization; designing free vs paid tiers, trials, paywall feature splits, pricing, payback, ARPU, or charge-readiness.
---

# Monetization Strategy

The strategy layer above StoreKit: which model, what tiers, what to charge, and what goes behind the paywall. Implementation lives in `storekit`.

## Responsibility

**Owns:** Readiness assessment, model selection, tier design, free/paid feature split, trial type and length, price points, take-rate math, paywall economics, when to change price.

**Does NOT own:** StoreKit 2 code, transaction listeners, receipt handling (see `storekit`). Paywall UI implementation (see `swiftui-mastery` or `design-screen`). App Store description and screenshots (see `app-store-marketing`).

## Readiness Gate

Do not monetize a product that is not ready. Charging a broken app burns trust and produces refunds.

| Signal | Ready | Not ready |
|---|---|---|
| Core value | Clear and differentiated | Still finding fit |
| Retention | D7 > 20% | D7 < 10% |
| Demand signal | Users asking to pay or for premium features | Silence or complaints |
| Feature depth | Enough to split free / paid honestly | Everything feels essential |
| Differentiation | Something competitors don't do | Commodity feature set |
| Polish | Professional | Rough edges throughout |

Decision:

- 5-6 ready signals → monetize now.
- 3-4 → soft-launch pricing (low price, gather data).
- 0-2 → fix the product first.

## Model Selection

```
Used daily or weekly?
├── Yes → Ongoing value (sync, content, AI, tracking)?
│   ├── Yes → Subscription
│   └── No  → One-time purchase (+ optional tip jar)
└── No  → Utility/tool?
    ├── Yes → One-time purchase or freemium unlock
    └── No  → Content-based?
        ├── Yes → Subscription or consumable IAP
        └── No  → Freemium with premium unlock
```

### Trade-offs

| Model | Recurring revenue | Implementation | Works small audience | Best for |
|---|---|---|---|---|
| Subscription | Yes | High | Yes | Daily-use, ongoing value, content, sync, AI |
| One-time paid | No | Low | Yes | Self-contained tools, niche pro tools |
| Freemium + IAP unlock | No (per user) | Medium | No (needs scale) | Mass-market apps, viral potential |
| Consumable IAP | Variable | High | Possible | AI/API-cost apps, games, generation tools |
| Tip jar | Almost never | Low | No | Open-source-adjacent, passion projects |
| Ad + premium | Partial | Medium | No | High-DAU casual apps |

### Apple commission

| Scenario | Apple cut | You keep |
|---|---|---|
| Standard, year 1 of subscription | 30% | 70% |
| Subscription year 2+ | 15% | 85% |
| Small Business Program (< $1M/yr) | 15% | 85% |

Always net Apple's cut from revenue projections. $9.99/mo on SBP = ~$8.49 to you.

## Tier Structure

**Two-tier (recommended default):** Free has core functionality with usage/storage limits; Pro removes limits and adds power features (sync, widgets, export, optional priority support).

**Three-tier:** only when "personal user" and "professional user" have genuinely different willingness to pay. Don't add a third tier purely to anchor.

### Free vs paid split — the hardest decision

**Free tier:** demonstrate core value (not a crippled demo). Useful enough that users invest data/time before hitting the paywall. Natural upgrade moments ("hit the limit", "sync needs Pro").

**Paid tier:** unlock power and convenience, not basic functionality. Feels like "more of what you love", not "stop annoying me". At least one hero feature worth paying for alone.

**Bad splits:** view free / edit paid (hostile). 3-day full trial then total lockout (no ongoing free value). "Remove ads" as the only hook (weak).

**Good splits:** 5 projects free / unlimited + templates paid. Basic tracking free / insights, trends, export paid. Single device free / sync + widgets + Watch paid.

## Pricing

### Indie sweet spots (US prices, 2025-era)

| Tier | Monthly | Annual | Lifetime | Best fit |
|---|---|---|---|---|
| Low | $2.99-4.99 | $19.99-29.99 | $29.99-49.99 | Utility, habit, single-purpose |
| Mid | $6.99-9.99 | $39.99-59.99 | $59.99-99.99 | Productivity, creative, health |
| High | $14.99-29.99 | $99.99-199.99 | $149.99+ | Pro tools, B2B, niche specialist |

Annual discount: 15-40% off monthly equivalent. ~30% is the empirical sweet spot — enough to drive annual selection, not so much that you discount your best customers.

### Pricing psychology — apply, don't worship

- **Anchoring:** show annual first; monthly looks expensive next to it.
- **Charm pricing:** .99 endings under $10. Round numbers ($19, $29) at premium tiers signal quality.
- **Decoy:** if you have three tiers, design the middle to look like the obvious value pick. Don't add tiers that don't serve a real segment.
- **Regional pricing:** use App Store Connect price tiers for automatic localization. Consider lower tiers in emerging markets via per-country pricing.

### When to change price

**Raise** when conversion > 8% (likely underpriced), significant new features shipped, costs increased, or competitors charge more for less.

**Lower** when conversion < 1% and users cite price, or entering a new market. For seasonal moves use introductory/promotional offers, not a base-price change.

**How to test:** introductory offers for new price points (lower risk than base price change), A/B with offer codes to specific cohorts, announce upcoming increase to drive urgency.

## Trial Strategy

### Trial type by app

| App type | Trial type | Length |
|---|---|---|
| Daily-use productivity | Time-limited full access | 7 days |
| Habit/health/fitness | Time-limited full access | 14 days |
| Creative tool | Time-limited full access | 7 days |
| Business/professional | Time-limited full access | 14-30 days |
| Education | Time-limited full access | 7 days |
| Freemium with premium unlock | Feature-limited free tier (no trial) | n/a |

Apple supports introductory offers (free or discounted) on subscriptions. For one-time purchases, time-limited trials require your own logic.

### Trial conversion tactics

Onboard to *premium* features during trial (not free) — the user must feel what they're losing. Reminder 2-3 days before expiry, not at expiry. Surface value received ("you logged 47 workouts"). Offer annual at trial end with savings spelled out. Win-back offer 30+ days after non-conversion via promotional offer.

## Paywall Economics

Back-of-envelope before designing anything:

```
Free → Trial start rate          A
Trial start → Paid conversion    B
Monthly retention (paid)         R
Net price after Apple cut        P

LTV = P × (1 / (1 - R))    [geometric series, assumes flat churn]
Payback months = CPA / P
Healthy: LTV ≥ 3 × CPA, payback ≤ 6 months
```

Common reality check: if R = 0.85 (15% monthly churn), each paid user lasts ~6.7 months, LTV ≈ 6.7 × P. If P = $4.24 net ($4.99 gross at SBP), LTV ≈ $28.40. CPA must stay under ~$9.50 for healthy unit economics.

### Conversion benchmarks

- Free → trial: 10-30% (good paywall placement).
- Trial → paid: 40-60% (good trial value demonstration).
- Free → paid (no trial): 2-5% typical, 5-10% great, 10%+ exceptional.

## App-Type Guidance

### Productivity / task management
Freemium + subscription. Sync paywall is powerful — but free tier must be useful on a single device. $3.99-6.99/mo, $29.99-49.99/yr, optional $29.99-79.99 lifetime.

### Health / wellness / therapy
Subscription with generous trial (14 days minimum). Never gate crisis or safety features behind a paywall. Frame as investment, not transaction. Apple Health integration adds disproportionate perceived value.

### Kids / education
Parents buy, kids use. Subscription (family-friendly) or content packs. No ads (kids category requirement). Parent dashboard sells. $4.99-7.99/mo or $39.99-59.99/yr.

### Creative tools
One-time purchase or freemium with subscription. Pro features: export quality, advanced tools, stock library. Trial = one project cycle (7 days).

### AI-powered apps
Hybrid: subscription for base usage + consumable credits for overage. Subscription must include enough usage that average users never buy credits. Credits cover heavy users and offset variable API cost.

### Developer tools
Lifetime or subscription. Developers prefer paying once. If subscription, justify with ongoing service (sync, cloud build, SDK updates). Higher prices acceptable ($14.99-49.99/mo).

### Finance / budgeting
Subscription. High willingness to pay if you save them money. Annual-friendly (matches financial mindset). Bank-grade trust signals matter more than features.

## Paywall Compliance Notes

App Store Review Guidelines section 3 governs business models. Key rules:

- **3.1.1** — IAP required for digital content/features. Physical goods can use external payment.
- **3.1.2** — Subscriptions must provide ongoing value, not unlock a one-time thing.
- **3.1.3(a)** — Reader apps can link out for account management.
- **5.6** — No manipulative tactics.

Paywall UI rules: show price per period clearly, highlight annual savings, Restore Purchases reachable (App Review rejects otherwise), ToS and Privacy links visible, easy to dismiss (no forced paywall on launch with no exit), don't auto-select the most expensive tier. Canonical text: https://developer.apple.com/app-store/review/guidelines/

## Output Format (when asked for a strategy)

```
# Monetization Strategy — [App]

## Readiness
Score X/6 — [Ready / Soft-launch / Fix product first]
[Per-signal table]

## Recommended model
[Model] — [one-sentence rationale]

## Tier structure
[Free vs Paid table]
Annual: $XX.99/yr (XX% off monthly)

## Trial
Type: [intro offer / feature-limited / time-limited]
Length: [N days]
Conversion tactics: [bullets]

## Economics
Net price: $X.XX (after Apple cut)
Target conversion: X-X%
Estimated LTV: $XX.XX (assumes XX% monthly retention)
Target CPA ceiling: $X.XX (LTV/3)

## Implementation handoff
- Configure products in App Store Connect: [list]
- StoreKit work: see `storekit`
- Paywall UI: see `design-screen`
```

## References

- `storekit` — StoreKit 2 implementation, transaction handling, restore.
- `app-store-marketing` — paywall copy, App Store description, promotional text.
- `analytics-interpretation` — measuring whether the strategy is working.
- `shipping` — submission compliance for IAP-bearing builds.
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
