# Spec: Mobile Responsive Offcanvas Menu & Zoom Prevention

## 1. Overview and Goals
This specification details the design for improving mobile responsiveness across the cozy retro handheld console application. Specifically, we will implement a slide-out right offcanvas menu (Option A) managed by a Zustand store to handle navigation on small screens, prevent mobile zooming, and audit other responsive elements.

### Core Features:
- Disable user-scalable zooming in mobile viewport meta settings.
- Global Zustand UI store to track state for offcanvas menu.
- Slide-out right offcanvas drawer on mobile screens (`<md`).
- Click-away backdrop overlay to close the drawer.
- Automatic body scroll locking when the menu is open.
- Keyboard support (Esc to close drawer).

---

## 2. Architecture & State Management

### Zustand Store (`packages/shell/src/store/uiStore.js`)
We will create a global Zustand UI store to track offcanvas open/close state:
- `isMenuOpen` (boolean, default: `false`)
- `setMenuOpen(isOpen)` (action)
- `toggleMenu()` (action)

### Viewport Settings
Prevent viewport pinch-zooming on mobile:
Modify the viewport meta tag in `packages/shell/index.html` (and other sub-package templates for consistency):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimum-scale=1.0" />
```

---

## 3. UI and Component Details

### Header Updates (`packages/shell/src/components/ConsoleFrame.jsx`)
- **Desktop Mode**: Render standard horizontal navigation buttons (`hidden md:flex`).
- **Mobile Mode**: Hide horizontal buttons. Render a `[MENU.EXE]` pixel-btn on the right side of the header bar (`md:hidden`). Clicking this toggles `isMenuOpen`.

### Drawer & Overlay (`packages/shell/src/components/ConsoleFrame.jsx`)
- **Backdrop**: Render a clickable gray backdrop overlay (`fixed inset-0 bg-black/45 z-40 md:hidden`) when `isMenuOpen` is `true`.
- **Drawer**: Render a right drawer container (`fixed top-0 right-0 bottom-0 w-64 bg-white border-l-4 border-cozy-border z-50 p-4 shadow-lg md:hidden`) when `isMenuOpen` is `true`.
  - Drawer header: Labeled `📂 MENU.EXE` with `[X]` close button on the right.
  - Navigation links: Stacked vertically using full-width `.pixel-btn` styles. Clicking a link sets the new tab and closes the drawer.
- **Scroll Lock**: Add `overflow-hidden` to `document.body` when `isMenuOpen` is `true`.

### Animations (`packages/shell/src/index.css`)
Add slide-in animation from the right side:
```css
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

---

## 4. Test & Verification Plan

### Unit Tests
- Create `packages/shell/src/store/uiStore.test.js` to test Zustand store state modifications.
- Create `packages/shell/src/components/ConsoleFrame.test.jsx` to test toggle behavior, backdrop triggers, and list elements rendering under mocked viewport dimensions or state.

### Build Verification
- Compile code using `npm run build:static` to ensure that all workspaces compile without errors and MFE federation setups match.
