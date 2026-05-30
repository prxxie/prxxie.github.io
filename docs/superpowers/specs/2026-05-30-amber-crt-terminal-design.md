# UI/UX Specification: Amber CRT Terminal Redesign

## 1. Overview & Visual Identity
A complete, retro-futuristic redesign of the personal portfolio SPA into a monochrome Amber CRT (cathode-ray tube) terminal emulator. All interactive panels, text elements, and game interfaces will use a high-contrast amber-on-black color scheme inspired by 1980s computer displays and FUI (Fictional User Interface) design systems.

---

## 2. Design Tokens & Styling
We will define centralized variables in `packages/shell/src/index.css` to govern all styles:

### Colors
- **Pure Black background (`--color-cozy-bg`):** `#000000`
- **CRT Window background (`--color-terminal-bg`):** `#050505`
- **Primary Amber (`--color-cozy-text`, `--color-cozy-border`, `--color-cozy-accent`):** `#FFB000`
- **Muted Amber (`--color-cozy-muted`):** `#805800` (50% brightness of Primary Amber)

### Typography
- **Monospace Fonts:** Primary fallback font is `'VT323'` (Google Fonts) for main UI text, and `'Press Start 2P'` (Google Fonts) for navigation headers, labels, and buttons.
- **Font Weights:** Strictly limited to `400 (Regular)` and `700 (Bold)`.
- **Text Case:** All headings, button labels, and system labels are in UPPERCASE (`text-transform: uppercase`).

### Screen Effects
- **Scanlines Effect:** A global viewport overlay (`body::after` linear-gradient) simulating horizontal scanlines and phosphor grille.
- **Phosphor Glow:** Text element shadow mapping to emulate phosphor glow (`text-shadow: 0 0 2px rgba(255, 176, 0, 0.35)`).

---

## 3. Shell Layout & Navigation
- **Window Titles:** All `.exe` suffixes are removed from the window headers and buttons.
  - `POSTS_VIEW.EXE` becomes `POSTS_VIEW`
  - `PET_HUD.EXE` becomes `PET_HUD`
  - `MENU.EXE` becomes `MENU`
- **Navbar buttons:** Thick 3px border, black background, and amber text. On hover or active state, they fully invert colors (amber background, black text/icons).
- **Desktop Grid:** 2-column asymmetric layout (Posts/Workspace at 65% width, Pet HUD at 35% width).
- **Mobile Layout:** The main workspace runs fullscreen. The `PET_HUD` is hidden by default and toggleable via a slide-in sidebar drawer (triggered by a floating/persistent toggle button), or accessible directly by selecting the "PETS" nav tab.

---

## 4. Component Breakdown & Restyles

### A. POSTS_VIEW
- **CLI Shell Prompt:** Header lists posts underneath a simulated terminal prompt:
  ```text
  guest@prxxie:~$ ls -l blog/posts/
  ```
- **Terminal File Listing:**
  ```text
  [2026-05-28]  > HELLO_RETRO_WORLD.MD
  [2026-05-29]  > MARKDOWN_VERIFICATION.MD
  ```
- **Hover Cursor Interaction:** Hovering a post line lights up the text to bright amber and appends a blinking terminal cursor: `_`.
- **Amber-on-Black CRT Reader:** Replace the lined notebook paper style. Markdown rendering is styled with glowing amber text on a dark `#050505` background inside the view window.

### B. PET_HUD
- **ASCII Progress Bars:** hunger/happiness metrics are visual block meters:
  - Feed / Play levels maps to a 12-segment bar: `HUNGER:    [████████░░░░] 64%`
- **Avatar Target crosshairs:** Absolute positioned `+` symbols in the four inner corners of the pet viewer box.
- **Phosphor Sepia Filter:** An SVG filter overlaying the pet sprite to color-shift the pixels to amber phosphor:
  ```css
  filter: sepia(1) saturate(5) hue-rotate(5deg);
  ```
- **Action buttons:** Square border, monospace text, fully inverting color on hover.

---

## 5. Universal Game Restyling (Shikaku & Sokoban)
To achieve visual unity, all gameplay interfaces are color-mapped to the CRT theme.

### Sokoban
- **Grid Background:** `#050505` (Deep Black).
- **Walls:** `#805800` (Muted Amber) fill with `#FFB000` (Primary Amber) borders.
- **Targets:** Thin Amber border circle with a centered crosshair.
- **Player:** Bright Amber round stroke with black eyes.
- **Boxes:** Primary Amber outline, black fill, with an amber internal `X` grid.
- **Stage Clear Modal:** Amber text overlay on a semi-transparent dark backdrop.

### Shikaku
- **Grid Lines:** Muted Amber (`#302000`) thin borders.
- **Numbers:** Bold Primary Amber (`#FFB000`).
- **Drag Selections:** Dashed Amber borders with a transparent amber highlight.
- **Placed Regions:** Solid Amber border with low-opacity amber background fills.
- **Win Screen:** Glowing bold amber overlay message.
