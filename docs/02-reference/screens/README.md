# Screens

Six routes, one page each. Every screen is a page with a real path and prerendered HTML (ADR-0002) — there is no modal
as a destination, and no hash route survives (OQ-12).

| Screen | Route | File | Job | Status | Story |
|--------|-------|------|-----|--------|-------|
| Home | `/` | `home.md` | turn a hiring reader into a contact, using the build as the argument | designed, not built | `US-HOME-001` |
| Games hub | `/games` | `games-hub.md` | let a visitor pick a puzzle and keep the star tally visible | route and a three-card listing shipped; the tally lands with `US-GAME-001` | `US-GAME-001` |
| Shikaku | `/games/shikaku` | `shikaku.md` | the rectangle-fill puzzle, fully re-skinned | routed at its own path, restyle pending | `US-GAME-002` |
| Sokoban | `/games/sokoban` | `sokoban.md` | the box-pushing puzzle, with two broken levels to fix | routed at its own path, restyle pending | `US-GAME-003` |
| Slitherlink | `/games/slitherlink` | `slitherlink.md` | the loop-drawing puzzle | routed at its own path, restyle pending | `US-GAME-004` |
| Devlog | `/devlog` | `devlog.md` | show how the thing is made, one post at a time, teaser level inline | designed, not built | `US-DEVLOG-002` |

## Shell regions

Every screen renders inside the same three regions, owned by the host.

| Region | Contents | Notes |
|--------|----------|-------|
| Header | site mark, nav (Home, Games, Devlog), sound switch, panel switch on small screens | the skip link precedes the header; nav is three items and the active one carries `aria-current="page"`; the pet is not navigation (OQ-04) |
| Main | the screen | `id="main"`, `tabindex="-1"`; one `h1` per page; focus lands here and the scroll resets on every route change |
| Footer | `#pet-widget-slot`, colophon, contact links | the widget is the only place the pet appears; contact links arrive with US-SITE-006 |

## Cross-screen rules

- One coral action per view. A second coral element means one of the two is not an action (ADR-0001).
- A game is playable without an account, without a request, and without waiting for a network round trip (NFR-03).
- A remote that fails to load renders its own named fallback with a retry; the rest of the page stays usable (NFR-15). The
  game region catches its own failure (`ErrorBoundary`), so the header, nav and footer stay mounted.
- A route that throws is replaced by a named error region with a way back; the shell never swaps the whole document.
- Stars appear only where they mean something: the game that awarded them, the hub tally and the home telemetry. They are
  never a badge on a nav item.
- Keyboard and screen-reader paths are part of the screen, not a follow-up: each screen lists its own in **Accessibility**.
- No screen offers an account, a save-to-cloud, a share, a comment or a newsletter. Those are absent by decision, not by
  omission (ADR-0004, ADR-0007).

## Not a screen

These are states, and they live inside the screen that owns them: loading (a region skeleton, never a full-page spinner),
empty (a post list with one post still reads as a list), offline remote (a named fallback with retry), solved (the win
panel inside the game), unplayed (`0 / 100` stars, not a hidden section), sleeping pet (the widget's sleeping pose).

## Legacy fragments

Old links addressed pages as `#about`, `#posts`, `#shikaku`… `useLegacyHashRedirect`
(`packages/shell/src/hooks/useLegacyHashRedirect.ts`) maps each once on mount with a replace
navigation; an unmapped fragment lands on the not-found screen. The table is
`LEGACY_HASH_ROUTES` in the same file — see US-SITE-005.
