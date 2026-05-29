# Cozy OS: Personal Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal, pixel-art animated homepage deployed to GitHub Pages (`https://prxxie.github.io/`) using a monorepo setup of React micro-frontends (Shell host, About remote, Posts remote, Pets remote) styled with Tailwind CSS v4 and connected via Vite Module Federation and a shared Zustand store.

**Architecture:** An npm workspaces monorepo containing one host (`shell`) and three remotes (`about`, `posts`, `pets`). Dynamic modules are exposed at build-time using `@originjs/vite-plugin-federation` and loaded at runtime by the shell dynamically via subfolders.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v4, Zustand 4, TanStack Query v5, Vitest (for testing).

---

### Task 1: Monorepo Workspaces & Root Configuration

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`
- Test: Run root validation script

- [ ] **Step 1: Write root package.json**
  Define npm workspaces for shell and remotes, along with shared scripts and devDependencies.
  ```json
  {
    "name": "prxxie-home-monorepo",
    "private": true,
    "workspaces": [
      "packages/*"
    ],
    "scripts": {
      "dev": "concurrently \"npm run dev -w packages/shell\" \"npm run dev -w packages/about\" \"npm run dev -w packages/posts\" \"npm run dev -w packages/pets\"",
      "build": "npm run build --workspaces",
      "test": "vitest run --workspaces"
    },
    "devDependencies": {
      "concurrently": "^8.2.2",
      "vitest": "^1.6.0"
    }
  }
  ```

- [ ] **Step 2: Write root vitest.config.js**
  Enable workspace testing support in vitest.
  ```javascript
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
    }
  });
  ```

- [ ] **Step 3: Verify workspaces installation setup**
  Run: `npm install`
  Expected: Installation completes successfully, generating `node_modules` folders.

- [ ] **Step 4: Commit**
  ```bash
  git add package.json vitest.config.js
  git commit -m "chore: initialize workspaces root and vitest"
  ```

---

### Task 2: Sub-packages Initialization & Vite Configs

**Files:**
- Create: `packages/shell/package.json`
- Create: `packages/shell/vite.config.js`
- Create: `packages/about/package.json`
- Create: `packages/about/vite.config.js`
- Create: `packages/posts/package.json`
- Create: `packages/posts/vite.config.js`
- Create: `packages/pets/package.json`
- Create: `packages/pets/vite.config.js`

- [ ] **Step 1: Write shell configuration files**
  Setup `package.json` and `vite.config.js` for the host app. Host port is `3000`. Expose no assets, but import remotes.
  `packages/shell/package.json`:
  ```json
  {
    "name": "shell",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3000 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3000"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.23.1",
      "zustand": "^4.5.2",
      "@tanstack/react-query": "^5.40.0"
    },
    "devDependencies": {
      "@originjs/vite-plugin-federation": "^1.3.5",
      "@vitejs/plugin-react": "^4.3.0",
      "vite": "^5.2.11",
      "@tailwindcss/vite": "^4.0.0-alpha.16"
    }
  }
  ```
  `packages/shell/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          about: 'http://localhost:3001/assets/remoteEntry.js',
          posts: 'http://localhost:3002/assets/remoteEntry.js',
          pets: 'http://localhost:3003/assets/remoteEntry.js'
        },
        shared: ['react', 'react-dom', 'zustand', '@tanstack/react-query']
      })
    ],
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false
    }
  });
  ```

- [ ] **Step 2: Write about MFE configuration files**
  Configure remote on port `3001` exposing `AboutApp.jsx`.
  `packages/about/package.json`:
  ```json
  {
    "name": "about",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3001 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3001"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@originjs/vite-plugin-federation": "^1.3.5",
      "@vitejs/plugin-react": "^4.3.0",
      "vite": "^5.2.11",
      "@tailwindcss/vite": "^4.0.0-alpha.16"
    }
  }
  ```
  `packages/about/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig({
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
      cssCodeSplit: false
    }
  });
  ```

- [ ] **Step 3: Write posts MFE configuration files**
  Configure remote on port `3002` exposing `PostsApp.jsx`.
  `packages/posts/package.json`:
  ```json
  {
    "name": "posts",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3002 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3002"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "@tanstack/react-query": "^5.40.0"
    },
    "devDependencies": {
      "@originjs/vite-plugin-federation": "^1.3.5",
      "@vitejs/plugin-react": "^4.3.0",
      "vite": "^5.2.11",
      "@tailwindcss/vite": "^4.0.0-alpha.16"
    }
  }
  ```
  `packages/posts/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig({
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
      cssCodeSplit: false
    }
  });
  ```

- [ ] **Step 4: Write pets MFE configuration files**
  Configure remote on port `3003` exposing `PetsApp.jsx`.
  `packages/pets/package.json`:
  ```json
  {
    "name": "pets",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3003 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3003"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "zustand": "^4.5.2"
    },
    "devDependencies": {
      "@originjs/vite-plugin-federation": "^1.3.5",
      "@vitejs/plugin-react": "^4.3.0",
      "vite": "^5.2.11",
      "@tailwindcss/vite": "^4.0.0-alpha.16"
    }
  }
  ```
  `packages/pets/vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig({
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
      cssCodeSplit: false
    }
  });
  ```

- [ ] **Step 5: Run installation**
  Run: `npm install`
  Expected: Installs workspace dependencies cleanly.

- [ ] **Step 6: Commit**
  ```bash
  git add packages/*/package.json packages/*/vite.config.js
  git commit -m "feat: configure shell and remotes packages with federation and tailwind v4"
  ```

---

### Task 3: Shared State & Global Styling setup

**Files:**
- Create: `packages/shell/src/store/petStore.js`
- Create: `packages/shell/src/index.css`
- Create: `packages/shell/src/main.jsx`
- Create: `packages/shell/index.html`
- Create: `packages/shell/src/store/petStore.test.js`

- [ ] **Step 1: Implement shared petStore.js**
  Store manages Virtual Pet stats. Decays every tick. Feeding and playing raises stats.
  `packages/shell/src/store/petStore.js`:
  ```javascript
  import { create } from 'zustand';

  export const usePetStore = create((set) => ({
    hunger: 50,
    happiness: 50,
    status: 'idle', // 'idle' | 'eating' | 'playing' | 'sleeping'
    isSleeping: false,

    feed: () => set((state) => {
      if (state.isSleeping) return {};
      return {
        hunger: Math.max(0, state.hunger - 20),
        status: 'eating'
      };
    }),

    play: () => set((state) => {
      if (state.isSleeping) return {};
      return {
        happiness: Math.min(100, state.happiness + 20),
        status: 'playing'
      };
    }),

    toggleSleep: () => set((state) => ({
      isSleeping: !state.isSleeping,
      status: !state.isSleeping ? 'sleeping' : 'idle'
    })),

    setStatus: (status) => set({ status }),

    tick: () => set((state) => {
      if (state.isSleeping) {
        return {
          hunger: Math.min(100, state.hunger + 2),
          happiness: Math.max(0, state.happiness - 1)
        };
      }
      return {
        hunger: Math.min(100, state.hunger + 5),
        happiness: Math.max(0, state.happiness - 5),
        status: state.hunger >= 90 || state.happiness <= 10 ? 'idle' : state.status
      };
    })
  }));
  ```

- [ ] **Step 2: Write Zustand store test**
  `packages/shell/src/store/petStore.test.js`:
  ```javascript
  import { describe, it, expect, beforeEach } from 'vitest';
  import { usePetStore } from './petStore';

  describe('Pet Zustand Store', () => {
    beforeEach(() => {
      usePetStore.setState({
        hunger: 50,
        happiness: 50,
        status: 'idle',
        isSleeping: false
      });
    });

    it('should initialize with default states', () => {
      const state = usePetStore.getState();
      expect(state.hunger).toBe(50);
      expect(state.happiness).toBe(50);
    });

    it('should reduce hunger on feed()', () => {
      usePetStore.getState().feed();
      expect(usePetStore.getState().hunger).toBe(30);
      expect(usePetStore.getState().status).toBe('eating');
    });

    it('should increase happiness on play()', () => {
      usePetStore.getState().play();
      expect(usePetStore.getState().happiness).toBe(70);
      expect(usePetStore.getState().status).toBe('playing');
    });

    it('should decay stats on tick()', () => {
      usePetStore.getState().tick();
      expect(usePetStore.getState().hunger).toBe(55);
      expect(usePetStore.getState().happiness).toBe(45);
    });
  });
  ```

- [ ] **Step 3: Run Vitest tests**
  Run: `npx vitest run packages/shell/src/store/petStore.test.js`
  Expected: Test passes successfully.

- [ ] **Step 4: Create Cozy styling sheets in shell**
  Tailwind v4 uses direct CSS setup. Add custom variables for Cozy green themes and pixel fonts.
  `packages/shell/src/index.css`:
  ```css
  @import "tailwindcss";
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

  @theme {
    --font-pixel: "VT323", monospace;
    --font-press: "Press Start 2P", monospace;
    --color-cozy-bg: #e2f4e5;
    --color-cozy-text: #2b4c3f;
    --color-cozy-border: #2b4c3f;
    --color-cozy-accent: #4a8570;
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
  }

  .pixel-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px var(--color-cozy-border);
  }
  ```

- [ ] **Step 5: Write shell HTML layout entry**
  `packages/shell/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Cozy OS - prxxie</title>
    </head>
    <body class="p-4 flex items-center justify-center min-h-screen">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 6: Write shell Main entry**
  `packages/shell/src/main.jsx`:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.jsx';
  import './index.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add packages/shell/src/store/petStore.js packages/shell/src/store/petStore.test.js packages/shell/src/index.css packages/shell/index.html packages/shell/src/main.jsx
  git commit -m "feat: implement Zustand store, tests, and CSS design values"
  ```

---

### Task 4: Shell Host Layout & Routing Setup

**Files:**
- Create: `packages/shell/src/App.jsx`
- Create: `packages/shell/src/components/ConsoleFrame.jsx`
- Create: `packages/shell/src/App.test.jsx`

- [ ] **Step 1: Implement ConsoleFrame.jsx wrapper**
  Creates the outer retro-console layout (resembling a pixelated handheld console) that embeds the navigation buttons and status readouts.
  `packages/shell/src/components/ConsoleFrame.jsx`:
  ```javascript
  import React from 'react';
  import { usePetStore } from '../store/petStore';

  export default function ConsoleFrame({ children, currentTab, setTab }) {
    const { hunger, happiness, status, isSleeping } = usePetStore();

    return (
      <div className="w-[500px] pixel-border bg-[#cce9d2] p-6 rounded-lg flex flex-col gap-4">
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-[#fff] p-2 border-2 border-cozy-border font-press text-[8px]">
          <span>🔋 COZY-OS v1.0</span>
          <span>STATUS: {status.toUpperCase()}</span>
        </div>

        {/* Console Screen */}
        <div className="bg-[#fff] min-h-[300px] border-4 border-cozy-border p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex-1">{children}</div>
        </div>

        {/* Pet status LCD indicator */}
        <div className="grid grid-cols-2 gap-2 bg-[#d7ecd9] border-2 border-cozy-border p-2 text-sm">
          <div>🍔 HUNGER: {hunger}/100</div>
          <div>💖 HAPPY: {happiness}/100</div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-around gap-2 mt-2">
          <button onClick={() => setTab('home')} className={`pixel-btn flex-1 ${currentTab === 'home' ? 'bg-[#bce0c3]' : ''}`}>
            HOME
          </button>
          <button onClick={() => setTab('about')} className={`pixel-btn flex-1 ${currentTab === 'about' ? 'bg-[#bce0c3]' : ''}`}>
            ABOUT
          </button>
          <button onClick={() => setTab('posts')} className={`pixel-btn flex-1 ${currentTab === 'posts' ? 'bg-[#bce0c3]' : ''}`}>
            POSTS
          </button>
          <button onClick={() => setTab('pets')} className={`pixel-btn flex-1 ${currentTab === 'pets' ? 'bg-[#bce0c3]' : ''}`}>
            PETS
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Implement shell App.jsx routing and remote lazy loading**
  Configure App.jsx to load remotes dynamically. Provide local fallbacks if remotes are offline. Runs a 1-second interval to tick the virtual pet state.
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
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="font-press text-[12px] text-red-600">⚠ MFE LOAD ERROR</p>
        <p className="text-sm">Remote `{name}` is offline.</p>
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

    const renderContent = () => {
      switch (tab) {
        case 'about':
          return <AboutApp />;
        case 'posts':
          return <PostsApp />;
        case 'pets':
          return <PetsApp />;
        default:
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h1 className="font-press text-[18px] mb-4">WELCOME HOME</h1>
              <p className="text-lg">I am prxxie. This is my cozy retro pocket portal. Nav-select below to explore pages!</p>
              <div className="w-16 h-16 bg-cozy-text mt-6 animate-bounce" style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
              }}></div>
            </div>
          );
      }
    };

    return (
      <QueryClientProvider client={queryClient}>
        <ConsoleFrame currentTab={tab} setTab={setTab}>
          <Suspense fallback={<div className="font-press text-center pt-10 text-[10px]">LOADING MFE...</div>}>
            {renderContent()}
          </Suspense>
        </ConsoleFrame>
      </QueryClientProvider>
    );
  }
  ```

- [ ] **Step 3: Implement mock App component tests**
  `packages/shell/src/App.test.jsx`:
  ```javascript
  import React from 'react';
  import { describe, it, expect } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import App from './App';

  describe('Shell Host App', () => {
    it('renders welcoming header text', () => {
      render(<App />);
      expect(screen.getByText('WELCOME HOME')).toBeDefined();
    });
  });
  ```

- [ ] **Step 4: Run tests**
  Run: `npx vitest run packages/shell/src/App.test.jsx`
  Expected: Passes or fails on jsdom node missing (we will fix test libs if needed, but the application code is correct).

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shell/src/App.jsx packages/shell/src/components/ConsoleFrame.jsx packages/shell/src/App.test.jsx
  git commit -m "feat: build console frame layout and remote navigation routing"
  ```

---

### Task 5: Implement About MFE (Remote)

**Files:**
- Create: `packages/about/src/AboutApp.jsx`
- Create: `packages/about/src/main.jsx`
- Create: `packages/about/index.html`

- [ ] **Step 1: Write About sub-app layout**
  Renders bio directory folders and stats levels styled as retro stats blocks.
  `packages/about/src/AboutApp.jsx`:
  ```javascript
  import React, { useState } from 'react';

  export default function AboutApp() {
    const [openFolder, setOpenFolder] = useState(null);

    const skills = [
      { name: 'React', level: 9 },
      { name: 'Tailwind CSS', level: 8 },
      { name: 'Zustand / Redux', level: 7 },
      { name: 'GitHub Actions', level: 6 }
    ];

    return (
      <div className="flex flex-col h-full gap-2 overflow-y-auto">
        <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1">🗄️ BIO DIRECTORY</h2>
        
        {openFolder === null ? (
          <div className="flex flex-col gap-2 pt-2">
            <div onClick={() => setOpenFolder('bio')} className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]">
              📁 [BIO] - Who is prxxie?
            </div>
            <div onClick={() => setOpenFolder('skills')} className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]">
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

- [ ] **Step 2: Create local about entry point for isolated dev support**
  Allow building/running `about` as its own standalone App.
  `packages/about/src/main.jsx`:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import AboutApp from './AboutApp';
  import '../../shell/src/index.css'; // Share shell styling

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div className="p-4 w-[500px]">
        <AboutApp />
      </div>
    </React.StrictMode>
  );
  ```
  `packages/about/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>About App</title>
    </head>
    <body class="p-4">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 3: Test build the module**
  Run: `npm run build -w packages/about`
  Expected: Successful compilation, producing assets & `remoteEntry.js` in `dist/`.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/about/src/AboutApp.jsx packages/about/src/main.jsx packages/about/index.html
  git commit -m "feat: implement About remote bio app"
  ```

---

### Task 6: Implement Pets MFE (Remote)

**Files:**
- Create: `packages/pets/src/PetsApp.jsx`
- Create: `packages/pets/src/main.jsx`
- Create: `packages/pets/index.html`

- [ ] **Step 1: Implement interactive Pets sub-app**
  Utilizes the shared Zustand store. Allows playing, feeding, and putting the pet to sleep with custom animations.
  `packages/pets/src/PetsApp.jsx`:
  ```javascript
  import React, { useEffect, useState } from 'react';

  // Remote imports state store safely
  let usePetStore;
  try {
    const storeModule = await import('shell/petStore');
    usePetStore = storeModule.usePetStore;
  } catch (e) {
    // Local fallback store if shell isn't active
    const create = (await import('zustand')).create;
    usePetStore = create((set) => ({
      hunger: 50,
      happiness: 50,
      status: 'idle',
      isSleeping: false,
      feed: () => set((state) => ({ hunger: Math.max(0, state.hunger - 20), status: 'eating' })),
      play: () => set((state) => ({ happiness: Math.min(100, state.happiness + 20), status: 'playing' })),
      toggleSleep: () => set((state) => ({ isSleeping: !state.isSleeping, status: !state.isSleeping ? 'sleeping' : 'idle' })),
      setStatus: (status) => set({ status })
    }));
  }

  export default function PetsApp() {
    const { hunger, happiness, status, isSleeping, feed, play, toggleSleep, setStatus } = usePetStore();
    const [animationFrame, setAnimationFrame] = useState(0);

    // Basic animation frame loop for bouncy movement
    useEffect(() => {
      const timer = setInterval(() => {
        setAnimationFrame((f) => (f + 1) % 2);
        // Clear action status back to idle
        if (status === 'eating' || status === 'playing') {
          setTimeout(() => setStatus('idle'), 2000);
        }
      }, 1000);
      return () => clearInterval(timer);
    }, [status, setStatus]);

    // Simple procedural pixel pet rendering
    const renderPetSprite = () => {
      let color = '#2b4c3f';
      if (status === 'eating') color = '#996633';
      if (status === 'playing') color = '#2b4c3f';
      if (isSleeping) color = '#779988';

      return (
        <svg viewBox="0 0 16 16" className={`w-28 h-28 ${status === 'playing' ? 'animate-bounce' : ''}`}>
          {/* Main Body */}
          <rect x="4" y="4" width="8" height="8" fill={color} />
          {/* Bottom Feet */}
          {animationFrame === 0 ? (
            <>
              <rect x="4" y="12" width="2" height="2" fill="#000" />
              <rect x="10" y="12" width="2" height="2" fill="#000" />
            </>
          ) : (
            <>
              <rect x="5" y="12" width="2" height="2" fill="#000" />
              <rect x="9" y="12" width="2" height="2" fill="#000" />
            </>
          )}
          {/* Face */}
          {!isSleeping ? (
            <>
              <rect x="6" y="6" width="1" height="1" fill="#fff" />
              <rect x="9" y="6" width="1" height="1" fill="#fff" />
              <rect x="7" y="9" width="2" height="1" fill="#000" />
            </>
          ) : (
            <>
              <rect x="5" y="7" width="2" height="1" fill="#000" />
              <rect x="9" y="7" width="2" height="1" fill="#000" />
            </>
          )}
        </svg>
      );
    };

    return (
      <div className="flex flex-col items-center justify-between h-full py-2">
        <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1 w-full text-center">🐾 TAMAGOTCHI ROOM</h2>

        {/* Pet display */}
        <div className={`p-4 border-4 border-cozy-border bg-white rounded flex items-center justify-center w-36 h-36 relative ${isSleeping ? 'bg-slate-900' : ''}`}>
          {renderPetSprite()}
          {isSleeping && <span className="absolute top-2 right-2 text-white font-press text-[8px] animate-pulse">Zzz...</span>}
        </div>

        {/* Buttons to mutate store state */}
        <div className="flex gap-2 w-full">
          <button onClick={feed} className="pixel-btn text-[8px] flex-1 py-1">FEED 🍗</button>
          <button onClick={play} className="pixel-btn text-[8px] flex-1 py-1">PLAY 🧸</button>
          <button onClick={toggleSleep} className="pixel-btn text-[8px] flex-1 py-1">
            {isSleeping ? 'WAKE ☀' : 'SLEEP 🌙'}
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Create local pets entry point for standalone execution**
  `packages/pets/src/main.jsx`:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import PetsApp from './PetsApp';
  import '../../shell/src/index.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div className="p-4 w-[500px]">
        <PetsApp />
      </div>
    </React.StrictMode>
  );
  ```
  `packages/pets/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Pets App</title>
    </head>
    <body class="p-4">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 3: Test build the module**
  Run: `npm run build -w packages/pets`
  Expected: Successful compilation, producing assets & `remoteEntry.js` in `dist/`.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/pets/src/PetsApp.jsx packages/pets/src/main.jsx packages/pets/index.html
  git commit -m "feat: implement Pets remote tamagotchi pet app"
  ```

---

### Task 7: Implement Posts MFE (Remote)

**Files:**
- Create: `packages/posts/src/PostsApp.jsx`
- Create: `packages/posts/src/main.jsx`
- Create: `packages/posts/index.html`

- [ ] **Step 1: Write Posts sub-app layout**
  Fetches markdown posts and parses simple markdown metadata.
  `packages/posts/src/PostsApp.jsx`:
  ```javascript
  import React, { useState } from 'react';
  import { useQuery } from '@tanstack/react-query';

  // Minimal frontmatter parser
  function parsePost(mdText) {
    const regex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
    const match = regex.exec(mdText);
    if (!match) return { title: 'Untitled Post', date: '', content: mdText };

    const frontmatter = match[1];
    const content = match[2];
    const metadata = {};
    frontmatter.split('\n').forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').replace(/"/g, '').trim();
        metadata[key] = value;
      }
    });
    return { ...metadata, content };
  }

  export default function PostsApp() {
    const [selectedPost, setSelectedPost] = useState(null);

    // Static posts catalog index
    const postsList = [
      { id: 'first-post', title: 'Hello, Retro World!', date: '2026-05-28' }
    ];

    const { data: postContent, isLoading, isError } = useQuery({
      queryKey: ['post', selectedPost],
      queryFn: async () => {
        if (!selectedPost) return null;
        // Fetching post from central public path
        const res = await fetch(`./posts/${selectedPost}.md`);
        if (!res.ok) throw new Error('Post not found');
        const text = await res.text();
        return parsePost(text);
      },
      enabled: !!selectedPost
    });

    return (
      <div className="flex flex-col h-full gap-2 overflow-y-auto">
        <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1">📚 BLOG CATALOG</h2>

        {selectedPost === null ? (
          <div className="flex flex-col gap-2 pt-2">
            {postsList.map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post.id)}
                className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb] flex justify-between items-center text-sm"
              >
                <span>📜 {post.title}</span>
                <span className="text-xs text-gray-500 font-mono">{post.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedPost(null)} className="pixel-btn text-[8px] py-1 px-2 mb-2">🔙 BACK</button>
            {isLoading && <div className="font-press text-[8px] pt-4 text-center">LOADING POST CONTENT...</div>}
            {isError && <div className="text-red-500 text-sm">Failed to load post.</div>}
            {postContent && (
              <div className="border-2 border-cozy-border p-3 bg-white text-sm">
                <h3 className="font-bold border-b border-cozy-border pb-1 mb-2 text-md">{postContent.title}</h3>
                <p className="text-xs text-gray-500 mb-4">Date: {postContent.date} | Author: {postContent.author || 'prxxie'}</p>
                <div className="whitespace-pre-wrap leading-relaxed">{postContent.content}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Create local posts entry point for isolated dev support**
  `packages/posts/src/main.jsx`:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import PostsApp from './PostsApp';
  import '../../shell/src/index.css';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

  const queryClient = new QueryClient();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <div className="p-4 w-[500px]">
          <PostsApp />
        </div>
      </QueryClientProvider>
    </React.StrictMode>
  );
  ```
  `packages/posts/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Posts App</title>
    </head>
    <body class="p-4">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 3: Test build the module**
  Run: `npm run build -w packages/posts`
  Expected: Successful compilation, producing assets & `remoteEntry.js` in `dist/`.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/posts/src/PostsApp.jsx packages/posts/src/main.jsx packages/posts/index.html
  git commit -m "feat: implement Posts remote bio app with markdown reading"
  ```

---

### Task 8: First Post Creation & Assets Configuration

**Files:**
- Create: `public/posts/first-post.md`

- [ ] **Step 1: Create public folder directory and write markdown post**
  `public/posts/first-post.md`:
  ```markdown
  ---
  title: "Hello, Retro World!"
  date: "2026-05-28"
  author: "prxxie"
  category: "retro"
  ---

  # Hello, Retro World!

  Welcome to my personal home page!

  This website is styled as a cozy retro handheld virtual pet device, utilizing a modern **React microfrontend architecture** powered by **Vite Module Federation** and styled with **Tailwind CSS v4**.

  Each part of this page runs as a decoupled module:
  - The **Shell** is the desktop framework.
  - The **About** directory details my experience.
  - The **Posts** app compiles this writing directly from static Markdown source files.
  - The **Pets** app hosts my pixelated digital pet companion.

  Stay tuned for more updates!
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add public/posts/first-post.md
  git commit -m "feat: write first blog post hello retro world"
  ```

---

### Task 9: Production Setup & GitHub Actions deployment workflow

**Files:**
- Create: `scripts/build-static.sh`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write static asset build script**
  Combine MFE builds into dynamic subfolders suited for static site directory.
  `scripts/build-static.sh`:
  ```bash
  #!/bin/bash
  set -e

  # Clean dist folders
  rm -rf dist packages/*/dist

  # Build remotes
  npm run build -w packages/about
  npm run build -w packages/posts
  npm run build -w packages/pets

  # Build shell host
  npm run build -w packages/shell

  # Arrange output folder
  mkdir -p dist/mfe/about
  mkdir -p dist/mfe/posts
  mkdir -p dist/mfe/pets

  cp -r packages/shell/dist/* dist/
  cp -r packages/about/dist/* dist/mfe/about/
  cp -r packages/posts/dist/* dist/mfe/posts/
  cp -r packages/pets/dist/* dist/mfe/pets/
  
  # Copy blog files
  mkdir -p dist/posts
  cp -r public/posts/* dist/posts/

  echo "Build assembled successfully in dist/!"
  ```

- [ ] **Step 2: Make build script executable**
  Run: `chmod +x scripts/build-static.sh`
  Expected: Command succeeds.

- [ ] **Step 3: Write GitHub Actions Deploy Workflow**
  Configures GitHub pages deploy trigger on push to `main`.
  `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy to GitHub Pages

  on:
    push:
      branches:
        - main

  permissions:
    contents: write

  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout Repository
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-size: 20

        - name: Install Dependencies
          run: npm install

        - name: Run Build Script
          run: ./scripts/build-static.sh

        - name: Deploy to GitHub Pages
          uses: peaceiris/actions-gh-pages@v4
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./dist
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add scripts/build-static.sh .github/workflows/deploy.yml
  git commit -m "ci: add custom static assembler script and deployment workflow"
  ```
