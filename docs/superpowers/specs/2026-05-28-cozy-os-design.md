# Cozy OS: Pixel-Art Animated Personal Homepage (GitHub Pages)

This document specifies the design for a personal homepage hosted on GitHub Pages (`https://prxxie.github.io/`) built as a React-based microfrontend (MFE) architecture inside a monorepo. It features a cozy, animated pixel-art theme styled with Tailwind CSS v4, containing a Shell host and three federated microfrontends: About, Posts, and Pets.

## 1. Project Overview & Aesthetic
The site is built under the **Cozy Tamagotchi OS** visual aesthetic:
- **Visuals:** Warm pastel green-scale tones (`#e2f4e5` background, `#2b4c3f` primary text/borders), thick pixel borders, custom retro windows with action buttons, pixel-art graphics.
- **Typography:** Pixelated retro fonts like `Press Start 2P` for headings/ui, and `VT323` for readable body text.
- **Animations:** Subtle 8-bit keyframe movements (bouncing pet, scrolling text, screen transitions, typing indicators).
- **Core Technology Stack:** React, Tailwind CSS v4, Zustand, TanStack Query, Vite, and `@originjs/vite-plugin-federation`.

## 2. Directory & Repository Layout
The project is organized as an npm workspace monorepo.

```
/
├── package.json (root workspaces configuration)
├── packages/
│   ├── shell/ (Host Application)
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── src/ (Layout, router, global store, and remote hooks)
│   ├── about/ (About Me MFE)
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── src/ (Bio, experience, avatar widgets)
│   ├── posts/ (Markdown Blog MFE)
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── src/ (Post lists, markdown parsers, reader component)
│   └── pets/ (Virtual Pet MFE)
│       ├── package.json
│       ├── vite.config.js
│       └── src/ (Interactive pixel creature simulation and stat controls)
└── public/
    └── posts/ (Central directory for blog markdown files)
        └── first-post.md
```

## 3. Microfrontend Configuration (Vite Module Federation)
Vite Module Federation operates over static build targets. The `shell` maps to `/` and remote apps compile to subdirectories deployed together under a single GitHub Pages domain.

### Port Assignments (Local Development)
- **Shell (Host):** `http://localhost:3000`
- **About MFE:** `http://localhost:3001`
- **Posts MFE:** `http://localhost:3002`
- **Pets MFE:** `http://localhost:3003`

### Production URLs (GitHub Pages)
- **Shell:** `https://prxxie.github.io/`
- **About Remote:** `https://prxxie.github.io/mfe/about/assets/remoteEntry.js`
- **Posts Remote:** `https://prxxie.github.io/mfe/posts/assets/remoteEntry.js`
- **Pets Remote:** `https://prxxie.github.io/mfe/pets/assets/remoteEntry.js`

### Shared Dependencies
To prevent redundant payload, the following libraries are shared across the federation boundary:
- `react` and `react-dom`
- `zustand`
- `@tanstack/react-query`

## 4. Shared State (Zustand Store)
A global Zustand state is initialized in the `shell` and shared with the remotes (primarily `pets` and the main layout).
```typescript
interface PetState {
  hunger: number;     // 0 to 100
  happiness: number;  // 0 to 100
  status: 'idle' | 'sleeping' | 'eating' | 'playing' | 'dead';
  feed: () => void;
  play: () => void;
  sleep: () => void;
  tick: () => void; // Decay stats over time
}
```

## 5. Microfrontend Detail & UI Elements

### 5.1 Shell (Host Portal)
- **Layout:** Framed inside a retro hand-held gaming console border (like a Game Boy or virtual pet keychain).
- **Navigation:** Pixelated dashboard buttons to swap between `/`, `/about`, `/posts`, and `/pets`.
- **Global Vibe:** Top status bar showing system time, global audio toggle, and current pet mood.
- **Embedded Widget:** An overlaying pixel-art pet container that shows the current state of the virtual pet regardless of which sub-page you are visiting.

### 5.2 About (Remote MFE)
- **UI:** Styled like a cozy "retro computer directory". Files can be opened to read biographical details.
- **Features:** Skill charts drawn as retro leveling bars (e.g., `React [████████░░] LV.8`), pixelated portrait avatar, and simple contact form styled like a system terminal command.

### 5.3 Posts (Remote MFE)
- **UI:** A classic arcade catalog interface or standard paper-scroll list.
- **Markdown Parsing:** Fetches static `.md` files at runtime from `public/posts/` and parses them into styled HTML elements.
- **Query Management:** TanStack Query is used to cache index lists and individual post contents.

### 5.4 Pets (Remote MFE)
- **UI:** Detailed pet home screen resembling a virtual pet grid.
- **Features:** An interactive screen where you can:
  - Feed the pet (plays eat animation, drops hunger).
  - Play a simple 8-bit mini-game (plays play animation, bumps happiness).
  - Turn off lights (sends pet to sleep to recover stamina).
- **Aesthetic:** Custom SVG or canvas-rendered pixel creature designed using raw pixel grids or pre-rendered SVGs.

## 6. Build and Deployment Pipeline
GitHub Pages only hosts static files, so a custom GitHub Action will build each package and arrange them into the final deployment structure:

1. Build `packages/about` outputting to `packages/about/dist/`.
2. Build `packages/posts` outputting to `packages/posts/dist/`.
3. Build `packages/pets` outputting to `packages/pets/dist/`.
4. Build `packages/shell` outputting to `packages/shell/dist/`.
5. Arrange production artifacts into a single output folder `dist/`:
   ```bash
   mkdir -p dist/mfe/about dist/mfe/posts dist/mfe/pets
   cp -r packages/shell/dist/* dist/
   cp -r packages/about/dist/* dist/mfe/about/
   cp -r packages/posts/dist/* dist/mfe/posts/
   cp -r packages/pets/dist/* dist/mfe/pets/
   cp -r public/posts dist/posts
   ```
6. Deploy `dist/` to the `gh-pages` branch using the `peaceiris/actions-gh-pages` deploy action.

## 7. First Post Content
A markdown file `public/posts/hello-world.md` will be created with the following metadata and content:
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
