# {App name}

{One sentence: who uses it and for what. The app UI is in Vietnamese; this README is in English because the
Base Database CLI accepts README headings in English, Chinese or Japanese only.}

## Background

{The problem, the users (roles) and where the data lives: one Lark Base with N tables. Link the original requirements
file if it is part of the project (for example `app-spec.md`).}

## Requested features

- {Main flow in 3–4 steps}
- {Roles and what each can see/do; sensitive fields}
- {Key pages}
- {Business rules: states, metrics, anti-duplication, snapshots, audit}
- {AI capabilities, notifications, attachments, external agent tools}
- {UI: layout, style preset, light/dark, Vietnamese formats, mobile priorities}

## Implemented capabilities

Pages ({language}, light/dark, desktop and phone widths; dates dd/mm/yyyy, 24-hour clock, VND):

- **{Role or area}**: {pages and actions actually implemented}

Backend:

- **Identity and roles** — {whoami, members table, how each Database Function filters by `CURRENT_USER_ID()`,
  which FaaS check roles}
- **Writes** — {FaaS / Mutation list grouped by business action}
- **Audit and notifications** — {tables, triggers}
- **AI Functions** — {keys, model, draft-only rule}

Sample data: {counts per table, all marked "(Demo)"}.

## Status and limitations

- Deployed to **{Preview | Prod}**. {Prod is published after the owner tries Preview and approves.}
- Verified: {df-smoke N/N, acceptance scenarios ①–⑩ results, UI harness widths/themes}.
- Not verified inside the Lark host: {file upload, external links, deep links from messages, …}.
- Platform limits that affect use: {for example no column arithmetic in SQL, org-only access, no unattended schedule
  without a Base workflow}.
- QA data left in Preview: {list, or "none"}.

## Local project

- CLI: `base-database-cli` {version} (or `npx -y @lark-base-open/base-database-cli@{version}`).
- Flow: `contracts generate` → `check --json` → `deploy` (Preview) → `deploy --production --yes` after approval.
- Tools: `node tools/df-smoke.mjs`, `node tools/invoke.mjs <id> '<json>'`, `node tools/acceptance.mjs`,
  `npx vite --config tools/harness/vite.config.mjs`.
- {Generators: `node tools/gen-database-functions.mjs`, `node tools/sync-faas-lib.mjs`}
