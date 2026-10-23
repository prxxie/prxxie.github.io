# Devlog

**Route** `/devlog` (index) and `/devlog/:slug` (post) · **Job**: show how the thing is made, one post at a time, with a
playable teaser level inline (NFR-06). **Status**: designed, not built. Today `/posts` renders a list and a reader with the
amber chrome, and posts are 2 markdown files plus 2 inline objects.

## Entry and exit

- **Entry**: the header's Devlog item, a post URL from a search result or a shared link, or the home page's "how it is
  made" section.
- **Exit**: the next post, the games hub, or the contact block. A reader who arrives directly on one post must find the
  index and the intro without going home first.

## Layout — index

| Region | Contents |
|--------|----------|
| Intro | one line about what the devlog is for: build notes on this site, not a general blog |
| Post list | reverse chronological: date, title, one-line summary, reading time |
| Teaser | the most recent post's playable level, with the stars it awarded |

## Layout — post

| Region | Contents |
|--------|----------|
| Header | date, title, back to index |
| Body | prose with headings, code blocks and figures |
| Teaser | the post's linked level, playable in place, with the star result |
| Footer | previous/next post, contact block |

## Fields

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| `slug` | `string` | present, unique, URL-safe; the file name is the slug | markdown file name in `packages/posts/src/content/posts/` |
| `title` | `string` | present, non-empty | frontmatter |
| `date` | `string` | present, exactly `YYYY-MM-DD` | frontmatter |
| `summary` | `string` | present, one line | frontmatter |
| `teaserGame` | `string` | optional; when present, a game slug | frontmatter |
| `teaserLevel` | `string` | optional; when present, a level id of `teaserGame` | frontmatter |
| `body` | markdown | must compile at build time | file contents |

An unknown frontmatter key fails the build rather than being dropped (`packages/posts/src/content/loadPosts.ts`).

A post with a missing or invalid field fails the build rather than shipping blank — markdown is compiled at build time,
not fetched at runtime (ADR-0006).

## States

| State | What renders |
|-------|--------------|
| Loading | prerendered index and post body; only the teaser frame waits for its remote |
| Empty index | one post still reads as a list; zero posts is a build-time state, not a runtime one |
| Unknown slug | the not-found screen with a link to the index, prerendered |
| Teaser remote offline | the named fallback with retry; the prose is unaffected |
| Solved teaser | stars shown beside the teaser, written to the same progress document as the games |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Open a post | navigates to `/devlog/:slug` | none | any visitor |
| Play the teaser | loads the linked level in place | none | any visitor |
| Previous / next | navigates within the series | none | any visitor |

## Accessibility

- The post is one `article` with a single `h1`; heading levels follow the document, never restart inside a section.
- Code blocks are horizontally scrollable with a keyboard-reachable container and keep their language label as text.
- The teaser's focus trap rules match the home page's embedded game: a named start control and an escape path.
- Dates are rendered as text and carry a machine-readable `datetime`; reading time is text, not an icon.

## Design

`docs/02-reference/design-system.md` — display serif for post titles, body sans for prose at 16/1.55, code in the mono
family, figures and teasers as cards.
