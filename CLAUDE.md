# CLAUDE.md — Cozy OS Development Guide

This guide describes development workflows, commands, and rules for agents and developers working in this codebase.

## 🛠 Commands Reference

Execute commands at the repository root. Always prefix execution commands with `rtk` (Rust Token Killer) to optimize token usage.

* **Start dev server (all packages)**: `rtk npm run dev`
* **Production static build**: `rtk npm run build:static`
* **Build individual packages**: `rtk npm run build -w packages/<name>`
* **Run tests (Vitest)**: `rtk npm run test`
* **Lint codebase**: `rtk npm run lint`
* **Type-check codebase**: `rtk npm run typecheck`

---

## ⚡ Rust Token Killer (RTK) Rules
Always use the `rtk` CLI proxy directly for execution operations:
- `rtk gain` — Check token analytics.
- `rtk discover` — Find optimization opportunities in shell history.
- `rtk proxy <cmd>` — Force raw command execution (debugging only).
- Standard git commands are automatically transparently intercepted; if you face issue, prefix explicitly with `rtk`.

---

## 📐 Code Style & Guidelines

### TypeScript & React
* Use React 18, functional components, and TypeScript (types, interfaces, no implicit `any`).
* Manage state using **Zustand** hooks.
* Load remote micro-frontends (MFEs) lazily with `React.lazy` and enclose them in a `<Suspense>` wrapper with a custom fallback component.
* Follow the props-based state injection pattern: only the `pets` MFE is injected with the shell host's `usePetStore` Zustand hook. Other MFEs must remain fully self-contained.

### Styling
* Use **Tailwind CSS v4** for layout and styling.
* Main custom tokens, animations, scanlines, CRT screen overlays, and retro layout styling are declared in `/packages/shell/src/index.css`. Use these predefined CSS variable tokens rather than creating ad-hoc color utility classes.

### Testing
* Write unit/integration tests with **Vitest**.
* In the `shell` host tests, mock all remote micro-frontends to prevent bundler resolution issues.
* Separate core business engines (like Shikaku solver or synth logic) from React components to keep them cleanly unit-testable.
