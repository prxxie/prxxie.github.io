# Refactor Codebase with React & TypeScript Best Practices

This design document outlines the plan for refactoring the **Cozy OS - prxxie** monorepo to align with React and TypeScript best practices, while polishing UI/UX interactions and accessibility.

## 1. Overview

**Cozy OS - prxxie** is a retro-styled micro-frontend monorepo. It features a host container (`shell`) and four remote modules (`about`, `posts`, `pets`, `shikaku`). 
The codebase is already written in TypeScript, but several areas can be refactored to align with modern best practices, improve type safety, optimize page interactions, and enhance accessibility.

## 2. Goals & Success Criteria

### Code Quality (React & TypeScript)
- Remove unused dependencies (e.g., `react-router-dom` in the shell MFE).
- Unify state types (`PetState`) between the host and remote modules.
- Secure and type `localStorage` serialization in the Shikaku game.
- Ensure audio system initialization is safe, standard, and resilient against browser autoplay restrictions.

### UI/UX & Accessibility (A11y)
- Replace OS-dependent system emojis with consistent, custom, inline pixel-art SVGs.
- Implement robust keyboard navigation with consistent visual focus states (`focus-visible`).
- Support accessibility preferences by disabling layout shifts and high-motion animations if `prefers-reduced-motion` is set.
- Fix color contrast issues on the level selection grid (contrast ratio >= 4.5:1).

---

## 3. Design Details

### Section 1: TypeScript & React Code Quality

#### Unifying Pet State Types
The shell MFE's `usePetStore` exposes `tick`, but the `PetsAppProps` in the pets MFE doesn't include it in its expected store definition type. We will align:
- Define `PetState` consistently across the packages.
- Ensure type definitions match exactly.

#### Safe LocalStorage Parsing in Shikaku
We will replace the unsafe `JSON.parse` cast in `useShikakuStore.ts`:
```typescript
// Safer parsing implementation
const saved = localStorage.getItem("cozy_os_shikaku_save");
if (saved) {
  const parsed = JSON.parse(saved) as unknown;
  if (parsed && typeof parsed === "object" && "completed" in parsed) {
    const completed = (parsed as { completed: CompletedLevels }).completed;
    set({ completedLevels: completed || {} });
  }
}
```

#### Autoplay Resilient Audio Synth
Modern browsers block AudioContext initialization without user interaction. We will safeguard `synth.ts`:
- Lazily initialize the `AudioContext` only on the first sound trigger or user interaction.
- Add `resume()` state checks before attempting to play retro notes.

---

### Section 2: UI/UX & CSS Improvements

#### Keyboard Navigation Focus Indicators
We will define custom, retro-styled dashed focus indicators:
```css
button:focus-visible,
[role="button"]:focus-visible,
.pixel-btn:focus-visible {
  outline: 3px dashed var(--color-cozy-accent);
  outline-offset: 2px;
}
```

#### Reduced Motion Media Query
Add to `index.css`:
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

#### WCAG Level Select Contrast
In `packages/shikaku/src/components/LevelSelect.tsx`, replace low-contrast text with theme-appropriate slate:
- Change `text-slate-500` on green background to `text-slate-700` or `text-emerald-950` to guarantee contrast ratios of 4.5:1.

#### Inline Pixel-Art SVG Replacements
We will create and render lightweight inline SVGs to replace native emojis:
- **Folder Icon (`📁`):** Classic pixel-outline computer folder.
- **Book/View Icon (`📖`):** Pixelated open book.
- **Paw Icon (`🐾`):** 8-bit retro paw block.
- **Scroll Icon (`📜`):** Vintage parchment scroll.
- **Back Icon (`🔙`):** Pixel arrow pointing left.
- **Chicken Icon (`🍗`):** Drumstick icon.
- **Bear Icon (`🧸`):** Toy bear face icon.
- **Sun/Moon Icon (`☀`/`🌙`):** Retro 8-bit sun/crescent.

---

## 4. Implementation Steps

1. **Clean up dependencies:** Uninstall `react-router-dom` from `packages/shell`.
2. **Refactor types and stores:** Update `petStore.ts` and `PetsApp.tsx` type safety. Apply safe JSON parsing to `useShikakuStore.ts`.
3. **Audio initialization safety:** Refactor `synth.ts` to be lazily initialized.
4. **CSS adjustments:** Update `index.css` for `focus-visible` indicators and `prefers-reduced-motion`.
5. **Level select contrast:** Update `LevelSelect.tsx` styling classes.
6. **SVG Replacements:** Replace all target emoji strings with unified React component SVGs.
7. **Verification:** Run typecheck, lint, and vitest test suite to verify no regressions.
