---
name: app-store-marketing
description: Use when working on App Store Optimization, app metadata, keywords, screenshots, App Preview, review responses, Apple Search Ads, App Store rejection responses, or featuring nominations.
---

# App Store Marketing

ASO, store metadata, screenshots, review responses, Apple Search Ads, rejection handling, and featuring nominations.

## Responsibility

**Owns:** App name, subtitle, keywords, description, promotional text, screenshot strategy, App Preview, review responses, ASA campaign structure, rejection diagnosis and Resolution Center responses, featuring pitches.

**Does NOT own:** StoreKit code (see `storekit`), submission pre-flight (see `shipping`), pricing strategy (see `monetization-strategy`), analytics interpretation (see `analytics-interpretation`).

## Canonical Sources

Quote URLs, do not paraphrase rules that drift.

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect Help (metadata): https://developer.apple.com/help/app-store-connect/
- Apple Search Ads: https://searchads.apple.com
- Featuring nomination form: https://developer.apple.com/contact/app-store/promote/

## Character Limits

| Field | Limit | Visibility | Updatable without review |
|---|---|---|---|
| App Name | 30 | Search, product page | No |
| Subtitle | 30 | Search, product page | No |
| Promotional Text | 170 | Top of description | Yes |
| Description | 4000 | Product page | No |
| Keywords | 100 | Index only, hidden | No |
| What's New | 4000 | Update screen | No (ships with build) |

## Keywords

### Field allocation

```
App Name (30)        — highest weight. Brand + top keyword phrase.
Subtitle (30)        — high weight. Secondary keywords + value prop.
Keywords (100)       — medium weight. Comma-separated, NO spaces.
Description          — Apple says indexed; treat as low-value SEO.
```

### Cross-field deduplication rule

Apple indexes every word once across Name + Subtitle + Keywords. Repeating a word costs you characters and gives zero ranking benefit. Apply the cascade: if a word is in Name, drop it from Subtitle and Keywords. If in Subtitle, drop it from Keywords. Singular/plural variants count as duplicates — keep the singular only.

### Disallowed in keywords/title

- "free", "best", "#1", "top" without proof
- Competitor brand names (Apple may reject; also legal risk)
- Category name (already indexed)
- "app", "application"
- Plurals of words you already have (Apple stems)
- Special characters and emoji
- Spaces after commas (wastes characters)

### Sweet spot for indie apps

Target keywords with Popularity > 20 and Difficulty < 60. Ideal: 25-50 / under 45. Use ASO tools (AppTweak, Sensor Tower, Astro) for actual scores; do not invent numbers.

## Description

Structure for the 4000-char field: hook (1-2 sentences, problem or benefit), top 3-5 features as benefits, optional social proof, brief how-it-works, CTA, support contact.

Rules:
- Lead with biggest benefit; never start with "Welcome to".
- Short paragraphs (2-3 lines). No prices, no URLs (don't render).
- Promotional Text (170) is updatable without review — use for sales, seasonal, teasers.

## Screenshots

### Order matters — first 2-3 are usually all a user sees.

| Slot | Purpose |
|---|---|
| 1 | Hero — value prop + best visual |
| 2 | Core feature in action |
| 3 | Key differentiator |
| 4 | Secondary feature |
| 5 | Social proof, awards, or final CTA |
| 6-10 | Optional depth: customization, integrations, workflow |

### Caption rules

- Under 8 words, action verb first, sentence case.
- Match the visual exactly. No jargon, no version numbers, no prices.
- Apple OCR indexes screenshot caption text — keywords in top/bottom captions can boost search.

### Sizes (verify against current App Store Connect Help)

iPhone 6.9": 1320 × 2868. iPhone 6.7": 1290 × 2796. iPad 13": 2064 × 2752. App Preview: 15-30s, 1080p+, hook in first 3s, assume muted playback.

## Review Responses

### When to respond

| Review | Respond? |
|---|---|
| 1-2 stars with feedback | Yes, within 24-48h |
| Bug report (any rating) | Yes, ASAP |
| 3 stars with suggestions | Yes |
| 5 stars generic | Optional |
| Abusive / competitor spam | Report to Apple, do not engage |

### A.C.T. structure

Acknowledge the experience, Clarify or solve, Thank them and invite further contact.

### Tone rules

Take responsibility, never blame user. Specific, not generic. 50-100 words (150 max). Never promise feature timelines. Sign off with a name and team.

## Apple Search Ads

### Readiness gate — do not run ads if any of these fail

| Check | Threshold | Why |
|---|---|---|
| Organic downloads | 100+/month | Proves baseline demand |
| Product page CVR | > 20% | Ads amplify your listing; bad listing burns spend |
| Screenshots | 5+ optimized | Paid traffic lands on product page |
| Average rating | 3.5+ (or none yet) | Low ratings tank ad CVR |
| Crash-free rate | > 99% | Crashes kill ROAS via refunds and reviews |
| Monetization | Active | No point acquiring users you can't monetize |

If any fail, fix the listing and product first. ASA on a broken listing is gambling.

### Campaign progression for indies

1. Search Results (exact match) — start here. Highest control and intent.
2. Search Results (broad match) in a separate, low-budget discovery group — mine the Search Terms report weekly for new exact-match winners.
3. Product Page ads — competitor and related-category audiences.
4. Search Tab and Today Tab — only after the above are profitable.

### Keyword categories

| Type | Example | Notes |
|---|---|---|
| Brand | your app name | Bid only if competitors bid on your name; otherwise you already rank #1 organically |
| Category | "habit tracker" | High volume, expensive. Target long-tail. |
| Competitor | rival app names | Legal and common. Pair with Custom Product Page that messages directly against them. |
| Discovery | "stop procrastinating" | Lowest CPT, highest intent, smallest volume. Best ROAS potential. |

### Budget by stage

| Stage | Daily | Monthly |
|---|---|---|
| Launch (first 30d) | $10-30 | $300-900 |
| Growth (m2-6) | $50-100 | $1.5k-3k |
| Scale (6m+) | $100+ | $3k+ |

### Bid action rules

Need 100+ impressions per keyword before evaluating. ROAS > 1.5× target: raise bid if impression share low, raise budget if high. ROAS < 0.5× for 7+ days, or 1000+ impressions with zero installs, or CPA 3× target after 14 days: pause.

### Common mistakes

Bidding on your own brand when nobody else is. Broad match without negative keywords (burns 30-50%). Day-one budget too high. Ignoring the Search Terms report. Generic product page for every keyword intent (use 2-3 Custom Product Pages minimum).

## Rejection Handling

### Step 1 — get the facts

Exact guideline number, full rejection message text, any screenshots Apple included, first submission vs resubmission.

### Step 2 — classify

```
Objectively correct (crash, missing IAP, private API)?
  → Phase A: Fix and resubmit.
Reviewer misunderstood the app?
  → Phase B: Clarify with evidence (steps, screenshots, video).
Subjective judgment (4.0 design, 4.2 minimum functionality, 4.3 spam)?
  → Phase C: Decide — fix or push back.
None of the above and you have evidence?
  → Phase D: Appeal to App Review Board.
```

### Top rejection categories

| Guideline | Issue |
|---|---|
| 2.1 | Completeness — crashes, placeholders, broken features, missing demo creds |
| 2.3 | Accurate metadata — screenshots don't match app, misleading description |
| 2.5 | Software requirements — private APIs, deprecated APIs |
| 3.1.1 | IAP required for digital content |
| 4.0 / 4.2 | Design / minimum functionality — web wrapper, glorified bookmark |
| 4.3 | Spam — duplicate/template app |
| 4.8 | Sign in with Apple required when third-party login is offered |
| 5.1.1 / 5.1.2 | Privacy — missing policy, undeclared collection, mismatched Nutrition Labels |

For the canonical list and current language, use the official guidelines URL.

### Resolution Center response rules

Reference the cited guideline number. 100-200 words first reply (300 max for clarifications). Evidence-based: screenshots, demo video, step-by-step. No emotional language, no threats, no name-shaming competitors. If you fixed it, state exactly what changed and in which build.

### Appeal escalation

1. Resolution Center reply — 1-3 business days.
2. Request a phone call in Resolution Center if reply doesn't resolve it.
3. Formal appeal to App Review Board: https://developer.apple.com/contact/app-store/ — separate reviewers; one shot per rejection.

### Rule of thumb

If three independent people read the rejection and all say "Apple has a point," fix it. If they all say "this is wrong," push back with evidence. Apple is usually right about crashes, privacy, IAP, and metadata; sometimes wrong about minimum functionality on intentionally focused apps.

## Featuring Nomination

Submit via the editorial nomination form (link above). Lead time: 6-8 weeks before desired date; seasonal features planned months ahead; within 2 weeks is too late.

**Strong angles:** new Apple-tech adoption (SwiftUI, App Intents, WidgetKit, Live Activities, Foundation Models, visionOS, watchOS, SharePlay); accessibility for an underserved community; health/wellness/education with measurable user impact; sustainability or cultural moment; named-indie founder story.

**What the pitch needs:** one-paragraph narrative (why this app, why now); specific Apple technologies named with how you use them (not generic mentions); a user-impact story or metric (not a feature list); visual highlights — design quality is the gate; accessibility and privacy stance.

No guarantee of featuring. Treat the nomination as a forcing function for crisp positioning — the pitch sharpens your description and screenshots even if Apple passes.

## Pre-Ship Checklist

- [ ] Name + subtitle + keywords have zero cross-field word duplication.
- [ ] Description leads with benefit; no prices, URLs, or competitor names.
- [ ] Screenshots 1-3 communicate value without reading captions.
- [ ] App Preview hook in first 3 seconds, plays muted.
- [ ] Demo credentials in App Review notes if login is required.
- [ ] Privacy Nutrition Labels match actual data collection.
- [ ] Promotional Text reserved for things you'll change between releases.

## References

- `shipping` — submission pre-flight, privacy manifest, metadata gate.
- `storekit` — IAP implementation when handling 3.1.1 rejections.
- `monetization-strategy` — pricing decisions that feed paywall copy.
- `analytics-interpretation` — diagnose product-page CVR before turning on ASA.
