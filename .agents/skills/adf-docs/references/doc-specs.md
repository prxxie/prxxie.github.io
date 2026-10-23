# Doc specs

Required sections for every generated doc. A section with nothing to say gets one line explaining why, not deletion.
Sizes are guides; split a file that grows past ~400 lines.

## docs/README.md

- One-paragraph description of the product and a facts table: tier, project types, stack, stack packs.
- Counts come from a generated block, never typed by hand:
  `<!-- adf:stats -->` + newline + `<!-- /adf:stats -->` (filled by `verify-docs.py --fix`).
- **Start here** table: "You are… → Read" rows for: new to the project, setting up locally, each relevant role
  (backend, frontend, mobile, data, QA, PM/BA), using an AI agent (→ `AGENTS.md`). The "picking up work →
  `03-stories/README.md`" row is added by `adf-plan` once the backlog exists.
- **Layout** tree of the folders that exist in this tier, one line each.
- **Blocking open questions**, if any, with links.

## 01-overview/project-overview.md

Purpose · Users and actors (table) · Goals and success measures · In scope (by module or epic area) · Out of scope ·
Constraints · Key numbers (screens, endpoints, entities, integrations — whatever applies).

## 01-overview/architecture.md

- **Context**: the system, its users, and external systems — a Mermaid `flowchart` diagram plus a table.
- **Components**: one row per deployable or module — responsibility, technology, owns which data.
- **Key flows**: 2–4 most important flows as numbered steps or a Mermaid `sequenceDiagram`.
- **Cross-cutting**: auth, error handling, logging, configuration, i18n — one short paragraph each, linking to
  conventions.
- **Source layout**: planned repository directory tree with one line per directory.
- **Lite tier only**: add short sections for glossary, NFRs, and the main contracts (endpoints / screens / commands)
  instead of separate files.

## 01-overview/glossary.md

Table: Term · Meaning · Code name (identifier used in code/DB) · Notes. Include every domain term and every status
value. Agents use the code name column to avoid inventing identifiers.

## 01-overview/nonfunctional-requirements.md

One section per area (performance, availability, security, privacy, accessibility, localization, audit, observability,
compatibility). Each requirement is measurable and has an id `NFR-<nn>` so stories can reference it. A requirement met
by operations rather than code (backups, uptime monitoring) says `operational` on its line; every other NFR must be
referenced by at least one story (`adf-plan` ensures it; the verifier warns otherwise).

## 01-overview/conventions.md

Project-specific working agreement. Start with a table of installed stack packs (pack → layer → link); then record
only what the packs do not decide or what this project does differently: chosen libraries (driver, auth library),
sync vs async, API/response conventions (envelope, paging, error body, ids, dates), configuration and env vars
(`.env.example` names), naming specific to this domain. For layers without a pack, cover repository layout, naming,
error handling, logging, test framework and locations, and lint/format tools. Mark each convention that is a
recommendation rather than a user decision.

## 01-overview/roles-and-permissions.md

Role list with descriptions · Permission matrix (rows = actions or resources, columns = roles) · Object-level rules
(ownership) · How roles are assigned.

## 01-overview/workflow-state-machine.md

One section per stateful entity: Mermaid `stateDiagram-v2` · transition table (from · to · trigger · who · guard ·
side effects) · terminal states.

## 01-overview/environment-setup.md

Prerequisites with versions · clone and install · configuration (env vars table: name, required, example, purpose) ·
run locally · run tests · common problems. Commands not yet verified are marked `(planned)`.

## 01-overview/deployment.md

Environments table · build and release pipeline · configuration per environment · rollback · who can deploy.

## 02-reference/api/

`README.md`: conventions summary, auth, error codes table, and an endpoint index (method · path · purpose · roles ·
story — `—` until `adf-plan` fills it). One file per resource with, per endpoint: request (params, body schema table), responses (status · body ·
when), errors, permissions, example. Anchors per endpoint.

## 02-reference/data/

`README.md`: Mermaid `erDiagram` and entity index. One file per domain area with, per table/collection: purpose,
columns (name · type · null · default · description), keys and indexes, relations, retention. Note which values are
code-managed enums (link to glossary).

## 02-reference/screens/

`README.md`: screen index (route · name · roles · stories — `—` until `adf-plan` fills it) and navigation map. One file per screen: purpose, layout
areas, fields (name · type · validation · source), actions (label · effect · API · permission), states (loading,
empty, error), and links to designs in `00-source/`.

## 02-reference/cli.md

Global options · one section per command: synopsis, arguments and flags table, examples, output (human and `--json`),
exit codes, config/env interaction.

## 02-reference/public-api.md

Install · one section per exported module/class/function: signature, parameters, returns, errors raised, example,
stability (stable / experimental). Compatibility and deprecation policy.

## 02-reference/pipelines.md

One section per flow or pipeline: trigger/schedule · source → transformations → destination (table) · field mapping
or schema · volumes · failure handling and retries · idempotency · monitoring. For ML: dataset, model, evaluation
metric and threshold, serving path.
