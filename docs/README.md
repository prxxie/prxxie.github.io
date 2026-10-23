# Documentation

A personal portfolio site for a single owner: a static, prerendered multi-page site where three browser puzzle games, a
virtual pet and a devlog act as evidence that the engineering behind them is real. There is no backend, no account and
no analytics; the only stored state is the visitor's own progress, in their browser.

| Fact | Value |
|------|-------|
| Tier | `standard` |
| Project types | `web-app` |
| Stack | TypeScript 5.9 · React 18 · Vite 5 · Tailwind 4 + daisyUI 5 · Zustand · Module Federation (`@originjs/vite-plugin-federation` 1.3.5) · Vitest 1 · GitHub Actions → GitHub Pages |
| Package manager | pnpm, one frozen lockfile, `workspace:*` (ADR-0005) |
| Stack packs | `adf-stack-react-vite` |
| Brief | [00-source/brief.md](00-source/brief.md) — `confirmed` |

<!-- adf:stats -->
| Stories | Done | In progress | Ready | Blocked | Draft | Closed |
|---|---|---|---|---|---|---|
| 36 | 4 | 0 | 32 | 0 | 0 | 0 |

Open questions: **Open: 1 · Blocking: 0 · Answered: 11 · Withdrawn: 0**
<!-- /adf:stats -->

## Start here

| You are… | Read |
|----------|------|
| New to the project | [01-overview/project-overview.md](01-overview/project-overview.md) |
| Setting up locally | [01-overview/environment-setup.md](01-overview/environment-setup.md) |
| Deciding whether a change is allowed | [00-source/brief.md](00-source/brief.md) (scope and constraints) |
| Front-end / design | [02-reference/design-system.md](02-reference/design-system.md), then [02-reference/screens/](02-reference/screens/README.md) |
| Working on the pet, progress or stars | [02-reference/data/README.md](02-reference/data/README.md), [01-overview/workflow-state-machine.md](01-overview/workflow-state-machine.md) |
| Working on a game MFE | [02-reference/screens/README.md](02-reference/screens/README.md), [01-overview/architecture.md](01-overview/architecture.md) |
| QA / verifying a release | [01-overview/nonfunctional-requirements.md](01-overview/nonfunctional-requirements.md), [01-overview/deployment.md](01-overview/deployment.md) |
| PM / BA / client-facing | [01-overview/roles-and-permissions.md](01-overview/roles-and-permissions.md), [00-source/brief.md](00-source/brief.md) |
| Picking up work | [03-stories/README.md](03-stories/README.md) — the backlog in dependency order |
| An AI agent picking up work | [AGENTS.md](../AGENTS.md), then [01-overview/conventions.md](01-overview/conventions.md) |
| Looking for a past decision | [04-decisions/adr/](04-decisions/adr/) |
| Looking for what is still unknown | [04-decisions/open-questions.md](04-decisions/open-questions.md) |

## Backlog

| Epic | Code | Stories |
|------|------|---------|
| [EPIC-00-foundation](03-stories/EPIC-00-foundation/README.md) | FND | 7 |
| [EPIC-01-design-system](03-stories/EPIC-01-design-system/README.md) | DS | 3 |
| [EPIC-02-site-shell](03-stories/EPIC-02-site-shell/README.md) | SITE | 6 |
| [EPIC-03-home](03-stories/EPIC-03-home/README.md) | HOME | 3 |
| [EPIC-04-games](03-stories/EPIC-04-games/README.md) | GAME | 5 |
| [EPIC-05-devlog](03-stories/EPIC-05-devlog/README.md) | DEVLOG | 4 |
| [EPIC-06-pet](03-stories/EPIC-06-pet/README.md) | PET | 3 |
| [EPIC-07-launch](03-stories/EPIC-07-launch/README.md) | LAUNCH | 5 |

Thirty-six stories, 100.5 story-days, seven waves — see [03-stories/README.md](03-stories/README.md) and the
[delivery plan](03-stories/delivery-plan.md).

## Layout

```
docs/
  00-source/        the confirmed brief, and the adopt report from reverse-engineering the shipped code
  01-overview/      product overview, architecture, glossary, NFRs, conventions, roles, state machine, setup, deployment
  02-reference/     the reference layer: design system, screens (one file per screen), data model
  04-decisions/     open questions and the ADR series (0001–0009)
  superpowers/      the pre-ADF plan and spec archive — historical, superseded, kept for provenance
```

## Open questions

Two questions are still open, and the stories that depend on them cannot start until they are answered. The generated
count above reads `Blocking: 0` because blocking is counted per story, and the backlog does not exist until `adf-plan`:

- [OQ-12](04-decisions/open-questions.md#oq-12--which-router-and-prerender-toolchain-produce-real-paths-with-prerendered-html)
  — which router and prerender toolchain produce the real paths (ADR-0009 is `proposed` on this). Blocks the routing and
  prerender foundations.
- [OQ-04](04-decisions/open-questions.md#oq-04--are-the-three-game-submodules-in-product-scope-and-where-do-game-defects-get-fixed)
  — the scope and ownership boundary of the three game submodules. Blocks the three game epics.

The remaining ten are answered and are recorded for their reasoning, not for action.
