---
id: US-FND-007
title: Serve the site from the user-site root
epic: EPIC-00-foundation
status: ready
priority: P1
size: S
depends_on: [US-SITE-004]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md", "04-decisions/open-questions.md"]
---

# US-FND-007 — Serve the site from the user-site root

## 1. Story

**As a** owner-developer
**I want** the repository renamed and served at `https://prxxie.github.io/`
**so that** absolute remote paths and a root base path agree, with no asset rewriting.

## 2. Context

The remotes are requested at `/mfe/<name>/assets/remoteEntry.js`, an absolute path that only works if the site is served from a domain root. OQ-08 settled it: the repository becomes a user site named `prxxie.github.io`, so the shell needs no `base` and nothing is rewritten. The story records the operational change and proves the assumption on the deployed site.

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |
| OQ-08 answer | [open-questions.md](../../04-decisions/open-questions.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the deployed site | `/mfe/shikaku/assets/remoteEntry.js` is requested | it returns 200 from the domain root |
| AC2 | `packages/shell/vite.config.ts` | `base` is read | it is unset, and asset URLs in the built HTML are absolute |
| AC3 | the repository settings | the pages configuration is read | it publishes `gh-pages` for the user site |
| AC4 | a deep link | the deployed URL is opened directly | the prerendered document is served, not a 404 |

## 4. Contract

No build-time base path. If the repository cannot be renamed, the fallback is an explicit `base: "/<repo>/"` plus a remote-path rewrite — a different story, not a silent change here.

## 5. Rules and edge cases

- Record the rename in `AGENTS.md` and `deployment.md` when it happens.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Changing the deploy branch or the publishing action.

## 8. Test notes

Manual check on the deployed site: `curl -I https://prxxie.github.io/mfe/shikaku/assets/remoteEntry.js` returns 200, and a deep link returns the prerendered HTML. Record both commands and their output.

## 9. Open questions

None.
