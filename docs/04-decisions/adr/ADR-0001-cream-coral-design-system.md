---
id: ADR-0001
title: Adopt warm cream and coral editorial as the single canonical design system
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0001 — Adopt warm cream and coral editorial as the single canonical design system

## Context

The repository carries four mutually incompatible visual directions: the amber CRT terminal the shell renders, the
`retro-window` pixel chrome around it, the daisyUI theme installed as a dependency, and the cream/coral editorial spec
in `DESIGN.md` whose tokens are already written into `packages/shell/src/index.css:6-42`. The site's job is to get a
hiring reader to make contact (brief § 1), and a recruiter-facing page reads four palettes as an unfinished product.
The interview fixed the direction and the rule that no alternative theme survives (brief § 4, OQ-02).

## Decision

Warm cream and coral editorial replaces every other direction as the only design system: `--color-canvas` `#faf9f5`,
`--color-primary` `#cc785c`, serif display over humanist body, one radius scale, one spacing scale, declared once in
`packages/shell/src/index.css` and themed into each game MFE. The amber palette, the pixel `retro-window` chrome and the
daisyUI theme are removed rather than kept behind a toggle.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Cream/coral editorial, single system** | Reads as a considered product to a hiring reader; tokens already exist in `packages/shell/src/index.css`; one system to restyle against | A full restyle of shell and three game repos before the site looks finished |
| Keep amber CRT as the identity | Zero restyle work; the pixel aesthetic matches the retro-game subject | The subject is retro, not the employer-facing signal; contrast and pixel-font choices fail the AA target |
| Ship cream/coral primary plus an amber theme switch | Keeps the retro work visible | Two systems to maintain, two QA passes, and the reader has to choose before understanding |

## Consequences

- Every shell component moves off `text-cozy-*`, `font-press` and `retro-window` onto the token set; the counts are the
  restyle's measure of done.
- The three game repositories restyle in their own release cycle (ADR-0003, OQ-11), so the site is visually split until
  each pointer bump lands.
- `DESIGN.md` stays in the repository as the raw spec until the restyle is finished, then leaves (OQ-09).
