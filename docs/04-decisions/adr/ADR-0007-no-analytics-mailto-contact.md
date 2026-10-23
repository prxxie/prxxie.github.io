---
id: ADR-0007
title: No analytics, and a contact path of mailto, LinkedIn and GitHub
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0007 — No analytics, and a contact path of mailto, LinkedIn and GitHub

## Context

The site's success measure is one inbound contact per month from a hiring reader (brief § 2), which normally implies
funnel instrumentation. The product brief rules out analytics, telemetry and any server-side surface (brief § 4), and the
privacy requirement is that nothing personal is collected at all (brief § 9).

## Decision

No analytics, no telemetry, no cookie or consent banner. Contact is a `mailto:` link plus LinkedIn and GitHub profile
links, with no form and no backend. Success is measured outside the product, by counting inbound messages.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **No analytics, mailto plus profile links** | Nothing to consent to, nothing to breach; consistent with local-only progress | No funnel data; a reader can only leave by choosing to |
| Privacy-friendly analytics (self-hosted, cookieless) | Funnel data without personal data | Still a third-party request, and the brief excludes telemetry |
| A contact form with a serverless function | Structured messages, spam filtering | Introduces a backend and a data store for the one thing the site exists to avoid |

## Consequences

- The contact block is a static set of links, so it works with JavaScript disabled and prerenders cleanly.
- Any future instrumentation reopens the privacy requirement in `docs/01-overview/nonfunctional-requirements.md`.
- Attribution of the puzzle artwork and fonts is a content decision, not a technical one (OQ-04 covers the game
  repositories' own licensing).
