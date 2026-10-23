---
id: US-SITE-006
title: Offer a contact path with no backend
epic: EPIC-02-site-shell
status: done
priority: P1
size: S
depends_on: [US-SITE-002]
open_questions: []
accepted_assumptions: []
refs: ["04-decisions/adr/ADR-0007-no-analytics-mailto-contact.md", "02-reference/screens/README.md", "01-overview/nonfunctional-requirements.md"]
---

# US-SITE-006 — Offer a contact path with no backend

## 1. Story

**As a** visitor who wants to reach me
**I want** one obvious way to write to me from any page, without a form that posts somewhere
**so that** I can make contact in two clicks and nothing on the site collects my data.

## 2. Context

The success measure is email contact, but NFR-08 forbids collecting personal data and ADR-0007 rules out analytics and a form backend. The contact path is therefore a `mailto:` link with a prefilled subject, plus LinkedIn and GitHub, rendered in the footer and reusable inside the home page.

**NFRs**: NFR-08, NFR-22

| Topic | Reference |
|-------|-----------|
| ADR-0007 | [ADR-0007-no-analytics-mailto-contact.md](../../04-decisions/adr/ADR-0007-no-analytics-mailto-contact.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | any page | the footer is reached | it shows an email link, a LinkedIn link and a GitHub link, each with an accessible name |
| AC2 | the email link | it is activated | the mail client opens with a subject and no body |
| AC3 | the page | it is loaded with JavaScript disabled | the contact links are present and usable |
| AC4 | the contact block | it is read by a screen reader | each link announces where it goes, and external links say so |
| AC5 | the built bundle | network requests are watched | no third-party script and no form submission is attempted |

## 4. Contract

One `ContactBlock` component, used verbatim on `/` and in the footer. Addresses come from a single constants module so a change is one edit.

## 5. Rules and edge cases

- The email address is public by choice — it is the point of the page.
- No obfuscation, no captcha, no "copy the address" widget.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A contact form, a newsletter or any address storage.

## 8. Test notes

Component test: three links, correct hrefs, accessible names; a manual check with scripting off.

## 9. Open questions

None.

## 10. Outcome

Commit `5677817`. `packages/shell/src/contact.ts` holds the three addresses in one object and builds the mailto link with a subject and no body; `packages/shell/src/components/ContactBlock.tsx` renders three plain anchors (email, LinkedIn, GitHub) with names that say where an external link goes; the footer mounts it on every route. No form, no script, no iframe, no cookie banner. Proven by `packages/shell/src/contact.test.tsx` (5 tests) and the prerendered footer.
