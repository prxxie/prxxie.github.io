# Supabase Sync and Auth Bugfixes Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 5 bugs in the Supabase sync integration (upsert error swallow, repository subscription leaks, swallowed saveState errors, getUserId race conditions, and CloudSyncModal timeout double-fires).

**Architecture:**
- Check and propagate all database upsert results.
- Implement React context for `ProgressService` to manage lifetime and clean up listeners on unmount.
- Redesign `saveState` Promise serialization queue to avoid masking errors.
- Guard `getUserId` using an in-flight Promise reference to handle concurrency.
- Clean up any active timeouts in UI handlers before initiating new ones.

---

### Task 1: Check Upsert Error in getState Check (Issue 1)

**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`

- [x] **Step 1: Propagate first-time sync upsert error**
  In `getState()`, capture and verify the `error` of the first-time sync upsert instead of swallowing it.
  ```typescript
          if (error.code === "PGRST116") {
            const { error: upsertError } = await this.supabase.from("user_progress").upsert({
              user_id: userId,
              state: localState,
            });
            if (upsertError) throw upsertError;
            return localState;
          }
  ```

- [x] **Step 2: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 2: Repository Listener Disposal & React Integration (Issue 2)

**Files:**
- Modify: `packages/shared/src/progress/service.ts`
- Modify: `packages/shared/src/repository/LocalProgressRepository.ts`
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Modify: `packages/shell/src/hooks/useProgressService.ts`
- Modify: `packages/shell/src/App.tsx`

- [ ] **Step 1: Implement dispose in ProgressService & repositories**
  - Add `dispose()` to `ProgressService`:
    ```typescript
    dispose(): void {
      if (typeof (this.repo as any).dispose === "function") {
        (this.repo as any).dispose();
      }
    }
    ```
  - Expose and implement `dispose()` in `LocalProgressRepository`:
    ```typescript
    private storageListener: ((event: StorageEvent) => void) | null = null;
    // ... setup inside constructor ...
    dispose(): void {
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function" && this.storageListener) {
        window.removeEventListener("storage", this.storageListener);
        this.storageListener = null;
      }
    }
    ```

- [ ] **Step 2: Refactor useProgressService to use React Context**
  Create a React Context for `ProgressService` in `packages/shell/src/hooks/useProgressService.ts` to manage instance lifetime. Expose `<ProgressServiceProvider>` and `useProgressService` using this Context.
  On provider unmount, invoke `progressService.dispose()`.

- [ ] **Step 3: Update App.tsx to use ProgressServiceProvider**
  Wrap the root application with `<ProgressServiceProvider>` and retrieve progress context.

- [ ] **Step 4: Verify test suite runs cleanly**
  Run: `rtk npx vitest run packages/shell/`
  Expected: PASS

---

### Task 3: Chained Queue Error Propagation (Issue 3)

**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`

- [ ] **Step 1: Chained queue with error propagation**
  Refactor `saveState` to return a `Promise<void>` that resolves or rejects based on the success of that specific operation, while still serialize-chaining onto the promise queue.
  ```typescript
    async saveState(state: ProgressState, skipLocalWrite = false): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const runSave = async () => {
          let finalState = state;
          const userId = await this.getUserId();
          
          if (!userId) {
            if (!skipLocalWrite) {
              await this.localRepo.saveState(state);
            }
            resolve();
            return;
          }

          try {
            const { data, error } = await this.supabase
              .from("user_progress")
              .select("state")
              .eq("user_id", userId)
              .single();

            if (error) {
              if (error.code !== "PGRST116") {
                throw error;
              }
            } else if (data?.state) {
              try {
                const cloudState = this.sanitizeProgressState(data.state);
                finalState = this.mergeStates(state, cloudState);
              } catch (valErr) {
                console.warn("Corrupt cloud state found during save. Overwriting with local state to repair:", valErr);
              }
            }

            const changed = JSON.stringify(state) !== JSON.stringify(finalState);
            if (changed || !skipLocalWrite) {
              await this.localRepo.saveState(finalState);
            }

            const { error: upsertError } = await this.supabase
              .from("user_progress")
              .upsert({ user_id: userId, state: finalState });
            if (upsertError) throw upsertError;
            
            resolve();
          } catch (err) {
            console.error("Failed to sync state to Supabase:", err);
            if (!skipLocalWrite) {
              try {
                await this.localRepo.saveState(state);
              } catch (localErr) {
                reject(localErr);
                return;
              }
            }
            reject(err);
          }
        };

        this.saveQueue = this.saveQueue.then(runSave).catch((err) => {
          console.error("Error in serialized save queue chain:", err);
        });
      });
    }
  ```

- [ ] **Step 2: Update and run tests**
  Ensure test assertions verify that errors propagate to the caller.
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 4: In-flight User ID Promise Guard (Issue 4)

**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`

- [ ] **Step 1: Guard getUserId against concurrent network requests**
  Introduce a private `userIdPromise` field in `SupabaseProgressRepository` and use it to check for in-flight requests.
  ```typescript
    private userIdPromise: Promise<string | null> | null = null;
    
    private async getUserId(): Promise<string | null> {
      if (this.userIdInitialized) {
        return this.cachedUserId;
      }
      if (this.userIdPromise) {
        return this.userIdPromise;
      }

      this.userIdPromise = (async () => {
        try {
          const { data: { session } } = await this.supabase.auth.getSession();
          let uid = session?.user?.id || null;
          if (!uid) {
            const { data: { user } } = await this.supabase.auth.getUser();
            uid = user?.id || null;
          }
          this.cachedUserId = uid;
          this.userIdInitialized = true;
          return uid;
        } catch {
          return null;
        } finally {
          this.userIdPromise = null;
        }
      })();

      return this.userIdPromise;
    }
  ```

- [ ] **Step 2: Verify all repository unit tests pass**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 5: UI Timeout Safety (Issue 5)

**Files:**
- Modify: `packages/shell/src/components/CloudSyncModal.tsx`

- [ ] **Step 1: Clear existing timeouts before setting new ones**
  In `handleAuth`, `handleLogout`, and `isOpen` trigger, ensure we call `clearTimeout(timeoutRef.current)` before assigning any new timeouts.
  ```typescript
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
  timeoutRef.current = setTimeout(onClose, 1500);
  ```

- [ ] **Step 2: Verify all shell tests pass**
  Run: `rtk npx vitest run packages/shell/`
  Expected: PASS
