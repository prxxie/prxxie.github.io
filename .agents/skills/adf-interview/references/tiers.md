# Tiers

The tier sets how much documentation and process a project gets. It is chosen in the interview, recorded in
`brief.md` frontmatter and `AGENTS.md` § PROJECT, and can be raised later (`adf-change`) — never silently lowered.

## Choosing

| Signal | lite | standard | full |
|--------|------|----------|------|
| Who it is for | Yourself, a prototype, a hackathon, an internal script | A team product, an internal tool others depend on | A client delivery, a regulated or contractual project |
| People involved | 1 | 2–8 | Several roles (PM, BA, dev, QA, client) |
| Expected life | Weeks | Months to years | Contracted, with acceptance and reporting |
| Stories (rough) | ≤ 15 | 15–80 | Any; formal tracking |

Default: **standard**. Propose `lite` when the user says "prototype", "PoC", "just for me", "quick". Propose `full`
when there is a client, a contract, acceptance testing, or status reporting to someone outside the team.

## Doc layout per tier

✅ = generated · ◐ = generated only if the project type needs it · — = not generated

| Path | lite | standard | full |
|------|------|----------|------|
| `docs/README.md` | ✅ | ✅ | ✅ |
| `00-source/brief.md` | ✅ | ✅ | ✅ |
| `01-overview/project-overview.md` | ✅ | ✅ | ✅ |
| `01-overview/architecture.md` | ✅ | ✅ | ✅ |
| `01-overview/glossary.md` | — | ✅ | ✅ |
| `01-overview/nonfunctional-requirements.md` | — | ✅ | ✅ |
| `01-overview/conventions.md` | — (goes in AGENTS.md) | ✅ | ✅ |
| `01-overview/roles-and-permissions.md` | — | ◐ (has roles) | ◐ (has roles) |
| `01-overview/workflow-state-machine.md` | — | ◐ (has stateful entities) | ◐ (has stateful entities) |
| `01-overview/environment-setup.md` | — | ✅ | ✅ |
| `01-overview/deployment.md` | — | ◐ (is deployed) | ✅ |
| `02-reference/api/` | — | ◐ api-service, web-app with backend | ◐ |
| `02-reference/data/` | — | ◐ has persistent data | ◐ |
| `02-reference/screens/` | — | ◐ web-app, mobile-app, desktop-app | ◐ |
| `02-reference/cli.md` | — | ◐ cli-tool | ◐ |
| `02-reference/public-api.md` | — | ◐ library | ◐ |
| `02-reference/pipelines.md` | — | ◐ data-ml, integration | ◐ |
| `03-stories/` epics + stories | ✅ | ✅ | ✅ |
| `03-stories/README.md` backlog index | ✅ | ✅ | ✅ |
| `03-stories/delivery-plan.md` | — | ✅ | ✅ |
| `04-decisions/open-questions.md` | ✅ | ✅ | ✅ |
| `04-decisions/adr/` | ✅ (only for real decisions) | ✅ | ✅ |
| `05-quality/test-cases.md` | — | — | ✅ |
| `06-reports/` | — | — | ✅ |
| `00-source/change-requests/` + `docs/CHANGELOG.md` (format in `adf-change` § 4) | — | ✅ when changes happen | ✅ |

In `lite`, the architecture file absorbs what would be in glossary, NFRs, and the reference layer — keep each to a
short section.

## Process per tier

| Practice | lite | standard | full |
|----------|------|----------|------|
| Definition of Ready / Done | R1–R3, D1–D3 | All | All |
| Branch per story | Optional | ✅ | ✅ |
| `adf-review` before merge | Optional | ✅ | ✅ |
| Test cases traced to stories | — | — | ✅ |
| Status reports | — | On request | Weekly / per sprint |
