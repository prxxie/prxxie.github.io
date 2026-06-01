# Pokemon Pet Unification Design Spec

This spec outlines the design for unifying the Pet MFE (page) and Pet HUD (sidebar) states, implementing a persistent and synchronized progress store, and introducing a Pokemon-style 5-stage evolution line with dynamic status animations in SVG.

## 1. Shared State Architecture

To solve the state drift between the HUD and the page, we will migrate all pet state into the shared `ProgressService` (backed by the persistent `LocalProgressRepository` in `localStorage`).

### 1.1 Updated `PetState` Schema
We will add `happiness`, `isSleeping`, and `lastPlayedAt` fields to `packages/shared/src/progress/types.ts`:

```typescript
export type PetState = {
  xp: number;
  stage: number;
  lastFedAt: number;
  happiness: number;     // Range: 0 - 100
  lastPlayedAt: number;  // Timestamp
  isSleeping: boolean;
};
```

### 1.2 Backward Compatibility
When loading state, `LocalProgressRepository` will supply defaults if the new fields are missing:
* `happiness`: default to `50`
* `lastPlayedAt`: default to `0`
* `isSleeping`: default to `false`

### 1.3 State Updates & Event Dispatching
* **Feed**: Consumes 1 star, adds 1 XP, increases stage if threshold crossed, resets `lastFedAt` to `Date.now()`, wakes the pet if sleeping, and dispatches `"cozyos:progress-updated"`.
* **Play**: Only allowed when awake. Sets `lastPlayedAt` to `Date.now()`, increases happiness by `20` (capped at `100`), and dispatches `"cozyos:progress-updated"`.
* **Sleep/Wake**: Toggles the `isSleeping` boolean state and dispatches `"cozyos:progress-updated"`.

### 1.4 Dynamic Decay Calculations
To avoid background setInterval timers drifting or failing when tabs are inactive, hunger and happiness decay will be derived dynamically:
* **Hunger level (0 to 6)**:
  * When awake: `elapsed = Date.now() - lastFedAt`. Hunger level increases by 1 for every `HUNGER_COOLDOWN` (10 minutes) elapsed.
  * When sleeping: Hunger decay is 2x slower. Hunger level increases by 1 for every `20 minutes` elapsed.
* **Happiness level (0% to 100%)**:
  * Base happiness is stored in `state.pet.happiness` (updated to `min(100, current + 20)` on Play).
  * Decay interval: `HAPPINESS_COOLDOWN = 10 minutes`.
  * When awake: Decays by `5%` every 10 minutes since `lastPlayedAt`.
  * When sleeping: Decays 4x slower (`5%` every 40 minutes since `lastPlayedAt`).

---

## 2. Creative Pokemon Evolution Sprites

We will completely rewrite `PetSprite.tsx` to render custom 16x16 pixel SVG drawings representing a Pokemon grass-starter evolution chain:

* **Stage 1 (XP 0–9): Egg**
  * Cute wiggling spotted egg.
  * *Animations*: Bounces when playing, wiggles when idle, shakes when eating.
* **Stage 2 (XP 10–29): Leafy Sprout**
  * Tiny green dinosaur baby with a single sprouting leaf on its head.
  * *Animations*: Cute tail wag, closes eyes when sleeping, leaf turns yellow when hungry.
* **Stage 3 (XP 30–59): Budreptile**
  * Teal-colored reptile with a pink flower bud node on its back.
  * *Animations*: Bud shakes when eating, feet wiggle when moving.
* **Stage 4 (XP 60–99): Florasaur**
  * Large, dark forest-green dinosaur with a fully blossomed red-spotted flower on its back.
  * *Animations*: Tail wags when playing, flower pulses.
* **Stage 5 (XP >= 100): Mega Florasaur**
  * Legendary form with foliage wings, golden crown leaf, and orbiting star spores.
  * *Animations*: Flaps wings, floats up and down, spore particles glow.

---

## 3. UI Layouts

### 3.1 Sidebar HUD (`PetWidget.tsx`)
* A compact status view.
* Displays:
  * 64px `PetSprite` (with eating/sleeping visual states).
  * Labels: `STAGE: [stage]`, `XP: [xp]`, `FOOD: [stars]`, `STATUS: [HUNGRY/FULL/SLEEPING]`.
  * Button: `FEED PET` (consumes 1 star, disabled if sleeping or not hungry).

### 3.2 Main Page MFE (`packages/pets/src/PetsApp.tsx`)
* A full-width console view.
* Receives `useProgressService` fields via props (passed by the shell host).
* Displays:
  * Large 128px `PetSprite` screen with corner crosshairs and sleep ZZZ animations.
  * Lore text describing current form and hunger/happiness mood.
  * Meters:
    * **XP Progress Bar**: `[███░░░░░░░] 42%` to next evolution.
    * **Hunger Bar**: `[████████░░] FULL / HUNGRY`.
    * **Happiness Bar**: `[██████░░░░] CONTENT`.
  * Buttons:
    * `FEED (★ 1)`: Active if hungry.
    * `PLAY`: Active if awake (5-minute cooldown since `lastPlayedAt`).
    * `SLEEP / WAKE`: Toggles sleeping state.

---

## 4. Test Strategy

* **Unit Tests**:
  * Add unit tests in `packages/shared/src/progress/service.test.ts` for:
    * `playWithPet` (cooldown checks, happy increment).
    * `toggleSleep` (sleeping state updates, hunger decay rate modification).
    * Backward compatibility parsing.
  * Add unit tests in `packages/shared/src/repository/LocalProgressRepository.test.ts` for persisting new fields.
* **Component Verification**:
  * Run `npm test` across all workspaces to verify zero regressions.
