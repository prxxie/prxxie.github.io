# Flat Mono Redesign — Design Spec

**Date:** 2026-05-30
**Status:** Draft
**Owner:** chungpt

## Goals & non-goals

**Goals.** Replace the current CRT pixel aesthetic with a flat, monospaced terminal look across all packages.

- Single typeface: Geist Mono (replaces both VT323 body and Press Start 2P display).
- 1px hairline borders everywhere (replaces 2px / 3px / 4px values).
- No `box-shadow` on any base component.
- No phosphor `text-shadow` glow on body text.
- No scanlines overlay (`body::after`).
- Color palette unchanged — amber (`#FFB000`) on black stays.

**Non-goals.**

- No layout changes. Grid columns, flex stacks, panel arrangements stay as-is.
- No utility class renames. `pixel-btn`, `retro-window`, `window-header`, `font-press`, `font-pixel` stay valid as identifiers.
- No new utilities or component primitives.
- No package restructure. No router/state/test framework changes.
- No dark/light theming infrastructure — palette is single-mode.

## Architecture

The whole site reads styles from one file: `packages/shell/src/index.css`. Every MFE imports it via `import "../../shell/src/index.css"` from its `main.tsx`. Token + class edits in that one file propagate site-wide on rebuild.

The change has two layers:

1. **CSS edits in `packages/shell/src/index.css`.** Token swap (font), base block edits (font-size, drop scanlines, drop text-shadow), class definition edits (border widths, drop shadows).
2. **TSX inline override sweep.** Tailwind utilities like `border-4`, `border-l-2`, `shadow-2xl`, `shadow-[…]` hard-code values that escape the CSS class layer. They need a mechanical grep-and-edit pass across `packages/{shell,pets,posts,about,shikaku,sokoban}/src/**/*.tsx`.

Token-aliasing both old font variables (`--font-pixel` and `--font-press`) to Geist Mono means existing class strings (`font-press`, `font-pixel`) keep working unchanged — no font-related TSX edits.

## File-level diff

### `packages/shell/src/index.css`

**Top of file (lines 1–13):** swap font import and tokens.

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

**`body` block (lines 15–24):** drop `text-shadow` and `image-rendering`. Reduce font-size from 20px to 14px (Geist Mono renders larger than VT323 at the same px value).

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

**Delete lines 26–46 entirely:** the `body::after` scanlines overlay block.

**Class redefinitions (lines 48–102):**

```css
.pixel-border {
  border: 1px solid var(--color-cozy-border);
}

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

Other blocks in `index.css` (`.markdown-body` table/code/blockquote borders, Prism token colors, slideIn/fade-in keyframes, fullscreen handling, focus-visible outline, prefers-reduced-motion) stay unchanged. The `.markdown-body` `border: 1px solid var(--color-cozy-border)` lines already match the new system.

### TSX inline override sweep

Run grep across all packages and remove the trailing weight digit from border utilities and remove shadow utilities entirely:

| Find | Replace |
|---|---|
| `border-4` | `border` |
| `border-l-4` | `border-l` |
| `border-r-4` | `border-r` |
| `border-t-4` | `border-t` |
| `border-b-4` | `border-b` |
| `border-2` | `border` |
| `border-l-2` | `border-l` |
| `border-r-2` | `border-r` |
| `border-t-2` | `border-t` |
| `border-b-2` | `border-b` |
| `shadow-[…]` (any `shadow-[*]`) | remove |
| `shadow-2xl`, `shadow-lg`, `shadow-md`, `shadow-sm`, `shadow-none` | remove |

Files known to contain these (from grep): `packages/shell/src/{App.tsx, components/ConsoleFrame.tsx, components/MatrixMenu.tsx, components/HomeDashboard.tsx, components/StatsTelemetry.tsx}`, `packages/pets/src/PetsApp.tsx`, `packages/posts/src/PostsApp.tsx`, `packages/about/src/AboutApp.tsx`, `packages/shikaku/src/{ShikakuApp.tsx, components/Board.tsx, components/Cell.tsx, components/HUD.tsx, components/LevelSelect.tsx}`, `packages/sokoban/src/{SokobanApp.tsx, components/HUD.tsx}`.

`border-dashed` stays — it's a style, not a weight.

## Testing & verification

**Existing tests.** Tests assert text content, ARIA labels, and class-string presence — not computed border widths or font families. Token aliasing keeps `font-press` and `font-pixel` Tailwind utilities resolvable, so any test selecting by class name continues to match. Expected outcome: 135/135 still passes after edits.

If a test asserts on a class that gets stripped (e.g., `border-4`, `shadow-2xl`), update the assertion in the same commit that strips the class.

**Verification steps.**

1. `npm run test` — all tests pass.
2. `npm run typecheck` — clean.
3. `npm run build -w packages/shell` — production build succeeds, no missing-token warnings.
4. `npm run dev`, manual smoke at `/`:
   - Geist Mono renders on body, headings, and buttons (inspect computed `font-family`).
   - No scanlines visible (no overlay element on top of viewport).
   - No box-shadows on buttons, panels, or window headers.
   - All visible borders are 1px (inspect computed `border-width`).
   - No phosphor glow on text (computed `text-shadow: none` on body).
5. Click through `#/about`, `#/posts`, `#/pets`, `#/shikaku`, `#/sokoban` and confirm each MFE inherits the new styles (since they import shell's `index.css`).

**Risk.** Geist Mono is delivered from Google Fonts via the same channel as the previous fonts, so no new failure mode. Fallback chain `ui-monospace, monospace` covers offline rendering.

## Rollout & migration

**Branch.** Continue on `feat/amber-crt-redesign` (open PR #3) — these edits are tightly coupled to the redesign just shipped, and stacking commits keeps the visual evolution reviewable as one unit.

**Commit shape.**

1. `style: replace pixel fonts with Geist Mono and remove text-shadow glow`
2. `style: drop scanlines overlay and box-shadows from base components`
3. `style: thin all borders to 1px hairlines across packages`
4. `chore: sweep inline border-N and shadow-* utilities in TSX`

**Rollback.** Single CSS file plus mechanical TSX class edits — `git revert` per commit cleanly restores the prior look. No data migration. No state changes. No test rewrites expected beyond inline class-string updates if any test happens to assert a stripped utility.
