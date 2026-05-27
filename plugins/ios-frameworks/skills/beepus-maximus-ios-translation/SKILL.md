---
name: translation
description: Reviews and writes Translation framework code — system translation UI, custom translation sessions, language availability, and batch translation. Use when adding in-app text translation.
---

# Translation

Review and write Translation framework code for correct language availability checking, translation UI, and session management.

## Responsibility

**Owns:** translationPresentation modifier, translationTask modifier, TranslationSession, LanguageAvailability, batch translation, language pair support.

**Does NOT own:** Localization (localization skill), Natural Language framework (text analysis), FoundationModels (LLM generation), string catalogs.

## Core Principles

1. **Check availability before offering translation.** Not all language pairs are available. Use LanguageAvailability first.
2. **System UI is simplest.** Use `translationPresentation` for the built-in translation overlay — zero custom UI needed.
3. **Custom sessions for control.** Use `translationTask` when you need programmatic access to translation results.
4. **Batch for efficiency.** Translate multiple strings in one session call rather than one at a time.

## References

- `references/translation-patterns.md` — System UI, custom sessions, language availability, batch translation
