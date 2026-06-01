# Pet Progression System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared progression system where solving puzzles earns food, food feeds the pet to gain XP, and XP drives evolution — wired into Shikaku and Sokoban via a repository-abstracted service.

**Architecture:** A new `packages/shared` workspace package owns all progression logic (types, service, repository). Shell, Shikaku, and Sokoban each bundle their own copy of the shared package and talk to a common `LocalProgressRepository` backed by a single `localStorage` key. The shell sidebar renders a new `PetWidget` that reacts to state changes via a `CustomEvent` dispatched after every mutation. Future Supabase migration only requires swapping the repository implementation.

**Tech Stack:** TypeScript (no React in shared), Zustand (shell petStore cosmetics only), Vitest + jsdom, vite-plugin-federation (Module Federation), npm workspaces.

---

## File Map

**Create:**
```
packages/shared/package.json
packages/shared/src/index.ts
packages/shared/src/progress/types.ts
packages/shared/src/progress/service.ts
packages/shared/src/progress/service.test.ts
packages/shared/src/pet/evolution.ts
packages/shared/src/pet/evolution.test.ts
packages/shared/src/repository/ProgressRepository.ts
packages/shared/src/repository/LocalProgressRepository.ts
packages/shared/src/repository/LocalProgressRepository.test.ts
packages/shell/src/hooks/useProgressService.ts
packages/shell/src/components/PetWidget.tsx
```

**Modify:**
```
tsconfig.json                                        — include packages/shared/src/**/*.ts
vitest.config.ts                                     — add shared alias
packages/shell/package.json                          — add "shared": "*"
packages/shikaku/package.json                        — add "shared": "*"
packages/sokoban/package.json                        — add "shared": "*"
packages/shell/src/App.tsx                           — replace PetsApp in sidebar with PetWidget
packages/shikaku/src/ShikakuApp.tsx                  — call completeLevel on win, show reward msg
packages/shikaku/src/ShikakuApp.test.tsx             — mock shared
packages/sokoban/src/components/WinModal.tsx         — call completeLevel on win, show reward msg
packages/sokoban/src/SokobanApp.test.tsx             — mock shared
```

---

### Task 1: Create `packages/shared` scaffold and wire monorepo

**Files:**
- Create: `packages/shared/package.json`
- Modify: `tsconfig.json`
- Modify: `vitest.config.ts`
- Modify: `packages/shell/package.json`
- Modify: `packages/shikaku/package.json`
- Modify: `packages/sokoban/package.json`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "shared",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    }
  }
}
```

- [ ] **Step 2: Add `shared` to tsconfig.json include**

Open `tsconfig.json`. In the `"include"` array, add one line after the last sokoban entry:

```json
"packages/shared/src/**/*.ts"
```

Full updated include array:
```json
"include": [
  "packages/shell/src/**/*.ts",
  "packages/shell/src/**/*.tsx",
  "packages/shell/src/**/*.d.ts",
  "packages/about/src/**/*.ts",
  "packages/about/src/**/*.tsx",
  "packages/posts/src/**/*.ts",
  "packages/posts/src/**/*.tsx",
  "packages/pets/src/**/*.ts",
  "packages/pets/src/**/*.tsx",
  "packages/shikaku/src/**/*.ts",
  "packages/shikaku/src/**/*.tsx",
  "packages/shikaku/src/**/*.d.ts",
  "packages/sokoban/src/**/*.ts",
  "packages/sokoban/src/**/*.tsx",
  "packages/shared/src/**/*.ts",
  "vitest.config.ts",
  "packages/*/vite.config.ts"
]
```

- [ ] **Step 3: Add `shared` alias to `vitest.config.ts`**

Add the `shared` alias to the existing resolve.alias object:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "about/AboutApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "posts/PostsApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "pets/PetsApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "shikaku/ShikakuApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "sokoban/SokobanApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "shared": path.resolve(
        __dirname,
        "./packages/shared/src/index.ts"
      ),
    },
  },
});
```

- [ ] **Step 4: Add `"shared": "*"` to shell, shikaku, sokoban package.json**

In `packages/shell/package.json`, add to `"dependencies"`:
```json
"shared": "*"
```

In `packages/shikaku/package.json`, add to `"dependencies"`:
```json
"shared": "*"
```

In `packages/sokoban/package.json`, add to `"dependencies"`:
```json
"shared": "*"
```

- [ ] **Step 5: Install workspace deps to create symlinks**

Run:
```bash
npm install
```

Expected: `node_modules/shared` symlink points to `packages/shared`.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/package.json tsconfig.json vitest.config.ts \
  packages/shell/package.json packages/shikaku/package.json packages/sokoban/package.json \
  package-lock.json
git commit -m "feat(shared): scaffold shared package and wire monorepo"
```

---

### Task 2: Evolution logic

**Files:**
- Create: `packages/shared/src/pet/evolution.ts`
- Create: `packages/shared/src/pet/evolution.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/shared/src/pet/evolution.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./evolution";

describe("getEvolutionStage", () => {
  it("returns stage 1 for xp 0–9", () => {
    expect(getEvolutionStage(0)).toBe(1);
    expect(getEvolutionStage(9)).toBe(1);
  });

  it("returns stage 2 for xp 10–29", () => {
    expect(getEvolutionStage(10)).toBe(2);
    expect(getEvolutionStage(29)).toBe(2);
  });

  it("returns stage 3 for xp 30–59", () => {
    expect(getEvolutionStage(30)).toBe(3);
    expect(getEvolutionStage(59)).toBe(3);
  });

  it("returns stage 4 for xp 60–99", () => {
    expect(getEvolutionStage(60)).toBe(4);
    expect(getEvolutionStage(99)).toBe(4);
  });

  it("returns stage 5 for xp >= 100", () => {
    expect(getEvolutionStage(100)).toBe(5);
    expect(getEvolutionStage(9999)).toBe(5);
  });

  it("EVOLUTION_THRESHOLDS has 5 entries", () => {
    expect(EVOLUTION_THRESHOLDS).toHaveLength(5);
  });

  it("first threshold is 0", () => {
    expect(EVOLUTION_THRESHOLDS[0]).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/pet/evolution.test.ts
```

Expected: FAIL — `Cannot find module './evolution'`

- [ ] **Step 3: Write implementation**

Create `packages/shared/src/pet/evolution.ts`:

```typescript
export const EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100];

export function getEvolutionStage(xp: number): number {
  let stage = 1;
  for (let i = 1; i < EVOLUTION_THRESHOLDS.length; i++) {
    if (xp >= EVOLUTION_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/pet/evolution.test.ts
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/pet/
git commit -m "feat(shared): add evolution stage logic with thresholds"
```

---

### Task 3: Progress types and repository interface

**Files:**
- Create: `packages/shared/src/progress/types.ts`
- Create: `packages/shared/src/repository/ProgressRepository.ts`

No tests needed — these are pure type declarations.

- [ ] **Step 1: Create `packages/shared/src/progress/types.ts`**

```typescript
export type CompletedLevel = {
  module: string;
  levelId: string;
  completedAt: number;
};

export type PetState = {
  xp: number;
  stage: number;
  lastFedAt: number;
};

export type ProgressState = {
  completedLevels: CompletedLevel[];
  foodConsumed: number;
  pet: PetState;
};
```

- [ ] **Step 2: Create `packages/shared/src/repository/ProgressRepository.ts`**

```typescript
import type { ProgressState } from "../progress/types";

export interface ProgressRepository {
  getState(): Promise<ProgressState>;
  completeLevel(module: string, levelId: string): Promise<boolean>;
  feedPet(): Promise<void>;
  saveState(state: ProgressState): Promise<void>;
}
```

`completeLevel` returns `true` on first completion, `false` if already completed.  
`feedPet` increments `xp`, `foodConsumed`, `lastFedAt`, and updates `stage`.  
Repository implementations own the persistence details; the service owns precondition checks.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/progress/types.ts packages/shared/src/repository/ProgressRepository.ts
git commit -m "feat(shared): add ProgressState types and ProgressRepository interface"
```

---

### Task 4: LocalProgressRepository

**Files:**
- Create: `packages/shared/src/repository/LocalProgressRepository.ts`
- Create: `packages/shared/src/repository/LocalProgressRepository.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/shared/src/repository/LocalProgressRepository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { LocalProgressRepository } from "./LocalProgressRepository";

const STORAGE_KEY = "cozyos.progress.v1";

describe("LocalProgressRepository", () => {
  let repo: LocalProgressRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalProgressRepository();
  });

  describe("getState", () => {
    it("returns initial state when localStorage is empty", async () => {
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
      expect(state.foodConsumed).toBe(0);
      expect(state.pet.xp).toBe(0);
      expect(state.pet.stage).toBe(1);
      expect(state.pet.lastFedAt).toBe(0);
    });

    it("returns initial state when localStorage contains malformed JSON", async () => {
      localStorage.setItem(STORAGE_KEY, "not-json{{{");
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
    });

    it("returns initial state when version field is missing", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: {} }));
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
    });
  });

  describe("saveState / getState round-trip", () => {
    it("persists and restores state", async () => {
      const saved = {
        completedLevels: [{ module: "shikaku", levelId: "easy-1", completedAt: 1000 }],
        foodConsumed: 1,
        pet: { xp: 1, stage: 1, lastFedAt: 9000 },
      };
      await repo.saveState(saved);
      const loaded = await repo.getState();
      expect(loaded).toEqual(saved);
    });
  });

  describe("completeLevel", () => {
    it("returns true and saves on first completion", async () => {
      const result = await repo.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(1);
      expect(state.completedLevels[0].module).toBe("shikaku");
      expect(state.completedLevels[0].levelId).toBe("easy-1");
    });

    it("returns false and does not duplicate on second call", async () => {
      await repo.completeLevel("shikaku", "easy-1");
      const result = await repo.completeLevel("shikaku", "easy-1");
      expect(result).toBe(false);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(1);
    });

    it("treats same levelId in different modules as distinct", async () => {
      await repo.completeLevel("shikaku", "level-1");
      const result = await repo.completeLevel("sokoban", "level-1");
      expect(result).toBe(true);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(2);
    });
  });

  describe("feedPet", () => {
    it("increments xp by 1 and foodConsumed by 1", async () => {
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.xp).toBe(1);
      expect(state.foodConsumed).toBe(1);
    });

    it("sets lastFedAt to a recent timestamp", async () => {
      const before = Date.now();
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.lastFedAt).toBeGreaterThanOrEqual(before);
      expect(state.pet.lastFedAt).toBeLessThanOrEqual(Date.now());
    });

    it("advances stage when xp crosses threshold (10 → stage 2)", async () => {
      await repo.saveState({
        completedLevels: [],
        foodConsumed: 9,
        pet: { xp: 9, stage: 1, lastFedAt: 0 },
      });
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.xp).toBe(10);
      expect(state.pet.stage).toBe(2);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/repository/LocalProgressRepository.test.ts
```

Expected: FAIL — `Cannot find module './LocalProgressRepository'`

- [ ] **Step 3: Write implementation**

Create `packages/shared/src/repository/LocalProgressRepository.ts`:

```typescript
import { getEvolutionStage } from "../pet/evolution";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

const STORAGE_KEY = "cozyos.progress.v1";

interface StoredData {
  version: 1;
  state: ProgressState;
}

function initialState(): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
  };
}

export class LocalProgressRepository implements ProgressRepository {
  async getState(): Promise<ProgressState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const data = JSON.parse(raw) as StoredData;
      if (data.version !== 1) return initialState();
      return data.state;
    } catch {
      return initialState();
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    const data: StoredData = { version: 1, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const state = await this.getState();
    const alreadyDone = state.completedLevels.some(
      (l) => l.module === module && l.levelId === levelId
    );
    if (alreadyDone) return false;
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, completedAt: Date.now() },
      ],
    });
    return true;
  }

  async feedPet(): Promise<void> {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now(),
      },
    });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/repository/LocalProgressRepository.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/repository/
git commit -m "feat(shared): implement LocalProgressRepository with localStorage"
```

---

### Task 5: ProgressService

**Files:**
- Create: `packages/shared/src/progress/service.ts`
- Create: `packages/shared/src/progress/service.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/shared/src/progress/service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProgressService, HUNGER_COOLDOWN } from "./service";
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

function makeState(overrides?: Partial<ProgressState>): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
    ...overrides,
  };
}

function makeMockRepo(state: ProgressState): ProgressRepository {
  return {
    getState: vi.fn().mockResolvedValue(state),
    saveState: vi.fn().mockResolvedValue(undefined),
    completeLevel: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ProgressService", () => {
  describe("getFoodAvailable", () => {
    it("returns completedLevels.length - foodConsumed", async () => {
      const state = makeState({
        completedLevels: [
          { module: "shikaku", levelId: "a", completedAt: 1 },
          { module: "sokoban", levelId: "b", completedAt: 2 },
          { module: "shikaku", levelId: "c", completedAt: 3 },
        ],
        foodConsumed: 1,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(2);
    });

    it("returns 0 when no levels completed", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.getFoodAvailable()).toBe(0);
    });
  });

  describe("isPetHungry", () => {
    it("returns true when lastFedAt is 0 (never fed)", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.isPetHungry()).toBe(true);
    });

    it("returns false when fed less than HUNGER_COOLDOWN ago", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - 1000 } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(false);
    });

    it("returns true when fed exactly HUNGER_COOLDOWN ago", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(true);
    });
  });

  describe("completeLevel", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      expect(repo.completeLevel).toHaveBeenCalledWith("shikaku", "easy-1");
    });
  });

  describe("feedPet", () => {
    it("calls repo.feedPet when pet is hungry and food is available", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).toHaveBeenCalledOnce();
    });

    it("does NOT call repo.feedPet when pet is not hungry", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });

    it("does NOT call repo.feedPet when food is 0", async () => {
      const state = makeState({
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });
  });

  describe("HUNGER_COOLDOWN", () => {
    it("is 4 hours in milliseconds", () => {
      expect(HUNGER_COOLDOWN).toBe(4 * 60 * 60 * 1000);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/progress/service.test.ts
```

Expected: FAIL — `Cannot find module './service'`

- [ ] **Step 3: Write implementation**

Create `packages/shared/src/progress/service.ts`:

```typescript
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

export const HUNGER_COOLDOWN = 4 * 60 * 60 * 1000;

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async getState(): Promise<ProgressState> {
    return this.repo.getState();
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const result = await this.repo.completeLevel(module, levelId);
    window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    return result;
  }

  async feedPet(): Promise<void> {
    const [hungry, food] = await Promise.all([
      this.isPetHungry(),
      this.getFoodAvailable(),
    ]);
    if (!hungry || food <= 0) return;
    await this.repo.feedPet();
    window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
  }

  async getFoodAvailable(): Promise<number> {
    const state = await this.repo.getState();
    return state.completedLevels.length - state.foodConsumed;
  }

  async isPetHungry(): Promise<boolean> {
    const state = await this.repo.getState();
    return Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
  }

  async getPetStage(): Promise<number> {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- --reporter=verbose packages/shared/src/progress/service.test.ts
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/progress/
git commit -m "feat(shared): implement ProgressService with hunger cooldown and food guard"
```

---

### Task 6: Shared barrel export

**Files:**
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create `packages/shared/src/index.ts`**

```typescript
export type { CompletedLevel, PetState, ProgressState } from "./progress/types";
export type { ProgressRepository } from "./repository/ProgressRepository";
export { LocalProgressRepository } from "./repository/LocalProgressRepository";
export { ProgressService, HUNGER_COOLDOWN } from "./progress/service";
export { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./pet/evolution";
```

- [ ] **Step 2: Verify the full test suite still passes**

Run:
```bash
npm test
```

Expected: all existing tests pass, no new failures.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "feat(shared): add barrel export for shared package"
```

---

### Task 7: Shell hook — useProgressService

**Files:**
- Create: `packages/shell/src/hooks/useProgressService.ts`

No separate test file for the hook itself — the integration is verified through PetWidget rendering and the existing test suite.

- [ ] **Step 1: Create `packages/shell/src/hooks/useProgressService.ts`**

```typescript
import { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import type { ProgressState } from "shared";

const progressService = new ProgressService(new LocalProgressRepository());

const EMPTY_STATE: ProgressState = {
  completedLevels: [],
  foodConsumed: 0,
  pet: { xp: 0, stage: 1, lastFedAt: 0 },
};

export function useProgressService() {
  const [state, setState] = useState<ProgressState>(EMPTY_STATE);
  const [isHungry, setIsHungry] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(0);

  const refresh = useCallback(async () => {
    const [s, hungry, food] = await Promise.all([
      progressService.getState(),
      progressService.isPetHungry(),
      progressService.getFoodAvailable(),
    ]);
    setState(s);
    setIsHungry(hungry);
    setFoodAvailable(food);
  }, []);

  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refresh]);

  const feedPet = useCallback(async () => {
    await progressService.feedPet();
  }, []);

  return { state, isHungry, foodAvailable, feedPet };
}

export { progressService };
```

- [ ] **Step 2: Verify typecheck passes**

Run:
```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shell/src/hooks/useProgressService.ts
git commit -m "feat(shell): add useProgressService hook backed by shared ProgressService"
```

---

### Task 8: Shell PetWidget component

**Files:**
- Create: `packages/shell/src/components/PetWidget.tsx`

- [ ] **Step 1: Create `packages/shell/src/components/PetWidget.tsx`**

```tsx
import React, { useState, useCallback } from "react";
import PetSprite from "./PetSprite";
import { useProgressService } from "../hooks/useProgressService";
import type { PetStatus } from "../types";

export default function PetWidget(): React.ReactElement {
  const { state, isHungry, foodAvailable, feedPet } = useProgressService();
  const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");

  const handleFeed = useCallback(async () => {
    await feedPet();
    setSpriteStatus("eating");
    setTimeout(() => setSpriteStatus("idle"), 2000);
  }, [feedPet]);

  const canFeed = isHungry && foodAvailable > 0;

  return (
    <div className="flex flex-col items-center gap-2 p-2 text-cozy-text">
      <div className="border border-cozy-border p-2 bg-black flex items-center justify-center">
        <PetSprite size={64} status={spriteStatus} />
      </div>

      <div className="w-full flex flex-col gap-1 font-mono text-[9px]">
        <div className="flex justify-between">
          <span className="font-press">STAGE:</span>
          <span>{state.pet.stage}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">XP:</span>
          <span>{state.pet.xp}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">FOOD:</span>
          <span>{foodAvailable}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">STATUS:</span>
          <span>{isHungry ? "HUNGRY" : "FULL"}</span>
        </div>
      </div>

      <button
        onClick={() => { void handleFeed(); }}
        disabled={!canFeed}
        className="w-full pixel-btn text-[8px] disabled:opacity-40 disabled:pointer-events-none"
      >
        {canFeed ? "FEED PET" : isHungry ? "NO FOOD" : "NOT HUNGRY"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck passes**

Run:
```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shell/src/components/PetWidget.tsx
git commit -m "feat(shell): add PetWidget showing XP, stage, food, and feed button"
```

---

### Task 9: Wire PetWidget into App.tsx sidebar

**Files:**
- Modify: `packages/shell/src/App.tsx`

The current `App.tsx` renders `<PetsApp usePetStore={usePetStore} />` in two places: the desktop sidebar and the mobile drawer. These get replaced with `<PetWidget />`. The pets full-screen tab still renders `<PetsApp>`.

- [ ] **Step 1: Add PetWidget import to App.tsx**

At the top of `packages/shell/src/App.tsx`, add:
```tsx
import PetWidget from "./components/PetWidget";
```

- [ ] **Step 2: Replace desktop sidebar PetsApp with PetWidget**

Find the block in `App.tsx` that renders the desktop sidebar pet window (around line 160–183). Replace the inner `<PetsApp usePetStore={usePetStore} />` call inside the `PET_HUD` window body with `<PetWidget />`.

Before:
```tsx
<div className="window-body min-h-[160px] p-2">
  <Suspense
    fallback={
      <div className="font-press text-center pt-4 text-[8px]">
        LOADING PET...
      </div>
    }
  >
    <PetsApp usePetStore={usePetStore} />
  </Suspense>
</div>
```

After:
```tsx
<div className="window-body min-h-[160px] p-2">
  <PetWidget />
</div>
```

- [ ] **Step 3: Replace mobile drawer PetsApp with PetWidget**

Find the second `<PetsApp usePetStore={usePetStore} />` in the mobile drawer section (around line 230–238). Replace it with `<PetWidget />`.

Before:
```tsx
<div className="border border-cozy-border p-2">
  <Suspense
    fallback={
      <div className="font-press text-center pt-4 text-[8px]">
        LOADING PET...
      </div>
    }
  >
    <PetsApp usePetStore={usePetStore} />
  </Suspense>
</div>
```

After:
```tsx
<div className="border border-cozy-border p-2">
  <PetWidget />
</div>
```

- [ ] **Step 4: Remove the `usePetStore` tick interval from App.tsx**

The existing `App.tsx` runs a `setInterval` that calls `tick()` from `usePetStore` every 5 seconds. Since `PetWidget` no longer uses `usePetStore`, remove this interval. Find and delete:

```tsx
const tick = usePetStore((state) => state.tick);
```

And:
```tsx
useEffect(() => {
  const timer = setInterval(() => {
    tick();
  }, 5000);
  return () => clearInterval(timer);
}, [tick]);
```

Note: `usePetStore` is still used for the full pets tab (`<PetsApp usePetStore={usePetStore} />`), so keep the import.

- [ ] **Step 5: Verify typecheck and tests pass**

Run:
```bash
npm run typecheck && npm test
```

Expected: no errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/shell/src/App.tsx
git commit -m "feat(shell): replace pet sidebar with PetWidget driven by ProgressService"
```

---

### Task 10: Shikaku integration

**Files:**
- Modify: `packages/shikaku/src/ShikakuApp.tsx`
- Modify: `packages/shikaku/src/ShikakuApp.test.tsx`

When a Shikaku puzzle is won, call `progressService.completeLevel("shikaku", puzzle.id)` and show a reward badge. Replays show "ALREADY COMPLETE" instead.

- [ ] **Step 1: Mock `shared` in `ShikakuApp.test.tsx`**

Open `packages/shikaku/src/ShikakuApp.test.tsx`. Add a `vi.mock("shared", ...)` call after the existing mock declarations:

```typescript
vi.mock("shared", () => ({
  ProgressService: vi.fn().mockImplementation(() => ({
    completeLevel: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
    getFoodAvailable: vi.fn().mockResolvedValue(0),
    isPetHungry: vi.fn().mockResolvedValue(false),
    getState: vi.fn().mockResolvedValue({
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0 },
    }),
  })),
  LocalProgressRepository: vi.fn().mockImplementation(() => ({})),
}));
```

- [ ] **Step 2: Run existing ShikakuApp tests to verify they still pass**

Run:
```bash
npm test -- --reporter=verbose packages/shikaku/src/ShikakuApp.test.tsx
```

Expected: all existing tests PASS (the mock is in place before adding the feature).

- [ ] **Step 3: Update `ShikakuApp.tsx` to call completeLevel and show reward**

Replace the full contents of `packages/shikaku/src/ShikakuApp.tsx`:

```tsx
import React, { useState, useEffect } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useShikakuStore } from "./store/useShikakuStore";
import { SHIKAKU_LEVELS } from "./levels";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import { synth } from "./engine/synth";

const progressService = new ProgressService(new LocalProgressRepository());

export default function ShikakuApp(): React.ReactElement {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const isWon = useShikakuStore((state) => state.isWon);
  const puzzle = useShikakuStore((state) => state.puzzle);
  const loadLevel = useShikakuStore((state) => state.loadLevel);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon || !puzzle) return;
    void progressService.completeLevel("shikaku", puzzle.id).then((firstTime) => {
      setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
    });
  }, [isWon, puzzle]);

  const handleSelectLevel = (idx: number): void => {
    setSelectedIdx(idx);
    setRewardMsg(null);
    loadLevel(SHIKAKU_LEVELS, idx);
  };

  return (
    <div className="w-full max-w-[450px] border border-cozy-border bg-black p-6 select-none text-cozy-text">
      {selectedIdx === null ? (
        <LevelSelect onSelect={handleSelectLevel} />
      ) : (
        <div className="flex flex-col gap-6 items-center">
          <HUD onBack={() => setSelectedIdx(null)} />
          <Board />
          {isWon && rewardMsg && (
            <div className="font-press text-[9px] border border-cozy-border px-3 py-1 text-cozy-text">
              {rewardMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they still pass**

Run:
```bash
npm test -- --reporter=verbose packages/shikaku/src/ShikakuApp.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 5: Run full test suite**

Run:
```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/shikaku/src/ShikakuApp.tsx packages/shikaku/src/ShikakuApp.test.tsx
git commit -m "feat(shikaku): call progressService.completeLevel on win, show reward badge"
```

---

### Task 11: Sokoban integration

**Files:**
- Modify: `packages/sokoban/src/components/WinModal.tsx`
- Modify: `packages/sokoban/src/SokobanApp.test.tsx`

When Sokoban is won, call `progressService.completeLevel("sokoban", "level-${currentLevelIdx}")` and show the reward in the WinModal.

- [ ] **Step 1: Mock `shared` in `SokobanApp.test.tsx`**

Open `packages/sokoban/src/SokobanApp.test.tsx`. Add a `vi.mock("shared", ...)` call after the existing synth mock:

```typescript
vi.mock("shared", () => ({
  ProgressService: vi.fn().mockImplementation(() => ({
    completeLevel: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
    getFoodAvailable: vi.fn().mockResolvedValue(0),
    isPetHungry: vi.fn().mockResolvedValue(false),
    getState: vi.fn().mockResolvedValue({
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0 },
    }),
  })),
  LocalProgressRepository: vi.fn().mockImplementation(() => ({})),
}));
```

- [ ] **Step 2: Run existing SokobanApp tests to verify they still pass**

Run:
```bash
npm test -- --reporter=verbose packages/sokoban/src/SokobanApp.test.tsx
```

Expected: all 3 existing tests PASS.

- [ ] **Step 3: Update `WinModal.tsx` to call completeLevel and show reward**

Replace the full contents of `packages/sokoban/src/components/WinModal.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSokobanStore } from "../store/useSokobanStore";
import { synth } from "../engine/synth";

const progressService = new ProgressService(new LocalProgressRepository());

interface WinModalProps {
  onBack: () => void;
}

export default function WinModal({ onBack }: WinModalProps): React.ReactElement {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon) {
      setRewardMsg(null);
      return;
    }
    void progressService
      .completeLevel("sokoban", `level-${currentLevelIdx}`)
      .then((firstTime) => {
        setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
      });
  }, [isWon, currentLevelIdx]);

  if (!isWon) return <React.Fragment />;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4">
        <h2 className="font-press text-[14px] text-cozy-text animate-bounce">
          STAGE CLEAR!
        </h2>
        <p className="font-mono text-sm text-cozy-text">
          Finished in{" "}
          <span className="font-bold font-press text-[11px] text-cozy-text">
            {moves}
          </span>{" "}
          movements.
        </p>
        {rewardMsg && (
          <p className="font-press text-[9px] border border-cozy-border px-2 py-1 text-cozy-text">
            {rewardMsg}
          </p>
        )}
        <div className="flex gap-4 mt-2">
          <button
            onClick={nextLevel}
            className="pixel-btn text-[10px] text-cozy-text"
            aria-label="Next stage"
          >
            NEXT &gt;
          </button>
          <button
            onClick={onBack}
            className="pixel-btn text-[10px] text-cozy-text/70"
            aria-label="Main menu"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run full test suite**

Run:
```bash
npm test
```

Expected: all tests pass, no failures.

- [ ] **Step 5: Commit**

```bash
git add packages/sokoban/src/components/WinModal.tsx packages/sokoban/src/SokobanApp.test.tsx
git commit -m "feat(sokoban): call progressService.completeLevel on win, show reward in WinModal"
```

---

## Success criteria checklist

After all tasks are complete, verify manually in a running dev server:

- [ ] Solve a Shikaku level for the first time → "+1 FOOD" badge appears
- [ ] Replay the same Shikaku level → "ALREADY COMPLETE" badge appears
- [ ] Solve a Sokoban level for the first time → "+1 FOOD" in WinModal
- [ ] Replay the same Sokoban level → "ALREADY COMPLETE" in WinModal
- [ ] PetWidget sidebar shows FOOD count increment after first completion
- [ ] PetWidget Feed button is disabled when pet is not hungry (within 4 hours of last feed)
- [ ] Clicking Feed when hungry and food > 0 → Food count decrements, XP increments, sprite plays eating animation
- [ ] Pet stage advances when XP hits 10, 30, 60, 100
- [ ] Reload the page → all state survives (localStorage `cozyos.progress.v1`)
- [ ] No gameplay code directly sets `pet.xp` or `pet.stage` or `foodConsumed` — only `ProgressService`/`LocalProgressRepository` do

---

## Notes for future Supabase migration

To migrate: implement `SupabaseProgressRepository` that satisfies the `ProgressRepository` interface. Pass it to `new ProgressService(supabaseRepo)` in the shell, shikaku, and sokoban singleton creation sites. No changes to `ProgressService`, `PetWidget`, `ShikakuApp`, or `WinModal` are needed.
