# Roles and permissions

## Roles

| Role | Description | How it is acquired |
|------|-------------|--------------------|
| Anonymous visitor | The only end-user role. Reads every page, plays every puzzle, accumulates progress in their own browser | Opening the site — no account, no login, no assignment step (ADR-0004) |
| Owner / author | The maintainer: pushes code, edits devlog files, releases games from their own repositories, runs the deploy | GitHub repository and organisation permissions; nothing inside the product |

There is no third role. Accounts, roles and server-side authorisation were removed with cloud sync (ADR-0004), so the
product has no admin surface, no user management and no privilege escalation path to defend.

## Permission matrix

| Action | Anonymous visitor | Owner |
|--------|-------------------|-------|
| Read any page | yes | yes |
| Play any puzzle at any level | yes — nothing is locked behind progress | yes |
| Earn stars, XP and evolutions | yes, in their own browser | yes |
| Feed, play with, or put the pet to sleep | yes | yes |
| Read the devlog | yes | yes |
| Reach the owner (mailto, LinkedIn, GitHub) | yes | yes (trivially) |
| Edit content | no — there is no authoring UI (ADR-0006) | yes, in source, then deploy |
| Release a game | no | yes, from that game's repository |
| Deploy the site | no | yes, by pushing to `main` (`.github/workflows/deploy.yml:3-8`) |
| See anyone else's progress | no — and neither can the owner: it never leaves the visitor's device | no |

## Object-level rules

| Object | Rule |
|--------|------|
| Progress document | Scoped to one browser profile and one origin. No sharing, no merge, no export. Two devices are two independent visitors (ADR-0004) |
| Level records | Keyed on `(module, levelId)`; only the best star count is kept, and a lower result is discarded (`packages/shared/src/repository/LocalProgressRepository.ts:122-147`) |
| Devlog post | A file in `packages/posts/src/content/posts/`; anyone with repository write access can publish it |
| Game release | Owned by the game's own repository; this repository only consumes the release artifact (ADR-0003) |

## How roles are assigned

Nothing is assigned at runtime. The visitor role is implicit, and the owner role is a GitHub permission on the
repositories. Because no request carries an identity, no endpoint or screen needs a role check — a deliberate property
(NFR-08, NFR-09) rather than an omission.
