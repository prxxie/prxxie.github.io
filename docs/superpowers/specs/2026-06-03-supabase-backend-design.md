# Supabase Cloud Sync Backend Design

This document details the architecture and implementation design for migrating the Cozy OS progression state from a pure local storage repository to a Supabase-backed repository with user authentication and automatic state merging.

---

## 1. Objectives & Requirements

- **Backend Platform**: Supabase (PostgreSQL Database + Auth).
- **Authentication**: Enable Retro-styled terminal Email/Password Signup and Sign In.
- **Data Syncing**: Cloud sync for user progress (`completedLevels`, `foodConsumed`, `pet` state).
- **Database Schema**: Flat JSONB storage table mapped directly to the TypeScript `ProgressState` type.
- **Offline/Zero Latency Support**: Keep the game fully local-first (caching and writes occur instantly to LocalStorage) and push/pull from Supabase asynchronously.
- **Auto-Merging**: Merge local progress with cloud progress on authentication to prevent user data loss.

---

## 2. Database Schema (Supabase SQL Editor)

```sql
-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own progress
CREATE POLICY "Allow users to read their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Allow users to insert/update their own progress
CREATE POLICY "Allow users to insert/update their own progress" 
ON public.user_progress 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Automatically update updated_at on modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

---

## 3. Class Architecture: `SupabaseProgressRepository`

We will implement `SupabaseProgressRepository` inside the `shared` package (`packages/shared/src/repository/SupabaseProgressRepository.ts`).

```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalProgressRepository } from "./LocalProgressRepository";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

export class SupabaseProgressRepository implements ProgressRepository {
  private localRepo = new LocalProgressRepository();

  constructor(private supabase: SupabaseClient) {}

  private async getUserId(): Promise<string | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user?.id || null;
  }

  private mergeStates(local: ProgressState, cloud: ProgressState): ProgressState {
    const levelsMap = new Map<string, typeof local.completedLevels[0]>();
    const addLevel = (lvl: typeof local.completedLevels[0]) => {
      const key = `${lvl.module}:${lvl.levelId}`;
      const existing = levelsMap.get(key);
      if (!existing || lvl.stars > existing.stars) {
        levelsMap.set(key, lvl);
      }
    };
    local.completedLevels.forEach(addLevel);
    cloud.completedLevels.forEach(addLevel);

    const useLocalPet = local.pet.xp > cloud.pet.xp;
    const pet = useLocalPet ? local.pet : cloud.pet;
    const foodConsumed = Math.max(local.foodConsumed, cloud.foodConsumed);

    return {
      completedLevels: Array.from(levelsMap.values()),
      foodConsumed,
      pet,
    };
  }

  async getState(): Promise<ProgressState> {
    const userId = await this.getUserId();
    const localState = await this.localRepo.getState();

    if (!userId) {
      return localState;
    }

    try {
      const { data, error } = await this.supabase
        .from("user_progress")
        .select("state")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        await this.supabase.from("user_progress").upsert({
          user_id: userId,
          state: localState,
        });
        return localState;
      }

      const cloudState = data.state as ProgressState;
      const mergedState = this.mergeStates(localState, cloudState);
      
      await this.localRepo.saveState(mergedState);
      await this.supabase.from("user_progress").upsert({
        user_id: userId,
        state: mergedState,
      });

      return mergedState;
    } catch (err) {
      console.error("Supabase read error, falling back to local cache:", err);
      return localState;
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await this.localRepo.saveState(state);

    const userId = await this.getUserId();
    if (userId) {
      try {
        const { error } = await this.supabase
          .from("user_progress")
          .upsert({ user_id: userId, state });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync state to Supabase:", err);
      }
    }
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const changed = await this.localRepo.completeLevel(module, levelId);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const changed = await this.localRepo.completeLevelWithStars(module, levelId, stars);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.feedPet(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async playWithPet(happiness: number): Promise<void> {
    await this.localRepo.playWithPet(happiness);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.toggleSleep(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }
}
```

---

## 4. UI & Shell Integration

### A. Environment Check (`packages/shell/src/utils/supabase.ts`)
- Automatically falls back to offline mode when credentials are missing.
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables.

### B. Shell hook updates (`packages/shell/src/hooks/useProgressService.ts`)
- Imports and instances `SupabaseProgressRepository` when config is available.
- Syncs state changes automatically when auth session starts or ends.

### C. Cloud Indicator Header (`packages/shell/src/components/ConsoleFrame.tsx`)
- Displays `[CLOUD: CONNECT]` if logged out.
- Displays `[CLOUD: SYNCED]` if logged in.
- Clicking triggers the display of the retro Modal.

### D. Authenticator Modal (`packages/shell/src/components/CloudSyncModal.tsx`)
- Pixelated inputs and borders.
- Allows Email + Password Login and Register.
- Displays error and success diagnostic alerts.
