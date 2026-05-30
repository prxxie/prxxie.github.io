# Amber CRT Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the personal portfolio SPA into a retro-futuristic monochrome Amber CRT terminal emulator across all micro-frontends (shell, about, posts, pets, sokoban, shikaku) while removing the `.exe` suffix, styling the blog as amber-on-black, implementing mobile drawers, and restyling the games.

**Architecture:** Use global CSS variables defined in the shell's `index.css` to override Tailwind theme settings. Modify sub-app components to consume these theme styles and replace hardcoded color configurations. Implement drawer controls in the shell layout for mobile responsive layout.

**Tech Stack:** React, Tailwind CSS, TypeScript, Zustand, Vitest

---

## File Structure Changes
- Modify: `packages/shell/src/index.css` — Global CSS variables, CRT overlays, scanlines, animations.
- Modify: `packages/shell/src/App.tsx` — Window header layout, `.exe` removal, mobile drawer integration.
- Modify: `packages/shell/src/components/ConsoleFrame.tsx` — Navbar styles, menu draw.
- Modify: `packages/posts/src/PostsApp.tsx` — CLI interface simulation, markdown reader.
- Modify: `packages/pets/src/PetsApp.tsx` — ASCII bars, target crosshairs, CSS filters.
- Modify: `packages/sokoban/src/components/Board.tsx` — Color mapping.
- Modify: `packages/sokoban/src/components/WinModal.tsx` — Color mapping.
- Modify: `packages/shikaku/src/components/Board.tsx` — Color mapping.
- Modify: `packages/shikaku/src/components/Cell.tsx` — Grid styling.
- Modify: `packages/shikaku/src/components/HUD.tsx` — HUD colors.

---

## Tasks

### Task 1: Centralize Theme Variables & Scanlines
**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Update theme colors & add CRT scanlines**
  Replace root variables and add CSS scanline effects and animations in `packages/shell/src/index.css`.
  ```css
  /* Target: packages/shell/src/index.css */
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
  @import "tailwindcss";

  @theme {
    --font-pixel: "VT323", monospace;
    --font-press: "Press Start 2P", monospace;
    --color-cozy-bg: #000000;
    --color-cozy-text: #FFB000;
    --color-cozy-border: #FFB000;
    --color-cozy-accent: #FFB000;
    --color-cozy-muted: #805800;
    --color-terminal-bg: #050505;
  }

  body {
    background-color: var(--color-cozy-bg);
    color: var(--color-cozy-text);
    font-family: var(--font-pixel);
    font-size: 20px;
    image-rendering: pixelated;
    position: relative;
    overflow-x: hidden;
    text-shadow: 0 0 2px rgba(255, 176, 0, 0.35);
  }

  /* Scanlines Overlay */
  body::after {
    content: " ";
    display: block;
    position: fixed;
    top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, 0.25) 50%
    ), 
    linear-gradient(
      90deg, 
      rgba(255, 176, 0, 0.03), 
      rgba(0, 0, 0, 0.02), 
      rgba(255, 176, 0, 0.03)
    );
    background-size: 100% 4px, 6px 100%;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.85;
  }

  .pixel-border {
    border: 4px solid var(--color-cozy-border);
    box-shadow: 4px 4px 0px var(--color-cozy-muted);
  }

  .pixel-btn {
    border: 3px solid var(--color-cozy-border);
    background-color: #000000;
    padding: 6px 12px;
    font-family: var(--font-press);
    font-size: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 0px var(--color-cozy-muted);
    transition: all 0.15s ease-in-out;
    color: var(--color-cozy-text);
  }

  .pixel-btn:hover, .pixel-btn:focus-visible {
    background-color: var(--color-cozy-text);
    color: #000000;
    box-shadow: 2px 2px 0px var(--color-cozy-border);
  }

  .pixel-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px var(--color-cozy-border);
  }

  .retro-window {
    border: 4px solid var(--color-cozy-border);
    background-color: var(--color-terminal-bg);
    box-shadow: 4px 4px 0px var(--color-cozy-muted);
    display: flex;
    flex-direction: column;
  }

  .window-header {
    background-color: #000000;
    color: var(--color-cozy-text);
    border-bottom: 3px solid var(--color-cozy-border);
    font-family: var(--font-press);
    font-size: 9px;
    padding: 8px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .window-header-accent {
    color: var(--color-cozy-accent);
  }

  .window-body {
    padding: 12px;
  }

  /* Blinking terminal cursor keyframes */
  @keyframes blink {
    50% { opacity: 0; }
  }
  .blink-cursor::after {
    content: " _";
    animation: blink 1s step-start infinite;
  }
  ```

- [ ] **Step 2: Run test suite to verify no syntax compilation failures**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add packages/shell/src/index.css
  git commit -m "style: define central amber crt theme and scanlines"
  ```

---

### Task 2: Window Headers, Suffixes & Responsive Grid Setup
**Files:**
- Modify: `packages/shell/src/App.tsx`
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`

- [ ] **Step 1: Clean window header suffixes & prepare layouts**
  Modify `packages/shell/src/App.tsx` to remove `.EXE` from view window names, configure asymmetric layout spans (`col-span-13` / `col-span-7`), and integrate mobile drawer parameters.
  ```typescript
  // Target: packages/shell/src/App.tsx
  // Replace references of `{tab.toUpperCase()}_VIEW.EXE` with `{tab.toUpperCase()}_VIEW`
  // Replace PET_HUD.EXE with PET_HUD
  // Add drawer state for mobile PET_HUD trigger
  ```
  ```tsx
  // Inside App component:
  const [isPetHudOpen, setIsPetHudOpen] = useState(false);
  ```
  And modify the grid:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-20 gap-6 items-start">
    <div
      ref={windowRef}
      className={`col-span-1 ${tab === "pets" ? "md:col-span-20" : "md:col-span-13"} retro-window`}
    >
      <div className="window-header">
        <span className="flex items-center gap-1">
          <PixelBookIcon className="w-3.5 h-3.5" />
          <span className="window-header-accent">
            {tab.toUpperCase()}_VIEW
          </span>
        </span>
  ...
  ```
  And render a persistent HUD button for mobile:
  ```tsx
  {/* On mobile, render a toggler button fixed to bottom-right */}
  {tab !== "pets" && (
    <button
      onClick={() => setIsPetHudOpen(true)}
      className="md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px] shadow-lg"
    >
      [ PET HUD ]
    </button>
  )}
  ```
  And implement the sliding drawer overlay:
  ```tsx
  {isPetHudOpen && (
    <div className="fixed inset-0 bg-black/75 z-40 md:hidden" onClick={() => setIsPetHudOpen(false)} />
  )}
  <div
    className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col shadow-2xl transition-transform duration-300 md:hidden
      ${isPetHudOpen ? "translate-x-0" : "translate-x-full"}
    `}
  >
    <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2 mb-4">
      <span className="font-press text-[9px] text-cozy-text flex items-center gap-1">
        <PixelPawIcon className="w-3.5 h-3.5" /> PET_HUD
      </span>
      <button
        onClick={() => setIsPetHudOpen(false)}
        className="text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none"
      >
        [X]
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING PET...</div>}>
        <PetsApp usePetStore={usePetStore} />
      </Suspense>
    </div>
  </div>
  ```

- [ ] **Step 2: Clean mobile menu header in ConsoleFrame**
  Modify `packages/shell/src/components/ConsoleFrame.tsx` to remove `.EXE` from `MENU.EXE`. Change hover/active state selectors for the desktop navigation item tabs.
  ```typescript
  // Replace MENU.EXE with MENU
  // Replace hover text styling to match theme-invert
  ```

- [ ] **Step 3: Run unit tests**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/App.tsx packages/shell/src/components/ConsoleFrame.tsx
  git commit -m "feat: remove exe window suffixes and add mobile drawer panel"
  ```

---

### Task 3: Posts CLI Prompt & Markdown Reader Redesign
**Files:**
- Modify: `packages/posts/src/PostsApp.tsx`
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: RESTYLE BLOG post listing with bash prompt & blinking cursors**
  Edit `packages/posts/src/PostsApp.tsx` to render terminal prompt lines and clean up the list layout. Add active states for hover blinking.
  ```tsx
  // Inside packages/posts/src/PostsApp.tsx
  // Replace:
  <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1 flex items-center gap-1">
    <PixelBookIcon className="w-4 h-4 text-cozy-accent" /> BLOG CATALOG
  </h2>
  // With:
  <div className="font-mono text-xs text-cozy-muted mb-2">
    guest@prxxie:~$ <span className="text-cozy-text">ls -l blog/posts/</span>
  </div>
  ```
  Change post items to render raw terminal rows:
  ```tsx
  {postsList.map((post) => (
    <div
      key={post.id}
      onClick={() => setSelectedPost(post.id)}
      className="group font-mono text-sm py-1 cursor-pointer flex justify-between items-center text-cozy-text hover:text-white"
    >
      <span className="flex items-center group-hover:blink-cursor">
        &gt; {post.title.toUpperCase().replace(/[\s,]+/g, "_")}.MD
      </span>
      <span className="text-xs text-cozy-muted font-mono ml-4">
        [{post.date}]
      </span>
    </div>
  ))}
  ```

- [ ] **Step 2: Rewrite markdown reader element layout**
  Replace notebook sheets with a pure dark terminal background reader frame in `packages/posts/src/PostsApp.tsx`.
  ```tsx
  // Replace the .notebook-paper element with a dark console terminal box:
  <div className="bg-[#050505] border-2 border-cozy-border p-6 min-h-[300px] font-mono text-cozy-text relative">
    <h3 className="font-bold border-b border-cozy-border pb-2 mb-2 text-md text-cozy-text uppercase">
      {postContent.title}
    </h3>
    <p className="text-[10px] text-cozy-muted mb-4 font-mono">
      DATE: {postContent.date} | AUTHOR: {postContent.author?.toUpperCase() || "PRXXIE"}
    </p>
    <div
      className="markdown-body text-sm leading-relaxed"
      dangerouslySetInnerHTML={{
        __html: postContent.htmlContent,
      }}
    />
  </div>
  ```

- [ ] **Step 3: Add markdown parser overrides inside index.css**
  Configure the markdown styles in `packages/shell/src/index.css` to be dark-CRT themed.
  ```css
  /* Target: packages/shell/src/index.css */
  /* Remove notebook paper and margin properties, style markdown elements: */
  .markdown-body {
    font-family: var(--font-pixel);
    color: var(--color-cozy-text);
  }
  .markdown-body h1, .markdown-body h2, .markdown-body h3 {
    font-family: var(--font-pixel);
    color: var(--color-cozy-text);
  }
  .markdown-body blockquote {
    border-left: 4px solid var(--color-cozy-muted);
    padding-left: 10px;
    background-color: #0c0c0c;
    color: var(--color-cozy-text);
    font-style: italic;
  }
  .markdown-body th, .markdown-body td {
    border: 1px solid var(--color-cozy-border);
  }
  .markdown-body th {
    background-color: #151515;
    color: var(--color-cozy-text);
  }
  .markdown-body tr:nth-child(even) {
    background-color: #090909;
  }
  .markdown-body code {
    background-color: #101010;
    border: 1px solid var(--color-cozy-muted);
    color: var(--color-cozy-text);
  }
  .markdown-body pre {
    background-color: #0c0c0c;
    border: 1px solid var(--color-cozy-muted);
  }
  ```

- [ ] **Step 4: Run unit tests**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/posts/src/PostsApp.tsx packages/shell/src/index.css
  git commit -m "feat: convert posts catalog to terminal rows and restyle markdown reader to dark CRT"
  ```

---

### Task 4: Pets HUD ASCII Status Indicators & Crosshair Decorations
**Files:**
- Modify: `packages/pets/src/PetsApp.tsx`

- [ ] **Step 1: Write ASCII indicator block generator**
  Modify `packages/pets/src/PetsApp.tsx` to add helper logic to construct ASCII progress bars.
  ```typescript
  const getAsciiBar = (value: number): string => {
    const totalSegments = 12;
    const filledSegments = Math.round((value / 100) * totalSegments);
    const emptySegments = totalSegments - filledSegments;
    return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
  };
  ```

- [ ] **Step 2: Render ASCII status labels**
  Replace progress elements inside `PetsApp.tsx` with ASCII labels:
  ```tsx
  {usePetStore && (
    <div className="w-full flex flex-col gap-2 text-xs font-mono mb-4 text-cozy-text">
      <div className="flex justify-between items-center">
        <span>HUNGER:</span>
        <span className="font-mono">{getAsciiBar(hunger)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span>HAPPINESS:</span>
        <span className="font-mono">{getAsciiBar(happiness)}</span>
      </div>
    </div>
  )}
  ```

- [ ] **Step 3: Modify sprite viewer box (Filter & Crosshairs)**
  Apply the target locking `+` crosshairs and sepia amber-glow color filter around the sprite viewport.
  ```tsx
  <div
    className={`p-4 border-4 border-cozy-border bg-black rounded flex items-center justify-center w-36 h-36 relative overflow-hidden`}
  >
    {/* Corner Crosshairs */}
    <span className="absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
    <span className="absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>
    <span className="absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
    <span className="absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>

    <div style={{ filter: "sepia(1) saturate(5) hue-rotate(5deg) brightness(1.2)" }}>
      {renderPetSprite()}
    </div>
    
    {isSleeping && (
      <span className="absolute top-2 right-2 text-cozy-text font-press text-[8px] animate-pulse">
        ZZZ...
      </span>
    )}
  </div>
  ```

- [ ] **Step 4: Update action buttons color scheme**
  Modify FEED, PLAY, and WAKE button classes to map to CRT theme-inverts. Ensure button labels are uppercase.

- [ ] **Step 5: Run tests**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add packages/pets/src/PetsApp.tsx
  git commit -m "feat: implement ASCII status bars and tracking crosshairs in PET_HUD"
  ```

---

### Task 5: Gameplay Conversion (Sokoban & Shikaku)
**Files:**
- Modify: `packages/sokoban/src/components/Board.tsx`
- Modify: `packages/sokoban/src/components/WinModal.tsx`
- Modify: `packages/shikaku/src/components/Board.tsx`
- Modify: `packages/shikaku/src/components/Cell.tsx`
- Modify: `packages/shikaku/src/components/HUD.tsx`

- [ ] **Step 1: Convert Sokoban colors to monochrome**
  Edit `packages/sokoban/src/components/Board.tsx` to map brick textures and cell spaces:
  - Board border/bg: `border-cozy-border bg-[#050505]`
  - Wall: `border-[#FFB000] bg-[#805800]`
  - Floor: `bg-[#000000]`
  - Target: Center Amber indicator dot `bg-[#FFB000]`
  - Box (on target or regular):
    ```tsx
    className={`w-full h-full border-2 border-cozy-border flex items-center justify-center font-bold font-press text-[8px] transition-colors relative
      ${isOnTarget ? "bg-[#805800] text-black" : "bg-black text-[#FFB000]"}
    `}
    ```
  - Player: `bg-[#FFB000] border-cozy-border`

- [ ] **Step 2: Restyle Sokoban WinModal**
  Update `packages/sokoban/src/components/WinModal.tsx` text labels from `#CC6666` to `text-cozy-text` (amber) with `#050505` window backgrounds.

- [ ] **Step 3: Convert Shikaku Board grids and regions**
  Edit `packages/shikaku/src/components/Board.tsx`:
  - Board border/bg: `border-cozy-border bg-black`
  - Active drag rect: `border-dashed border-[#FFB000] bg-[#FFB000]/15`
  - Placed region background maps to transparent amber shades:
    ```tsx
    style={{
      ...
      border: "2px solid #FFB000",
      backgroundColor: "rgba(255, 176, 0, 0.15)",
      color: "#FFB000"
    }}
    ```
  - Win Modal overlay: `bg-black/95 text-cozy-text`

- [ ] **Step 4: Update Shikaku Cell background colors**
  Edit `packages/shikaku/src/components/Cell.tsx` cell default color classes:
  - Default: `border-cozy-muted/30 bg-black text-cozy-text`

- [ ] **Step 5: Restyle Shikaku HUD action panels**
  Edit `packages/shikaku/src/components/HUD.tsx` text details and progress bars to use amber CRT color variables instead of pastel greens/reds.

- [ ] **Step 6: Run full project tests**
  Run: `npm test`
  Expected: PASS

- [ ] **Step 7: Commit**
  ```bash
  git add packages/sokoban/src/components/Board.tsx packages/sokoban/src/components/WinModal.tsx packages/shikaku/src/components/Board.tsx packages/shikaku/src/components/Cell.tsx packages/shikaku/src/components/HUD.tsx
  git commit -m "feat: complete Sokoban and Shikaku gameplay conversion to monochrome Amber CRT"
  ```
