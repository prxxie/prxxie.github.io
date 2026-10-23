# Rule 04 — Git and pull requests

## 1. Branches

- One branch per story: `<type>/<STORY-ID>-<short-slug>`, e.g. `feat/US-AUTH-001-email-sign-in`.
- Docs-only work: `docs/<short-slug>`. Change requests: `docs/CR-<YYYY-MM-DD>-<slug>`.
- Never commit directly to the default branch, except the initial commits in § 4.

## 2. Commits

Conventional commits, with the story id in the subject when there is one:

```
<type>(<scope>): <description> [<STORY-ID>]

<optional body: why, not what>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

- One logical change per commit. Code and the docs it changes go in the **same** commit.
- Never commit secrets, `.env` files, generated build output, or large binaries.
- Commit only when the user asked for it or the active skill's instructions say to.

## 3. Pull requests

- Title: same format as a commit subject.
- Body: story link, summary of changes, how it was verified (commands run and results), safety flags (⚠️ breaking
  change, migration, security-sensitive), and follow-ups.
- Run `adf-review` on the branch before opening the PR.

## 4. Local repository without a remote

When there is no remote (typical at project start):

1. `git init`; the first commit on the default branch is the scaffold (`chore: add ADF scaffold`), the second the
   generated docs (`docs: add brief, doc set, and backlog`) — the user's go-ahead to run the workflow covers these.
2. Each story still gets its own branch.
3. "Opening a PR" becomes: run `adf-review` on the branch. With APPROVE (or APPROVE WITH NITS), merge locally:
   `git switch <default> && git merge --no-ff <branch>`; then delete the branch.
4. When a remote is added later, switch to the PR flow above.
5. Commit under the user's own git identity. Never set `user.name` / `user.email`, `--author`, or `GIT_AUTHOR_*` /
   `GIT_COMMITTER_*` yourself; if git reports no identity, stop and ask the user to configure it. An invented identity
   cannot be told apart from a real teammate in the history or in a report built from it.

## 5. Never without explicit permission

Force-push, rewrite published history, delete branches, change remotes, or push to a shared branch.
