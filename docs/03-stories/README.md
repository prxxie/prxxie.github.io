# Backlog

Thirty-six stories across eight epics, in dependency order. Every story is a vertical slice: an outcome a visitor or a
maintainer can observe, plus the evidence that it holds. The order below is the delivery plan's default — waves are in
[delivery-plan.md](delivery-plan.md).

<!-- adf:stats -->
| Stories | Done | In progress | Ready | Blocked | Draft | Closed |
|---|---|---|---|---|---|---|
| 36 | 1 | 0 | 35 | 0 | 0 | 0 |

Open questions: **Open: 1 · Blocking: 0 · Answered: 11 · Withdrawn: 0**
<!-- /adf:stats -->

## Epics

<!-- adf:epics -->
| Epic | Code | Title | Stories | Done | Blocked |
|---|---|---|---|---|---|
| [EPIC-00-foundation](EPIC-00-foundation/README.md) | FND | Foundation: reproducible workspace and honest gates | 7 | 1 | 0 |
| [EPIC-01-design-system](EPIC-01-design-system/README.md) | DS | One design system, warm cream and coral | 3 | 0 | 0 |
| [EPIC-02-site-shell](EPIC-02-site-shell/README.md) | SITE | Real routes, prerendered pages, one contact path | 6 | 0 | 0 |
| [EPIC-03-home](EPIC-03-home/README.md) | HOME | The one-page proof | 3 | 0 | 0 |
| [EPIC-04-games](EPIC-04-games/README.md) | GAME | The games hub and three games in the same clothes | 5 | 0 | 0 |
| [EPIC-05-devlog](EPIC-05-devlog/README.md) | DEVLOG | Markdown compiled at build time | 4 | 0 | 0 |
| [EPIC-06-pet](EPIC-06-pet/README.md) | PET | The pet becomes a footer widget | 3 | 0 | 0 |
| [EPIC-07-launch](EPIC-07-launch/README.md) | LAUNCH | Landing page, discovered | 5 | 0 | 0 |
<!-- /adf:epics -->

## Blocked stories

None. Every open question that touched a story was answered before the backlog was written, and the one question still
open — [OQ-04](../04-decisions/open-questions.md) (game submodule ownership) — has a recorded assumption that is
acceptable to build on, so `US-GAME-002`, `US-GAME-003` and `US-GAME-004` carry it in `accepted_assumptions` instead of
being blocked. If that assumption turns out to be wrong, those three stories are re-checked first.

## Suggested order

1. **Make the gates honest.** `US-FND-001` → `US-FND-002` → `US-FND-003` → `US-FND-005`. Nothing else is trustworthy
   while the type-check and lint gates are red and CI does not run them.
2. **One visual language.** `US-DS-001` → `US-DS-002` → `US-DS-003`, so no screen is written twice.
3. **Real URLs.** `US-SITE-001` → `US-SITE-002` → `US-SITE-003` → `US-SITE-004`.
4. **Then content and games in parallel** — HOME, GAME and DEVLOG touch different files and can be taken in any order
   once the shell routes exist.
5. **Land it.** `US-FND-006` and the `LAUNCH` epic last, and `US-LAUNCH-005` very last: it makes the docs describe the
   site that now exists.

The full wave-by-wave sequence, sizes and gates are in [delivery-plan.md](delivery-plan.md).

## Conventions

- Story files live in their epic directory and are named `US-<CODE>-<nnn>-<slug>.md`; ids are never renumbered.
- `status` is one of `draft`, `ready`, `in_progress`, `done`, `blocked`, `closed` (see
  [Rule 03](../01-overview/conventions.md) and the definition of ready and done in `.agents/rules/`).
- Acceptance criteria are the contract: a story is done when every AC has evidence, the gates pass, and the docs it
  touched are updated.
