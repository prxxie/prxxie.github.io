# Specification: Shikaku Difficulty Progression & Fullscreen Support

This specification details changes to correct the level difficulty progression curve, fit the game board container dynamically to the browser viewport, update the page background color, and implement native browser fullscreen window capabilities.

---

## 1. Difficulty Progression Redesign

Levels in `packages/shikaku/src/levels.js` are reorganized to follow a progressive increase in board dimensions, shape factors, and symmetry.

### Level List Configurations
1. **Level 1 (4x4)**: Four $2\times2$ squares (value 4). Very simple, teaches basic grid rules.
2. **Level 2 (5x5)**: Five $1\times5$ columns (value 5). Teaches rectangular draws.
3. **Level 3 (6x6)**: Four $3\times3$ squares (value 9, original Level 2).
4. **Level 4 (6x6)**: Six $2\times3$ rectangles (value 6).
5. **Level 5 (6x6)**: Combination of 4s, 8s, and 12s (original Level 3).
6. **Level 6 (6x6)**: original Level 1.
7. **Levels 7 to 13 (8x8)**: Medium difficulty levels with a blend of asymmetrical divisions.
8. **Levels 14 to 20 (10x10)**: Hard difficulty levels with complex factorizations (e.g. 25, 16, 10).

---

## 2. Dynamic Container Sizing

To prevent vertical viewport overflows on small touch screens and short displays, the grid board container is scaled relative to the viewport minimum (`vmin`) using Tailwind CSS styles or inline styles.

### Constraints in `Board.jsx`
* The outer board container will use:
  ```css
  max-width: min(85vw, 65vh, 400px);
  max-height: min(85vw, 65vh, 400px);
  ```
* This guarantees that even in landscape mobile viewports, the board fits vertically alongside the HUD and back buttons.

---

## 3. Visual Background Update

The global background variable `--color-cozy-bg` inside the host stylesheet `packages/shell/src/index.css` is updated:
```css
--color-cozy-bg: oklch(96.8% 0.007 247.896);
```
This changes the page color to a soft, cozy light-blue hue.

---

## 4. Native Browser Fullscreen

We will add a maximize button `[⛶]` inside the retro window header in `packages/shell/src/App.jsx`.

### Fullscreen Logic
* A reference (`useRef`) is attached to the `.retro-window` container.
* Clicking `[⛶]` checks:
  * If `document.fullscreenElement` is null, it requests fullscreen: `windowElement.requestFullscreen()`.
  * If `document.fullscreenElement` is active, it exits: `document.exitFullscreen()`.
* An event listener for `'fullscreenchange'` is added to track when browser fullscreen changes (e.g., when the user presses `Esc`), updating React state to render the correct fullscreen/minimize icon.
