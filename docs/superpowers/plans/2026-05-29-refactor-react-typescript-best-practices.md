# React & TypeScript Refactoring & UI/UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Cozy OS monorepo to remove unused dependencies, enforce TypeScript safety, implement autoplay-safe audio synth initialization, add CSS rules for keyboard focus and motion accessibility, fix text contrast, and replace native emojis with custom pixel-art SVGs.

**Architecture:** We will clean up package dependencies, unify MFE type shapes, inject standard/lazy AudioContext logic, enhance global stylesheet attributes, and replace unicode emojis in components with local SVG elements for browser visual consistency.

**Tech Stack:** React 18, TypeScript, Zustand 4, Vitest, Tailwind CSS v4

---

### Task 1: Clean Up Dead Dependencies

**Files:**
- Modify: `packages/shell/package.json`

- [ ] **Step 1: Remove `react-router-dom` from dependencies**
  Edit `packages/shell/package.json` to remove the unused `"react-router-dom": "^6.23.1"` line.
- [ ] **Step 2: Run npm install to update node_modules and package-lock.json**
  Run: `npm install`
  Expected: Command finishes successfully and removes unused dependencies.
- [ ] **Step 3: Verify the application still builds**
  Run: `npm run build`
  Expected: Build succeeds.
- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/package.json package-lock.json
  git commit -m "refactor: remove unused react-router-dom dependency from shell MFE"
  ```

---

### Task 2: Align and Unify PetState Store Types

**Files:**
- Modify: `packages/shell/src/store/petStore.ts`
- Modify: `packages/pets/src/PetsApp.tsx`
- Test: `packages/shell/src/store/petStore.test.ts`

- [ ] **Step 1: Synchronize PetState type definition**
  Ensure the host's `petStore.ts` types align with `PetsApp.tsx`.
  Modify `packages/shell/src/store/petStore.ts` to export standard interface `PetState`:
  ```typescript
  import { create } from "zustand";
  import type { PetStatus } from "../types";

  // Explicit PetState definition
  export interface PetState {
    hunger: number;
    happiness: number;
    status: PetStatus;
    isSleeping: boolean;
    feed: () => void;
    play: () => void;
    toggleSleep: () => void;
    setStatus: (status: PetStatus) => void;
    tick: () => void;
  }
  ```
- [ ] **Step 2: Update local state types in `packages/pets/src/PetsApp.tsx`**
  Modify the `PetState` definition in `packages/pets/src/PetsApp.tsx` to include the `tick` signature so that the local fallback store matches the host store's interface signature:
  ```typescript
  interface PetState {
    hunger: number;
    happiness: number;
    status: PetStatus;
    isSleeping: boolean;
    feed: () => void;
    play: () => void;
    toggleSleep: () => void;
    setStatus: (status: PetStatus) => void;
    tick?: () => void; // Optional fallback tick
  }
  ```
- [ ] **Step 3: Run Vitest to check petStore tests**
  Run: `npx vitest run packages/shell/src/store/petStore.test.ts`
  Expected: All 6 tests pass.
- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/store/petStore.ts packages/pets/src/PetsApp.tsx
  git commit -m "refactor: unify PetState type definitions across host and pets MFE"
  ```

---

### Task 3: Secure LocalStorage Parsing in Shikaku

**Files:**
- Modify: `packages/shikaku/src/store/useShikakuStore.ts`
- Test: `packages/shikaku/src/store/useShikakuStore.test.ts`

- [ ] **Step 1: Write safe localStorage retrieval and parsing**
  Modify `packages/shikaku/src/store/useShikakuStore.ts:67-78` to validate parsing structure instead of casting directly with any:
  ```typescript
    loadSave: () => {
      try {
        const saved = localStorage.getItem("cozy_os_shikaku_save");
        if (saved) {
          const parsed = JSON.parse(saved) as unknown;
          if (parsed && typeof parsed === "object" && "completed" in parsed) {
            const completed = (parsed as { completed: CompletedLevels }).completed;
            set({ completedLevels: completed || {} });
          }
        }
      } catch (e) {
        console.error("Failed to load save state", e);
      }
    },
  ```
- [ ] **Step 2: Verify game store tests are green**
  Run: `npx vitest run packages/shikaku/src/store/useShikakuStore.test.ts`
  Expected: All 10 tests pass.
- [ ] **Step 3: Commit**
  ```bash
  git add packages/shikaku/src/store/useShikakuStore.ts
  git commit -m "refactor: enforce safe JSON parsing for Shikaku save-states"
  ```

---

### Task 4: Make Synth Audio Initialization Lazy & Autoplay-Safe

**Files:**
- Modify: `packages/shikaku/src/engine/synth.ts`
- Test: `packages/shikaku/src/engine/synth.test.ts`

- [ ] **Step 1: Refactor `synth.ts` to defer AudioContext instantiation**
  Modify `packages/shikaku/src/engine/synth.ts` to instantiate `AudioContext` only on user interaction / note playback:
  ```typescript
  class RetroSynth {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    private getContext(): AudioContext | null {
      if (this.isMuted) return null;
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch((err) => console.warn("Failed to resume AudioContext:", err));
      }
      return this.ctx;
    }

    setMute(mute: boolean): void {
      this.isMuted = mute;
      if (mute && this.ctx) {
        this.ctx.close().catch(() => {});
        this.ctx = null;
      }
    }

    playTone(freq: number, duration: number, type: OscillatorType = "sine"): void {
      const context = this.getContext();
      if (!context) return;

      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, context.currentTime);

      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(context.currentTime + duration);
    }

    playClick(): void {
      this.playTone(150, 0.05, "triangle");
    }

    playPlace(): void {
      this.playTone(440, 0.1, "sine");
    }

    playError(): void {
      this.playTone(100, 0.2, "sawtooth");
    }

    playWin(): void {
      const context = this.getContext();
      if (!context) return;
      const now = context.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.03, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.15);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.15);
      });
    }
  }

  export const synth = new RetroSynth();
  ```
- [ ] **Step 2: Run synth engine tests**
  Run: `npx vitest run packages/shikaku/src/engine/synth.test.ts`
  Expected: All 7 tests pass.
- [ ] **Step 3: Commit**
  ```bash
  git add packages/shikaku/src/engine/synth.ts
  git commit -m "refactor: defer AudioContext creation in RetroSynth to support autoplay policies"
  ```

---

### Task 5: CSS Accessibility Rules (Focus Rings & Reduced Motion)

**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Add keyboard focus-visible custom outline style**
  Modify `packages/shell/src/index.css` to add the custom dashed focus-visible rings:
  ```css
  button:focus-visible,
  [role="button"]:focus-visible,
  .pixel-btn:focus-visible {
    outline: 3px dashed var(--color-cozy-accent);
    outline-offset: 2px;
  }
  ```
- [ ] **Step 2: Add prefers-reduced-motion media query**
  At the end of `packages/shell/src/index.css`, append:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animate-bounce,
    .animate-shake,
    .transition-transform,
    .pixel-btn {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
  ```
- [ ] **Step 3: Commit**
  ```bash
  git add packages/shell/src/index.css
  git commit -m "style: add custom focus-visible ring styles and prefers-reduced-motion safety"
  ```

---

### Task 6: Contrast Improvement in Level Selection

**Files:**
- Modify: `packages/shikaku/src/components/LevelSelect.tsx`

- [ ] **Step 1: Change board dimensions text color from slate-500 to slate-700**
  Modify `packages/shikaku/src/components/LevelSelect.tsx:40` to use `text-slate-700` instead of `text-slate-500`:
  ```tsx
  <span className="text-[6px] mt-1 text-slate-700 font-sans">
    {lvl.width}x{lvl.height}
  </span>
  ```
- [ ] **Step 2: Run linter and tests**
  Run: `npm run lint && npm run typecheck`
  Expected: No errors.
- [ ] **Step 3: Commit**
  ```bash
  git add packages/shikaku/src/components/LevelSelect.tsx
  git commit -m "style: improve text contrast in LevelSelect from slate-500 to slate-700"
  ```

---

### Task 7: Replace Emojis in Host Shell layout

**Files:**
- Create: `packages/shell/src/components/Icons.tsx`
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shell/src/App.tsx`
- Test: `packages/shell/src/components/ConsoleFrame.test.tsx`
- Test: `packages/shell/src/App.test.tsx`

- [ ] **Step 1: Create shared SVG retro icon definitions in host shell**
  Create `packages/shell/src/components/Icons.tsx` with folder, view/book, and paw icons:
  ```tsx
  import React from "react";

  export const PixelFolderIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M1 3h4l2 2h8v8H1V3z" />
      <line x1="1" y1="5" x2="15" y2="5" />
    </svg>
  );

  export const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M1 2h6v11H1V2z M9 2h6v11H9V2z" />
      <line x1="3" y1="5" x2="5" y2="5" />
      <line x1="3" y1="8" x2="5" y2="8" />
      <line x1="11" y1="5" x2="13" y2="5" />
      <line x1="11" y1="8" x2="13" y2="8" />
    </svg>
  );

  export const PixelPawIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="7" y="7" width="2" height="3" />
      <rect x="4" y="9" width="2" height="2" />
      <rect x="10" y="9" width="2" height="2" />
      <rect x="5" y="4" width="2" height="2" />
      <rect x="9" y="4" width="2" height="2" />
    </svg>
  );
  ```
- [ ] **Step 2: Replace emojis in `ConsoleFrame.tsx`**
  Modify `packages/shell/src/components/ConsoleFrame.tsx` to import and render `PixelFolderIcon`:
  ```tsx
  import { PixelFolderIcon } from "./Icons";
  // Replace: 📂 MENU.EXE
  <span className="font-press text-[10px] text-cozy-accent flex items-center gap-1">
    <PixelFolderIcon className="w-3.5 h-3.5" /> MENU.EXE
  </span>
  ```
- [ ] **Step 3: Replace emojis in `App.tsx`**
  Modify `packages/shell/src/App.tsx` to import and render `PixelBookIcon` and `PixelPawIcon`:
  ```tsx
  import { PixelBookIcon, PixelPawIcon } from "./components/Icons";
  // Replace: 📖 {tab.toUpperCase()}_VIEW.EXE
  <span>
    <PixelBookIcon className="w-3.5 h-3.5 inline mr-1" />
    <span className="window-header-accent">
      {tab.toUpperCase()}_VIEW.EXE
    </span>
  </span>

  // Replace: 🐾 PET_HUD.EXE
  <span>
    <PixelPawIcon className="w-3.5 h-3.5 inline mr-1" />
    <span className="window-header-accent">PET_HUD.EXE</span>
  </span>
  ```
- [ ] **Step 4: Verify test suites in shell**
  Run: `npx vitest run packages/shell/src/components/ConsoleFrame.test.tsx` and `npx vitest run packages/shell/src/App.test.tsx`
  Expected: All tests pass.
- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/components/Icons.tsx packages/shell/src/components/ConsoleFrame.tsx packages/shell/src/App.tsx
  git commit -m "refactor: replace system emojis in shell components with custom retro inline SVGs"
  ```

---

### Task 8: Replace Emojis in About MFE

**Files:**
- Create: `packages/about/src/Icons.tsx`
- Modify: `packages/about/src/AboutApp.tsx`

- [ ] **Step 1: Create local folder and back icons in About app**
  Create `packages/about/src/Icons.tsx`:
  ```tsx
  import React from "react";

  export const PixelFolderIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M1 3h4l2 2h8v8H1V3z" />
      <line x1="1" y1="5" x2="15" y2="5" />
    </svg>
  );

  export const PixelBackIcon = ({ className = "w-3 h-3 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 8 8" fill="currentColor">
      <path d="M4 1L1 4l3 3V5h3V3H4V1z" />
    </svg>
  );

  export const PixelBioIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <line x1="5" y1="6" x2="11" y2="6" />
      <line x1="5" y1="9" x2="11" y2="9" />
    </svg>
  );
  ```
- [ ] **Step 2: Replace emojis in `AboutApp.tsx`**
  Modify `packages/about/src/AboutApp.tsx` to render the newly created SVGs:
  - Replace `🗄️ BIO DIRECTORY` with `<PixelBioIcon className="w-4 h-4 mr-1 text-cozy-accent" /> BIO DIRECTORY`.
  - Replace `📁 [BIO]` and `📁 [SKILLS]` with `<PixelFolderIcon className="w-4 h-4 mr-2" /> [BIO]` / `[SKILLS]`.
  - Replace `🔙 BACK` with `<PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK`.
- [ ] **Step 3: Run typescript compiler dry-run**
  Run: `npm run typecheck`
  Expected: Passes with no errors.
- [ ] **Step 4: Commit**
  ```bash
  git add packages/about/src/Icons.tsx packages/about/src/AboutApp.tsx
  git commit -m "refactor: replace system emojis in about MFE with custom retro inline SVGs"
  ```

---

### Task 9: Replace Emojis in Posts MFE

**Files:**
- Create: `packages/posts/src/Icons.tsx`
- Modify: `packages/posts/src/PostsApp.tsx`
- Test: `packages/posts/src/PostsApp.test.tsx`

- [ ] **Step 1: Create local catalog icons in Posts app**
  Create `packages/posts/src/Icons.tsx`:
  ```tsx
  import React from "react";

  export const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M1 2h6v11H1V2z M9 2h6v11H9V2z" />
      <line x1="3" y1="5" x2="5" y2="5" />
      <line x1="3" y1="8" x2="5" y2="8" />
      <line x1="11" y1="5" x2="13" y2="5" />
      <line x1="11" y1="8" x2="13" y2="8" />
    </svg>
  );

  export const PixelScrollIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M3 2h10v12H3V2z" />
      <line x1="6" y1="5" x2="10" y2="5" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="6" y1="11" x2="10" y2="11" />
    </svg>
  );

  export const PixelBackIcon = ({ className = "w-3 h-3 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 8 8" fill="currentColor">
      <path d="M4 1L1 4l3 3V5h3V3H4V1z" />
    </svg>
  );
  ```
- [ ] **Step 2: Replace emojis in `PostsApp.tsx`**
  Modify `packages/posts/src/PostsApp.tsx` to render the newly created SVGs:
  - Replace `📚 BLOG CATALOG` with `<PixelBookIcon className="w-4 h-4 mr-1 text-cozy-accent" /> BLOG CATALOG`.
  - Replace `📜 {post.title}` with `<PixelScrollIcon className="w-4 h-4 mr-2" /> {post.title}`.
  - Replace `🔙 BACK` with `<PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK`.
- [ ] **Step 3: Verify tests pass**
  Run: `npx vitest run packages/posts/src/PostsApp.test.tsx`
  Expected: All 4 tests pass.
- [ ] **Step 4: Commit**
  ```bash
  git add packages/posts/src/Icons.tsx packages/posts/src/PostsApp.tsx
  git commit -m "refactor: replace system emojis in posts MFE with custom retro inline SVGs"
  ```

---

### Task 10: Replace Emojis in Pets MFE

**Files:**
- Create: `packages/pets/src/Icons.tsx`
- Modify: `packages/pets/src/PetsApp.tsx`

- [ ] **Step 1: Create local pet actions icons in Pets app**
  Create `packages/pets/src/Icons.tsx`:
  ```tsx
  import React from "react";

  export const PixelChickenIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="5" y="4" width="6" height="6" />
      <rect x="4" y="5" width="8" height="4" />
      <rect x="8" y="10" width="2" height="3" />
      <rect x="7" y="12" width="4" height="2" />
    </svg>
  );

  export const PixelBearIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="3" height="3" />
      <rect x="10" y="3" width="3" height="3" />
      <rect x="4" y="5" width="8" height="8" />
      <rect x="6" y="8" width="1" height="1" fill="#fff" />
      <rect x="9" y="8" width="1" height="1" fill="#fff" />
      <rect x="7" y="10" width="2" height="1" />
    </svg>
  );

  export const PixelMoonIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="6" y="2" width="4" height="2" />
      <rect x="4" y="4" width="4" height="2" />
      <rect x="3" y="6" width="3" height="4" />
      <rect x="4" y="10" width="4" height="2" />
      <rect x="6" y="12" width="4" height="2" />
    </svg>
  );

  export const PixelSunIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="6" y="6" width="4" height="4" />
      <rect x="7" y="2" width="2" height="2" />
      <rect x="7" y="12" width="2" height="2" />
      <rect x="2" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
    </svg>
  );

  export const PixelHeartIcon = ({ className = "w-4 h-4 inline-block" }): React.ReactElement => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="3" height="3" />
      <rect x="10" y="3" width="3" height="3" />
      <rect x="2" y="6" width="12" height="4" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
    </svg>
  );
  ```
- [ ] **Step 2: Replace emojis in `PetsApp.tsx`**
  Modify `packages/pets/src/PetsApp.tsx` to render the newly created SVGs:
  - Replace `🍔 HNG` with `<PixelChickenIcon className="w-3.5 h-3.5 mr-1" /> HNG`.
  - Replace `💖 HPP` with `<PixelHeartIcon className="w-3.5 h-3.5 mr-1" /> HPP`.
  - Replace `🍔 HUNGER` with `<span className="flex items-center gap-1"><PixelChickenIcon className="w-3.5 h-3.5" /> HUNGER</span>`.
  - Replace `💖 HAPPINESS` with `<span className="flex items-center gap-1"><PixelHeartIcon className="w-3.5 h-3.5" /> HAPPINESS</span>`.
  - Replace `FEED 🍗` with `<span className="flex items-center justify-center gap-1">FEED <PixelChickenIcon className="w-3.5 h-3.5" /></span>`.
  - Replace `PLAY 🧸` with `<span className="flex items-center justify-center gap-1">PLAY <PixelBearIcon className="w-3.5 h-3.5" /></span>`.
  - Replace `WAKE ☀` with `<span className="flex items-center justify-center gap-1">WAKE <PixelSunIcon className="w-3.5 h-3.5" /></span>`.
  - Replace `SLEEP 🌙` with `<span className="flex items-center justify-center gap-1">SLEEP <PixelMoonIcon className="w-3.5 h-3.5" /></span>`.
- [ ] **Step 3: Run compiler verification**
  Run: `npm run typecheck`
  Expected: Passes with no errors.
- [ ] **Step 4: Commit**
  ```bash
  git add packages/pets/src/Icons.tsx packages/pets/src/PetsApp.tsx
  git commit -m "refactor: replace system emojis in pets MFE with custom retro inline SVGs"
  ```

---

### Task 11: End-to-End Verification

**Files:**
- None

- [ ] **Step 1: Check entire workspace tests**
  Run: `npm test`
  Expected: 96 tests passed across all 15 test files.
- [ ] **Step 2: Check entire codebase types**
  Run: `npm run typecheck`
  Expected: Success without type errors.
- [ ] **Step 3: Run linter check**
  Run: `npm run lint`
  Expected: Success without style violations.
- [ ] **Step 4: Verify static production builds**
  Run: `npm run build`
  Expected: Builds compile successfully.
