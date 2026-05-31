# Sokoban 30 Hacker-Themed Levels Design

**Date:** 2026-05-31  
**Status:** Approved  
**Goal:** Create 30 new hacker-themed Sokoban levels from easy to hard, with algorithmic verification that every level is solvable.

## Overview

Replace the existing 20 levels in `packages/sokoban/src/levels.ts` with 30 entirely new hacker-themed puzzle levels. Each level must be provably solvable through automated solver verification. The difficulty curve should be aggressive, starting accessible but ramping up to genuinely challenging puzzles in the final third.

## Requirements

### Functional Requirements

1. **30 Levels Total**: Complete set of levels numbered 1-30
2. **Hacker Theme**: All level names use programming/security concepts (e.g., "Hello World", "Stack Overflow", "SQL Injection", "Zero Day")
3. **Guaranteed Solvability**: Every level must pass automated solver verification
4. **Aggressive Difficulty Curve**: 
   - Levels 1-5: Tutorial basics (1-2 boxes)
   - Levels 6-10: Sequencing introduction (2-3 boxes)
   - Levels 11-15: Deadlock awareness (3-4 boxes)
   - Levels 16-20: Spatial reasoning (4-5 boxes)
   - Levels 21-25: Advanced tactics (5-6 boxes)
   - Levels 26-30: Expert mastery (6-7 boxes, 100+ move solutions)
5. **Moderate Grid Sizes**: Keep levels between 6×8 and 10×12 to focus on puzzle mechanics rather than scale

### Technical Requirements

1. **Level Format**: Match existing `LevelData` interface (id, name, grid)
2. **Valid Symbols**: Use standard Sokoban notation (`#` wall, `@` player, `$` box, `.` target, ` ` empty, `*` box on target, `+` player on target)
3. **Level Validation**: Each level must have exactly 1 player, N boxes, N targets
4. **Solver Integration**: Automated tests verify solvability during development

## Architecture

### Component Breakdown

#### 1. Sokoban Solver (`packages/sokoban/src/solver/`)

**Purpose:** Verify level solvability and provide solution metrics.

**Files:**
- `solver.ts` - Main BFS solver with state management
- `deadlock.ts` - Deadlock detection heuristics
- `state.ts` - State representation and hashing utilities

**Algorithm: BFS with Deadlock Pruning**

The solver uses breadth-first search to guarantee shortest solutions while pruning unsolvable states early.

**State Representation:**
```typescript
interface SolverState {
  playerX: number;
  playerY: number;
  boxes: Array<{x: number, y: number}>;
  moveCount: number;
  path: string[]; // for solution reconstruction
}
```

**State Hashing:**
Normalize box positions (sort by coordinates) and create hash string: `${playerX},${playerY}|${box1X},${box1Y}|${box2X},${box2Y}...`

**Deadlock Detection:**

Prune states that are provably unsolvable:

1. **Simple Corner Deadlock**: Box in corner with no target at that corner
2. **Freeze Deadlock**: Box against wall with no target on that wall segment
3. **Corral Deadlock**: Multiple boxes forming unmovable cluster away from targets
4. **Goal Room Deadlock**: Box pushed into enclosed area with no targets and no exit path

**Search Strategy:**
- BFS queue ensures shortest solution by move count
- Visited set (using state hash) prevents cycles
- Early termination when all boxes on targets
- State limit (100k states) and timeout (30s) prevent infinite loops on broken levels

**Return Value:**
```typescript
interface SolverResult {
  solvable: boolean;
  moveCount?: number;
  solution?: string[]; // array of moves: 'up', 'down', 'left', 'right'
  statesExplored?: number;
}
```

#### 2. Level Data (`packages/sokoban/src/levels.ts`)

**Purpose:** Store the 30 level definitions.

**Structure:**
```typescript
export const SOKOBAN_LEVELS: LevelData[] = [
  // Levels 1-5: Easy
  { id: "hack-01", name: "Hello World", grid: [...] },
  { id: "hack-02", name: "Null Pointer", grid: [...] },
  // ... 28 more levels
  { id: "hack-30", name: "Singularity", grid: [...] }
];
```

**Level ID Format:** `hack-01` through `hack-30` (zero-padded)

#### 3. Verification Tests (`packages/sokoban/src/levels.test.ts`)

**Purpose:** Automated validation of all levels.

**Existing Tests (keep):**
- Symbol validation (only allowed characters)
- Structure validation (1 player, N boxes, N targets)

**New Tests (add):**
- Solvability test: Run solver on each level, assert `solvable === true`
- Performance test: Assert solver completes within 30 seconds per level

## Level Design Principles

### Core Mechanics Progression

**Levels 1-5: Fundamentals**
- Single box push-to-target
- Two boxes with obvious order
- Introduce basic spatial awareness
- No deadlock traps

**Levels 6-10: Sequencing**
- Order matters: wrong sequence creates deadlocks
- Introduce narrow corridors
- Multiple valid paths but one optimal
- Teach "thinking ahead"

**Levels 11-15: Deadlock Awareness**
- Deliberate deadlock traps
- Corner and wall freeze scenarios
- Require backtracking when mistakes made
- Introduce box-to-box blocking

**Levels 16-20: Spatial Reasoning**
- Tight spaces with limited maneuvering
- Room-to-room puzzles
- Box chains (push one to access another)
- Sacrifice moves (push box away from target temporarily)

**Levels 21-25: Advanced Tactics**
- Multi-step sequences (5+ moves to position one box)
- Interdependent box movements
- Complex backtracking requirements
- Pattern recognition challenges

**Levels 26-30: Expert Mastery**
- 100+ move optimal solutions
- Deep search trees (many dead ends)
- Subtle deadlock patterns
- Require planning 10+ moves ahead
- "Aha moment" solutions

### Design Constraints

1. **No Trivial Solutions**: Even easy levels should require thought
2. **Intentional Design**: Every wall, space, and box placement serves a purpose
3. **Elegant Solutions**: Prefer levels with clever insights over brute-force grinding
4. **Moderate Size**: Keep grids 6×8 to 10×12 to maintain focus
5. **Thematic Consistency**: Hacker names should feel appropriate to difficulty/complexity

### Hacker Theme Name Bank

**Easy (1-5):**
- Hello World
- Null Pointer
- Syntax Error
- First Commit
- Console Log

**Medium (6-10):**
- Stack Overflow
- Infinite Loop
- Race Condition
- Memory Leak
- Buffer Overflow

**Hard (11-15):**
- Segmentation Fault
- Heap Fragmentation
- Deadlock
- Thread Starvation
- Cache Miss

**Expert (16-20):**
- SQL Injection
- XSS Attack
- CSRF Token
- Man in the Middle
- Zero Day

**Advanced (21-25):**
- Kernel Panic
- Privilege Escalation
- Side Channel
- Timing Attack
- Spectre

**Master (26-30):**
- Ransomware
- Rootkit
- Cryptanalysis
- Quantum Entanglement
- Singularity

## Development Workflow

### Phase 1: Build Solver (Foundation)

1. Implement state representation and hashing (`state.ts`)
2. Implement deadlock detection functions (`deadlock.ts`)
3. Implement BFS solver with pruning (`solver.ts`)
4. Write unit tests for solver components
5. Test solver on existing 20 levels to validate correctness

### Phase 2: Design Levels in Batches

For each batch (1-5, 6-10, 11-15, 16-20, 21-25, 26-30):

1. Hand-design 5 levels following difficulty guidelines
2. Run solver on each level
3. If unsolvable: analyze why, redesign, re-verify
4. If solvable: record move count, adjust difficulty if needed
5. Iterate until all 5 levels in batch pass

### Phase 3: Integration and Testing

1. Replace `packages/sokoban/src/levels.ts` with final 30 levels
2. Update `levels.test.ts` with solvability tests
3. Run full test suite
4. Verify difficulty progression (move counts should generally increase)
5. Manual playtest sample levels from each tier

## Testing Strategy

### Unit Tests

**Solver Tests:**
- State hashing produces consistent results
- Deadlock detection catches known patterns
- Solver finds solutions for simple known-solvable levels
- Solver rejects known-unsolvable levels

**Level Tests:**
- All 30 levels use valid symbols
- All 30 levels have exactly 1 player
- All 30 levels have matching box/target counts
- All 30 levels are solvable (solver returns `solvable: true`)

### Integration Tests

- Full test suite runs in reasonable time (<5 minutes)
- No level times out during solver verification
- Difficulty progression is reasonable (later levels generally have higher move counts)

### Manual Testing

- Playtest levels 1, 5, 10, 15, 20, 25, 30 to verify feel
- Confirm early levels are accessible to new players
- Confirm late levels are genuinely challenging

## Success Criteria

1. ✅ 30 levels created with hacker theme names
2. ✅ All levels pass automated solvability verification
3. ✅ Difficulty curve is aggressive (easy start, hard finish)
4. ✅ Grid sizes stay moderate (6×8 to 10×12)
5. ✅ All tests pass
6. ✅ Solver is reusable for future level design

## Future Enhancements (Out of Scope)

- Level editor with real-time solver feedback
- Solution replay/visualization
- Difficulty rating based on solver metrics (states explored, move count)
- Procedural level generation using solver validation
- Hint system using solver's solution path

## References

- Existing levels: `packages/sokoban/src/levels.ts`
- Reference file: `sokoban_hacking_levels_30.ts` (inspiration only, not copying)
- Level format: `packages/sokoban/src/types.ts` (`LevelData` interface)
- Existing tests: `packages/sokoban/src/levels.test.ts`
