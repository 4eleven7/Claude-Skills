---
name: competitor-research
description: Research competitor apps and add structured competitor entries to a project reference document.
---

# Add Competitor — Scout & Document a Competitor App

## Portability

This is the canonical workflow. Claude slash commands may call this skill, but they must not duplicate its process. Codex should use this skill directly. Project-specific documents, scripts, tools, and paths named below are optional context; read or run them only when they exist in the current repository.

Use this skill as the Add Competitor workflow. Your job is to research a competitor app and add a structured entry to the project competitor research document.

## Input

Use the user request, selected files, command arguments, or current repo context as input. For Claude command wrappers, `$ARGUMENTS` — An release channel URL, website URL, or app name.

## Process

### Step 1: Research the App

Fetch the release channel listing (via `WebFetch`) and/or website. Extract:

- **Name** (display name)
- **release channel / Website URL(s)**
- **Developer**
- **Rating** (score + number of ratings)
- **Pricing** (free/paid/IAP tiers — include currency from the listing)
- **Requirements** (minimum platform/version, size if available, languages, supported platforms)

If the URL is an release channel link, also try to find the developer's website from the listing. If only a name is given, search the web to find the release channel listing.

### Step 2: Determine the Category

Read the section headings in the project competitor research document. Either:
- Place the app under an existing section if it clearly fits, OR
- Create a new `## Section` if no existing section is appropriate

### Step 3: Write the Entry

Use this exact structure:

```markdown
### <App Name>
- **Website:** <url or omit if none>
- **release channel:** <url>
- **Developer:** <name>
- **Rating:** <score>/5 (<count> ratings)
- **Pricing:** <tiers>
- **Requirements:** <minimum platform/version, size if available, languages, supported platforms>
- **Focus:** <1-2 sentences — what problem it solves and for whom>
- **Key unique features:** <bullet list of 3-5 genuinely distinctive capabilities — things competitors don't do or that define this app's identity>
- **What it does well:** <bullet list of 2-4 strengths worth learning from>
- **Where it could improve:** <bullet list of 2-3 weaknesses, gaps, or UX friction points>
- **What to study:** <comma-separated list of specific UX patterns, design decisions, and product strategies worth examining — focus on what your app can learn from, not generic praise>
```

#### Writing Rules

- **Focus** should be sharp — one or two sentences that capture the core value prop. Don't list features here.
- **Key unique features** are things that make this app *different*, not just good. If every competitor has it, it's not unique.
- **What it does well** and **Where it could improve** should be honest and specific. Don't be sycophantic about competitors or artificially negative.
- **What to study** is for your app — what UX patterns, product decisions, or positioning moves are worth learning from? Be specific enough that a future reader can act on it.

### Step 4: Write the Opportunity Analysis

After the entry (or after a group of entries in the same section), write or update the `### Our Opportunity` paragraph. This should:

- Identify what your app already does or could do in this space
- Name the specific differentiator that sets your app apart
- Be concrete — reference existing features, specs, or exploration docs by name where relevant
- Stay under 4 sentences

If the section already has an `### Our Opportunity`, update it to account for the new competitor rather than adding a second one.

### Step 5: Persona Reactions

Read all persona files from the project's persona directory (e.g., the project persona folder). Skip any template files. If no persona directory exists, skip this step.

For each persona, write a 1-2 sentence reaction to this competitor from their perspective — what would attract them, what would frustrate them, or why they wouldn't care.

Add this after the Our Opportunity section:

```markdown
#### Persona Reactions

| Persona | Reaction |
|---|---|
| <Name> (<Archetype>) | <1-2 sentences> |
```

Reactions should be in-character and honest — not every persona will care about every competitor. "Wouldn't use this" is a valid reaction.

### Step 6: Insert into the File

- Place the entry in the correct section of the project competitor research document
- Follow the existing file structure — `---` separators between sections
- Persona Reactions go after the Our Opportunity section

### Step 7: Confirm

Report back with:

```
## Competitor Added

**App:** <name>
**Section:** <section heading>
**Our Opportunity:** <one-line summary>
**Most interesting thing to study:** <single most valuable takeaway>
```

## Rules

- Always fetch the actual listing — don't rely on memory or assumptions about the app
- If the app can't be found or the URL is broken, tell the user instead of guessing
- Don't invent pricing, ratings, or features — only include what's on the listing
- Keep the whole entry honest and useful — this is a reference doc, not marketing copy
