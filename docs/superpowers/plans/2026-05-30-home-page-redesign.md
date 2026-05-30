# Retro-Futuristic Home Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio workspace's main layout to implement the Option A "BRT Satellite Broadcast System" grid layout: move navigation and Pet HUD + stats to the right control center panel, implement hash-based client-side routing, animate dynamic visualizers, and ensure full mobile responsiveness and monochrome Amber CRT theme consistency.

**Architecture:** 
- A custom hook `useHashRouter` will manage reactive hash routing (e.g. `/#/about`) without adding third-party routing packages.
- On desktop, the page is structured into a split-pane layout: a main Left Panel (rendering the current view, plus bottom animated canvases when on "HOME"), and a Right Control Center Panel (rendering matrix navigation, Pet HUD, and stats widgets).
- On mobile, it collapses to a single column, with the right control center controls shifting into a drawer overlays/collapsible stack.
- Real-time canvases (Planet, Oscilloscope, Waterfall) will use `requestAnimationFrame` canvas drawings in a dedicated `HomeDashboard` component.

**Tech Stack:** React, TypeScript, Zustand, TailwindCSS, Vitest, HTML5 Canvas, Web Audio API.

---

## File Structure Map
- Create: `packages/shell/src/hooks/useHashRouter.ts` (Hash-based client-side router hook)
- Create: `packages/shell/src/utils/audio.ts` (Synthesizer utility for playBeepSound)
- Create: `packages/shell/src/components/MatrixMenu.tsx` (Command Matrix nav grid)
- Create: `packages/shell/src/components/StatsTelemetry.tsx` (User gameplay and posts statistics)
- Create: `packages/shell/src/components/HomeDashboard.tsx` (Core dashboard: Planet, logs, animated waves, tower links)
- Modify: `packages/shell/src/components/ConsoleFrame.tsx` (Overall wrapper structure, mobile drawer navigation)
- Modify: `packages/shell/src/App.tsx` (Shell coordinator, rendering Left/Right panels based on route)
- Modify: `packages/shell/src/index.css` (Scanline CRT overlays, responsive styling, and layout tokens)

---

### Task 1: Hash-Based Client-Side Router Hook

**Files:**
- Create: `packages/shell/src/hooks/useHashRouter.ts`
- Test: Create `packages/shell/src/hooks/useHashRouter.test.ts`

- [ ] **Step 1: Write failing unit test for `useHashRouter`**
  Create `packages/shell/src/hooks/useHashRouter.test.ts` with tests to check default hash behavior, navigation updates, and back/forward sync.
  ```typescript
  import { describe, it, expect, beforeEach, afterEach } from "vitest";
  import { renderHook, act } from "@testing-library/react";
  import { useHashRouter } from "./useHashRouter";

  describe("useHashRouter", () => {
    beforeEach(() => {
      window.location.hash = "";
    });

    afterEach(() => {
      window.location.hash = "";
    });

    it("should return 'home' as default tab if hash is empty", () => {
      const { result } = renderHook(() => useHashRouter());
      expect(result.current.currentTab).toBe("home");
    });

    it("should update tab when window hash changes", () => {
      const { result } = renderHook(() => useHashRouter());
      act(() => {
        window.location.hash = "#/about";
      });
      // Trigger event manually to simulate browser hash change
      act(() => {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
      expect(result.current.currentTab).toBe("about");
    });

    it("should navigate to a tab and update hash location", () => {
      const { result } = renderHook(() => useHashRouter());
      act(() => {
        result.current.navigate("shikaku");
      });
      expect(window.location.hash).toBe("#/shikaku");
      expect(result.current.currentTab).toBe("shikaku");
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test`
  Expected: FAIL with compilation error (useHashRouter module does not exist).

- [ ] **Step 3: Implement useHashRouter hook**
  Create `packages/shell/src/hooks/useHashRouter.ts`:
  ```typescript
  import { useState, useEffect, useCallback } from "react";
  import type { Tab } from "../types";

  const VALID_TABS: Tab[] = ["home", "about", "posts", "pets", "shikaku", "sokoban"];

  function getTabFromHash(): Tab {
    const hash = window.location.hash;
    const path = hash.replace(/^#\/?/, "");
    if (VALID_TABS.includes(path as Tab)) {
      return path as Tab;
    }
    return "home";
  }

  export function useHashRouter() {
    const [currentTab, setCurrentTab] = useState<Tab>(getTabFromHash);

    useEffect(() => {
      const handleHashChange = () => {
        setCurrentTab(getTabFromHash());
      };
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const navigate = useCallback((tab: Tab) => {
      window.location.hash = `#/${tab === "home" ? "" : tab}`;
      setCurrentTab(tab);
    }, []);

    return { currentTab, navigate };
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/hooks/useHashRouter.ts packages/shell/src/hooks/useHashRouter.test.ts
  git commit -m "feat: implement hash-based client-side router hook"
  ```

---

### Task 2: Retro Sound Synthesizer Utility

**Files:**
- Create: `packages/shell/src/utils/audio.ts`

- [ ] **Step 1: Implement playBeepSound utility**
  Create `packages/shell/src/utils/audio.ts` using the Web Audio API to emit a short synth beep. Provide a persistent state (via simple local module variable or Zustand if needed) to track if audio is muted/unmuted.
  ```typescript
  let audioCtx: AudioContext | null = null;
  let isAudioMuted = true; // Audio default is OFF to prevent auto-play browser blockages

  export function getAudioMuted(): boolean {
    return isAudioMuted;
  }

  export function setAudioMuted(muted: boolean) {
    isAudioMuted = muted;
    localStorage.setItem("prxxie_audio_muted", JSON.stringify(muted));
  }

  // Load saved setting
  try {
    const saved = localStorage.getItem("prxxie_audio_muted");
    if (saved !== null) {
      isAudioMuted = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load audio preference", e);
  }

  export function playBeepSound(frequency = 440, duration = 0.08) {
    if (isAudioMuted) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn("Failed to play synth sound:", err);
    }
  }
  ```

- [ ] **Step 2: Verify code compiling**
  Run: `npm run typecheck`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add packages/shell/src/utils/audio.ts
  git commit -m "feat: implement retro Web Audio synth beep utility"
  ```

---

### Task 3: Command Matrix Navigation Widget

**Files:**
- Create: `packages/shell/src/components/MatrixMenu.tsx`
- Test: Create `packages/shell/src/components/MatrixMenu.test.tsx`

- [ ] **Step 1: Write unit test for MatrixMenu**
  Create `packages/shell/src/components/MatrixMenu.test.tsx` to verify buttons are rendered, highlight active, and click triggers navigate.
  ```typescript
  import React from "react";
  import { describe, it, expect, vi } from "vitest";
  import { render, screen, fireEvent } from "@testing-library/react";
  import "@testing-library/jest-dom";
  import MatrixMenu from "./MatrixMenu";

  describe("MatrixMenu", () => {
    it("renders all valid tabs as buttons", () => {
      const mockNavigate = vi.fn();
      render(<MatrixMenu currentTab="home" navigate={mockNavigate} />);
      
      expect(screen.getByText("HOME")).toBeInTheDocument();
      expect(screen.getByText("ABOUT")).toBeInTheDocument();
      expect(screen.getByText("POSTS")).toBeInTheDocument();
      expect(screen.getByText("PETS")).toBeInTheDocument();
      expect(screen.getByText("SHIKAKU")).toBeInTheDocument();
      expect(screen.getByText("SOKOBAN")).toBeInTheDocument();
    });

    it("triggers navigation when button is clicked", () => {
      const mockNavigate = vi.fn();
      render(<MatrixMenu currentTab="home" navigate={mockNavigate} />);
      
      fireEvent.click(screen.getByText("ABOUT"));
      expect(mockNavigate).toHaveBeenCalledWith("about");
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test`
  Expected: FAIL with compilation error (MatrixMenu not found).

- [ ] **Step 3: Implement MatrixMenu component**
  Create `packages/shell/src/components/MatrixMenu.tsx`:
  ```typescript
  import React from "react";
  import type { Tab } from "../types";
  import { playBeepSound } from "../utils/audio";

  interface MatrixMenuProps {
    currentTab: Tab;
    navigate: (tab: Tab) => void;
  }

  const GRID_ITEMS: Array<{ tab: Tab; key: string }> = [
    { tab: "home", key: "HM" },
    { tab: "about", key: "AB" },
    { tab: "posts", key: "PO" },
    { tab: "pets", key: "PE" },
    { tab: "shikaku", key: "SH" },
    { tab: "sokoban", key: "SO" },
  ];

  export default function MatrixMenu({ currentTab, navigate }: MatrixMenuProps): React.ReactElement {
    const handleButtonClick = (tabName: Tab) => {
      playBeepSound(440, 0.06);
      navigate(tabName);
    };

    return (
      <div className="border border-cozy-border p-2 bg-black">
        <div className="text-[10px] font-press text-cozy-accent mb-2 text-center bg-cozy-muted/20 py-1">
          COMMAND_MATRIX
        </div>
        <div className="grid grid-cols-3 gap-2">
          {GRID_ITEMS.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleButtonClick(item.tab)}
              className={`pixel-btn text-[9px] py-2 px-1 text-center font-press capitalize ${
                currentTab === item.tab
                  ? "bg-cozy-accent text-black shadow-none border-cozy-border"
                  : "bg-transparent text-cozy-text hover:bg-cozy-muted/20"
              }`}
            >
              [{item.key}] {item.tab}
            </button>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/components/MatrixMenu.tsx packages/shell/src/components/MatrixMenu.test.tsx
  git commit -m "feat: implement interactive MatrixMenu navigation widget"
  ```

---

### Task 4: User Telemetry & Games Stats Widget

**Files:**
- Create: `packages/shell/src/components/StatsTelemetry.tsx`
- Test: Create `packages/shell/src/components/StatsTelemetry.test.tsx`

- [ ] **Step 1: Write test for StatsTelemetry**
  Create `packages/shell/src/components/StatsTelemetry.test.tsx` to verify gameplay data loads from localStorage and newest posts titles are displayed.
  ```typescript
  import React from "react";
  import { describe, it, expect, beforeEach, afterEach } from "vitest";
  import { render, screen } from "@testing-library/react";
  import "@testing-library/jest-dom";
  import StatsTelemetry from "./StatsTelemetry";

  describe("StatsTelemetry", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it("renders game title sections and default stats", () => {
      render(<StatsTelemetry />);
      expect(screen.getByText("USER_STATS_TELEMETRY")).toBeInTheDocument();
      expect(screen.getByText(/SHIKAKU CORES:/)).toBeInTheDocument();
      expect(screen.getByText(/SOKOBAN CARGO:/)).toBeInTheDocument();
    });

    it("loads Shikaku progress from localStorage", () => {
      const mockSave = {
        completed: {
          "level-1": { stars: 3, bestTime: 12 },
          "level-2": { stars: 2, bestTime: 45 }
        }
      };
      localStorage.setItem("cozy_os_shikaku_save", JSON.stringify(mockSave));

      render(<StatsTelemetry />);
      expect(screen.getByText(/SOLVED: 2/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test`
  Expected: FAIL with compilation error (StatsTelemetry not found).

- [ ] **Step 3: Implement StatsTelemetry component**
  Create `packages/shell/src/components/StatsTelemetry.tsx`:
  ```typescript
  import React, { useEffect, useState } from "react";

  interface ShikakuSaveData {
    completed?: Record<string, { stars: number; bestTime: number }>;
  }

  export default function StatsTelemetry(): React.ReactElement {
    const [shikakuSolved, setShikakuSolved] = useState(0);
    const [sokobanLevel, setSokobanLevel] = useState(0);

    const posts = [
      { date: "2026-05-30", title: "Monochrome Amber CRT theme conversion completed" },
      { date: "2026-05-29", title: "Building Sokoban micro-frontend puzzle game" }
    ];

    useEffect(() => {
      // 1. Read Shikaku local storage progress
      try {
        const savedShikaku = localStorage.getItem("cozy_os_shikaku_save");
        if (savedShikaku) {
          const parsed = JSON.parse(savedShikaku) as ShikakuSaveData;
          if (parsed?.completed) {
            setShikakuSolved(Object.keys(parsed.completed).length);
          }
        }
      } catch (e) {
        console.error("Failed to parse Shikaku save progress in dashboard", e);
      }

      // 2. Read Sokoban level state from local storage or store
      try {
        const savedSokoban = localStorage.getItem("cozy_os_sokoban_level");
        if (savedSokoban) {
          setSokobanLevel(parseInt(savedSokoban, 10));
        }
      } catch (e) {
        // Fallback
      }
    }, []);

    return (
      <div className="border border-cozy-border p-2 bg-black text-cozy-text font-mono text-[9px] flex flex-col gap-2">
        <div className="font-press text-[9px] text-cozy-accent text-center bg-cozy-muted/20 py-1">
          USER_STATS_TELEMETRY
        </div>
        
        <div className="flex flex-col gap-1.5 leading-relaxed">
          <div>
            <span className="text-cozy-accent font-bold">● SHIKAKU CORES</span><br />
            <span>SOLVED: {shikakuSolved} PUZZLE(S)</span>
          </div>
          <div>
            <span className="text-cozy-accent font-bold">● SOKOBAN CARGO</span><br />
            <span>LEVEL REACHED: {sokobanLevel + 1} | SOLVED: {sokobanLevel}</span>
          </div>
          <div className="border-t border-dashed border-cozy-border pt-1.5 mt-1">
            <span className="text-cozy-accent font-bold">● NEWEST POSTS LOG</span>
            <ul className="list-none flex flex-col gap-1 mt-1">
              {posts.map((post, idx) => (
                <li key={idx} className="truncate">
                  [{post.date}] {post.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/components/StatsTelemetry.tsx packages/shell/src/components/StatsTelemetry.test.tsx
  git commit -m "feat: implement StatsTelemetry widget showing gameplay achievements and blog logs"
  ```

---

### Task 5: Core Home Dashboard Component

**Files:**
- Create: `packages/shell/src/components/HomeDashboard.tsx`
- Test: Create `packages/shell/src/components/HomeDashboard.test.tsx`

- [ ] **Step 1: Write test for HomeDashboard**
  Create `packages/shell/src/components/HomeDashboard.test.tsx` to verify canvases render, logs list renders, and active status displays correctly.
  ```typescript
  import React from "react";
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import "@testing-library/jest-dom";
  import HomeDashboard from "./HomeDashboard";

  describe("HomeDashboard", () => {
    it("renders core sections and details on mount", () => {
      render(<HomeDashboard />);
      expect(screen.getByText("BYRIA-RR9")).toBeInTheDocument();
      expect(screen.getByText(/MASS/)).toBeInTheDocument();
      expect(screen.getByText(/SYSTEM_BOOT_LOGS/)).toBeInTheDocument();
      expect(screen.getByText(/Scanning Incoming Transmissions/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test`
  Expected: FAIL with compilation error (HomeDashboard not found).

- [ ] **Step 3: Implement HomeDashboard component**
  Create `packages/shell/src/components/HomeDashboard.tsx` with dynamic canvas drawings for the Planet, Oscilloscope wave, and Waterfall radio grid using standard `canvas` API drawing loops inside `requestAnimationFrame`.
  ```typescript
  import React, { useEffect, useRef } from "react";

  export default function HomeDashboard(): React.ReactElement {
    const planetCanvasRef = useRef<HTMLCanvasElement>(null);
    const waterfallRef = useRef<HTMLCanvasElement>(null);
    const oscilloscopeRef = useRef<HTMLCanvasElement>(null);

    // Dynamic anim loop for rotating planet
    useEffect(() => {
      const canvas = planetCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let angle = 0;
      let animId: number;

      const draw = () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = 45;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Core Planet BG
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#161a0e";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffb000";
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        angle += 0.006;
        let offset = (angle * 40) % 80;

        ctx.strokeStyle = "#aa7500";
        ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.ellipse(cx + (i * 20) + offset - 30, cy, 30, r * 0.95, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Craters
        ctx.fillStyle = "#3a2800";
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx - 18, cy + 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Crosshairs
        ctx.strokeStyle = "#ffb000";
        ctx.lineWidth = 0.75;
        ctx.strokeRect(cx - r - 6, cy - r - 6, 8, 8);
        ctx.strokeRect(cx + r - 2, cy + r - 2, 8, 8);

        animId = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(animId);
    }, []);

    // Waveforms (oscilloscope & waterfall) animations
    useEffect(() => {
      const osc = oscilloscopeRef.current;
      const wf = waterfallRef.current;
      if (!osc || !wf) return;
      const oCtx = osc.getContext("2d");
      const wCtx = wf.getContext("2d");
      if (!oCtx || !wCtx) return;

      let wavePhase = 0;
      let animId: number;

      // Reset sizes
      osc.width = osc.parentElement?.clientWidth || 250;
      osc.height = osc.parentElement?.clientHeight || 65;
      wf.width = wf.parentElement?.clientWidth || 250;
      wf.height = wf.parentElement?.clientHeight || 65;

      const drawWaves = () => {
        // 1. Oscilloscope drawing
        oCtx.clearRect(0, 0, osc.width, osc.height);
        oCtx.strokeStyle = "#ffb000";
        oCtx.lineWidth = 1;
        oCtx.beginPath();
        wavePhase += 0.15;
        for (let x = 0; x < osc.width; x++) {
          const y = osc.height / 2 + 
                    Math.sin(x * 0.05 + wavePhase) * 12 + 
                    Math.sin(x * 0.12 - wavePhase * 1.5) * 4;
          if (x === 0) oCtx.moveTo(x, y);
          else oCtx.lineTo(x, y);
        }
        oCtx.stroke();

        // 2. Waterfall drawing (simple shifting rows of bars)
        wCtx.clearRect(0, 0, wf.width, wf.height);
        wCtx.fillStyle = "#ffb000";
        const barWidth = 4;
        const gap = 2;
        const count = Math.floor(wf.width / (barWidth + gap));
        
        for (let i = 0; i < count; i++) {
          const height = Math.abs(Math.sin(i * 0.2 + wavePhase) * Math.cos(i * 0.05 + wavePhase * 0.8)) * (wf.height - 10);
          wCtx.fillRect(i * (barWidth + gap), wf.height - height, barWidth, height);
        }

        animId = requestAnimationFrame(drawWaves);
      };
      drawWaves();
      return () => cancelAnimationFrame(animId);
    }, []);

    const logs = [
      "PID  USER    MEM%  TIME+    Command",
      "051  root20  0.20  0:00.00  tail -n +0 -F /logs",
      "052  root27  0.50  0:00.21  /tools/shell/MFE_LOAD",
      "053  root20  0.26  0:00.19  /usr/bin/web-audio-init",
      "056  root28  0.23  0:00.00  /node/packages/pets/tick",
      "057  root20  0.80  0:00.05  /bin/shikaku-solver-v1"
    ];

    return (
      <div className="flex flex-col gap-3 h-full">
        {/* Top: Planet info & logs terminal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          {/* Planet Visual */}
          <div className="border border-cozy-border p-2 flex gap-3 items-center bg-black relative">
            <div className="flex flex-col justify-between h-full font-mono text-[9px]">
              <div>
                <div className="text-[7px] text-cozy-muted uppercase">Planet Designation</div>
                <div className="text-white font-bold font-press text-[9px] mb-1">BYRIA-RR9</div>
              </div>
              <div className="flex flex-col gap-1">
                <div>MASS: 6.39 x 10^23 kg</div>
                <div>GRAVITY: 3.721 m/s²</div>
                <div>RADIUS: 3,389.5 km</div>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <canvas ref={planetCanvasRef} width="110" height="110" className="max-w-full" />
            </div>
          </div>

          {/* System logs */}
          <div className="border border-cozy-border p-2 bg-black flex flex-col">
            <div className="text-[9px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1.5 flex justify-between">
              <span>SYSTEM_BOOT_LOGS</span>
              <span className="text-white text-[8px] animate-pulse">● ONLINE</span>
            </div>
            <div className="font-mono text-[9px] text-cozy-text leading-tight overflow-hidden whitespace-pre">
              {logs.join("\n")}
            </div>
          </div>
        </div>

        {/* Bottom waves panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Waterfall transmission */}
          <div className="border border-cozy-border p-2 bg-black flex flex-col h-[100px]">
            <div className="text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between">
              <span>Transmissions Scanning</span>
              <span className="text-white font-bold">1285 kHz</span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <canvas ref={waterfallRef} className="w-full h-full block bg-black/40" />
            </div>
          </div>

          {/* Oscilloscope channel */}
          <div className="border border-cozy-border p-2 bg-black flex flex-col h-[100px]">
            <div className="text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between">
              <span>Incoming Signal Wave</span>
              <span className="text-white font-bold">Channel: 98</span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <canvas ref={oscilloscopeRef} className="w-full h-full block bg-black/40" />
            </div>
          </div>

          {/* Broadcast Towers Links */}
          <div className="border border-cozy-border p-2 bg-black flex flex-col justify-between h-[100px] font-mono text-[9px]">
            <div className="text-[8px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1">
              BROADCAST_TOWERS
            </div>
            <div className="flex flex-col gap-1 text-[8px]">
              <a href="https://github.com/prxxie" target="_blank" rel="noopener noreferrer" className="hover:underline flex justify-between">
                <span>BRT-743-T (GITHUB)</span>
                <span className="text-white">ONLINE</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex justify-between">
                <span>AEW-DYM-Y (TWITTER)</span>
                <span className="text-white">STABLE</span>
              </a>
              <div className="flex justify-between text-cozy-muted">
                <span>RT-GPT-05 (LOCAL)</span>
                <span>RSSI: -83dBm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/components/HomeDashboard.tsx packages/shell/src/components/HomeDashboard.test.tsx
  git commit -m "feat: implement HomeDashboard component drawing planet and waveform animations"
  ```

---

### Task 6: ConsoleFrame Restructuring

**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shell/src/components/ConsoleFrame.test.tsx`

- [ ] **Step 1: Modify ConsoleFrame.tsx**
  Remove top horizontal tabs in the header. Add an audio toggle button `[SOUND: ON/OFF]` that toggles muting state in the synthesizer.
  Update the component to receive standard navigation inputs, placing the menu matrix inside the mobile slide-in drawer.
  Modify `packages/shell/src/components/ConsoleFrame.tsx`:
  ```typescript
  import React, { useEffect, useState } from "react";
  import { PixelFolderIcon } from "./Icons";
  import { useUiStore } from "../store/uiStore";
  import type { Tab } from "../types";
  import { getAudioMuted, setAudioMuted, playBeepSound } from "../utils/audio";
  import MatrixMenu from "./MatrixMenu";

  interface ConsoleFrameProps {
    children: React.ReactNode;
    currentTab: Tab;
    setTab: (tab: Tab) => void;
  }

  export default function ConsoleFrame({
    children,
    currentTab,
    setTab,
  }: ConsoleFrameProps): React.ReactElement {
    const isMenuOpen = useUiStore((state) => state.isMenuOpen);
    const setMenuOpen = useUiStore((state) => state.setMenuOpen);
    const toggleMenu = useUiStore((state) => state.toggleMenu);
    const [muted, setMuted] = useState(getAudioMuted);

    useEffect(() => {
      if (isMenuOpen) {
        document.body.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
      }
      return () => {
        document.body.classList.remove("overflow-hidden");
      };
    }, [isMenuOpen]);

    useEffect(() => {
      if (!isMenuOpen) return;
      const handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === "Escape") setMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMenuOpen, setMenuOpen]);

    const handleAudioToggle = () => {
      const nextMuted = !muted;
      setAudioMuted(nextMuted);
      setMuted(nextMuted);
      if (!nextMuted) {
        playBeepSound(520, 0.08);
      }
    };

    return (
      <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
        <header className="bg-black border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border">
            <div className="flex items-center gap-2">
              <svg
                className="inline-block"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="none"
                stroke="var(--color-cozy-accent)"
                strokeWidth="2.5"
                strokeLinecap="square"
              >
                <path d="M3,4 L8,8 L3,12" />
                <line x1="9" y1="12" x2="14" y2="12" />
              </svg>
              <span className="font-press text-xs font-bold text-cozy-accent uppercase">
                PRXXIE_OS v4.7
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound Audio Controller in Header */}
              <button
                onClick={handleAudioToggle}
                className={`pixel-btn text-[9px] px-3 py-1 ${
                  !muted ? "bg-cozy-accent text-black border-cozy-border" : ""
                }`}
                aria-label="Toggle Audio Beeps"
              >
                SOUND: {!muted ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => {
                  playBeepSound(440, 0.05);
                  toggleMenu();
                }}
                className="md:hidden pixel-btn text-[9px] px-3 py-1"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu-drawer"
                aria-label="Toggle navigation menu"
              >
                [MENU]
              </button>
            </div>
          </div>
        </header>

        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/45 z-40 md:hidden animate-[fade-in_0.2s_ease-out]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Control Center Navigation Drawer */}
        {isMenuOpen && (
          <div
            id="mobile-menu-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 bottom-0 w-64 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden"
          >
            <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2">
              <span className="font-press text-[10px] text-cozy-accent flex items-center gap-1">
                <PixelFolderIcon className="w-3.5 h-3.5" /> MOBILE_CTRL
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-cozy-accent font-bold cursor-pointer font-press text-[10px] bg-transparent border-none"
                aria-label="Close navigation menu"
              >
                [X]
              </button>
            </div>
            
            {/* Embedded matrix grid navigation menu in drawer */}
            <MatrixMenu currentTab={currentTab} navigate={setTab} />
          </div>
        )}

        <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
          {children}
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Update ConsoleFrame tests**
  Modify `packages/shell/src/components/ConsoleFrame.test.tsx` to fix elements references (e.g. testing matrix interactions inside mobile drawer, matching labels, testing audio click trigger).
  Specifically replace references to header `HOME` buttons with tests for the audio toggle button, or trigger drawer to test the matrix navigation item triggers.

- [ ] **Step 3: Run ConsoleFrame tests to verify they pass**
  Run: `npm run test packages/shell/src/components/ConsoleFrame.test.tsx`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/components/ConsoleFrame.tsx packages/shell/src/components/ConsoleFrame.test.tsx
  git commit -m "feat: restructure ConsoleFrame to integrate Audio Synth toggling and Sidebar drawer navigation"
  ```

---

### Task 7: Shell Host App & Router Integration

**Files:**
- Modify: `packages/shell/src/App.tsx`
- Modify: `packages/shell/src/App.test.tsx`

- [ ] **Step 1: Integrate Routing and Split Panels in App.tsx**
  Refactor `packages/shell/src/App.tsx` to hook up `useHashRouter`, replacing standard tabs state. Define the left layout container (dashboard/current MFE view) and the right control center widgets.
  Modify `packages/shell/src/App.tsx`:
  ```typescript
  import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
  import ConsoleFrame from "./components/ConsoleFrame";
  import { PixelBookIcon, PixelPawIcon } from "./components/Icons";
  import { usePetStore } from "./store/petStore";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { useHashRouter } from "./hooks/useHashRouter";
  import MatrixMenu from "./components/MatrixMenu";
  import StatsTelemetry from "./components/StatsTelemetry";
  import HomeDashboard from "./components/HomeDashboard";

  const queryClient = new QueryClient();

  const AboutApp = lazy(
    () =>
      import("about/AboutApp").catch(() => ({
        default: () => <Fallback name="About" />,
      }))
  );

  const PostsApp = lazy(
    () =>
      import("posts/PostsApp").catch(() => ({
        default: () => <Fallback name="Posts" />,
      }))
  );

  const PetsApp = lazy(
    () =>
      import("pets/PetsApp").catch(() => ({
        default: () => <Fallback name="Pets" />,
      }))
  );

  const ShikakuApp = lazy(
    () =>
      import("shikaku/ShikakuApp").catch(() => ({
        default: () => <Fallback name="Shikaku" />,
      }))
  );

  const SokobanApp = lazy(
    () =>
      import("sokoban/SokobanApp").catch(() => ({
        default: () => <Fallback name="Sokoban" />,
      }))
  );

  function Fallback({ name }: { name: string }): React.ReactElement {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
        <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
        <p className="text-sm text-center">Remote `{name}` is offline.</p>
      </div>
    );
  }

  export default function App(): React.ReactElement {
    const { currentTab, navigate } = useHashRouter();
    const tick = usePetStore((state) => state.tick);
    const windowRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPetHudOpen, setIsPetHudOpen] = useState(false);

    useEffect(() => {
      const handleFullscreenChange = (): void => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }, []);

    const toggleFullscreen = (): void => {
      if (!document.fullscreenElement) {
        if (windowRef.current) {
          windowRef.current.requestFullscreen().catch((err: Error) => {
            console.error("Failed to enter fullscreen mode:", err);
          });
        }
      } else {
        document.exitFullscreen().catch((err: Error) => {
          console.error("Failed to exit fullscreen mode:", err);
        });
      }
    };

    useEffect(() => {
      const timer = setInterval(() => {
        tick();
      }, 5000);
      return () => clearInterval(timer);
    }, [tick]);

    const renderMainContent = (): React.ReactNode => {
      switch (currentTab) {
        case "about":
          return <AboutApp />;
        case "posts":
          return <PostsApp />;
        case "pets":
          return <PetsApp usePetStore={usePetStore} />;
        case "shikaku":
          return <ShikakuApp />;
        case "sokoban":
          return <SokobanApp />;
        default:
          return <HomeDashboard />;
      }
    };

    return (
      <QueryClientProvider client={queryClient}>
        <div className="w-full flex justify-center min-h-screen">
          <ConsoleFrame currentTab={currentTab} setTab={navigate}>
            <div className="grid grid-cols-1 md:grid-cols-20 gap-6 items-start">
              
              {/* Left Column: View Shell Container */}
              <div
                ref={windowRef}
                className={`col-span-1 ${
                  currentTab === "pets" ? "md:col-span-20" : "md:col-span-13"
                } retro-window`}
              >
                <div className="window-header">
                  <span className="flex items-center gap-1">
                    <PixelBookIcon className="w-3.5 h-3.5" />
                    <span className="window-header-accent">
                      {currentTab.toUpperCase()}_VIEW
                    </span>
                  </span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={toggleFullscreen}
                      className="text-cozy-accent font-bold cursor-pointer hover:underline bg-transparent border-none p-0 font-press text-[9px]"
                      aria-label="Toggle Fullscreen"
                    >
                      {isFullscreen ? "[🗗]" : "[⛶]"}
                    </button>
                    <span className="text-cozy-accent font-bold cursor-pointer">
                      [X]
                    </span>
                  </div>
                </div>
                <div className="window-body min-h-[350px]">
                  <Suspense
                    fallback={
                      <div className="font-press text-center pt-10 text-[8px]">
                        LOADING MFE...
                      </div>
                    }
                  >
                    {renderMainContent()}
                  </Suspense>
                </div>
              </div>

              {/* Right Column: Embedded Control center (desktop only) */}
              {currentTab !== "pets" && (
                <div className="hidden md:flex md:col-span-7 flex-col gap-4">
                  
                  {/* Command Navigation Grid */}
                  <MatrixMenu currentTab={currentTab} navigate={navigate} />

                  {/* Dynamic Pet HUD Widget */}
                  <div className="retro-window">
                    <div className="window-header">
                      <span className="flex items-center gap-1">
                        <PixelPawIcon className="w-3.5 h-3.5" />
                        <span className="window-header-accent">PET_HUD</span>
                      </span>
                      <span className="text-cozy-accent font-bold cursor-pointer">
                        [-]
                      </span>
                    </div>
                    <div className="window-body min-h-[160px] p-2">
                      <Suspense fallback={<div className="font-press text-center pt-4 text-[8px]">LOADING PET...</div>}>
                        <PetsApp usePetStore={usePetStore} />
                      </Suspense>
                    </div>
                  </div>

                  {/* Gameplay Telemetry Stats */}
                  <StatsTelemetry />
                </div>
              )}
            </div>

            {/* Mobile HUD overlay Button */}
            {currentTab !== "pets" && (
              <button
                onClick={() => setIsPetHudOpen(true)}
                className="md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px] shadow-lg"
              >
                [ MOBILE HUD ]
              </button>
            )}

            {/* Sliding drawer overlay */}
            {isPetHudOpen && (
              <div className="fixed inset-0 bg-black/75 z-45 md:hidden" onClick={() => setIsPetHudOpen(false)} />
            )}
            <div
              className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-2xl transition-transform duration-300 md:hidden
                ${isPetHudOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2">
                <span className="font-press text-[9px] text-cozy-text flex items-center gap-1">
                  <PixelPawIcon className="w-3.5 h-3.5" /> MOBILE_HUD
                </span>
                <button
                  onClick={() => setIsPetHudOpen(false)}
                  className="text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none"
                >
                  [X]
                </button>
              </div>

              {/* Navigation in mobile drawer */}
              <MatrixMenu currentTab={currentTab} navigate={navigate} />

              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {/* Pet HUD */}
                <div className="border border-cozy-border p-2">
                  <Suspense fallback={<div className="font-press text-center pt-4 text-[8px]">LOADING PET...</div>}>
                    <PetsApp usePetStore={usePetStore} />
                  </Suspense>
                </div>

                {/* Telemetry Stats */}
                <StatsTelemetry />
              </div>
            </div>
          </ConsoleFrame>
        </div>
      </QueryClientProvider>
    );
  }
  ```

- [ ] **Step 2: Update App.test.tsx unit tests**
  Refactor `packages/shell/src/App.test.tsx` to align with the matrix nav click handlers instead of top headers, and to handle initial mount hash routing states.

- [ ] **Step 3: Run all unit tests to verify they pass**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/App.tsx packages/shell/src/App.test.tsx
  git commit -m "feat: integrate hash router and layout grid sections in Host App"
  ```

---

### Task 8: Styling Polish & Theme Compliance

**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Polish CSS classes and grids in index.css**
  Configure slide-in animation keyframes, CRT responsive adjustments, button active hover behaviors, and layout constraints in `packages/shell/src/index.css`. Make sure there are no remaining Cozy Green styles.
  Ensure scanlines look sharp and align correctly on larger high-DPI displays.

- [ ] **Step 2: Verify production build passes**
  Run: `npm run build`
  Expected: Production compilation finishes successfully without errors.

- [ ] **Step 3: Verify all test cases**
  Run: `npm run test`
  Expected: 100% of 114+ test cases pass.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/index.css
  git commit -m "style: polish layout grids, slide transitions, and scanline compliance in index.css"
  ```
