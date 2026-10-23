---
name: adf-interview
description: Interview the user to turn a project idea, spec, or partial requirements into a structured project brief (docs/00-source/brief.md) before any docs or code are written. Use when starting a new project, when brief.md does not exist, when the user says "I have an idea", "start a project", "interview me", or when the brief has open gaps to fill.
---

# adf-interview

Turn an idea or spec into `docs/00-source/brief.md`: a complete, sourced, AI-friendly brief that `adf-docs` and
`adf-plan` can work from without asking again.

## Inputs

- The user's idea, in any form.
- `docs/00-source/brief.md` if it exists — **resume** from it; never restart a completed section.
- `docs/00-source/ingest-report.md` if `adf-ingest` ran — ask only about its gaps and conflicts.
- If `docs/00-source/` contains specs but no `ingest-report.md`, run `adf-ingest` first.

## Outputs

- `docs/00-source/brief.md`, from `.agents/templates/brief.md`.
- New entries in `docs/04-decisions/open-questions.md` (create it from `.agents/templates/open-questions.md`).

## How to ask

- **A round is one message to the user, with ≤4 questions.** Closely related sub-questions on one topic (e.g.
  deadline, team size, budget) count as one question. Use the tool's structured-question UI if it has one.
- **The question bank is a coverage checklist, not a script.** Every bank question must end up answered, inferred,
  or marked not applicable — but only ask what you cannot infer. Put all inferences of a round in one
  "I'm assuming: …" list at the end of the message; the user correcting or accepting it counts as one question.
- **Offer options with a recommended default** for every question that has a conventional answer. Put the
  recommendation first and say why in one line.
- **"You decide"** is a decision, not an open question: record it in the brief as
  `<chosen default> [user: delegated]`. For a technical choice (stack, auth, hosting), `adf-docs` also writes an
  `accepted` ADR. Do **not** raise an open question for it.
- **"Not sure" / "need to ask X"** is a genuine unknown: raise an open question (`adf-decide` format) naming who can
  answer, with the default you will assume until then in **Assumption**.
- **Write as you go.** Update `brief.md` after every round so the interview survives an interrupted session.
- Ask in the user's language; write the brief in English.

## Procedure

### Round 0 — Orient (no questions yet)

1. Read the inputs above. Restate the idea in two sentences and list what you already know.
2. Tell the user how the interview works: ~3–6 short rounds, they can answer "you decide" to anything.

### Round 1 — Core (always)

Ask from [references/questions/core.md](references/questions/core.md) § Round 1: problem, users, goals and success
measure, must-have scope, explicit non-goals, constraints (deadline, team, budget, compliance).

From the answers, **classify**:
- **Project types** (one or more): `web-app`, `api-service`, `mobile-app`, `cli-tool`, `library`, `data-ml`,
  `integration` (automation, bots, ETL, connectors), `desktop-app`. Confirm your classification with the user.
- **Tier**: propose one per [references/tiers.md](references/tiers.md) and confirm.

### Round 2 — Type modules

Load **only** the module file for each confirmed type from `references/questions/` and ask its questions. For
`desktop-app`, use `web-app.md` § UI and `cli-tool.md` § Distribution. Skip questions already answered.

### Round 3 — Cross-cutting

Ask from `core.md` § Round 3: data and privacy, identity and roles, integrations, non-functional requirements,
environments and deployment, tech stack preferences, testing expectations. In the `lite` tier ask only the questions
marked **[lite]**.

### Round 4 — Delivery (standard and full tiers)

Ask from `core.md` § Round 4: milestones, team and roles, working cadence, reporting audience, definition of done
extras, source-of-truth ownership.

### Round 5 — Confirm

1. Show a compact summary of the brief: one line per section plus the list of assumptions and open questions.
2. Ask the user to confirm or correct. Apply corrections.
3. Set `status: confirmed` in the brief frontmatter and set `updated` to today's date.
4. Tell the user the next step: `adf-docs`.

## Brief rules

- Every answer carries a source tag: `[user]`, `[user: delegated]`, `[spec: <file>#<section>]`, `[inferred]`
  (stated to and not corrected by the user), or `[assumption: OQ-nn]`.
- § 15 records the assumptions and open questions **as of the interview**. Later questions live only in
  `docs/04-decisions/open-questions.md`; the brief is not kept in sync with them.
- Write facts, not the conversation. Bad: "User said they think maybe 50 users". Good: "~50 concurrent users [user]".
- Leave a section as `_not applicable_` with a one-line reason rather than deleting it.
- Tech stack: record preferences and constraints. If the user has none, propose a stack fitting the project type,
  team skills, and deployment target, give a one-line rationale, and record it as an assumption unless confirmed.

## Stop conditions

- The user wants to skip the interview: write the brief from what you have, mark every gap as an open question, set
  `status: draft`, and warn that `adf-docs` output will be thinner.
- Contradictory answers: name the contradiction and ask once; if unresolved, open a question.
