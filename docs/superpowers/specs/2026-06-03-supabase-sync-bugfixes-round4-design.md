# Supabase Sync Bugfixes Round 4 Design Specification

**Goal:** Resolve the remaining and newly identified synchronization bugs from the Round 4 review to ensure robust, conflict-free state merging, proper UI error handling, and memory/promise safety.

---

## 1. Issues & Technical Designs

### Issue 1: `feedPet` No Error Handling
* **Symptom**: If the asynchronous `feedPet()` request fails, the UI still moves to the `"eating"` sprite animation, and the error remains unhandled.
* **Design**: Wrap the `feedPet()` call in UI components with `try/catch`. Only set `"eating"` state upon successful promise resolution.
* **Files**:
  - `packages/shell/src/components/PetWidget.tsx`
  - `packages/pets/src/PetsApp.tsx`

---

### Issue 2: In-Flight Cache Promise Eviction (`cozyos:progress-updated` race)
* **Symptom**: `activeGetState` and `userIdPromise` are cleared when the event listener triggers. If a new call populates them, the `finally` block of the first (original) promise will unconditionally wipe out the *new* promise instance.
* **Design**: Protect the `finally` block by comparing the resolved promise with the cached reference before clearing:
  ```typescript
  finally {
    if (this.activeGetState === currentPromise) {
      this.activeGetState = null;
    }
  }
  ```
* **Files**:
  - `packages/shared/src/repository/SupabaseProgressRepository.ts`

---

### Issue 3: `getLevelKey` includes `completedAt` → Stale Overwrite
* **Symptom**: `mergeStates()` has no tie-breaker for levels with identical stars. If local has `T1` (older) and cloud has `T2` (newer), local wins. When syncing, `areStatesEqual` returns `false` (since `completedAt` differs), triggering a save that overwrites `T2` with `T1`.
* **Design**: Add a `completedAt` tie-breaker to `mergeStates()`'s level merging logic so that the level with the later timestamp wins when stars are equal.
* **Files**:
  - `packages/shared/src/repository/SupabaseProgressRepository.ts`

---

### Issue 4: SELECT Failure Fallback Data Loss
* **Symptom**: If fetching the cloud state in `saveState()` fails, we catch the error and overwrite `localRepo` with the local-only `state`, losing any pre-existing cloud-synced progress on the device.
* **Design**: In the catch block of `saveState()`, fetch the existing state from `localRepo`, merge the new `state` into it using `mergeStates()`, and save the merged result to preserve cloud progress.
* **Files**:
  - `packages/shared/src/repository/SupabaseProgressRepository.ts`

---

### Issue 5: `PetsApp` isSleeping Hardcoded to `false`
* **Symptom**: The virtual pet MFE renders `<PetSprite>` with `isSleeping={false}` unconditionally, and doesn't restrict feeding when sleeping.
* **Design**:
  - Add `isSleeping` to the `ProgressState` interface in `PetsApp.tsx`.
  - Pass `isSleeping={progressState?.isSleeping ?? false}` to `<PetSprite>`.
  - Prevent feeding when sleeping by updating `canFeed` and `handleFeed`.
* **Files**:
  - `packages/pets/src/PetsApp.tsx`

---

### Issue 6: `MOCK_TIMESTAMP_THRESHOLD` Merging Corruption on Never-Interacted Pets
* **Symptom**: When a pet has never been interacted with (`maxTime = 0`), it is treated as a mock timestamp because `0 < MOCK_TIMESTAMP_THRESHOLD`. This results in `now = 0`, producing unscaled interaction times of `0`. On ties, the cloud overwrites local sleep toggles.
* **Design**: Require `maxTime > 0` before treating it as a mock timestamp:
  ```typescript
  const now = (maxTime > 0 && maxTime < MOCK_TIMESTAMP_THRESHOLD) ? maxTime : Date.now();
  ```
* **Files**:
  - `packages/shared/src/repository/SupabaseProgressRepository.ts`

---

## 2. Testing Strategy

1. **Unit Tests**:
   - In `SupabaseProgressRepository.test.ts`, add test cases verifying:
     - Merging of levels with equal stars tie-breaks correctly to the later `completedAt` timestamp.
     - `getUnscaledInteractionTime` handles `maxTime = 0` correctly, producing valid unscaled timestamps relative to `Date.now()`.
     - In-flight promise clearing respects identity, preventing older promises from clearing newer cached promises.
     - `saveState()` failure merges local changes with existing local state instead of wiping out old progress.
2. **Integration Verification**:
   - Run typecheck: `npm run typecheck`
   - Run linter: `npm run lint`
   - Run all workspace tests: `npm run test`
