---
paths:
  - "docs/03-stories/**"
---

# Rule 03 — Definition of Ready and Done

## 1. Definition of Ready

A story may move to `in-progress` only when every check below holds **for the project's tier** — `lite`: R1–R3; `standard` and `full`: all of them (the matrix is in `adf-interview/references/tiers.md`). `adf-ship` checks them first and stops if any fail.

| # | Check |
|---|-------|
| R1 | Frontmatter is valid (`verify-docs.py` passes for the story) |
| R2 | `status` is `ready` — not `draft`, `blocked`, or `closed` |
| R3 | Every story in `depends_on` is `done` |
| R4 | `open_questions` is empty. Questions still open but whose recorded **Assumption** the user agreed to build on are listed in `accepted_assumptions` instead |
| R5 | Acceptance criteria are testable: each has a concrete given/when/then or an observable result |
| R6 | Every doc the story links to exists, and the contracts it needs (API, data, UI, CLI) are specified there |
| R7 | Size is `S`, `M` or `L` — an `XL` story is split first |

If a check fails, report which one and what would unblock it. Do not start implementation "partially".

## 2. Definition of Done

A story may be marked `done` only when every check below holds **for the project's tier** — `lite`: D1–D3; `standard` and `full`: all of them. `adf-review` checks them.

| # | Check |
|---|-------|
| D1 | Every acceptance criterion is met and traced to a test (or, for untestable criteria, a recorded manual check) |
| D2 | New and changed behavior has automated tests; the full test suite passes |
| D3 | Build, lint, and typecheck commands from `AGENTS.md` § PROJECT pass |
| D4 | No rule in `.agents/rules/` is violated; no secrets, debug output, or commented-out code added |
| D5 | Docs that describe changed behavior or contracts are updated in the same change |
| D6 | `adf-review` verdict is APPROVE or APPROVE WITH NITS; then story frontmatter `status: done`; any open question discovered during work is recorded |
| D7 | `verify-docs.py --fix` passes (generated blocks regenerated, no errors) |
| D8 | The change is ready to commit: code and docs together, no scratch files, and committed per `04-git.md` where the project commits — a review of a working tree grades this as "ready to commit", because `adf-ship` commits after the review (§ 8) |

## 3. Status transitions

```
draft ──► ready ──► in-progress ──► done
  │         │            ▲  │         │
  └────►  blocked ◄──────┘  └─────────┘ reopen (not yet merged)
                                  any ──► closed (removed from scope; keeps its file and id)
```

- `draft → ready`: acceptance criteria written and R1–R7 satisfiable.
- `done → in-progress` (**reopen**): a review finds a Critical or Medium issue, or a failed DoD item, before the
  change is merged to the default branch. Fix on the same branch, re-verify, review again.
- After merge, a defect in a `done` story is **not** a reopen: create a new story (`fix:` in the title, `depends_on`
  the original) so shipped history stays accurate.
- `→ blocked`: an open question could change acceptance criteria. List it in `open_questions`.
- `blocked → ready`: all listed questions answered (`adf-decide` does this when recording answers).
- `→ closed`: only through `adf-change`, with the decision and date recorded at the top of the story.
