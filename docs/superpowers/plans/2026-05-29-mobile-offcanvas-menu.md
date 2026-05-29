# Mobile Offcanvas Navigation & Zoom Prevention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive slide-out right offcanvas side drawer for navigation menus on mobile viewport widths, prevent viewport zooming, and verify responsive scaling.

**Architecture:** Create a Zustand UI store to manage the open/close state of the offcanvas drawer. Modify `ConsoleFrame.jsx` to render the drawer UI, click-away backdrop, body scroll lock, and mobile-only `[MENU.EXE]` button. Adjust HTML viewport meta settings to prevent zoom.

**Tech Stack:** React, Zustand, Tailwind CSS v4, Vitest, `@testing-library/react`.

---

## Viewport Settings & Configuration

### Task 1: Prevent Viewport Zooming in index.html Templates
**Files:**
- Modify: `packages/shell/index.html`
- Modify: `packages/about/index.html`
- Modify: `packages/posts/index.html`
- Modify: `packages/pets/index.html`

- [ ] **Step 1: Edit viewport settings in index.html files**
Update the `<meta name="viewport">` tag in all 4 `index.html` files to prevent user-scalable zooming on mobile devices:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimum-scale=1.0" />
```

- [ ] **Step 2: Verify git diff changes**
Run: `git diff`
Expected: Diff shows viewport modification in 4 index.html files.

- [ ] **Step 3: Commit**
```bash
git add packages/*/index.html
git commit -m "chore: prevent user-scalable zooming on mobile viewport settings"
```

---

## State Management

### Task 2: Implement Zustand UI Store & Tests
**Files:**
- Create: `packages/shell/src/store/uiStore.js`
- Create: `packages/shell/src/store/uiStore.test.js`

- [ ] **Step 1: Write unit tests for uiStore.js**
Create `packages/shell/src/store/uiStore.test.js` to test store operations (initial state, toggle, set menu open).
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('Zustand useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ isMenuOpen: false });
  });

  it('has initial isMenuOpen state as false', () => {
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it('setMenuOpen updates the state correctly', () => {
    useUiStore.getState().setMenuOpen(true);
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    useUiStore.getState().setMenuOpen(false);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it('toggleMenu toggles the state correctly', () => {
    useUiStore.getState().toggleMenu();
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    useUiStore.getState().toggleMenu();
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run test suite to verify failure**
Run: `npm test`
Expected: FAIL (cannot import `useUiStore` from `./uiStore`).

- [ ] **Step 3: Implement useUiStore**
Create `packages/shell/src/store/uiStore.js`:
```javascript
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isMenuOpen: false,
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen }))
}));
```

- [ ] **Step 4: Run test suite to verify success**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add packages/shell/src/store/uiStore.js packages/shell/src/store/uiStore.test.js
git commit -m "feat: add Zustand store to manage mobile offcanvas menu state"
```

---

## Styling Updates

### Task 3: Append Offcanvas Animations in index.css
**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Append slide-in animation keyframes**
Add `@keyframes slideIn` definitions to the end of `packages/shell/src/index.css`:
```css
/* --- Offcanvas Slide-in Drawer Animation --- */
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add packages/shell/src/index.css
git commit -m "style: add slide-in animation keyframes for mobile menu drawer"
```

---

## UI Components & Integration

### Task 4: Implement ConsoleFrame Offcanvas Menu & Backdrop
**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.jsx`
- Create: `packages/shell/src/components/ConsoleFrame.test.jsx`

- [ ] **Step 1: Create unit tests for ConsoleFrame offcanvas behaviors**
Create `packages/shell/src/components/ConsoleFrame.test.jsx` that renders `ConsoleFrame` and checks responsiveness triggers.
```javascript
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsoleFrame from './ConsoleFrame';
import { useUiStore } from '../store/uiStore';

describe('ConsoleFrame Responsive Menu', () => {
  beforeEach(() => {
    useUiStore.setState({ isMenuOpen: false });
  });

  it('renders standard horizontal buttons and hides mobile menu button by default', () => {
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    // Desktop navigation checks
    expect(screen.getByText('HOME')).toBeInTheDocument();
    
    // Toggle button should be rendered but styled hidden on desktop
    const menuBtn = screen.getByRole('button', { name: '[MENU.EXE]' });
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn).toHaveClass('md:hidden');
  });

  it('opens offcanvas menu drawer when clicking [MENU.EXE]', () => {
    render(<ConsoleFrame currentTab="home" setTab={() => {}} />);
    
    const menuBtn = screen.getByRole('button', { name: '[MENU.EXE]' });
    fireEvent.click(menuBtn);
    
    // Zustand state check
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    // Verify offcanvas contents
    expect(screen.getByText('📂 MENU.EXE')).toBeInTheDocument();
    
    // Drawer close action check
    const closeBtn = screen.getByRole('button', { name: '[X]' });
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run test suite to verify failure**
Run: `npm test`
Expected: FAIL (no button found with name `[MENU.EXE]`).

- [ ] **Step 3: Implement mobile menu toggle, backdrop overlay, and slide drawer**
Modify `packages/shell/src/components/ConsoleFrame.jsx`. Import `useUiStore` and render drawer markup, dynamic toggle classes, and backdrop click handlers.
```javascript
import React, { useEffect } from 'react';
import { usePetStore } from '../store/petStore';
import { useUiStore } from '../store/uiStore';

export default function ConsoleFrame({ children, currentTab, setTab }) {
  const { isMenuOpen, setMenuOpen, toggleMenu } = useUiStore();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMenuOpen]);

  const handleTabClick = (tabName) => {
    setTab(tabName);
    setMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'posts', label: 'POSTS' },
    { id: 'pets', label: 'PETS' }
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
      {/* Top Header Bar */}
      <header className="bg-white border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border">
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

          {/* Navigation Menu (Desktop Only) */}
          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleTabClick(item.id)} 
                className={`pixel-btn text-[9px] px-3 py-1 ${currentTab === item.id ? 'bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Menu Toggle Button (Mobile Only) */}
          <button
            onClick={toggleMenu}
            className="md:hidden pixel-btn text-[9px] px-3 py-1"
          >
            [MENU.EXE]
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/45 z-40 md:hidden animate-[fade-in_0.2s_ease-out]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Offcanvas Drawer Panel */}
      {isMenuOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-64 bg-white border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden">
          <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2">
            <span className="font-press text-[10px] text-cozy-accent">📂 MENU.EXE</span>
            <button 
              onClick={() => setMenuOpen(false)} 
              className="text-cozy-accent font-bold cursor-pointer font-press text-[10px] bg-transparent border-none"
            >
              [X]
            </button>
          </div>
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`pixel-btn w-full text-[10px] text-left py-2 px-3 ${currentTab === item.id ? 'bg-cozy-accent text-white border-cozy-border shadow-none' : ''}`}
              >
                {currentTab === item.id ? '[x]' : '[ ]'} {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Content Section */}
      <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run test suite to verify success**
Run: `npm test`
Expected: PASS (all tests pass cleanly).

- [ ] **Step 5: Commit**
```bash
git add packages/shell/src/components/ConsoleFrame.jsx packages/shell/src/components/ConsoleFrame.test.jsx
git commit -m "feat: implement mobile responsive offcanvas menu and backdrop overlay"
```

---

## Assembly & Testing

### Task 5: Final Static Build Integration Verification
**Files:**
- None (command-only)

- [ ] **Step 1: Recompile full monorepo static build**
Run: `npm run build:static`
Expected: Compilation completes successfully.

- [ ] **Step 2: Commit checklist updates**
Check off completed tasks in tasks-todo.md and commit:
```bash
git add docs/superpowers/plans/tasks-todo.md
git commit -m "docs: complete mobile offcanvas navigation implementation checklist"
```
