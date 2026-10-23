# Home

**Route** `/` · **Job**: turn a hiring reader into a contact, with the build itself as the argument (NFR-01).
**Status**: designed, not built. Today `/` renders the About tab of a tabbed shell.

## Entry and exit

- **Entry**: the site root, a link from a CV, or a search result for the person's name. The reader arrives knowing
  nothing, in under a minute, probably on a phone.
- **Exit**: the contact block (mailto, LinkedIn, GitHub), a devlog post, or a game. The page does not end in a dead end —
  the contact block is the last thing before the footer, and it is reachable from the header at any scroll position.

## Layout

One column, in the order that answers a stranger's questions: who is this, what did they build, can I try it, is it real
engineering, how is it made, how do I reach them.

| Order | Region | What the reader learns |
|-------|--------|------------------------|
| 1 | Intro | name, that this is a working portfolio, and the one-line claim |
| 2 | What I build | three or four concrete projects, the puzzle site among them |
| 3 | Play it here | one embedded puzzle, playable in place, with the star result written back to the pet |
| 4 | Proof | the checkable claims: test count, gates, federation, releases |
| 5 | How it is made | the architecture in three sentences, and a link to the devlog |
| 6 | Contact | mailto, LinkedIn, GitHub, and what happens after a message |
| 7 | Footer | the pet widget, colophon |

The embedded puzzle is the centre of gravity: it is the only section that requires the visitor to do something, and it is
the reason the rest of the claims are believable.

## Fields

The page has no form and no input. Its fields are content blocks, and their content is the owner's, not the system's.

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| Intro claim | prose | none — it is prose | content module, owner-authored |
| Project entries | list of `{ name, oneLine, link }` | at least three | content module |
| Embedded level | one level reference | must be a level that exists in the referenced game's catalog | `content/devlog.ts` teaser config |
| Proof figures | `{ tests, files, gates, remotes, levels }` | rendered from the build, never typed by hand | build-time generated content |
| Contact links | `{ mailto, linkedin, github }` | each an absolute URL; mailto carries a subject | content module |

## States

| State | What renders |
|-------|--------------|
| Loading | the regions are prerendered; only the embedded game's frame shows a skeleton until its remote resolves |
| Game remote offline | the play section shows the named fallback and a retry; the rest of the page is unaffected |
| Never played | the pet widget shows stage 1 and `0 / 100` stars, not an empty state |
| Playing | the game's own board, its controls, and the win panel on solve |
| Solved | the win panel shows stars and the pet's XP change; the figure updates without a reload |
| Wide / narrow | one column at every width; the proof figures reflow from a row to a two-column grid below 640px |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Play the embedded level | loads the game MFE into the frame; nothing leaves the browser | none | any visitor |
| Solve it | writes `CompletedLevel` via the repository, awards XP, updates the widget and the proof figure | none | any visitor |
| Retry the remote | re-requests `remoteEntry.js` | static fetch | any visitor |
| Open a devlog post | navigates to `/devlog/:slug` | none | any visitor |
| Contact | opens `mailto:` with a subject line, or an external profile | none | any visitor |

## Accessibility

- Landmarks in order (banner, main, contentinfo); one `h1`; the intro is the page's first text, not a decorative hero.
- The embedded game is an iframe-free MFE: it must expose a focusable start control and an escape path back to the page,
  so a keyboard visitor can leave the board without fighting its arrow keys.
- The proof figures are text, not images of numbers.
- The contact block is links, so it works with JavaScript disabled and with a screen reader's link list.

## Design

`docs/02-reference/design-system.md` — display serif for the intro and section heads, body sans for prose, one coral
primary in the contact block, the pet widget as the page's only soft card.
