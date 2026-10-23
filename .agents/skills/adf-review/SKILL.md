---
name: adf-review
description: Review a change (working tree, branch, or PR) against its user story, the project docs, the rules in .agents/rules, and the Definition of Done, and return findings ranked Critical / Medium / Nit with a verdict. Use when the user asks to review changes, before opening a PR, or as the self-review step of adf-ship.
---

# adf-review

Review is read-only. Do not edit files unless the user asks you to apply fixes.

## 1. Scope

- Target: the argument (PR, branch, commit range, path) or, by default, uncommitted changes plus commits on the
  current branch not on the default branch.
- Story: from the branch name, commit messages, or the argument. No story → review against rules and docs only, and
  note that traceability could not be checked.

## 2. Read

The full diff · the story · the docs the story links to · `.agents/rules/` · `AGENTS.md` § PROJECT · the review
checklist of every stack pack (`adf-stack-*`) whose layer the diff touches — its items are added to § 3. Read enough of
the surrounding code to judge each change in context.

Take the tier from `AGENTS.md` § PROJECT (`Docs tier`) and grade only what it requires: `lite` = R1–R3 and D1–D3,
`standard` and `full` = all of them (`.agents/skills/adf-interview/references/tiers.md`).

## 3. Check

| Area | Questions |
|------|-----------|
| **Correctness vs story** | Is every acceptance criterion implemented? Anything implemented that the story does not ask for? Contract matches the docs exactly (names, types, status codes, errors)? |
| **Tests** | Does each AC have a test that would fail without the change? Unhappy paths covered? Tests deterministic? Were tests weakened or skipped? |
| **Security** (rule 06) | Input validation, authz on server side, object-level ownership, injection, secrets, sensitive data in logs, new dependencies |
| **Robustness** | Error handling without swallowing, null/empty/limit cases, concurrency and transactions, idempotency where needed |
| **Docs** (D5) | Contracts and behavior changes reflected in `docs/`? Story status and indexes updated? `verify-docs.py` passes? |
| **Scope and style** | Unrelated changes, reformatting, dead code introduced, conventions from `conventions.md` / AGENTS.md followed |

Run the test suite and `verify-docs.py` if they have not been run on this exact state — report results as executed.

## 4. Report

```
Review — <target> (<story id or "no story">)

Critical (must fix before merge)
- path:line — problem → concrete fix

Medium (should fix)
- path:line — problem → concrete fix

Nit (optional)
- path:line — suggestion

Definition of Done: D1 ✅ D2 ✅ D3 ❌ (lint: 2 errors) D4 ✅ D5 ⚠️ D6 … D8
Verdict: APPROVE | APPROVE WITH NITS | CHANGES REQUIRED
```

Grade D8 (changes committed) as **ready to commit** when reviewing a working tree: `adf-ship` commits after this
review (§ 8), so a commit cannot exist yet. Grade it as failed only when the project commits before review and the
commit is missing.

- Every finding names a location and a fix. No vague "consider improving".
- Only report what you verified. Mark a suspicion you could not confirm as "unverified".
Verdict mapping:

| Findings | Verdict |
|----------|---------|
| Any Critical, or any failed DoD item | CHANGES REQUIRED |
| Medium (no Critical) | CHANGES REQUIRED — unless the user explicitly accepts each Medium as follow-up; then record each as a new story or open question and the verdict is APPROVE WITH NITS |
| Nits only | APPROVE WITH NITS |
| None | APPROVE |

Review the **story's own changes plus any test or infrastructure code they rely on** — an issue found in an
already-merged story is reported as a separate finding with "pre-existing in US-…" and handled as a fix story, not
as a blocker of the current one.
