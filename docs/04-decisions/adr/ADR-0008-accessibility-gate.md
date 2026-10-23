---
id: ADR-0008
title: Enforce WCAG 2.2 AA by construction with an automated CI gate
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0008 — Enforce WCAG 2.2 AA by construction with an automated CI gate

## Context

The current shell is built for the look rather than for reach: `font-press` sets 9–10px monospace text, colour tokens
were chosen for a CRT glow, and the puzzle boards are drawn in canvas-like grids whose keyboard path is unverified.
Accessibility was declared a requirement rather than an aspiration (brief § 9, OQ-07), and the design system is being
replaced anyway (ADR-0001), so the cost of getting it right now is lowest.

## Decision

Accessibility targets WCAG 2.2 AA and is enforced by an automated check in CI: contrast, visible focus, keyboard-only
play for all three puzzles, reduced-motion variants, semantic landmarks and a 360px–1920px responsive range. A failure
fails the build.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **AA with an automated gate** | Regressions are caught before deploy; the claim becomes checkable | Adds a CI step and one dependency; automated checks never cover everything |
| Manual review before each release | No tooling | Nothing enforces it; the current state is the evidence |
| Target AA without a gate | No CI cost | The claim is unverifiable, which is the opposite of the site's purpose |

## Consequences

- The shell and each game need a keyboard model for their boards, plus reduced-motion variants for their animations.
- Game repositories carry the same gate, so a restyle cannot land with a contrast regression.
- The gate is a floor, not a substitute for a manual pass on the three boards.
