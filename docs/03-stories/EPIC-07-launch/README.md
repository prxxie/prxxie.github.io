---
id: EPIC-07-launch
code: LAUNCH
title: Landing page, discovered
---

# EPIC-07 — Landing page, discovered

The last pass before the site is pointed at people: per-page metadata and social cards, a sitemap and robots file generated from the route manifest, a performance budget met on a cold load, an accessibility audit across every route, and the documentation archive brought in line with what now exists.

## Goal

Every route has a title, a description and a share image; a crawler gets a sitemap; a cold load on a slow phone is usable; no route fails an accessibility audit; the docs describe the site as it is.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-LAUNCH-001](US-LAUNCH-001-give-every-page-its-metadata-and-a-share-card.md) | Give every page its metadata and a share card | P2 | M | ready | US-SITE-003 |
| [US-LAUNCH-002](US-LAUNCH-002-publish-a-sitemap-and-robots-file.md) | Publish a sitemap and robots file | P2 | S | ready | US-LAUNCH-001 |
| [US-LAUNCH-003](US-LAUNCH-003-meet-a-performance-budget-on-a-cold-load.md) | Meet a performance budget on a cold load | P2 | M | ready | US-HOME-002, US-DS-002 |
| [US-LAUNCH-004](US-LAUNCH-004-audit-and-fix-accessibility-across-every-route.md) | Audit and fix accessibility across every route | P1 | M | ready | US-FND-006, US-GAME-005, US-DEVLOG-003 |
| [US-LAUNCH-005](US-LAUNCH-005-sync-the-documentation-with-the-shipped-site.md) | Sync the documentation with the shipped site | P3 | M | ready | US-SITE-001, US-DS-001, US-PET-003 |
<!-- /adf:epic-stories -->

## Out of scope

- Marketing copy or a launch campaign.
- Analytics of any kind (ADR-0007).
