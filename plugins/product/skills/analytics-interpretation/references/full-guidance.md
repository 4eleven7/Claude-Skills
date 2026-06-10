# Analytics Interpretation

Read product metrics, diagnose where the funnel leaks, and decide what to do about it. Works on App Store Connect data, third-party analytics (Mixpanel, Amplitude, Firebase, RevenueCat), or raw numbers the user shares.

## Responsibility

**Owns:** Metric definitions, benchmarks by app type, App Store funnel interpretation, AARRR diagnostics, cohort retention reading, LTV / payback math, invest-iterate-pivot-sunset decision.

**Does NOT own:** Pricing changes (see `monetization-strategy`), ASO and product-page copy fixes (see `app-store-marketing`), implementing analytics SDKs, A/B test infrastructure.

## North-Star Metrics by Model

The right metric to obsess over depends on monetization. Don't average across models.

| Model | North star | Supporting |
|---|---|---|
| Free + ads | DAU, sessions/day, ad revenue per DAU | D1/D7/D30 retention, session length |
| Freemium (one-time unlock) | Free→paid conversion rate | D7 retention of free users, time-to-conversion |
| Subscription | Trial→paid conversion, monthly churn, LTV | Trial start rate, M1/M3/M12 retention, payback period |
| Paid upfront | Downloads, refund rate (<5%), rating | Organic vs paid mix |

## App Store Funnel (App Store Connect)

```
Impressions
  ↓ Tap-Through Rate (TTR) = Product Page Views / Impressions
Product Page Views
  ↓ Conversion Rate (CVR) = Downloads / Product Page Views
Downloads
  ↓ D1 retention
Day 1 Active
  ↓ D7
Day 7 Active
  ↓ D30
Day 30 Active
  ↓ paywall conversion
Paying users
```

### Step-level reads

| Stage | Good | Average | Poor | First fix when poor |
|---|---|---|---|---|
| TTR | > 8% | 4-8% | < 4% | Icon, title, subtitle, search rank |
| CVR | > 40% | 25-40% | < 25% | First 3 screenshots, App Preview, ratings |
| D1 retention | > 35% | 20-35% | < 20% | Onboarding length, value-on-first-launch, screenshot honesty |
| D7 retention | > 20% | 10-20% | < 10% | Reason to come back (notifications, streaks), core loop depth |
| D30 retention | > 10% | 5-10% | < 5% | Feature depth, progression, content cadence |
| Free→paid | > 5% | 2-5% | < 2% | Paywall placement, trial design, price |

These ranges are rough industry medians. Your category may differ — use your own historical baseline as the real benchmark.

## AARRR Funnel — Diagnostic Order

Walk the funnel top-to-bottom. Fixing a leaky bucket below a leakier one upstream gives nothing.

1. **Acquisition** — top sources, organic vs paid mix, CPA vs LTV.
2. **Activation** — % of new installs reaching the "aha action" in session 1.
3. **Retention** — D1/D7/D30, DAU/MAU ratio (15-30% is healthy daily engagement).
4. **Revenue** — paywall touch rate, trial start rate, trial→paid, ARPU vs ARPPU.
5. **Referral** — organic multiplier, share rate, rating prompt acceptance.

If retention is broken, do not invest in acquisition. You will pour water into a sieve.

## Cohort Reading

```
              M0     M1     M2     M3     M4     M5
Jan cohort   100%   62%    55%    50%    48%    46%
Feb cohort   100%   58%    51%    46%    44%     —
Mar cohort   100%   65%    59%    54%     —      —
Apr cohort   100%   70%    63%     —     —      —
May cohort   100%   68%     —      —     —      —
```

What to look for:

- **M0→M1 drop** — biggest single drop. Industry-typical 30-50% churn on subscription apps. >50% means trial experience or onboarding is broken.
- **Curve flattening** — should plateau by M3-M5. That plateau is your "natural retention floor" and drives LTV.
- **Cohort improvement** — compare same column across cohorts. Apr M1 (70%) > Jan M1 (62%) means recent product changes worked.
- **Scheduled cliffs** — M1 cliff often means annual non-renewals; M12 cliff is annual renewal decisions.

### Significance rule of thumb (no formal stats)

- < 3 percentage points cohort-over-cohort: noise, do nothing.
- 3-10 pp: meaningful, keep the change.
- > 10 pp: major signal, double down.

For real significance use a proper test — but don't paralyze on small samples either.

## LTV and Payback

```
ARPU      = total revenue / total users (free + paid)
ARPPU     = total revenue / paying users only
LTV       = ARPPU × average subscriber lifetime (months)
Payback   = CPA / monthly net ARPPU
Healthy   = LTV ≥ 3× CPA, payback ≤ 6 months for indie subscription apps
```

Common mistakes:

- Using ARPPU when you mean ARPU (or vice versa) — they differ by 5-20×.
- Computing LTV from a 30-day window — long-tail subscriptions accrue most LTV after month 6. Use cohort-based LTV, not snapshot.
- Forgetting Apple's cut. $9.99/mo at 15% Small Business Program = ~$8.49 net.
- Treating annual subscribers as "12× monthly" — they churn differently and pay upfront.

## Common Misinterpretations

| Symptom | What people say | What it usually is |
|---|---|---|
| DAU rising, retention flat | "We're growing!" | You're acquiring faster than churning. Fragile. Check D30 cohort trend. |
| MAU > DAU × 30 | "Lots of monthly users" | Most are zombies who launched once. Track DAU/MAU ratio. |
| Conversion up after price cut | "Lower price worked" | Revenue per visitor may be down. Compute price × CVR, not CVR alone. |
| Retention "improved" after release | "Feature X works" | Could be cohort mix change, seasonality, or marketing push. Compare same-source cohorts. |
| Paid acquisition CPA looks low | "Channel is profitable" | Compare CPA to *paid-user* LTV, not blended LTV. Paid users churn faster than organic. |
| Refund rate under 1% | "Users love it" | App Store hides involuntary refunds; check chargebacks separately for subscription. |
| Vanity install number | "We hit 100k installs" | Installs without retention is a cost line, not an asset. |

## Diagnostic Decision Trees

### Low impressions (established app)

```
Ranking for any keywords?
├── No  → ASO problem. See app-store-marketing.
└── Yes → High-volume keywords?
    ├── No  → Target higher-volume terms.
    └── Yes → Top 10 placement?
        ├── No  → Improve rank: more ratings, better CVR.
        └── Yes → Expand keyword set or add locales.
```

### High impressions, low TTR (< 4%)

```
Icon distinctive at thumbnail size?
├── No  → Redesign, A/B test 3 variants.
└── Yes → Title clear and keyword-rich?
    ├── No  → "Brand - Value Keyword" format.
    └── Yes → Subtitle specific?
        ├── No  → Concrete benefit, not generic.
        └── Yes → Differentiated from category competitors?
```

### Good downloads, bad D1 retention (< 25%)

```
Onboarding completion > 70%?
├── No  → Cut steps, add skip.
└── Yes → User reaches "aha" in session 1?
    ├── No  → Restructure first run to show core value first.
    └── Yes → Crashes / slow launch?
        ├── Yes → Fix stability before anything else.
        └── No  → Did screenshots overpromise vs reality?
```

### Good retention, low revenue (< 3% conversion)

```
Users see the paywall?
├── No  → Add paywall touchpoints (feature gates, usage limits).
└── Yes → Compelling paywall (value, comparison, social proof)?
    ├── No  → Redesign.
    └── Yes → Price right?
        ├── Too high  → Test lower or cheaper tier.
        ├── Too low   → Users may not perceive value; test higher.
        └── Right     → Trial showcasing premium features?
```

## Invest, Iterate, Pivot, Sunset

After walking the funnel, pick one path:

| Path | Signals | Action |
|---|---|---|
| **Invest** | D7 > 40%, organic growth, requests for features, conversion improving, 4.5+ rating | Increase build cadence, consider paid acquisition, expand platforms |
| **Iterate** | D7 20-40%, mixed feedback, stable but unspectacular conversion | Find what retained users do differently; make all users do that. A/B onboarding and paywall. |
| **Pivot** | D7 < 20% after 3+ iterations; engagement concentrated on an unexpected feature | Rebuild around what users actually do, not what you planned |
| **Sunset** | Declining across the board, no organic growth despite iteration, opportunity cost too high | Maintenance mode, consider open-sourcing or selling, redirect energy |

Sunsetting is not failure. Most successful indie portfolios shipped several apps before one worked.

## Output Format (when asked for a health report)

```
# Analytics Health Report — [App]

App type: [free/freemium/subscription/paid]
Stage: [pre-launch/early/growing/mature]
Period: [date range]

## Funnel
| Stage | Metric | Value | Status | First-action |
| ... | ... | ... | green/yellow/red | ... |

## Primary bottleneck
[Stage] — [one-sentence cause].

## Recommendations (priority order)
1. [critical fix] — expected impact
2. [high] — expected impact
3. [medium] — expected impact

## Verdict
Invest / Iterate / Pivot / Sunset — [2 sentences]
```

## References

- `app-store-marketing` — fixing TTR/CVR, screenshot rework, ASA readiness gates.
- `monetization-strategy` — pricing/tier changes that follow from low-revenue diagnosis.
- `storekit` — instrumenting trials and renewals if data is missing.
