# Supabase Auth State Subscriptions & Prop Lifting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize authentication state tracking in `App.tsx`, remove redundant auth subscriptions from `CloudSyncModal` and `useProgressService`, and update unit tests to verify the behavior.

**Architecture:** Prop-lift the `cloudUser` state from `CloudSyncModal` to `App.tsx` and pass it down as a prop. Use a global `cozyos:progress-updated` CustomEvent triggered by the centralized auth state listener in `App.tsx` to notify and refresh the progress service, avoiding multiple parallel listeners.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Supabase Auth

---

### Task 1: Clean up ConsoleFrame props

**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.tsx:5-12`

- [ ] **Step 1: Make `cloudUser` optional in ConsoleFrameProps**

Modify the `ConsoleFrameProps` interface in `packages/shell/src/components/ConsoleFrame.tsx` to make `cloudUser` optional.

```typescript
interface ConsoleFrameProps {
  children: React.ReactNode;
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  onMobileHud?: () => void;
  onCloudClick?: () => void;
  cloudUser?: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shell/src/components/ConsoleFrame.tsx
git commit -m "refactor: make cloudUser optional in ConsoleFrameProps"
```

---

### Task 2: Lift CloudSyncModal state and remove redundant subscriptions

**Files:**
- Modify: `packages/shell/src/components/CloudSyncModal.tsx`

- [ ] **Step 1: Update CloudSyncModal props and state**

In `packages/shell/src/components/CloudSyncModal.tsx`:
1. Add `cloudUser: string | null;` to `CloudSyncModalProps`.
2. Remove the internal `userEmail` state declaration.
3. Remove the internal auth-checking logic and `onAuthStateChange` from `useEffect`.
4. Update the component to reference `cloudUser` instead of `userEmail`.

```typescript
interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudUser: string | null;
}

export default function CloudSyncModal({ isOpen, onClose, cloudUser }: CloudSyncModalProps): React.ReactElement | null {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
```

Also, replace all occurrences of `userEmail` with `cloudUser` in the JSX:
- Line ~120: `) : cloudUser ? (`
- Line ~124: `<p className="text-[8px] mt-1 text-cozy-text/70">ACCOUNT: {cloudUser}</p>`

- [ ] **Step 2: Commit**

```bash
git add packages/shell/src/components/CloudSyncModal.tsx
git commit -m "feat: lift user state and remove redundant auth subscriptions in CloudSyncModal"
```

---

### Task 3: Remove redundant auth listener in useProgressService

**Files:**
- Modify: `packages/shell/src/hooks/useProgressService.ts:40-59`

- [ ] **Step 1: Clean up useEffect in useProgressService**

Remove the `onAuthStateChange` subscription from `useProgressService.ts`'s `useEffect` block. It will rely purely on the `cozyos:progress-updated` custom event.

```typescript
  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);

    return () => {
      window.removeEventListener("cozyos:progress-updated", handler);
    };
  }, [refresh]);
```

- [ ] **Step 2: Commit**

```bash
git add packages/shell/src/hooks/useProgressService.ts
git commit -m "perf: remove redundant auth listener from useProgressService"
```

---

### Task 4: Centralize subscription in App.tsx and emit event

**Files:**
- Modify: `packages/shell/src/App.tsx`

- [ ] **Step 1: Emit progress update event on auth state changes**

In `packages/shell/src/App.tsx`, modify the `onAuthStateChange` handler inside `useEffect` to trigger a `cozyos:progress-updated` CustomEvent on the window whenever auth state changes.

```typescript
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user?.email || null);
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    });
```

- [ ] **Step 2: Pass cloudUser to CloudSyncModal**

Pass the `cloudUser` state down to the `CloudSyncModal` component.

```typescript
        <CloudSyncModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          cloudUser={cloudUser}
        />
```

- [ ] **Step 3: Commit**

```bash
git add packages/shell/src/App.tsx
git commit -m "feat: dispatch progress update on auth state change and pass cloudUser to modal"
```

---

### Task 5: Update CloudSyncModal unit tests

**Files:**
- Modify: `packages/shell/src/components/CloudSyncModal.test.tsx`

- [ ] **Step 1: Update the unit tests to pass cloudUser prop**

Update all test cases in `packages/shell/src/components/CloudSyncModal.test.tsx` to supply the `cloudUser` prop when rendering `<CloudSyncModal>`.
Remove any obsolete assertions or waits for `mockSupabase.auth.getUser` on mount, except where we want to test interaction/configuration specifically.

Specifically:
- For logged out cases, pass `cloudUser={null}`.
- For logged in cases, pass `cloudUser="user@cozyos.net"`.
- Remove `await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());` from test cases as `CloudSyncModal` no longer runs `getUser` on mount.

- [ ] **Step 2: Run all tests in the shell package to verify correctness**

Run: `rtk npx vitest run packages/shell/`
Expected output: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/shell/src/components/CloudSyncModal.test.tsx
git commit -m "test: update CloudSyncModal unit tests for prop-lifted state"
```
