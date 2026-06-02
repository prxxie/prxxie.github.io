# AGENTS.md — Cozy OS Architecture Guide

> Keep this file up to date. If you add, remove, or restructure a package or change how MFEs are wired, update the relevant section before ending your session.

---

## Project Overview

A **retro-styled personal home page** (CRT/pixel aesthetic) built as a Vite + React monorepo using **Module Federation**. The `shell` host app lazy-loads MFE remotes at runtime.

---

## Monorepo Structure

```
packages/
  shell/        — Host app (Module Federation consumer, routing, global state)
  about/        — MFE: About page
  posts/        — MFE: Blog/posts reader
  pets/         — MFE: Virtual pet display (state-injected by shell)
  shikaku/      — MFE: Shikaku puzzle game
  slitherlink/  — MFE: Slitherlink puzzle game
  sokoban/      — MFE: Sokoban puzzle game
  shared/       — Internal library: ProgressService, PetState, evolution logic
```

---

## Package Specs

### `shell`
- **Role**: Module Federation host. Owns global routing, layout, Zustand stores.
- **Key files**:
  - `src/App.tsx` — lazy-loads all MFEs, `useHashRouter` for tab routing
  - `src/store/petStore.ts` — pet state (injected into `pets` MFE as props)
  - `src/store/uiStore.ts` — UI state
  - `src/hooks/useProgressService.ts` — wraps ProgressService, exposes `hungryLevel`
  - `src/index.css` — all CSS custom tokens, CRT/scanline animations
- **MFE remotes served at**: `/mfe/<name>/assets/remoteEntry.js`
- **Dev**: sirv middleware mounts each MFE's `dist/` at `/mfe/<name>`

### `about` / `posts` / `shikaku` / `slitherlink` / `sokoban`
- **Role**: Self-contained MFE remotes. No shell state injected.
- **Exposes**: `./XxxApp` component via `remoteEntry.js`
- **Build base**: `/mfe/<name>/`

### `slitherlink`
- **Role**: Slitherlink loop-drawing puzzle game.
- **Engine**: `src/engine/validation.ts` — loop validation (vertex degrees, clue counts, single closed loop traversal)
- **Store**: `src/store/useSlitherlinkStore.ts` — Zustand store with undo stack, timer, win detection
- **Synth**: `src/engine/synth.ts` — RetroSynth audio (WebAudio API)
- **Levels**: `src/engine/levels.ts` — 10 pre-baked levels (5 Easy, 5 Medium)
- **Integrates**: Dispatches `cozyos:progress-updated` CustomEvent on win for shell ProgressService pickup

### `pets`
- **Role**: MFE remote that receives shell's `usePetStore` hook as a prop.
- **Exposes**: `./PetsApp`
- **Special**: Only MFE that accepts injected state — keeps it display-only.

### `shared`
- **Role**: Pure TS library. No React, no Vite federation.
- **Exports**: `ProgressService`, `LocalProgressRepository`, `getEvolutionStage`, `PetState`, `ProgressState`, `CompletedLevel`
- **Used by**: `shell` (and any MFE that needs game progress logic)

---

## Module Federation Wiring

```
shell vite.config.ts
  remotes: { about, posts, pets, shikaku, slitherlink, sokoban }
  shared:  react, react-dom, zustand, @tanstack/react-query

each MFE vite.config.ts
  exposes: { ./XxxApp: ./src/XxxApp.tsx }
  shared:  react, react-dom  (+ zustand for pets, slitherlink)
```

Adding a new MFE requires changes in **three places**:
1. New package `vite.config.ts` — add `federation({ exposes })` 
2. `shell/vite.config.ts` — add to `remotes` and `mfePackages` array
3. `shell/src/App.tsx` — add `lazy(() => import('name/Component'))` and route

---

## State & Data Flow

```
shared/ProgressService  ←→  LocalProgressRepository (localStorage)
        ↑
shell/useProgressService  →  petStore (Zustand)
                          →  pets MFE (via props)
        ↑
MFE game apps (sokoban, shikaku, slitherlink) call completeLevelWithStars on win
```

---

## Testing Rules

- Test files live beside source: `Foo.test.tsx` next to `Foo.tsx`
- Shell tests **mock all MFE remotes** (see `MockMfe.tsx`)
- Game engines (`sokoban/engine`, `shikaku/engine`, `slitherlink/engine`) are pure TS — test them directly, no React needed
- Run all tests: `rtk npm run test`

---

## Updating This File

When you make any of these changes, update AGENTS.md in the same session:

| Change | Section to update |
|--------|-------------------|
| Add/remove a package | Monorepo Structure, Package Specs |
| Change MFE exposed component name | Module Federation Wiring |
| Add shell state passed to an MFE | State & Data Flow, `pets` spec note |
| Add new shared export | `shared` Package Specs |
| Change port/path conventions | Module Federation Wiring |
