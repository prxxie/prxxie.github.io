# Sokoban Solver Deadlock Fix Design Spec

**Date:** 2026-06-01  
**Status:** Approved  
**Goal:** Fix false positives in the Sokoban solver's deadlock detection and verify all 100 levels are solvable.

## 1. Problem Statement
The current BFS solver uses a deadlock heuristic called `isFreezeDeadlock` in `deadlock.ts` to prune search states when a box is pushed against a wall. However, this heuristic is overly aggressive: it assumes that if a box is against a wall, and there are no targets on that row/column, the box is in a deadlock.

In reality, a box can slide along a wall and then be pushed away from the wall if there is a gap/corridor. This false-positive deadlock pruning causes the solver to discard valid paths, making most levels (starting with `hack-04`) report as unsolvable.

## 2. Proposed Changes
1. **Temporarily Disable `isFreezeDeadlock`**: Modify `isFreezeDeadlock` in `packages/sokoban/src/solver/deadlock.ts` to return `false` immediately.
2. **Run Solver Tests**: Execute `packages/sokoban/src/solver/existing-levels.test.ts` to solve all 100 levels using only `isSimpleCornerDeadlock`.
3. **Analyze Results**:
   - If all levels solve within state limit (100k states) and timeout (30s), keep `isFreezeDeadlock` disabled or remove it.
   - If some levels time out or exceed state limits, refine the heuristic to be more precise (e.g. checking for continuous walls without gaps).

## 3. Testing plan
- Run `rtk npm run test -- packages/sokoban/src/solver/existing-levels.test.ts`.
- Verify the test passes, indicating all 100 levels are solvable.
