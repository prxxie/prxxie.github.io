---
id: EPIC-06-pet
code: PET
title: The pet becomes a footer widget
---

# EPIC-06 — The pet becomes a footer widget

The virtual pet leaves the navigation and becomes what it always was: a small, persistent companion in the footer that reacts to the same progress the games write. No route, no tab, no second progress store.

## Goal

A visitor who solves a level sees the pet react in the footer, understands what feeding costs (stars, with a cooldown) and never has to open a page to look after it.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-PET-001](US-PET-001-build-the-pet-widget.md) | Build the pet widget | P1 | M | done | US-DS-003 |
| [US-PET-002](US-PET-002-make-the-feeding-economy-legible.md) | Make the feeding economy legible | P2 | M | done | US-PET-001 |
| [US-PET-003](US-PET-003-put-the-pet-in-the-home-footer-and-only-there.md) | Put the pet in the home footer, and only there | P1 | S | ready | US-PET-001, US-SITE-002 |
<!-- /adf:epic-stories -->

## Out of scope

- New pet species, art pipelines or a shop.
- Server-side pet state.
