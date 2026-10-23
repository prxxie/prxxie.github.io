---
id: EPIC-03-home
code: HOME
title: The one-page proof
---

# EPIC-03 — The one-page proof

The front page becomes the whole argument: who I am, what I build, a puzzle you can play before you read anything, and evidence that the thing you are looking at is real work — figures computed from the build itself.

## Goal

A recruiter or peer lands on `/`, reads a headline that says what I do, plays a real level without a route change, sees proof figures that no one typed by hand, and has a way to write to me.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-HOME-001](US-HOME-001-build-the-proof-page.md) | Build the proof page | P1 | M | ready | US-SITE-003, US-DS-003 |
| [US-HOME-002](US-HOME-002-put-a-playable-puzzle-on-the-front-page.md) | Put a playable puzzle on the front page | P1 | L | ready | US-HOME-001 |
| [US-HOME-003](US-HOME-003-print-the-proof-from-the-build.md) | Print the proof from the build | P2 | M | ready | US-HOME-001, US-FND-005 |
<!-- /adf:epic-stories -->

## Out of scope

- A second landing variant or A/B testing.
- Any page longer than one screen of reading.
