---
name: product-onboarding
description: Use when designing, implementing, or reviewing product onboarding, activation flows, first-run experiences, feature adoption prompts, product tours, setup tasks, aha moments, or time-to-value.
---

# Product Onboarding

## Core Principle

Product onboarding is not a welcome screen, tour, or tooltip layer. It is the system that gets a user from intent to first real value with as little confusion, delay, and interruption as possible.

Optimize for activation, time-to-value, retention, and support deflection. Do not optimize for tour completion, tooltip views, or checklist clicks unless they correlate with a real product outcome.

## First Decision

Before proposing UI, identify:

- **User intent**: What did the user come here to accomplish?
- **Activation event**: What observable product event proves they reached meaningful value?
- **First win**: What can they complete in under 30 seconds?
- **Friction points**: Where do users hesitate, abandon, ask support, or misclick?
- **Segments**: Which role, plan, use case, lifecycle stage, or account type changes the right guidance?
- **Escape route**: How can the user skip, dismiss, snooze, or relaunch guidance?

If the activation event is vague, stop and define it. A flow cannot be reviewed honestly without knowing what it is trying to cause.

## Pattern Selection

Use the least interruptive pattern that can still move the user toward activation.

| Situation | Prefer | Avoid |
|---|---|---|
| First-time setup | Embedded checklist or inline setup card | Blocking modal tour |
| User is stuck or asks for help | On-demand help, hub, or contextual walkthrough | Forced education before action |
| Existing user needs to learn a UI change | Short opt-in tour, hint, or announcement | Full re-onboarding |
| Complex/high-value account setup | Hybrid onboarding with human escalation | Pure self-serve automation |
| High-volume simple onboarding | Automated in-product tasks | Repeated manual calls |
| New feature adoption | Contextual prompt tied to relevant behavior | Generic global announcement |

Blunt rule: first-run product tours are usually the wrong primitive. They present the team's map of the product as an obstacle between the user and their goal.

## Checklists

Use checklists when onboarding requires multiple setup actions or when the user benefits from visible progress.

Checklist requirements:

- Keep it to 3-5 tasks.
- Make the first task fast, concrete, and likely to be completed naturally.
- Each task must be a real product action, not "view this page" filler.
- Complete tasks from product events, not from "mark complete" buttons.
- Link each task directly to the place where it can be done.
- Allow dismissing the checklist without penalty.
- Allow relaunching it from a predictable help, setup, or account area.
- Personalize tasks by role, intent, plan, lifecycle stage, or account state when those differences change the activation path.

Implementation hooks:

- Track stable event names for each task completion.
- Store dismissed, snoozed, completed, and last-shown state separately.
- Make checklist state server-backed when it must follow the account across devices.
- Handle already-completed tasks on first render so the checklist feels intelligent.
- Never block the primary workflow while loading checklist state.

## Tours And Walkthroughs

Use tours sparingly. A tour describes the product; activation usually requires the user to do something.

A tour is defensible when:

- The user opted in.
- The user is already trying to complete the related workflow.
- The product changed and existing users need orientation.
- The flow teaches a genuinely sequential, hard-to-discover interaction.
- Every step either enables an action or explains a decision the user must make now.

Tour requirements:

- Keep it short. Long tours are skipped.
- Make every step actionable or decision-relevant.
- Make it dismissible.
- Add snooze if the prompt is not user-initiated.
- Provide a relaunch path.
- Do not point at obvious UI and narrate labels already on screen.
- Do not use tour completion as the success metric. Measure downstream activation or retention.

Prefer hints over tours when awareness is enough. Hints should be closed by default, lightweight, and non-blocking.

## Manual, Automated, Hybrid

Choose the onboarding model from product complexity, account value, user risk, and team capacity.

- **Manual**: Use for complex implementations, high-value accounts, regulated setups, strategic customers, or early-stage discovery where the product still needs qualitative signal.
- **Automated**: Use for high-volume signups, repeatable setup, simple activation paths, and product-led growth.
- **Hybrid**: Use when most users can self-serve but specific behavior should trigger human support.

Hybrid trigger examples:

- User stalls before activation.
- User repeats the same failed action.
- User reaches a high-value integration or billing step.
- Account size, plan, or role indicates high potential value.
- Support sentiment or survey response shows confusion.

Do not automate a broken workflow and call it onboarding. Fix the workflow when the product itself is confusing.

## Iteration Loop

Use SAIL for onboarding changes:

1. **Survey the journey**: Review funnel drop-off, time-to-value, support tickets, chat logs, session replays, user testing, surveys, and a fresh-account friction audit.
2. **Articulate the problem**: Write one specific failure mode, affected segment, suspected cause, and target metric.
3. **Iterate to solve**: Ship the smallest experiment that can test the hypothesis without adding new friction.
4. **Learn and expand**: Compare activation, retention, support load, qualitative feedback, and unintended side effects before broadening the change.

If tracking is missing, instrumentation is the first onboarding task. You cannot iterate on a flow you cannot see.

## Experiment Design

For onboarding experiments:

- Compare against the same activation event, not against engagement with the onboarding surface.
- Include retention windows when possible; day-7 behavior often exposes whether onboarding created durable value.
- Segment results by role, use case, plan, and account state.
- Watch for support tickets and rage clicks, not just conversion.
- Prefer A/B testing a lower-interruption pattern against an existing modal or tour before redesigning everything.

Bad metric: "80% of users saw the tour."

Better metric: "Users who saw variant B reached the activation event faster and retained better at day 7."

## Copy And UX Rules

- Lead with the user's goal, not the product's feature inventory.
- Show what to do next, not what every control means.
- Keep guidance close to the action it supports.
- Avoid "learn more" as the primary action when the user should be doing something.
- Avoid novelty language. New users are trying to reduce uncertainty, not admire the onboarding.
- Use plain verbs: Create, Connect, Invite, Record, Import, Publish, Review.
- Preserve agency: skip, dismiss, back, snooze, and relaunch are part of the design, not edge cases.

## Review Checklist

Reject onboarding work when:

- It blocks the user's first meaningful action.
- It teaches labels already visible in the UI.
- It has no defined activation event.
- It measures only surface engagement.
- It lacks skip/dismiss/snooze/relaunch behavior.
- It uses the same flow for materially different user segments.
- It adds guidance instead of fixing an obviously confusing product workflow.
- It cannot recover when the user has already completed a task elsewhere.

Approve only when the flow helps a specific user segment reach a specific product outcome with measurable evidence and minimal interruption.
