# Deployment

## Environments

| Environment | URL | Purpose | How it is built |
|-------------|-----|---------|-----------------|
| Production | `https://prxxie.github.io/` (OQ-08) | The public site, served from the `gh-pages` branch | `.github/workflows/deploy.yml`, publishing `./dist` |
| Local | `http://localhost:3000` plus per-remote ports 3001–3006 | Development and manual checking | `dev` script: host dev server + a watch build per remote (`docs/01-overview/environment-setup.md`) |
| Preview | — | Does not exist. Nothing is deployed outside `main`; a branch is checked by running it locally | — |

There is no staging environment, no container image, no server process and no database to migrate. The artifact is
static files plus the browser.

## Build and release pipeline

Triggers: a push to `main`, or a `repository_dispatch` of type `mfe-updated` sent by a game repository after it publishes
a release (`.github/workflows/deploy.yml:3-8`). A game therefore ships without anyone touching this repository.

| Step | What it does | Location |
|------|--------------|----------|
| Checkout | Clones the repo with the three submodules, using `MFE_DOWNLOAD_TOKEN` | `.github/workflows/deploy.yml:17-21` |
| Node | Sets up Node 20 | `.github/workflows/deploy.yml:23-26` |
| Install | Installs the workspace (`npm install` today, `pnpm install --frozen-lockfile` after ADR-0005) | `.github/workflows/deploy.yml:28-29` |
| Download game bundles | For each of `shikaku`, `sokoban`, `slitherlink`: creates `packages/<game>/dist` and extracts that repository's latest `dist.tar.gz` release into it | `.github/workflows/deploy.yml:31-40` |
| Assemble | Runs `scripts/build-static.sh`: builds `about`, `posts` and `pets`; uses the pre-downloaded `dist/` for a game when `dist/assets/remoteEntry.js` exists, otherwise builds it from source; builds the host; copies everything into `dist/` with each remote under `dist/mfe/<name>/` | `.github/workflows/deploy.yml:42-46`, `scripts/build-static.sh:5-40` |
| Publish | Pushes `./dist` to the `gh-pages` branch | `.github/workflows/deploy.yml:48-52` |

The assembly is idempotent with respect to game bundles: a pre-built `dist/` wins, so the deployed game is the released
artifact rather than whatever the submodule pointer happens to contain. Deleting `packages/<game>/dist` before a local
`build:static` is how you force a build from submodule source.

The pipeline does not currently run the quality gates. It installs, assembles and publishes, so a red test, lint or type
check does not block a deploy — the gap NFR-18 closes, ahead of the accessibility gate (ADR-0008).

## Configuration per environment

| Variable | Where it is used | Production | Local |
|----------|------------------|-----------|-------|
| `MFE_DOWNLOAD_TOKEN` | checkout of submodules and `gh release download` | repository secret | not needed |
| `GITHUB_TOKEN` | publishing to `gh-pages` | provided by Actions | not needed |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | baked into the shell bundle at build time | repository secrets today | unset, which selects the local adaptor | 
| `VITE_*` build variables after ADR-0004 | — | none remain; the build reads no configuration | none |

The two Supabase variables are the only thing build-time configuration is used for today, and they are deleted with the
cloud adaptor (ADR-0004). After that the bundle contains no configuration and the workflow needs only its two tokens.

## Rollback

| Scenario | Action |
|----------|--------|
| A bad site deploy | Re-run the workflow for the last good commit (`gh workflow run` on that ref, or push a revert of the offending commit); the `gh-pages` branch keeps its history, so a previous tree can be restored directly if needed |
| A bad game release | In the game's repository, re-release the previous `dist.tar.gz`, then re-run this workflow — the assembly downloads whatever release is latest |
| A bad submodule pointer | `git revert` the pointer bump and push; the site rebuilds from the previous game commit |
| A bad content change | Revert the markdown commit; a post is data, not a deploy |

Rolling back is always a redeploy of a previous tree. Nothing is patched in place on the host, and there is no
server-side state to reconcile.

## Who can deploy

The owner, by pushing to `main` or by dispatching the workflow. There is no approval gate, no manual promotion and no
other role: anyone with repository write access can deploy, which is one person (see
`docs/01-overview/roles-and-permissions.md`). The game repositories can trigger a deploy of this site without write
access here, because `repository_dispatch` with the `mfe-updated` type is accepted from a token held in this
repository's secrets.
