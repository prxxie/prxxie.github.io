# Sokoban Solver Deadlock Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Temporarily disable the buggy freeze deadlock heuristic to verify all Sokoban levels are solvable, then confirm the solver meets performance and accuracy constraints.

**Architecture:** BFS solver state pruning modification in `deadlock.ts` to prevent false positives during state space search.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Disable isFreezeDeadlock and Run Existing Levels Solver Test

**Files:**
- Modify: `packages/sokoban/src/solver/deadlock.ts:51-87`

- [ ] **Step 1: Modify isFreezeDeadlock to return false**
  Update `isFreezeDeadlock` in `packages/sokoban/src/solver/deadlock.ts` to immediately return `false`.
  
  ```typescript
  export function isFreezeDeadlock(
    box: Position,
    walls: boolean[][],
    targets: Position[]
  ): boolean {
    return false;
  }
  ```

- [ ] **Step 2: Run the test to verify all 100 levels are solvable**
  Run: `rtk npm run test -- packages/sokoban/src/solver/existing-levels.test.ts`
  Expected: All 100 levels should pass and be solved successfully within the state limit and timeout constraints.

- [ ] **Step 3: Commit the change**
  Run:
  ```bash
  rtk git add packages/sokoban/src/solver/deadlock.ts
  rtk git commit -m "fix(sokoban): temporarily disable isFreezeDeadlock to restore level solvability"
  ```

---

### Task 2: Verify Main Solver Tests Still Pass

**Files:**
- Test: `packages/sokoban/src/solver/solver.test.ts`

- [ ] **Step 1: Run main solver tests**
  Run: `rtk npm run test -- packages/sokoban/src/solver/solver.test.ts`
  Expected: PASS

- [ ] **Step 2: Run all packages/sokoban tests**
  Run: `rtk npm run test -- packages/sokoban/`
  Expected: PASS
