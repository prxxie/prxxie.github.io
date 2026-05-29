# Responsive Redesign & MFE Path Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the personal homepage repository to use a mobile-responsive full-width website grid with a header navigation bar, custom terminal SVG logo, and White/Slate/Fuzzy Wuzzy theme, and fix MFE asset loading errors on GitHub Pages by setting base paths.

**Architecture:** Update MFE build bases. Shell host layout is converted from a fixed-width console frame to a responsive grid. The virtual pet simulator stows cleanly below content on mobile and floats in the sidebar on desktop.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v4, Zustand 4, TanStack Query 5.

---

### Task 1: MFE Production Base Path Configuration

**Files:**
- Modify: `packages/about/vite.config.js`
- Modify: `packages/posts/vite.config.js`
- Modify: `packages/pets/vite.config.js`

- [ ] **Step 1: Set base path in About MFE config**
  `packages/about/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig(({ command }) => {
    return {
      base: command === 'build' ? '/mfe/about/' : '/',
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: 'about',
          filename: 'remoteEntry.js',
          exposes: {
            './AboutApp': './src/AboutApp.jsx'
          },
          shared: ['react', 'react-dom']
        })
      ],
      build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
          input: './src/AboutApp.jsx'
        }
      }
    };
  });
  ```

- [ ] **Step 2: Set base path in Posts MFE config**
  `packages/posts/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig(({ command }) => {
    return {
      base: command === 'build' ? '/mfe/posts/' : '/',
      publicDir: '../../public',
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: 'posts',
          filename: 'remoteEntry.js',
          exposes: {
            './PostsApp': './src/PostsApp.jsx'
          },
          shared: ['react', 'react-dom', '@tanstack/react-query']
        })
      ],
      build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
          input: './src/PostsApp.jsx'
        }
      }
    };
  });
  ```

- [ ] **Step 3: Set base path in Pets MFE config**
  `packages/pets/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig(({ command }) => {
    return {
      base: command === 'build' ? '/mfe/pets/' : '/',
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: 'pets',
          filename: 'remoteEntry.js',
          exposes: {
            './PetsApp': './src/PetsApp.jsx'
          },
          shared: ['react', 'react-dom', 'zustand']
        })
      ],
      build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
          input: './src/PetsApp.jsx'
        }
      }
    };
  });
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/*/vite.config.js
  git commit -m "chore(federation): set production build base paths for all remotes"
  ```

---

### Task 2: Redesign Styling & Color Scheme

**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Overwrite index.css theme tokens**
  Update styling variables to support `oklch(20.8% 0.042 265.755)` borders and `#CC6666` accents.
  `packages/shell/src/index.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
  @import "tailwindcss";

  @theme {
    --font-pixel: "VT323", monospace;
    --font-press: "Press Start 2P", monospace;
    --color-cozy-bg: #f8f9fa;
    --color-cozy-text: oklch(20.8% 0.042 265.755);
    --color-cozy-border: oklch(20.8% 0.042 265.755);
    --color-cozy-accent: #CC6666;
  }

  body {
    background-color: var(--color-cozy-bg);
    color: var(--color-cozy-text);
    font-family: var(--font-pixel);
    font-size: 20px;
    image-rendering: pixelated;
  }

  .pixel-border {
    border: 4px solid var(--color-cozy-border);
    box-shadow: 4px 4px 0px var(--color-cozy-border);
  }

  .pixel-btn {
    border: 3px solid var(--color-cozy-border);
    background-color: #fff;
    padding: 6px 12px;
    font-family: var(--font-press);
    font-size: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 0px var(--color-cozy-border);
    transition: transform 0.1s, box-shadow 0.1s;
    color: var(--color-cozy-text);
  }

  .pixel-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px var(--color-cozy-border);
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add packages/shell/src/index.css
  git commit -m "style: configure index.css with oklch and fuzzy-wuzzy variables"
  ```

---

### Task 3: Restructure ConsoleFrame to Retro Window Layout

**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.jsx`
- Overwrite: `packages/shell/src/App.jsx`

- [ ] **Step 1: Rewrite ConsoleFrame.jsx**
  Changes the fixed-width handheld layout into a responsive wrapper container.
  `packages/shell/src/components/ConsoleFrame.jsx`:
  ```javascript
  import React from 'react';
  import { usePetStore } from '../store/petStore';

  export default function ConsoleFrame({ children, currentTab, setTab }) {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-6 px-4 py-6 box-border">
        {/* Top Header Bar */}
        <header className="bg-white border-4 border-cozy-border p-3 flex justify-between items-center shadow-[3px_3px_0px_var(--color-cozy-accent)] box-border">
          {/* Logo container with vertical centering */}
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
            <span className="font-press text-xs font-bold text-cozy-accent">PRXXIE</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-2">
            <button 
              onClick={() => setTab('home')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'home' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              HOME
            </button>
            <button 
              onClick={() => setTab('about')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'about' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              ABOUT
            </button>
            <button 
              onClick={() => setTab('posts')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'posts' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              POSTS
            </button>
            <button 
              onClick={() => setTab('pets')} 
              className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 ${currentTab === 'pets' ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
            >
              PETS
            </button>
          </nav>
        </header>

        {/* Content Section */}
        <main className="w-full flex-1">
          {children}
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Rewrite App.jsx grid routing**
  Update the main layout to render a 2-column grid on desktop (`md:grid-cols-3`), placing the main screen on the left (`md:col-span-2`) and the virtual pet room on the right (`md:col-span-1`) as a sidebar. On mobile, it displays them sequentially. On `/pets` tab in mobile, it displays pets MFE in full.
  `packages/shell/src/App.jsx`:
  ```javascript
  import React, { useState, useEffect, lazy, Suspense } from 'react';
  import ConsoleFrame from './components/ConsoleFrame';
  import { usePetStore } from './store/petStore';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

  const queryClient = new QueryClient();

  // Lazy load MFEs with fallbacks
  const AboutApp = lazy(() => import('about/AboutApp').catch(() => ({ default: () => <Fallback name="About" /> })));
  const PostsApp = lazy(() => import('posts/PostsApp').catch(() => ({ default: () => <Fallback name="Posts" /> })));
  const PetsApp = lazy(() => import('pets/PetsApp').catch(() => ({ default: () => <Fallback name="Pets" /> })));

  function Fallback({ name }) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
        <p className="font-press text-[10px] text-red-600">⚠ MFE LOAD ERROR</p>
        <p className="text-sm text-center">Remote `{name}` is offline.</p>
      </div>
    );
  }

  export default function App() {
    const [tab, setTab] = useState('home');
    const tick = usePetStore((state) => state.tick);

    useEffect(() => {
      const timer = setInterval(() => {
        tick();
      }, 5000); // Stat decays every 5 seconds
      return () => clearInterval(timer);
    }, [tick]);

    const renderMainContent = () => {
      switch (tab) {
        case 'about':
          return <AboutApp />;
        case 'posts':
          return <PostsApp />;
        case 'pets':
          // On mobile, show pets page in full if that tab is active
          return (
            <div className="block md:hidden">
              <PetsApp usePetStore={usePetStore} />
            </div>
          );
        default:
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h1 className="font-press text-[14px] mb-4 text-cozy-accent">WELCOME HOME</h1>
              <p className="text-lg">I am prxxie. This is my responsive retro dashboard workspace. Swivel tabs above to see more sections!</p>
              <div className="w-12 h-12 bg-cozy-accent mt-6 animate-bounce" style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
              }}></div>
            </div>
          );
      }
    };

    return (
      <QueryClientProvider client={queryClient}>
        <div className="w-full flex justify-center min-h-screen">
          <ConsoleFrame currentTab={tab} setTab={setTab}>
            {/* Grid Layout: Main panel left, Pet sidebar right (desktop only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Active Sub-page (Left Side Panel) */}
              {tab !== 'pets' && (
                <div className="col-span-1 md:col-span-2 retro-window">
                  <div className="window-header">
                    <span>📖 <span className="window-header-accent">{tab.toUpperCase()}_VIEW.EXE</span></span>
                    <span className="text-cozy-accent font-bold cursor-pointer">[X]</span>
                  </div>
                  <div className="window-body min-h-[350px]">
                    <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING MFE...</div>}>
                      {renderMainContent()}
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Stacking fallback when pets page is opened on mobile */}
              {tab === 'pets' && (
                <div className="col-span-1 md:col-span-2 retro-window block md:hidden">
                  <div className="window-header">
                    <span>🐾 <span class="window-header-accent">PETS_VIEW.EXE</span></span>
                    <span className="text-cozy-accent font-bold cursor-pointer">[X]</span>
                  </div>
                  <div className="window-body min-h-[350px]">
                    <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING MFE...</div>}>
                      {renderMainContent()}
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Tamagotchi Sidebar Room (Right Side Panel - Always visible on desktop, stows below content on mobile) */}
              <div className={`col-span-1 retro-window ${tab === 'pets' ? 'block' : 'hidden md:block'}`}>
                <div className="window-header">
                  <span>🐾 <span className="window-header-accent">PET_HUD.EXE</span></span>
                  <span className="text-cozy-accent font-bold cursor-pointer">[-]</span>
                </div>
                <div className="window-body min-h-[350px]">
                  <Suspense fallback={<div className="font-press text-center pt-10 text-[8px]">LOADING PET...</div>}>
                    <PetsApp usePetStore={usePetStore} />
                  </Suspense>
                </div>
              </div>

            </div>
          </ConsoleFrame>
        </div>
      </QueryClientProvider>
    );
  }
  ```

- [ ] **Step 3: Update App.jsx and ConsoleFrame styling styles**
  In `packages/shell/src/components/ConsoleFrame.jsx`, add custom `.window-header` and `.window-header-accent` styles to make them matches our spec rules. Let's make sure styles are in CSS too.
  Add helper classes to `packages/shell/src/index.css`:
  ```css
  .retro-window {
    border: 4px solid var(--color-cozy-border);
    background-color: #fff;
    box-shadow: 4px 4px 0px var(--color-cozy-border);
    display: flex;
    flex-direction: column;
  }

  .window-header {
    background-color: #fff;
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
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/shell/src/App.jsx packages/shell/src/components/ConsoleFrame.jsx packages/shell/src/index.css
  git commit -m "feat(shell): implement responsive grid layouts, SVG terminal logo, and White/Slate headers"
  ```

---

### Task 4: UI Color Alignment & HUD Tuning

**Files:**
- Modify: `packages/about/src/AboutApp.jsx`
- Modify: `packages/posts/src/PostsApp.jsx`
- Modify: `packages/pets/src/PetsApp.jsx`

- [ ] **Step 1: Align About App directory borders**
  Update styling inside `packages/about/src/AboutApp.jsx` to match oklch border variables.
  `packages/about/src/AboutApp.jsx` border classes: replace `border-2 border-cozy-border` or hardcoded classes if needed. Our code currently uses `border-2 border-cozy-border`, which maps automatically! We just need to check if there are hardcoded backgrounds or fonts to clean.
  Let's update `packages/about/src/AboutApp.jsx` line 20 and 23 to replace `bg-[#f0f9f2] hover:bg-[#d5eedb]` with `bg-white hover:bg-[var(--color-cozy-accent)] hover:text-white` to fit the Fuzzy Wuzzy accent system!
  `packages/about/src/AboutApp.jsx`:
  ```javascript
  import React, { useState } from 'react';

  const skills = [
    { name: 'React', level: 9 },
    { name: 'Tailwind CSS', level: 8 },
    { name: 'Zustand / Redux', level: 7 },
    { name: 'GitHub Actions', level: 6 }
  ];

  export default function AboutApp() {
    const [openFolder, setOpenFolder] = useState(null);

    return (
      <div className="flex flex-col h-full gap-2 overflow-y-auto">
        <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1">🗄️ BIO DIRECTORY</h2>
        
        {openFolder === null ? (
          <div className="flex flex-col gap-2 pt-2">
            <div onClick={() => setOpenFolder('bio')} className="border-2 border-cozy-border p-2 bg-white cursor-pointer hover:bg-cozy-accent hover:text-white">
              📁 [BIO] - Who is prxxie?
            </div>
            <div onClick={() => setOpenFolder('skills')} className="border-2 border-cozy-border p-2 bg-white cursor-pointer hover:bg-cozy-accent hover:text-white">
              📁 [SKILLS] - Character Stats
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setOpenFolder(null)} className="pixel-btn text-[8px] py-1 px-2 mb-2">🔙 BACK</button>
            {openFolder === 'bio' && (
              <div className="border-2 border-cozy-border p-3 bg-white text-sm leading-relaxed">
                <p className="mb-2"><strong>NAME:</strong> prxxie</p>
                <p className="mb-2"><strong>CLASS:</strong> Web Developer</p>
                <p>Hello! I build highly interactive websites. I love combining clean engineering practices (like micro frontends) with rich visual game designs.</p>
              </div>
            )}
            {openFolder === 'skills' && (
              <div className="border-2 border-cozy-border p-3 bg-white text-sm">
                <h4 className="font-bold mb-2">CHARACTER LEVELS:</h4>
                <div className="flex flex-col gap-2">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>{skill.name}</span>
                        <span>LV.{skill.level}</span>
                      </div>
                      <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
                        <div 
                          className="h-full bg-cozy-accent" 
                          style={{ width: `${skill.level * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Align Posts App folder hover colors**
  In `packages/posts/src/PostsApp.jsx`, replace `bg-[#f0f9f2] hover:bg-[#d5eedb]` with `bg-white hover:bg-cozy-accent hover:text-white` to fit our theme:
  `packages/posts/src/PostsApp.jsx` fragment:
  ```javascript
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post.id)}
                className="border-2 border-cozy-border p-2 bg-white cursor-pointer hover:bg-cozy-accent hover:text-white flex justify-between items-center text-sm"
              >
  ```

- [ ] **Step 3: Align Pets MFE design styles**
  In `packages/pets/src/PetsApp.jsx`, replace the color theme matching variables. The color of the pet should match our slate-navy variable or Fuzzy Wuzzy rose:
  `packages/pets/src/PetsApp.jsx` sprite generator segment:
  ```javascript
    // Simple procedural pixel pet rendering
    const renderPetSprite = () => {
      let color = 'oklch(20.8% 0.042 265.755)'; // Slate
      if (status === 'eating') color = '#CC6666'; // Fuzzy Wuzzy
      if (status === 'playing') color = '#CC6666';
      if (isSleeping) color = '#779988';
  ```
  Ensure stats meters are colored in `bg-cozy-accent` (Fuzzy Wuzzy):
  `packages/pets/src/PetsApp.jsx` meter segment:
  ```javascript
        {/* HUD readouts inside PetsApp */}
        {!usePetStore && (
          <div className="flex gap-4 text-xs font-press bg-[#f8f9fa] border-2 border-cozy-border p-1 mb-2">
            <span>🍔 HNG: {hunger}</span>
            <span>💖 HPP: {happiness}</span>
          </div>
        )}
        
        {/* Interactive Stats indicators inside Pets Sidebar */}
        {usePetStore && (
          <div className="w-full flex flex-col gap-2 text-xs mb-4">
            <div className="flex justify-between items-center">
              <span>🍔 HUNGER</span>
              <span>{hunger}/100</span>
            </div>
            <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
              <div className="h-full bg-cozy-accent" style={{ width: `${hunger}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>💖 HAPPINESS</span>
              <span>{happiness}/100</span>
            </div>
            <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
              <div className="h-full bg-cozy-accent" style={{ width: `${happiness}%` }}></div>
            </div>
          </div>
        )}
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/about/src/AboutApp.jsx packages/posts/src/PostsApp.jsx packages/pets/src/PetsApp.jsx
  git commit -m "style: unify card directory highlights, pet SVG colors, and stats HUD bars"
  ```

---

### Task 5: Compilation and Deployment to GitHub Pages

**Files:**
- Output: Run compile validation scripts
- Deploy: Push commits to GitHub repository

- [ ] **Step 1: Run Vitest tests**
  Run: `npm run test`
  Expected: All 8 unit tests pass successfully.

- [ ] **Step 2: Run Production Build Assembler**
  Run: `npm run build:static`
  Expected: Clean compilation, assets output nested dynamically inside `dist/` folder.

- [ ] **Step 3: Push changes to main branch**
  Run: `git push origin main` (or checkout main, merge your feature, and push)
  Expected: Pushes successfully, triggers GitHub Actions deployment to build static sites on Pages.

- [ ] **Step 4: Commit and Finish**
  Verify the live site at `https://prxxie.github.io/`.
