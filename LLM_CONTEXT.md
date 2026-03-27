## SmartHeal — LLM Context and Onboarding

This file is a compact, self-contained context any capable LLM can ingest to instantly understand the SmartHeal repository and help continue work on it. Keep this file with the project and provide it to the model before asking implementation or projection questions.

---

## 1) High-level summary

- Project name: SmartHeal
- Purpose: A self-healing agent platform that monitors, analyzes, and applies fixes (automated remediation) across systems. It contains a backend with agent/executor/guardrail logic and a frontend UI that displays metrics, jobs, and configuration.

## 2) Repo layout (top-level)

High-level folders and responsibilities (short):

- `backend/` — Node.js server and agent logic (APIs, agent, executor, guardrails, utilities).
- `frontend/` — Vite + React UI (pages, components, features, assets, services).
- `README.md` — project-level notes and quick start information.

## 2.a) Backend — comprehensive structure

The backend is organized to separate runtime server code, agent logic, patch execution, guardrails (validators), and API routes.

Example tree (files present or expected):

backend/
package.json # backend package manifest, scripts
server.js # Express server entry point, bootstraps routes and middlewares
.env.example # example environment variables (do not include secrets)

agent/
agent.js # highest-level agent orchestration (detect, decide, dispatch)
detector.js # components that detect issues/alerts (optional)
planner.js # translates findings into remediation plans (optional)

executor/
applyPatch.js # core logic to apply patches/edits to files or infrastructure
patchRunner.js # helper that executes atomic patch jobs, handles rollback

guardrails/
syntax.js # syntax-related validators (avoid broken code edits)
security.js # security checks (no exfil, restricted APIs)
scope.js # scope/authorization checks (limits which files/areas can be changed)
quality.js # quality checks (lint, test-run heuristics)

routes/
agent.js # agent-related API endpoints (submit findings, start jobs)
health.js # health/readiness checks
error.js # centralized error handling route/middleware

utils/
logger.js # logging helpers
fileOps.js # safe file read/write helpers used by executor
validators.js # shared validation helpers

tests/
unit/ # unit tests for agent, executor, guardrails
integration/ # small integration tests for key flows

Notes and conventions:

- All code that performs automated changes must pass through the `guardrails/` validators before mutation.
- `applyPatch.js` should produce minimal hunks and include a dry-run mode.
- Keep environment-specific configs out of repo; use `.env` files locally and `process.env` in code.

## 2.b) Frontend — comprehensive structure

The frontend uses Vite + React and is organized by feature and layout. Components, pages, and state logic live under `src/`.

Example tree (files present or expected):

frontend/
package.json # frontend package manifest, scripts
index.html
vite.config.js
tailwind.config.js
.env.example

src/
main.jsx # app entry, ReactDOM.render / createRoot and provider wiring
index.css
App.jsx # top-level App component and routes
App.css

    app/
      store.js            # Redux store or other global state wiring

    assets/
      hero.png
      react.svg

    components/
      layout/
        Topbar.jsx        # top navigation bar
        Sidebar.jsx       # app sidebar

      dashboard/
        Metrics.jsx       # visualization components for metrics

    features/             # feature-scoped modules
      jobs/
        jobSlice.js       # Redux slice for jobs
        JobList.jsx       # list view for jobs
      trigger/
        TriggerButton.jsx # small component to trigger actions on the agent

    pages/
      DashboardPage.jsx
      JobsPage.jsx
      ConfigPage.jsx

    services/
      api.js              # wrapper around fetch/axios for backend endpoints

    utils/                # small UI utilities and helpers

    tests/
      unit/               # component/unit tests (Jest + React Testing Library)

Notes and conventions:

- Use feature folders to keep related components, hooks, and tests together.
- `services/api.js` should centralize HTTP calls and handle auth headers, baseURL, and error normalization.
- Keep presentational components (dumb) in `components/` and feature-specific containers in `features/`.

## 3) How to run (developer quick-start)

Assumes macOS (zsh), Node 18+ and npm/yarn installed.

1. Backend

- cd backend
- npm install
- npm run dev # or `node server.js` if using the simple entry

2. Frontend

- cd frontend
- npm install
- npm run dev # starts Vite dev server

3. Tests / lint

- Look for test scripts in `package.json` files (run `npm test` per package)

If any service uses environment variables, prefer a `.env.local` in the relevant folder (do not commit secrets).

## 4) Key files and what they do

- `backend/agent/agent.js` — orchestrates detection and remediation decisions.
- `backend/executor/applyPatch.js` — performs file edits/patches. Critical for automated changes; review guardrails first.
- `backend/guardrails/` — contains validators to prevent risky or out-of-scope changes. Files: `syntax.js`, `security.js`, `scope.js`, `quality.js`.
- `frontend/src/pages/JobsPage.jsx` and `jobSlice.js` — job listing and job state management.
- `frontend/src/services/api.js` — API wrappers used by the UI to call the backend.

## 5) Development conventions and preferences

- JavaScript/Node and React (JSX). Keep consistent style following ESLint config at `frontend/eslint.config.js`.
- Use small commits with descriptive messages. Example: `fix(agent): validate patch size in guardrails`.
- Branch names: `feature/<short-desc>`, `fix/<short-desc>`, `chore/<tooling>`.
- Tests: add a unit test for behavior-critical code (agent decision, applyPatch) and a lightweight integration or smoke test for the API route.

## 6) Minimal "contract" (for the LLM)

When asked to make a change, the LLM should:

- Input: a clear task (bugfix/feature/intent), the repository context (this file), and any additional constraints (timebox, security off-limits).
- Output: a small set of concrete changes (patches) with rationale, tests added/updated, and instructions to run/verify.
- Error modes: if a change is risky (guardrail failure) or missing context (missing env var, credentials, external API) — ask for clarification.

Success criteria:

- Code compiles / lints cleanly in the modified modules.
- Tests added pass locally (unit + a small integration/smoke test).
- PR-ready commit(s) with a short description.

## 7) Edge cases to watch

- applyPatch usage: must not overwrite unrelated files; prefer minimal hunks.
- Guardrails: all automated patches must run through `backend/guardrails/*` validators.
- Secrets/config: never embed tokens or secrets in code. Use `.env`.

## 8) Useful quick tasks and examples

- Common quick requests you might ask the LLM:
  - "Add validation that rejects patches larger than X lines in `applyPatch.js`."
  - "Create a unit test for `agent/agent.js` decision path when no actions are applicable."
  - "Wire the Jobs page to fetch from `/api/jobs` and display statuses."

- Example prompt for the LLM (copy/paste):

  "You are given the SmartHeal repo and this `LLM_CONTEXT.md`. Task: [concise task here]. Return: (1) A small patch (or list of file edits) to implement the change, (2) unit tests, (3) run/verification steps. Run guardrails and explain any skipped steps or missing context."

## 9) How to continue (projection / continuation workflow)

1. Start each session by loading this file into the model. Provide the target branch and the task.
2. Ask the LLM to produce a small plan (3–6 steps) and to produce patches directly.
3. For each patch, verify build/tests locally and ask for follow-up patches if needed.
4. When satisfied, create a branch, commit with conventional message, and open a PR describing the change and test results.

## 10) Troubleshooting tips

- If a change fails tests, look at the stack trace and request a focused fix (unit scope) rather than a broad rewrite.
- For environment-specific failures, supply the `.env.example` or local values (without secrets) to the LLM.

## 11) Maintenance ideas (future)

- Add a tiny CI workflow that runs `npm test` for `backend` and `frontend` on PR.
- Add a `PR_TEMPLATE.md` and a `DEVELOPER_GUIDE.md` with keyboard shortcuts, debugging tips, and test commands.

---

If you need this summarized into a single-line LLM prompt template or want a stricter JSON manifest version (machine-parseable), ask and I'll add it as `LLM_CONTEXT.json`.

## Recent manual edits (keep this up to date)

Note: the repo has had manual frontend edits. When you start a session, load this section first so the LLM knows about the latest local changes.

- Files changed manually on or after 2026-03-27:
  - `frontend/index.html` — added Google Fonts preconnect and font link (Inter, Merriweather, Roboto Mono) and updated page title to `SmartHeal`.
  - `frontend/src/index.css` — replaced simple font import with Tailwind preflight imports, added CSS variables for font families, set global typography defaults (Inter for body, Merriweather for headings, Roboto Mono for code), and added small helpers like `.lead`.
  - `frontend/tailwind.config.js` — extended theme `fontFamily` to include `sans: Inter`, `serif: Merriweather`, and `mono: Roboto Mono` so Tailwind utilities map to the selected fonts.
  - `frontend/src/components/layout/Topbar.jsx` — contains the topbar heading (`<h1 className="text-2xl font-semibold">Overview</h1`) which will inherit the serif heading styling from `index.css`.

Why this matters for the LLM:

- Typography now has a consistent mapping:
  - Body/UI text: Inter (variable `--font-sans`, Tailwind `font-sans`).
  - Headings (h1–h5): Merriweather (variable `--font-serif`, Tailwind `font-serif`).
  - Code/pre: Roboto Mono (variable `--font-mono`, Tailwind `font-mono`).

- The LLM should prefer using these fonts when creating new UI components or storybook examples. For accessible contrast and scale follow these rules:
  - Use Inter for small UI labels, buttons, form controls.
  - Use Merriweather for larger headings only (h2/h1); keep body largely Inter for consistency.
  - For inline code or code blocks use `code`, `pre`, or Tailwind `font-mono` to ensure Roboto Mono is applied.

Verification / quick checks (dev machine):

```bash
# from repo root
cd frontend
npm run dev
# Open the Vite dev URL printed by the command and verify:
# - Body text looks like Inter
# - Page headings use a serif texture (Merriweather)
# - Code blocks show Roboto Mono
```

If you'd like, I can update common UI components to explicitly set font utilities (e.g., add `className="font-sans"` or `font-serif`) for clarity, or switch to a single-family approach (Inter for everything) if you prefer a fully modern sans UI.

Generated on: 2026-03-27
