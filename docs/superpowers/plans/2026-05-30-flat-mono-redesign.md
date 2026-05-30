# Flat Mono Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CRT pixel aesthetic with a flat, monospaced terminal look — Geist Mono everywhere, 1px hairline borders, no shadows, no scanlines, no phosphor text-shadow. Color palette stays.

**Architecture:** All styles live in one shared file (`packages/shell/src/index.css`) imported by every MFE via `import "../../shell/src/index.css"`. Token swap + class redefinitions in that file propagate site-wide. A second pass mechanically sweeps inline Tailwind overrides (`border-4`, `border-l-2`, `shadow-2xl`, `shadow-[…]`, `shadow-md`, `shadow-inner`, `shadow-lg`, `shadow-none`) across all `*.tsx` files.

**Tech Stack:** Tailwind CSS v4 (`@theme` blocks), React, TypeScript, Vitest, Geist Mono via Google Fonts.

---

## File Structure Map

- Modify: `packages/shell/src/index.css` (font tokens, body, scanlines, base classes)
- Modify: `packages/about/src/AboutApp.tsx` (border-N sweep)
- Modify: `packages/pets/src/PetsApp.tsx` (border-N + shadow sweep)
- Modify: `packages/posts/src/PostsApp.tsx` (border-N sweep)
- Modify: `packages/shell/src/App.tsx` (border-N + shadow sweep)
- Modify: `packages/shell/src/components/ConsoleFrame.tsx` (border-N + shadow sweep)
- Modify: `packages/shell/src/components/MatrixMenu.tsx` (shadow sweep)
- Modify: `packages/shikaku/src/ShikakuApp.tsx` (border-N + shadow sweep)
- Modify: `packages/shikaku/src/components/Board.tsx` (border-N sweep)
- Modify: `packages/shikaku/src/components/Board.test.tsx` (selector fix)
- Modify: `packages/shikaku/src/components/HUD.tsx` (border-N sweep)
- Modify: `packages/shikaku/src/components/LevelSelect.tsx` (border-N sweep)
- Modify: `packages/sokoban/src/SokobanApp.tsx` (border-N + shadow sweep)
- Modify: `packages/sokoban/src/components/Board.tsx` (border-N + shadow sweep)
- Modify: `packages/sokoban/src/components/Controls.tsx` (border-N sweep)
- Modify: `packages/sokoban/src/components/HUD.tsx` (border-N sweep)
- Modify: `packages/sokoban/src/components/LevelSelect.tsx` (border-N sweep)
- Modify: `packages/sokoban/src/components/WinModal.tsx` (border-N + shadow sweep)

---

### Task 1: Swap fonts to Geist Mono and remove text-shadow glow

**Files:**
- Modify: `packages/shell/src/index.css:1-24`

- [ ] **Step 1: Replace top-of-file imports and `@theme` block**

Replace `packages/shell/src/index.css` lines 1–13 with:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;700&display=swap');
@import "tailwindcss";

@theme {
  --font-mono: "Geist Mono", ui-monospace, monospace;
  --font-pixel: "Geist Mono", ui-monospace, monospace;
  --font-press: "Geist Mono", ui-monospace, monospace;
  --color-cozy-bg: #000000;
  --color-cozy-text: #FFB000;
  --color-cozy-border: #FFB000;
  --color-cozy-accent: #FFB000;
  --color-cozy-muted: #805800;
  --color-terminal-bg: #050505;
}
```

- [ ] **Step 2: Replace the `body` block**

Replace `packages/shell/src/index.css` lines 15–24 with:

```css
body {
  background-color: var(--color-cozy-bg);
  color: var(--color-cozy-text);
  font-family: var(--font-mono);
  font-size: 14px;
  position: relative;
  overflow-x: hidden;
}
```

(Drops `text-shadow`, drops `image-rendering: pixelated`, reduces font-size from 20px to 14px.)

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 4: Commit**

```bash
git add packages/shell/src/index.css
git commit -m "style: replace pixel fonts with Geist Mono and remove text-shadow glow"
```

---

### Task 2: Drop scanlines overlay and shadows from base classes

**Files:**
- Modify: `packages/shell/src/index.css:26-102`

- [ ] **Step 1: Delete the `body::after` scanlines block**

In `packages/shell/src/index.css`, delete the entire block (currently lines 26–46) starting `/* Scanlines Overlay */` through the closing `}` of `body::after`.

- [ ] **Step 2: Replace `.pixel-border`**

Replace the `.pixel-border` rule (currently 2 lines: `border: 4px solid …; box-shadow: …;`) with:

```css
.pixel-border {
  border: 1px solid var(--color-cozy-border);
}
```

- [ ] **Step 3: Replace `.pixel-btn` and its state rules**

Replace the entire `.pixel-btn`, `.pixel-btn:hover, .pixel-btn:focus-visible`, and `.pixel-btn:active` blocks with:

```css
.pixel-btn {
  border: 1px solid var(--color-cozy-border);
  background-color: #000000;
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  color: var(--color-cozy-text);
}

.pixel-btn:hover, .pixel-btn:focus-visible {
  background-color: var(--color-cozy-text);
  color: #000000;
}

.pixel-btn:active {
  opacity: 0.85;
}
```

- [ ] **Step 4: Replace `.retro-window` and `.window-header`**

Replace the existing `.retro-window` and `.window-header` blocks with:

```css
.retro-window {
  border: 1px solid var(--color-cozy-border);
  background-color: var(--color-terminal-bg);
  display: flex;
  flex-direction: column;
}

.window-header {
  background-color: #000000;
  color: var(--color-cozy-text);
  border-bottom: 1px solid var(--color-cozy-border);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

(`.window-header-accent` and `.window-body` blocks immediately after stay unchanged.)

- [ ] **Step 5: Run all tests and typecheck**

Run: `npm run typecheck && npm run test`
Expected: typecheck clean, 135/135 tests pass (no test asserts on `box-shadow` or `border-width`).

- [ ] **Step 6: Commit**

```bash
git add packages/shell/src/index.css
git commit -m "style: drop scanlines overlay and box-shadows from base components"
```

---

### Task 3: Sweep shadow utilities from TSX

**Files:**
- Modify: `packages/shell/src/App.tsx`
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shell/src/components/MatrixMenu.tsx`
- Modify: `packages/pets/src/PetsApp.tsx`
- Modify: `packages/shikaku/src/ShikakuApp.tsx`
- Modify: `packages/sokoban/src/SokobanApp.tsx`
- Modify: `packages/sokoban/src/components/Board.tsx`
- Modify: `packages/sokoban/src/components/WinModal.tsx`

The rule: every Tailwind shadow utility gets removed from `className` strings. The classes covered are `shadow-[…]` (any arbitrary-value), `shadow-2xl`, `shadow-lg`, `shadow-md`, `shadow-sm`, `shadow-none`, `shadow-inner`. Hover variants like `hover:shadow-[…]` go too. Surrounding whitespace collapses to a single space.

- [ ] **Step 1: Edit `packages/shell/src/App.tsx`**

Line ~191: change

```tsx
className="md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px] shadow-lg"
```

to

```tsx
className="md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px]"
```

Line ~204: change the template literal to remove `shadow-2xl`:

```tsx
className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 transition-transform duration-300 md:hidden ${
```

- [ ] **Step 2: Edit `packages/shell/src/components/ConsoleFrame.tsx`**

Line ~60: change

```tsx
<header className="bg-black border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30">
```

to

```tsx
<header className="bg-black border-b-4 border-cozy-border p-3 box-border w-full relative z-30">
```

Line ~122: change

```tsx
className="fixed top-0 right-0 bottom-0 w-64 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden"
```

to

```tsx
className="fixed top-0 right-0 bottom-0 w-64 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 animate-[slideIn_0.2s_ease-out] md:hidden"
```

- [ ] **Step 3: Edit `packages/shell/src/components/MatrixMenu.tsx`**

Line ~40: change

```tsx
? "bg-cozy-accent text-black shadow-none border-cozy-border"
```

to

```tsx
? "bg-cozy-accent text-black border-cozy-border"
```

- [ ] **Step 4: Edit `packages/pets/src/PetsApp.tsx`**

Lines ~222, ~228, ~234 (three identical buttons): change

```tsx
className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border shadow-none hover:bg-black hover:text-cozy-text hover:shadow-[2px_2px_0px_var(--color-cozy-muted)]"
```

to

```tsx
className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text"
```

(Use Edit's `replace_all: true` since all three lines are identical.)

- [ ] **Step 5: Edit `packages/shikaku/src/ShikakuApp.tsx`**

Line ~26: remove `shadow-md` from

```tsx
<div className="w-full max-w-[450px] border-4 border-cozy-border bg-black p-6 shadow-md select-none text-cozy-text">
```

→

```tsx
<div className="w-full max-w-[450px] border-4 border-cozy-border bg-black p-6 select-none text-cozy-text">
```

- [ ] **Step 6: Edit `packages/sokoban/src/SokobanApp.tsx`**

Line ~19: remove `shadow-md` from

```tsx
<div className="w-full max-w-[450px] border-4 border-cozy-border bg-black p-4 shadow-md select-none relative flex flex-col items-center text-cozy-text">
```

→

```tsx
<div className="w-full max-w-[450px] border-4 border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text">
```

- [ ] **Step 7: Edit `packages/sokoban/src/components/Board.tsx`**

Line ~21: remove `shadow-inner` from

```tsx
className="relative w-full border-4 border-[#FFB000] bg-[#050505] shadow-inner select-none overflow-hidden"
```

→

```tsx
className="relative w-full border-4 border-[#FFB000] bg-[#050505] select-none overflow-hidden"
```

- [ ] **Step 8: Edit `packages/sokoban/src/components/WinModal.tsx`**

Line ~24: remove `shadow-md` from

```tsx
<div className="border-4 border-[#FFB000] bg-[#050505] p-6 shadow-md max-w-xs w-full text-center flex flex-col items-center gap-4">
```

→

```tsx
<div className="border-4 border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4">
```

- [ ] **Step 9: Verify no shadow utilities remain**

Run: `grep -rn "shadow-\[\|shadow-2xl\|shadow-lg\|shadow-md\|shadow-sm\|shadow-none\|shadow-inner" packages/*/src --include="*.tsx"`
Expected: zero matches.

- [ ] **Step 10: Run all tests**

Run: `npm run test`
Expected: 135/135 pass.

- [ ] **Step 11: Commit**

```bash
git add packages/shell/src packages/pets/src packages/shikaku/src packages/sokoban/src
git commit -m "style: remove all box-shadow utilities from components"
```

---

### Task 4: Thin all border utilities to 1px hairlines

**Files:**
- Modify: `packages/about/src/AboutApp.tsx`
- Modify: `packages/pets/src/PetsApp.tsx`
- Modify: `packages/posts/src/PostsApp.tsx`
- Modify: `packages/shell/src/App.tsx`
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shikaku/src/ShikakuApp.tsx`
- Modify: `packages/shikaku/src/components/Board.tsx`
- Modify: `packages/shikaku/src/components/Board.test.tsx`
- Modify: `packages/shikaku/src/components/HUD.tsx`
- Modify: `packages/shikaku/src/components/LevelSelect.tsx`
- Modify: `packages/sokoban/src/SokobanApp.tsx`
- Modify: `packages/sokoban/src/components/Board.tsx`
- Modify: `packages/sokoban/src/components/Controls.tsx`
- Modify: `packages/sokoban/src/components/HUD.tsx`
- Modify: `packages/sokoban/src/components/LevelSelect.tsx`
- Modify: `packages/sokoban/src/components/WinModal.tsx`

The rule: any Tailwind border-weight utility loses its trailing weight digit. `border-4` → `border`, `border-l-4` → `border-l`, `border-b-2` → `border-b`, etc. The `border-dashed` style stays. The 1px definition comes from the `.pixel-border` / `.retro-window` / inline `border` utility (Tailwind defaults `border` to 1px).

- [ ] **Step 1: Edit `packages/about/src/AboutApp.tsx`**

Use Edit with `replace_all: true` for each pattern below in this single file:
- `border-b-2` → `border-b`
- `border-2` → `border`

(Two passes: first the more specific `border-b-2`, then the general `border-2`. Order matters because `border-b-2` contains the substring `border-2` only after the `-b-`.)

- [ ] **Step 2: Edit `packages/pets/src/PetsApp.tsx`**

Use Edit with `replace_all: true` in order:
- `border-b-2` → `border-b` (none expected, but safe)
- `border-2` → `border`
- `border-4` → `border`

- [ ] **Step 3: Edit `packages/posts/src/PostsApp.tsx`**

Use Edit with `replace_all: true`:
- `border-2` → `border`

- [ ] **Step 4: Edit `packages/shell/src/App.tsx`**

Use Edit with `replace_all: true` in order:
- `border-l-4` → `border-l`
- `border-b-2` → `border-b`

- [ ] **Step 5: Edit `packages/shell/src/components/ConsoleFrame.tsx`**

Use Edit with `replace_all: true` in order:
- `border-l-4` → `border-l`
- `border-b-4` → `border-b`
- `border-b-2` → `border-b`

- [ ] **Step 6: Edit `packages/shikaku/src/ShikakuApp.tsx`**

Use Edit with `replace_all: true`:
- `border-4` → `border`

- [ ] **Step 7: Edit `packages/shikaku/src/components/Board.tsx`**

Use Edit with `replace_all: true`:
- `border-4` → `border`

- [ ] **Step 8: Update `packages/shikaku/src/components/Board.test.tsx`**

Line 127 currently asserts `.relative.border-4`. After Step 7 the rendered class is `.relative.border`. Update the test selector accordingly.

Edit `packages/shikaku/src/components/Board.test.tsx`: replace

```typescript
const boardContainer = container.querySelector(".relative.border-4");
```

with

```typescript
const boardContainer = container.querySelector(".relative.border");
```

- [ ] **Step 9: Edit `packages/shikaku/src/components/HUD.tsx`**

Use Edit with `replace_all: true` in order:
- `border-b-2` → `border-b`
- `border-2` → `border`

- [ ] **Step 10: Edit `packages/shikaku/src/components/LevelSelect.tsx`**

Use Edit with `replace_all: true` in order:
- `border-b-2` → `border-b`
- `border-2` → `border`

- [ ] **Step 11: Edit `packages/sokoban/src/SokobanApp.tsx`**

Use Edit with `replace_all: true`:
- `border-4` → `border`

- [ ] **Step 12: Edit `packages/sokoban/src/components/Board.tsx`**

Use Edit with `replace_all: true` in order:
- `border-2` → `border`
- `border-4` → `border`

- [ ] **Step 13: Edit `packages/sokoban/src/components/Controls.tsx`**

Use Edit with `replace_all: true`:
- `border-2` → `border`

- [ ] **Step 14: Edit `packages/sokoban/src/components/HUD.tsx`**

Use Edit with `replace_all: true`:
- `border-b-2` → `border-b`

- [ ] **Step 15: Edit `packages/sokoban/src/components/LevelSelect.tsx`**

Use Edit with `replace_all: true`:
- `border-2` → `border`

- [ ] **Step 16: Edit `packages/sokoban/src/components/WinModal.tsx`**

Use Edit with `replace_all: true`:
- `border-4` → `border`

- [ ] **Step 17: Verify no border-N utilities remain**

Run: `grep -rn "border-4\|border-2\|border-l-4\|border-l-2\|border-r-4\|border-r-2\|border-t-4\|border-t-2\|border-b-4\|border-b-2" packages/*/src --include="*.tsx"`
Expected: zero matches.

- [ ] **Step 18: Run all tests**

Run: `npm run test`
Expected: 135/135 pass.

- [ ] **Step 19: Commit**

```bash
git add packages/about/src packages/pets/src packages/posts/src packages/shell/src packages/shikaku/src packages/sokoban/src
git commit -m "style: thin all borders to 1px hairlines across packages"
```

---

### Task 5: Final verification

**Files:** none modified — verification only.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: clean exit, no errors.

- [ ] **Step 2: Run all tests**

Run: `npm run test`
Expected: 135/135 pass across 23 files.

- [ ] **Step 3: Run shell production build**

Run: `npm run build -w packages/shell`
Expected: build completes, no missing-token warnings, no missing-font warnings.

- [ ] **Step 4: Run all package builds**

Run: `npm run build`
Expected: all packages (`about`, `pets`, `posts`, `shell`, `shikaku`, `sokoban`) build successfully.

- [ ] **Step 5: Verify no remaining shadow or thick-border utilities**

Run:
```bash
grep -rn "shadow-\[\|shadow-2xl\|shadow-lg\|shadow-md\|shadow-sm\|shadow-none\|shadow-inner" packages/*/src --include="*.tsx"
grep -rn "border-4\|border-2\|border-l-4\|border-l-2\|border-r-4\|border-r-2\|border-t-4\|border-t-2\|border-b-4\|border-b-2" packages/*/src --include="*.tsx"
grep -n "VT323\|Press Start 2P" packages/shell/src/index.css
grep -n "text-shadow\|body::after" packages/shell/src/index.css
```
Expected: each grep returns zero matches.

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev`. Open the shell at the Vite dev URL, then:
- Confirm body text renders in Geist Mono (DevTools → Computed → `font-family` should start with `"Geist Mono"`).
- Confirm no scanlines overlay is present (no fixed full-viewport pseudo-element with the diagonal/horizontal stripe pattern).
- Confirm no `box-shadow` on header, panels, buttons (DevTools → Computed → `box-shadow: none`).
- Confirm all visible borders are 1px (DevTools → Computed → `border-*-width: 1px`).
- Confirm no phosphor glow (DevTools → Computed on `body` → `text-shadow: none`).
- Click each matrix item (`#/about`, `#/posts`, `#/pets`, `#/shikaku`, `#/sokoban`); each MFE inherits the same flat mono look.
- Toggle SOUND on, click a matrix item, confirm beep still plays (audio path unaffected).

- [ ] **Step 7: No commit needed**

This task is verification only. If any check fails, return to the relevant prior task and fix before proceeding to ship.

---

## Self-Review

Spec coverage check:
- Goals → fonts swapped (Task 1), borders thinned (Tasks 2 + 4), shadows removed (Tasks 2 + 3), scanlines removed (Task 2), text-shadow removed (Task 1). ✓
- Non-goals → no class renames, no layout changes, no new utilities — confirmed by inspection. ✓
- File-level diff section of spec → token block (Task 1), body block (Task 1), scanlines deletion (Task 2), `.pixel-border`/`.pixel-btn`/`.retro-window`/`.window-header` redefinitions (Task 2), TSX shadow sweep (Task 3), TSX border-N sweep (Task 4). ✓
- Testing & verification → Task 5 covers all verification steps from spec section 4. ✓
- Rollout & migration → branch and commit shape match spec section 5 (one extra commit because shadow + border sweeps were split for reviewability — a strict superset of the spec's 4-commit shape). ✓

Placeholder scan: no TBD/TODO entries, no "implement later", no "similar to Task N" references. Each step has the exact code or command. ✓

Type/symbol consistency: no new symbols introduced — purely CSS values and Tailwind class strings. No risk of cross-task name drift. ✓
