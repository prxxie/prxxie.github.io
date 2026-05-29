# Project Review: prxxie-home

## Overview

**prxxie-home** is a personal portfolio/dashboard site — "Cozy OS - prxxie" — styled like a retro pixel-art desktop operating system with tamagotchi-style virtual pet interactions. It's a React micro-frontend monorepo deployed to GitHub Pages.

**Section-based dashboard** with five tabs:

- **Home** — console-style intro
- **About** — skill bars and bio folders
- **Posts** — Markdown-driven devlog/blog
- **Pets** — virtual pet with hunger/happiness stats
- **Shikaku** — complete puzzle game with 20 handcrafted levels

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (JSX) |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 (alpha) + Google Fonts (Press Start 2P, VT323) |
| State | Zustand 4 |
| Data fetching | @tanstack/react-query v5 |
| Testing | Vitest + @testing-library/react + jsdom |
| Architecture | Module Federation via @originjs/vite-plugin-federation |
| Markdown | marked + prismjs |
| Animation | framer-motion (shikaku only) |
| CI/CD | GitHub Actions → GitHub Pages |
| Monorepo | npm workspaces |

---

## Architecture

```
packages/
├── shell/     (port 3000) — Host: layout chrome, tab routing, lazy remote MFE loading
├── about/     (port 3001) — Remote MFE: bio, skill bars
├── posts/     (port 3002) — Remote MFE: markdown blog viewer
├── pets/      (port 3003) — Remote MFE: tamagotchi virtual pet
└── shikaku/   (port 3004) — Remote MFE: puzzle game (20 levels, solver, synth)
```

The **shell** is the host — all other packages are remote MFEs loaded lazily at runtime via Module Federation. Each MFE runs standalone in dev on its own port (3001-3004), but in production all are compiled to `dist/mfe/<name>/` with `remoteEntry.js` files. The shell builds last and loads remotes from `/mfe/<name>/assets/remoteEntry.js`.

### Cross-package communication

Minimal by design. Only the **pets MFE** shares state with the shell — the shell passes its `usePetStore` Zustand hook as a prop. The pets MFE falls back to its own local store when running standalone. All other MFEs are self-contained.

---

## Key Files

| File | Purpose |
|---|---|
| `packages/shell/src/App.jsx` | Tab routing, MFE lazy loading (`<Suspense>`), fullscreen toggle, pet stat decay timer |
| `packages/shell/src/components/ConsoleFrame.jsx` | Layout chrome, responsive nav, offcanvas mobile drawer |
| `packages/shell/src/store/petStore.js` | Shared Zustand pet store (feed, play, tick decay, sleep blocking) |
| `packages/shell/src/store/uiStore.js` | Mobile menu open/close |
| `packages/shell/src/index.css` | All design tokens, pixel UI classes, Prism theme, animations |
| `packages/posts/src/PostsApp.jsx` | Markdown post listing + rendering pipeline |
| `packages/posts/src/utils/markdown.js` | Frontmatter parser + marked GFM + Prism.js syntax highlighting |
| `packages/pets/src/PetsApp.jsx` | SVG pet rendering, action buttons, stat bars |
| `packages/shikaku/src/ShikakuApp.jsx` | Puzzle app: level select ↔ game board |
| `packages/shikaku/src/components/Board.jsx` | Grid rendering with drag-to-select |
| `packages/shikaku/src/store/useShikakuStore.js` | Core game state: drag, commit, undo, hint, localStorage persistence |
| `packages/shikaku/src/engine/validation.js` | Region placement validation |
| `packages/shikaku/src/engine/solver.js` | Backtracking solver with pre-computed valid placements |
| `packages/shikaku/src/engine/synth.js` | Web Audio API retro sound effects |
| `packages/shikaku/src/levels.js` | 20 handcrafted levels: 6 Easy (4×4–6×6), 7 Medium (8×8), 7 Hard (10×10) |

---

## Build & Deploy

- **Dev**: `npm run dev` — concurrently runs all 5 Vite dev servers
- **Production**: `npm run build:static` — calls `scripts/build-static.sh`, which cleans and builds remote MFEs first, then the shell, and assembles output into `dist/`
- **Deploy**: `.github/workflows/deploy.yml` triggers on push to `main` — builds and deploys `dist/` to GitHub Pages via `peaceiris/actions-gh-pages`

Notable: all builds use `minify: false` and `cssCodeSplit: false` for readability. `target: 'esnext'`.

---

## Testing

**14 test files** across shell, posts, and shikaku packages:

| Package | Coverage |
|---|---|
| shell | App rendering, tab nav, fullscreen toggle, ConsoleFrame (desktop/mobile nav, drawer, Escape key, backdrop click, body scroll lock, unmount cleanup), petStore (feed/play/tick/sleep/decay), uiStore |
| posts | Markdown parse/render utilities, GFM features, Prism highlighting, react-query integration |
| shikaku | All 20 levels validated (count, difficulty, board size, solver-verified solvable), game store (load/drag/commit/undo/remove/reset/timer/save/load/hint), solver (valid solutions, unsolvable detection), validation (correct/wrong/overlap/bounds), synth (audio context init, mute, parameter verification), component rendering (App, Board, Cell, HUD, LevelSelect) |

Shell tests mock all remote MFEs to avoid federation dependency in test. Shikaku's test suite is especially thorough — it brute-force validates that every level is solvable, and mocks Web Audio API completely for the synth tests.

---

## Strengths

- **Clean Module Federation setup** — Each MFE is independently buildable and runnable. Shell degrades with `<Suspense>` fallbacks for offline remotes
- **Excellent test coverage** — Store logic, game engine validation/solver, audio mocking, responsive menu behavior all well-tested. The solver-verification test for all 20 levels is a standout
- **Hexagonal engine separation** — Shikaku's `engine/` sub-package (solver, validation, synth) is cleanly decoupled from React components and state management
- **Pragmatic MFE state sharing** — Shell passes Zustand hook as prop; MFE has fallback for standalone dev. No shared library overhead
- **Responsive design** — Desktop 3-column grid → single column on mobile. Offcanvas menu drawer with backdrop, Escape key, ARIA attributes, body scroll lock
- **No runtime router** — Tab state is just React `useState`. Simple and fits the use case perfectly
- **Good accessibility** — ARIA labels, `aria-expanded`, `aria-modal`, `aria-controls` on mobile menu

---

## Things to Watch

- **`react-router-dom` listed as shell dependency but unused** — Dead dependency, can be removed
- **Tailwind CSS v4 alpha** (`@tailwindcss/vite: ^4.0.0-alpha.16`) — Using an alpha; potential for breaking changes on upgrade
- **`minify: false` in production** — Larger bundles, but appropriate for a personal site where readability trumps performance
- **Single large CSS file** — `shell/src/index.css` at ~259 lines holds all Tailwind directives, theme tokens, component classes, markdown styles, and Prism theme. Manageable now but could benefit from splitting if it grows
- **Some dependency duplication** — zustand lives in shell, pets, and shikaku. npm workspaces deduplicates, but there's still conceptual overlap
- **About package has no tests** — The simplest MFE; could be trivially covered
- **Backtracking solver** — Works perfectly for max 10×10 grids but would need algorithm upgrade for larger puzzles
- **No TypeScript** — Entire codebase is plain JSX. Fine for a solo personal project but worth noting

---

## Summary

A well-architected, thoroughly tested personal portfolio site that uses Module Federation as a deliberate architectural choice rather than over-engineering. The Shikaku puzzle game is a fully polished feature with its own solver and audio engine. The codebase is clean, conventions are consistent, and the test suite gives confidence that things work end-to-end.
