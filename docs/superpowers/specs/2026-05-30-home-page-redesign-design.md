# Specification: Retro-Futuristic Home Page Redesign (BRT System Adaptation)

## 1. Objectives & Goals
Redesign the personal homepage portfolio workspace layout to implement **Option A** (inspired by the BRT Satellite Broadcast System) in a monochrome Amber CRT theme. This involves:
- Moving navigation from the top header into a command-oriented **Matrix Menu** in the right panel.
- Relocating the **Pet HUD** to the right panel.
- Adding a new **User Telemetry (Stats)** widget in the right panel displaying gameplay details from Shikaku and Sokoban, plus the newest blog posts.
- Implementing **Hash-based Client-side Routing** (`/#/`, `/#/about`, etc.) to support back/forward navigation and deep-linking.
- Standardizing the layout and visual consistency of all Micro-Frontends (MFEs).
- Providing **full mobile responsiveness** with a slide-out drawer or stacked views.

## 2. Architecture & Design

### 2.1 Grid Layout
The application container will use a responsive grid:
- **Desktop (md and up):** 
  - A two-column split structure (approx. `1.2fr` left to `1fr` right or `col-span-13` / `col-span-7`).
  - **Left Column:** Renders the main view (the selected tab page). When `tab === "home"`, it displays the core BRT-inspired telemetry dashboard: Planet Canvas, Boot/System logs terminal, Waveform canvases (Waterfall & Oscilloscope), and Social/Projects Towers link-list.
  - **Right Column:** Renders the Control Center: Connectivity status, Command Matrix (navigation buttons), Pet HUD, and User Telemetry (stats & newest posts).
- **Mobile (below md):**
  - Collapses into a single vertical column.
  - The Control Center (including navigation matrix) can be opened via a sliding drawer toggled by a compact `[MENU]` button in the top header.

### 2.2 Hash-based Routing
To implement routing without adding external routing packages to the workspaces, we will construct a lightweight, reactive hash-based router hook (`useHashRouter`) in the shell package:
- Reads `window.location.hash` on mount.
- Maps `#/about` to `"about"`, `#/posts` to `"posts"`, etc. Defaults to `"home"` for `#/` or empty hashes.
- Listens to `hashchange` events to update state reactive to browser back/forward buttons.
- Exposes a `navigate(tab)` function that sets `window.location.hash = '#/' + tab` and automatically plays a beep sound if audio is enabled.

### 2.3 Component Customizations & State Integration
- **User Telemetry Widget:** 
  - Retrieves Shikaku stats from local storage key `cozy_os_shikaku_save`. It parses the number of completed levels and best scores.
  - Retrieves Sokoban stats (current level index, moves, status) from the Sokoban Zustand store or localStorage if persisted.
  - Displays titles of latest posts by referencing the static list in `PostsApp.tsx`.
- **Audio System:**
  - Standardizes the Web Audio API synthesizer. Navigation clicks, matrix button pushes, and system events trigger a short synthetic beep.
- **Waveform Canvas Visualizers:**
  - Waterfalls and Oscilloscopes are animated using `requestAnimationFrame`. They generate sine-wave interference loops to mimic radio interference.

## 3. Mockups & Interaction Flows

### Desktop Layout Mockup
```
+-------------------------------------------------------------------------------+
| [Prxxie Icon] PRXXIE PORTFOLIO SHELL                             [SOUND: ON]  |
+-------------------------------------------------------+-----------------------+
|  LEFT PANEL (Main View)                               |  RIGHT PANEL          |
|  +-------------------------------------------------+  |  STATUS: ● CONNECTED  |
|  |  PLANET & BIO METRIC         SYSTEM LOGS        |  |                       |
|  |  +-----------------------+  +-----------------+ |  |  +-----------------+  |
|  |  |  ( O )                |  | 14:07:22 BOOT   | |  |  | COMMAND MATRIX  |  |
|  |  |  Planet Byria-RR9     |  | shell online    | |  |  |  [HM] [AB] [PO] |  |
|  |  |                       |  | welcome home    | |  |  |  [PE] [SH] [SO] |  |
|  |  +-----------------------+  +-----------------+ |  |  +-----------------+  |
|  |                                                 |  |                       |
|  |  [ MFE Content Injected Here on Navigation ]    |  |  +-----------------+  |
|  |                                                 |  |  | PET HUD         |  |
|  |  +---------------+ +---------------+ +--------+ |  |  | Kotaro (=^-^=)  |  |
|  |  | WATERFALL WAVE| | OSCILLOSCOPE  | | TOWERS | |  |  +-----------------+  |
|  |  | 1285 kHz      | | Channel: 98   | | RSSI   | |  |                       |
|  |  +---------------+ +---------------+ +--------+ |  |  +-----------------+  |
|  |                                                 |  |  | USER TELEMETRY  |  |
|  |                                                 |  |  | Games & Blog    |  |
|  |                                                 |  |  +-----------------+  |
|  +-------------------------------------------------+  +-----------------------+
+-------------------------------------------------------------------------------+
```

## 4. Implementation Steps & Checkpoints
1. **Hash Routing System:** Implement the `useHashRouter` hook and replace tab state switches in `App.tsx`.
2. **Layout Overhaul:** 
   - Modify `ConsoleFrame.tsx` to move tabs list to the Right Control Center.
   - Refactor `App.tsx` grid definitions. Define the Left Panel and Right Panel structures.
3. **Home Dashboard Component:** Create `/components/HomeDashboard.tsx` containing the planet renderer, status boot logs, waveforms, and tower link widgets.
4. **Widgets Construction:**
   - Implement `MatrixMenu` with custom beep click handlers.
   - Build `StatsTelemetry` extracting info from localStorage save states.
   - Relocate the MFE `PetsApp` load hook into the right panel's widget stack.
5. **Styling and Audio Consistency:** Adjust styling in `index.css` to handle grid elements and ensure scanlines are applied evenly.
6. **Mobile Adaptations:** Add CSS media queries for layout collapsing, and wire mobile menu buttons to toggle the right panel as an overlay drawer.
7. **MFE Restyling verification:** Review and adjust font settings / custom elements inside packages (`about`, `posts`, `pets`, `shikaku`, `sokoban`) to ensure visual compliance.
