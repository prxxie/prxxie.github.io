# Fix Sokoban Level Hack-10 Layout

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the unsolvable layout of level `hack-10` ("Buffer Overflow") in `levels.ts` so that it is solvable by the Sokoban BFS solver, verify all tests pass, and commit the fix.

**Architecture:** We will replace the two blocking walls at coordinates `y=2, x=4` and `y=4, x=4` in the `hack-10` grid with empty space ` `, allowing boxes to pass from the isolated left room to the right room where targets reside.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Modify hack-10 Grid Layout

**Files:**
- Modify: `packages/sokoban/src/levels.ts`

- [ ] **Step 1: Edit levels.ts to open paths in hack-10**
  In the `hack-10` level definition, replace the wall `#` characters at column index 4 of rows 2 and 4 with spaces.
  
  Expected lines to change:
  - Row 2: Change `"#  $##$## #"` to `"#  $ #$## #"`
  - Row 4: Change `"#  $##$   #"` to `"#  $ #$   #"`

### Task 2: Run Debug Test and Verify Solvability

**Files:**
- Test: `packages/sokoban/src/solver/debug.test.ts`

- [ ] **Step 1: Execute debug test**
  Run the debug test file targeting `hack-10` to verify that the solver successfully finds a solution.
  
  Run: `rtk npx vitest run packages/sokoban/src/solver/debug.test.ts`
  
  Expected output:
  - The solver output should show `solvable: true` instead of `solvable: false`.

### Task 3: Run Full Test Suite and Clean Up

**Files:**
- Delete: `packages/sokoban/src/solver/debug.test.ts`

- [ ] **Step 1: Run the full test suite**
  Verify that the layout change did not break other levels and all unit tests pass.
  
  Run: `rtk npm run test`
  
  Expected output:
  - All tests in the workspace (including Sokoban levels) pass successfully.

- [ ] **Step 2: Clean up debug.test.ts**
  Remove the temporary debug test file since it is no longer needed.
  
  Run: `rm packages/sokoban/src/solver/debug.test.ts`

### Task 4: Commit and Push Changes

**Files:**
- Modify: `packages/sokoban/src/levels.ts`

- [ ] **Step 1: Stage and commit the fix**
  Stage the level modification and commit it.
  
  Run:
  ```bash
  rtk git add packages/sokoban/src/levels.ts
  rtk git commit -m "fix(sokoban): open paths in hack-10 layout to make it solvable"
  ```
  
- [ ] **Step 2: Push changes to remote**
  Push the local commit to the remote feature branch.
  
  Run: `rtk git push`
