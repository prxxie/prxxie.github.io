---
name: adf-docs
description: Generate or regenerate the project's AI-friendly documentation (docs/01-overview, docs/02-reference, docs/README.md) and fill the PROJECT section of AGENTS.md from the confirmed brief. Use after adf-interview, when the user asks to "generate the docs", or when the brief changed and the docs must be refreshed.
---

# adf-docs

Turn `docs/00-source/brief.md` into the overview and reference layers of the doc set, sized to the project's tier.

## Preconditions

- `docs/00-source/brief.md` exists. If not, stop and run `adf-interview`.
- If the brief has `status: draft`, warn the user that the docs will contain more assumptions, then continue only if
  they agree.

## Procedure

1. **Read** the brief, `.agents/rules/02-docs-navigation.md`, and the layout table in
   [../adf-interview/references/tiers.md](../adf-interview/references/tiers.md). Read every file in
   `docs/00-source/` the brief cites.
2. **Stack packs** (before writing anything, because the docs build on them). Resolve the scaffold path in this order:
   `$ADF_SCAFFOLD_PATH` (a teammate's clone differs from the machine that ran the installer), then `scaffold_path` in
   `.agents/adf.json`, then ask the user for the path to their scaffold checkout. Run
   `<scaffold_path>/install.sh --list-packs`. Match the brief's tech stack against the catalog and propose the matching
   packs (one line each: pack → which part of the stack, plus its `status` — flag any `unverified` pack so the user knows
   its commands need confirming, `requires:` pulled in automatically, and the `works with:` packs not being installed).
   On the user's approval run
   `<scaffold_path>/install.sh --pack <a,b> .` from the project root, then read each installed
   `.agents/skills/adf-stack-<name>/SKILL.md`. If the `version` recorded in `.agents/adf.json` differs from
   `<scaffold_path>/VERSION`, say so and recommend `install.sh --dry-run --force .` before adding packs — the skills in
   `.agents/` and the packs would otherwise come from two different versions. If neither source yields a working path, give the user the command to run
   instead (`ADF_SCAFFOLD_PATH=/path/to/adf-scaffold ./install.sh --pack …`). Layers with no matching pack are covered
   by `conventions.md` alone — say which.
3. **Plan the file list.** From the tier and `project_types`, list every file to generate (✅ and applicable ◐ rows).
   Show the list to the user in one message, then proceed unless they object.
4. **Existing docs.** If a target file already exists, update it in place: keep content not derived from the brief,
   and never delete a section someone added by hand. Report what changed per file.
5. **Write each file** following [references/doc-specs.md](references/doc-specs.md). Rules:
   - Carry source tags from the brief into the docs where a fact could be challenged.
   - Anything the brief does not support is an assumption: tag it `[assumption: OQ-nn]` (rule 02 § 7) and add or
     reuse an open question in `docs/04-decisions/open-questions.md` (create from
     `.agents/templates/open-questions.md`).
   - **No story ids yet** — stories do not exist until `adf-plan`. Write `—` in "story" columns; `adf-plan` fills
     them in.
   - `conventions.md` records project decisions and deviations from the installed packs only — link the pack for
     everything else; do not copy pack content.
   - Prefer tables. Keep each file focused; link instead of repeating.
6. **Decisions.** For each significant choice in the brief (stack, architecture style, auth approach, hosting),
   create an ADR in `docs/04-decisions/adr/` from `.agents/templates/adr.md`: status `accepted` if the user chose or
   delegated it (`[user: delegated]`), `proposed` if it rests on an open question. Number from `ADR-0001`.
7. **AGENTS.md PROJECT section.** Replace only the text between `<!-- adf:project:start -->` and
   `<!-- adf:project:end -->`. Fill name, tier, project type, stack, stack packs, layout, and conventions summary. For
   build/test/lint/run commands: take them from the installed pack's "PROJECT values" when there is one; otherwise use
   the real command if the project is already set up, or the command the chosen stack's standard tooling will use.
   Commands not yet runnable get `(planned — verify after US-FND-001)`; `adf-ship` removes the marker once the story
   that makes them runnable is done. In the lite tier, put the conventions (naming, structure, error handling,
   testing framework) directly here, ≤15 lines.
8. **docs/README.md.** Write it per doc-specs § docs/README.md, including the `adf:stats` generated block.
9. **Verify.** Run `python3 .agents/scripts/verify-docs.py --fix`. Fix every error; report warnings.
10. **Report** the files written, packs installed, assumptions added (with OQ ids), ADRs created, and the next step:
    `adf-plan`.

## Do not

- Invent requirements, endpoints, fields, or roles the brief does not imply. A reasonable inference is allowed only as
  an assumption with an open question.
- Write stories — that is `adf-plan`.
- Copy the brief verbatim. The docs restructure it for lookup; the brief remains the record of what was said.
