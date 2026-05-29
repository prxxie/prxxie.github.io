# Responsive Redesign: Cozy OS to PRXXIE (Fuzzy Wuzzy & Slate Layout)

This document specifies the design updates to transition the personal homepage from the handheld console wrapper to a responsive, full-width website layout, using a white/slate/fuzzy-wuzzy color palette. It also details the production assets fix for resolving the micro-frontend loading errors on GitHub Pages.

## 1. MFE Base URL Assets Path Fix
To resolve the loading errors (404) on GitHub Pages, the compiled assets (JS chunks) of each micro-frontend must be fetched relative to their deployment sub-paths. Each remote's `vite.config.js` is updated with a dynamic `base` property:

- **About MFE:** `base: command === 'build' ? '/mfe/about/' : '/'`
- **Posts MFE:** `base: command === 'build' ? '/mfe/posts/' : '/'`
- **Pets MFE:** `base: command === 'build' ? '/mfe/pets/' : '/'`
- **Shell Host:** `base: '/'`

During local development (`npm run dev`), the base remains `/`. In production build (`npm run build`), the compiler rewrites the resource paths to match the GitHub Pages subfolders.

## 2. Visual Theme & Color Palette Redesign
The visual identity changes from a green-scale pastel console to a high-contrast White/Slate/Rose system.

### Color Specifications
- **Base Light (White):** `#ffffff` (Card background, header base, reading pane)
- **Base Dark (Slate):** `oklch(20.8% 0.042 265.755)` (Borders, primary text, drop-shadows)
- **Accent (Fuzzy Wuzzy):** `#CC6666` (Crayola dusty rose; used for active tab overlays, title highlights, stat bars)
- **Page Background:** `#f8f9fa` (Light off-white slate)

### CSS Variables (Tailwind v4)
`packages/shell/src/index.css`:
```css
@theme {
  --font-pixel: "VT323", monospace;
  --font-press: "Press Start 2P", monospace;
  --color-cozy-bg: #f8f9fa;
  --color-cozy-text: oklch(20.8% 0.042 265.755);
  --color-cozy-border: oklch(20.8% 0.042 265.755);
  --color-cozy-accent: #CC6666;
}
```

## 3. Responsive Layout Restructuring
The Shell host is restructured from a fixed-width `500px` console to a modern, fluid grid that fits desktop and mobile devices.

### 3.1 Header Bar (Top Navigation)
- **Height:** `48px` or dynamic flex header.
- **Logo (Left):** Inline SVG terminal icon (`>_` chevron & cursor cursor line) followed by `PRXXIE` text. Styled in Fuzzy Wuzzy rose, vertically centered.
- **Navigation Menu (Right):** Horizontal menu links (`HOME`, `ABOUT`, `POSTS`, `PETS`). Vertically centered. Active tab is highlighted with a Fuzzy Wuzzy background and white text.
- **Mobile responsiveness:** Nav switches to inline flex-wrap or displays clean stacked block spacing on small screens.

### 3.2 Content Layout
- **Desktop (width >= 768px):** A two-column grid:
  - **Left Area (span-2):** Houses the active page container (About BIO folder directories, Posts reader, or Home introduction).
  - **Right Area (span-1):** Houses the virtual pet tamagotchi simulator MFE (`PETS`).
- **Mobile (width < 768px):** Stacks vertically:
  - Header is displayed at top.
  - Active page is displayed in full width.
  - Virtual pet room stows cleanly below the active content, keeping stats and pet interactive.

## 4. UI Elements Modification

### 4.1 Window Headers
All content cards are styled as retro GUI windows:
- Top bar has white background, a thick slate outline, and the window label (e.g. `MAIN_SCREEN.EXE`) highlighted in Fuzzy Wuzzy color.
- Controls are outlined in slate, using the accent color for exit (`[X]`) or minimize (`[-]`) buttons.

### 4.2 Terminal Icon SVG
```xml
<svg class="logo-icon-svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="var(--color-cozy-accent)" stroke-width="2.5" stroke-linecap="square">
  <path d="M3,4 L8,8 L3,12" />
  <line x1="9" y1="12" x2="14" y2="12" />
</svg>
```
