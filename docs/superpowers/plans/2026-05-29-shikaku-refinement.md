# Shikaku Difficulty curve and Fullscreen Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Shikaku level progression curve, prevent viewport layout overflows on small displays, change the shell page background to oklch(96.8% 0.007 247.896), and support browser fullscreen mode on the retro window.

**Architecture:** Levels list is reordered and expanded to begin with 4x4 and 5x5 grids. Sizing is made viewport-height/width responsive using dynamic CSS limits. Fullscreen uses HTML5 `requestFullscreen()` toggled from the shell window header.

**Tech Stack:** React, CSS Grid, Tailwind CSS, HTML5 Fullscreen API.

---

### Task 1: Re-order Levels Progression Meta

**Files:**
* Modify: `packages/shikaku/src/levels.js`
* Test: `packages/shikaku/src/levels.test.js`

- [ ] **Step 1: Reorganize levels list in `levels.js`**
  Modify `packages/shikaku/src/levels.js` to define a progressive list of levels:
  - Level 1: 4x4 grid (tutorial, four 2x2 squares).
  - Level 2: 5x5 grid (five 1x5 columns).
  - Level 3: 6x6 grid (four 3x3 squares of value 9).
  - Level 4: 6x6 grid (six 2x3 rectangles).
  - Level 5: 6x6 grid (asymmetrical 4s, 8s, 12s).
  - Level 6: 6x6 grid (original easy-1).
  - Levels 7 to 13: 8x8 grids (Medium difficulty).
  - Levels 14 to 20: 10x10 grids (Hard difficulty).
  Verify that we have exactly 20 levels.

- [ ] **Step 2: Run level solver tests**
  Run: `npx vitest run packages/shikaku/src/levels.test.js`
  Expected: PASS (checks that all 20 levels solve successfully under the backtracking engine).

- [ ] **Step 3: Commit levels progression**
  ```bash
  git add packages/shikaku/src/levels.js
  git commit -m "feat(shikaku): restructure levels list to establish smooth progressive difficulty"
  ```

---

### Task 2: Responsive Grid Board Container Sizing

**Files:**
* Modify: `packages/shikaku/src/components/Board.jsx`

- [ ] **Step 1: Refactor Board sizing inside `Board.jsx`**
  Modify `packages/shikaku/src/components/Board.jsx` line 77 to dynamically restrict max-width and max-height based on browser viewport size (using `vmin` or viewport functions):
  ```javascript
  // Replace current styling:
  className="relative border-4 border-[#2b4c3f] bg-[#2b4c3f] overflow-hidden select-none touch-none w-full max-w-[400px] aspect-square mx-auto transition-transform"
  // with:
  className="relative border-4 border-[#2b4c3f] bg-[#2b4c3f] overflow-hidden select-none touch-none w-full aspect-square mx-auto transition-transform"
  style={{ 
    touchAction: 'none',
    maxWidth: 'min(85vw, 60vh, 400px)',
    maxHeight: 'min(85vw, 60vh, 400px)'
  }}
  ```

- [ ] **Step 2: Run test suite**
  Run: `npm test`
  Expected: PASS.

- [ ] **Step 3: Commit board styling**
  ```bash
  git add packages/shikaku/src/components/Board.jsx
  git commit -m "style(shikaku): scale game board container dynamically to fit display sizes without overflow"
  ```

---

### Task 3: Shell Background Variable Styling

**Files:**
* Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Update cozy-bg color**
  Modify `packages/shell/src/index.css` line 7 to update `--color-cozy-bg`:
  ```css
  --color-cozy-bg: oklch(96.8% 0.007 247.896);
  ```

- [ ] **Step 2: Run test suite**
  Run: `npm test`
  Expected: PASS.

- [ ] **Step 3: Commit styles**
  ```bash
  git add packages/shell/src/index.css
  git commit -m "style(shell): change global background color to soft oklch theme"
  ```

---

### Task 4: Fullscreen Toggle Support in Retro Window Header

**Files:**
* Modify: `packages/shell/src/App.jsx`

- [ ] **Step 1: Implement fullscreen toggle in `App.jsx`**
  Modify `packages/shell/src/App.jsx` to:
  1. Add a `windowRef` pointing to the `.retro-window` DOM node.
  2. Maintain a state state variable `isFullscreen`.
  3. Add a helper function `toggleFullscreen` calling `requestFullscreen()` or `exitFullscreen()`.
  4. Attach a maximize button `[⛶]` inside the window header next to `[X]`.
  5. Add a `useEffect` listening to `'fullscreenchange'` to keep `isFullscreen` state synced.

  Example header layout change:
  ```javascript
  const windowRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!windowRef.current) return;
    if (!document.fullscreenElement) {
      windowRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  ```

  Inside return block:
  ```html
  <div ref={windowRef} className={`col-span-1 ${tab === 'pets' ? 'md:col-span-3' : 'md:col-span-2'} retro-window`}>
    <div className="window-header">
      <span>📖 <span className="window-header-accent">{tab.toUpperCase()}_VIEW.EXE</span></span>
      <div className="flex gap-2 items-center">
        <button onClick={toggleFullscreen} className="text-cozy-accent font-bold cursor-pointer hover:underline" aria-label="Toggle Fullscreen">
          {isFullscreen ? '[🗗]' : '[⛶]'}
        </button>
        <span className="text-cozy-accent font-bold cursor-pointer">[X]</span>
      </div>
    </div>
  ```

- [ ] **Step 2: Run test suite**
  Run: `npm test`
  Expected: PASS.

- [ ] **Step 3: Commit fullscreen logic**
  ```bash
  git add packages/shell/src/App.jsx
  git commit -m "feat(shell): add HTML5 fullscreen maximize button in retro window header"
  ```

---

### Task 5: Production Build Verification

**Files:**
* None.

- [ ] **Step 1: Run static assembly builds**
  Run: `npm run build:static`
  Expected: Compiles cleanly.

- [ ] **Step 2: Commit final integrations**
  ```bash
  git add .
  git commit -m "chore(shikaku): complete game difficulty restructuring and fullscreen capabilities"
  ```
