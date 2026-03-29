## SmartHeal — LLM Context and Onboarding

This file is a compact, self-contained context any capable LLM can ingest to instantly understand the SmartHeal repository and help continue work on it. Keep this file with the project and provide it to the model before asking implementation or projection questions.

---

## 1) High-level summary

- Project name: SmartHeal
- Purpose: A self-healing agent platform that monitors, analyzes, and applies fixes (automated remediation) across systems. It contains a backend with agent/executor/guardrail logic and a frontend UI that displays metrics, jobs, and configuration. Includes GitHub integration for automated PR creation.

## 2) Repo layout (top-level)

High-level folders and responsibilities (short):

- `backend/` — Node.js server and agent logic (APIs, agent, executor, guardrails, daemon, services, utilities).
- `frontend/` — Vite + React UI (pages, components, features, assets, services).
- `README.md` — project-level notes and quick start information.
- `ROADMAP.md` — project roadmap and future plans.

## 2.a) Backend — comprehensive structure

The backend is organized to separate runtime server code, agent logic, patch execution, guardrails (validators), daemon processing, and API routes.

Example tree (files present or expected):

backend/
package.json # backend package manifest, scripts
server.js # Express server entry point, bootstraps routes and middlewares
.env.example # example environment variables (do not include secrets)

app/
app.js # Example app code with intentional bug for testing
smartheal.js # SmartHeal SDK for error capture and reporting

agent/
agent.js # highest-level agent orchestration (detect, decide, dispatch)
detector.js # components that detect issues/alerts (optional)
planner.js # translates findings into remediation plans (optional)

daemon/
watcher.js # Background job processing daemon (picks up NEW jobs, runs agent, applies patches)

executor/
applyPatch.js # core logic to apply patches/edits to files or infrastructure
patchRunner.js # helper that executes atomic patch jobs, handles rollback

guardrails/
validate.js # Main validation orchestrator (runs all rule checks)
rules/
syntax.js # syntax-related validators (avoid broken code edits)
security.js # security checks (no exfil, restricted APIs)
scope.js # scope/authorization checks (limits which files/areas can be changed)
quality.js # quality checks (lint, test-run heuristics)

routes/
agent.js # agent-related API endpoints (submit findings, start jobs)
github.js # GitHub OAuth flow, repo listing, and repo selection endpoints
health.js # health/readiness checks
error.js # centralized error handling route/middleware

services/
githubService.js # GitHub API integration (create PRs, manage branches)

models/
Job.js # Mongoose model for Job records (lifecycle, AI results, execution logs)
Repo.js # Mongoose model for GitHub repositories (projectId, name, fullName, accessToken)

utils/
logger.js # logging helpers
fileOps.js # safe file read/write helpers used by executor
db.js # MongoDB connection helper
notify.js # notification utilities

tests/
unit/ # unit tests for agent, executor, guardrails
integration/ # small integration tests for key flows

Notes and conventions:

- All code that performs automated changes must pass through the `guardrails/` validators before mutation.
- `applyPatch.js` should produce minimal hunks and include a dry-run mode.
- Keep environment-specific configs out of repo; use `.env` files locally and `process.env` in code.
- The `daemon/watcher.js` runs as a background process, polling for NEW jobs every 2 seconds.
- GitHub integration uses OAuth flow with session-based token storage.

## 2.b) Frontend — comprehensive structure

The frontend uses Vite + React and is organized by feature and layout. Components, pages, and state logic live under `src/`.

Example tree (files present or expected):

frontend/
package.json # frontend package manifest, scripts
index.html
vite.config.js
tailwind.config.js
.eslint.config.js # ESLint configuration
.env.example

src/
main.jsx # app entry, ReactDOM.render / createRoot and provider wiring
index.css
App.jsx # top-level App component and routes
App.css
smartheal.js # SmartHeal SDK for frontend error capture

    app/
      store.js            # Redux store or other global state wiring

    assets/
      hero.png
      react.svg
      vite.svg

    components/
      layout/
        Topbar.jsx        # top navigation bar
        Sidebar.jsx       # app sidebar
        Skeleton.tsx      # loading skeleton component

      dashboard/
        Metrics.jsx       # visualization components for metrics

      connector/
        ConnectRepoWizard.jsx # GitHub repository connection wizard (2-step: OAuth → repo selection)

    features/             # feature-scoped modules
      jobs/
        jobSlice.js       # Redux slice for jobs
        JobList.jsx       # list view for jobs
      trigger/
        TriggerButton.jsx # small component to trigger actions on the agent
      config/             # placeholder for config-related features
      dashboard/          # placeholder for dashboard-related features

    pages/
      DashboardPage.jsx
      JobsPage.jsx
      ConfigPage.jsx

    services/
      api.js              # wrapper around fetch/axios for backend endpoints

    utils/                # small UI utilities and helpers

    tests/
      unit/               # component/unit tests (Jest + React Testing Library expected)

Notes and conventions:

- Use feature folders to keep related components, hooks, and tests together.
- `services/api.js` should centralize HTTP calls and handle auth headers, baseURL, and error normalization.
- Keep presentational components (dumb) in `components/` and feature-specific containers in `features/`.
- The `ConnectRepoWizard` component handles GitHub OAuth flow and repository selection.

## 2.c) Codebase summary — quick reference (frontend + backend)

This short summary is for quick ingestion by an LLM or a new contributor. It highlights the primary responsibilities, entry points, and data flow between frontend and backend.

- Frontend (what it is and how it behaves):
  - Purpose: A Vite + React single-page app that displays metrics, job status, and allows triggering/inspecting remediation jobs. Includes GitHub repository connection wizard.
  - Entry: `frontend/src/main.jsx` → `App.jsx` routes → pages under `src/pages/`.
  - State: Redux (store in `src/app/store.js`) is used for global state; feature slices live in `src/features/` (e.g., `jobs/jobSlice.js`).
  - Network: `src/services/api.js` centralizes calls to backend REST endpoints (jobs, agent, health, github).
  - Styling: Tailwind CSS configured in `tailwind.config.js`; global overrides in `src/index.css`. Fonts: Inter (UI), Merriweather (headings), Roboto Mono (code).
  - Tests: unit tests live under `src/tests/` (Jest + React Testing Library expected).

- Backend (what it is and how it behaves):
  - Purpose: Node.js/Express server that exposes REST endpoints to accept findings, create jobs, run the agent, execute patches via the executor, and manage GitHub integration.
  - Entry: `backend/server.js` — sets up Express, connects middleware, mounts `routes/` and bootstraps DB connection.
  - Data model: Mongoose models under `backend/models/` (e.g., `Job.js`, `Repo.js`) persist job lifecycle, AI results, execution logs, and GitHub repository info.
  - Agent: `backend/agent/` contains detection, planning, and orchestration logic. `executor/applyPatch.js` performs edits.
  - Daemon: `backend/daemon/watcher.js` runs as a background process, polling for NEW jobs and processing them through the agent pipeline.
  - Guardrails: `backend/guardrails/` performs validation (syntax, scope, security, quality) before any automatic change is applied.
  - Services: `backend/services/githubService.js` handles GitHub API interactions (PR creation, branch management).
  - Tests: unit and integration tests in `backend/tests/`.

- Data flow (high-level):
  1. Frontend calls backend API (e.g., POST /api/jobs) via `services/api.js`.
  2. Backend creates a `Job` record with status `NEW`.
  3. `daemon/watcher.js` picks up the job (atomic findOneAndUpdate), sets status to `PROCESSING`.
  4. Agent generates `agentResult` (RCAs, patches, confidence score) and updates the `Job` record.
  5. Based on confidence score:
     - < 0.5: Job rejected (status → `FAILED`)
     - 0.5–0.85: Job awaits manual approval (status → `AWAITING_APPROVAL`)
     - > 0.85: Job auto-approved (continues to guardrails)
  6. If auto-approved, patches go through `backend/guardrails/validate.js` (syntax, security, scope, quality checks).
  7. If guardrails pass, executor runs `applyPatch.js` and/or creates a GitHub PR via `githubService.js`.
  8. Job status updated to `DONE` or `FAILED` with timeline entries.
  9. Frontend polls or subscribes to job updates to show status and results.

- Quick edit guide (where to implement common changes):
  - Add backend API: create route in `backend/routes/`, add controller logic, update `backend/server.js` to mount if necessary, and add tests.
  - Change agent logic: edit `backend/agent/agent.js` or helper modules; add unit tests for decision paths.
  - Add frontend UI: add page under `frontend/src/pages/`, wire state in `features/` or `app/store.js`, call backend via `services/api.js`, and add styles in `components/` or `index.css`.
  - Add guardrail rule: create new file in `backend/guardrails/rules/`, export check function, and add to `validate.js` checks array.

## 2.d) Folder structure (detailed)

Below is a more explicit folder-level map (what to expect in each folder). Use this as a quick navigator.

backend/
package.json # scripts, deps, start/dev commands
server.js # express app, middleware, route mounting, DB connect
.env.example

app/
app.js # Example app code with intentional bug for testing
smartheal.js # SmartHeal SDK for error capture and reporting

models/ # Mongoose models
Job.js # job lifecycle, AI results, execution logs
Repo.js # GitHub repository model (projectId, name, fullName, accessToken)

routes/ # Express routers
agent.js # agent-related endpoints
github.js # GitHub OAuth flow, repo listing, repo selection
health.js # health checks
error.js # error handling and wrappers

agent/ # core autonomous logic
agent.js # orchestrator (detect → plan → act)
detector.js # input detectors/parsers
planner.js # plan creation and scoring

daemon/ # background job processing
watcher.js # polls for NEW jobs, runs agent pipeline, applies patches

executor/ # applies approved changes
applyPatch.js # creates/apply file hunks; supports dry-run and rollback
patchRunner.js # executes patch tasks, records output

guardrails/ # validators run before applying any change
validate.js # main orchestrator (runs all rule checks)
rules/
syntax.js # syntax validation
security.js # security risk detection
scope.js # scope/authorization checks
quality.js # quality checks (condition handling, trivial patches)

services/ # external service integrations
githubService.js # GitHub API integration (create PRs, manage branches)

utils/ # small reusable helpers
logger.js # logging helpers
fileOps.js # safe file read/write helpers
db.js # MongoDB connection helper
notify.js # notification utilities

tests/
unit/
integration/

frontend/
package.json
index.html
vite.config.js
tailwind.config.js
eslint.config.js
public/ # static assets served by Vite
favicon.svg
icons.svg

src/
main.jsx
App.jsx
index.css
App.css
smartheal.js # SmartHeal SDK for frontend error capture

    app/
      store.js

    components/
      layout/
        Topbar.jsx
        Sidebar.jsx
        Skeleton.tsx # loading skeleton component
      dashboard/
        Metrics.jsx
      connector/
        ConnectRepoWizard.jsx # GitHub repo connection wizard

    features/
      jobs/
        jobSlice.js
        JobList.jsx
      trigger/
        TriggerButton.jsx
      config/ # placeholder for config features
      dashboard/ # placeholder for dashboard features

    pages/
      DashboardPage.jsx
      JobsPage.jsx
      ConfigPage.jsx

    services/
      api.js

    assets/
      hero.png
      react.svg
      vite.svg
    utils/
    tests/

## System flow (detailed)

This describes the lifecycle of a typical "job" or "issue" from reception through remediation and UI update. Use this as the authoritative sequence when adding features or debugging behavior.

1. Ingestion
   - Frontend or an external system POSTs a new event/job to `POST /api/jobs` (via `services/api.js` on frontend).
   - Backend route (e.g., `backend/routes/agent.js`) validates request and creates a `Job` document (Mongoose model) with status `NEW`.

2. Daemon pickup
   - `backend/daemon/watcher.js` runs as a background process (polls every 2 seconds).
   - Atomically picks up a `NEW` job using `findOneAndUpdate` (sets status to `PROCESSING`).
   - Creates a unified updater function that also emits realtime updates (stub for now).

3. Agent analysis
   - `backend/agent/agent.js` is called with the job's error message.
   - Agent may call external AI services to generate RCAs, patches, and confidence scores.
   - Retry logic: up to 2 attempts if confidence is low.
   - Results saved to `job.agentResult` and timeline appended with steps and timestamps.

4. Decision routing
   - Based on confidence score:
     - < 0.5: Job rejected (status → `FAILED`, decision → `REJECTED`)
     - 0.5–0.85: Job awaits manual approval (status → `AWAITING_APPROVAL`, decision → `MANUAL`)
     - > 0.85: Job auto-approved (decision → `AUTO`, continues to guardrails)

5. Guardrails & approval
   - Before any mutation, proposed patches go through `backend/guardrails/validate.js`.
   - Runs checks: syntax, security, scope, quality.
   - If guardrails fail, job status → `FAILED` with failure reason in timeline.

6. Execution
   - If guardrails pass, executor runs `applyPatch.js` (currently commented out in watcher).
   - If a GitHub repo is connected (`Repo` model), `githubService.js` creates a PR:
     - Gets default branch and latest commit SHA
     - Creates new branch (`smartheal-fix-{timestamp}`)
     - Creates PR with patch content
   - Execution results stored in `job.execution`.

7. Finalization & notification
   - On success, `Job.status` is set to `DONE` and final artifacts (patches, logs, PR URL) are persisted.
   - Alert sent (stub: console.log).
   - Frontend subscribes or polls for job updates and displays status/result to users (via `jobs` slice and pages).

8. Audit & rollback
   - All changes include metadata and timestamps in `timeline` for auditing.
   - `applyPatch.js` should support rollback/human-driven revert steps recorded in `timeline`.

Diagram (ASCII):

Frontend (UI) --> POST /api/jobs --> Backend routes --> Job model (status: NEW)
|
v
Daemon (watcher.js) picks up job
|
v
Agent (detect/plan) --> agentResult (confidence, patch)
|
v
Decision routing:

- confidence < 0.5: FAILED
- 0.5-0.85: AWAITING_APPROVAL
- > 0.85: AUTO (continue)
  > |
  > v
  > Guardrails (validate.js) ---> Executor (applyPatch) / GitHub PR creation
  > |
  > v
  > job.timeline <--- execution results
  > |
  > v
  > Frontend polls/subscribes

## 3) How to run (developer quick-start)

Assumes macOS (zsh), Node 18+ and npm/yarn installed.

1. Backend

- cd backend
- npm install
- cp .env.example .env # Configure environment variables
- npm run dev # or `node server.js` if using the simple entry

See [`backend/README.md`](backend/README.md) for detailed setup instructions including GitHub OAuth configuration.

2. Frontend

- cd frontend
- npm install
- npm run dev # starts Vite dev server

3. Tests / lint

- Look for test scripts in `package.json` files (run `npm test` per package)

If any service uses environment variables, prefer a `.env.local` in the relevant folder (do not commit secrets).

## 4) Key files and what they do

- `backend/daemon/watcher.js` — Background job processing daemon. Polls for NEW jobs, runs agent pipeline, applies patches or creates GitHub PRs.
- `backend/agent/agent.js` — orchestrates detection and remediation decisions.
- `backend/executor/applyPatch.js` — performs file edits/patches. Critical for automated changes; review guardrails first.
- `backend/guardrails/validate.js` — Main validation orchestrator that runs all guardrail checks (syntax, security, scope, quality).
- `backend/guardrails/rules/` — Individual guardrail rule files (syntax.js, security.js, scope.js, quality.js).
- `backend/services/githubService.js` — GitHub API integration for creating PRs with automated fixes.
- `backend/models/Repo.js` — Mongoose model for connected GitHub repositories.
- `backend/routes/github.js` — GitHub OAuth flow and repository selection endpoints.
- `frontend/src/components/connector/ConnectRepoWizard.jsx` — GitHub repository connection wizard (2-step: OAuth → repo selection).
- `frontend/src/pages/JobsPage.jsx` and `jobSlice.js` — job listing and job state management.
- `frontend/src/services/api.js` — API wrappers used by the UI to call the backend.
- `frontend/src/smartheal.js` and `backend/app/smartheal.js` — SmartHeal SDK for error capture and reporting.

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
- Guardrails: all automated patches must run through `backend/guardrails/validate.js` before execution.
- Secrets/config: never embed tokens or secrets in code. Use `.env`.
- GitHub integration: OAuth tokens stored in session; ensure proper error handling for expired tokens.
- Daemon reliability: `watcher.js` uses atomic findOneAndUpdate to prevent race conditions when picking up jobs.

## 8) Useful quick tasks and examples

- Common quick requests you might ask the LLM:
  - "Add validation that rejects patches larger than X lines in `applyPatch.js`."
  - "Create a unit test for `agent/agent.js` decision path when no actions are applicable."
  - "Wire the Jobs page to fetch from `/api/jobs` and display statuses."
  - "Add a new guardrail rule in `backend/guardrails/rules/` to check for specific patterns."
  - "Implement the GitHub PR creation logic in `githubService.js` to apply actual diffs."

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
- For GitHub OAuth issues, check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env`.
- For daemon issues, check that `watcher.js` is running and MongoDB connection is established.

### GitHub API 403 Error: "Resource not accessible by integration"

This error occurs when the GitHub OAuth token doesn't have sufficient permissions. Common causes:

1. **GitHub App vs OAuth App**: The OAuth app is configured as a GitHub App instead of an OAuth App. GitHub Apps have different permission models and won't work with the current code.
   - **Fix**: Go to GitHub Settings > Developer settings > OAuth Apps and create a new OAuth App (not a GitHub App).

2. **Missing 'repo' scope**: The OAuth app doesn't have the 'repo' scope enabled.
   - **Fix**: In your OAuth App settings, ensure the 'repo' scope is requested during authorization.

3. **Branch protection rules**: The repository has branch protection rules that prevent branch creation.
   - **Fix**: Check repository settings > Branches and ensure the token user has permission to create branches.

4. **Expired token**: The OAuth token has expired.
   - **Fix**: Reconnect the repository through the ConnectRepoWizard to get a fresh token.

**Error handling**: The [`githubService.js`](backend/services/githubService.js) now provides detailed error messages for these common issues. Check the job timeline for specific error details.

### GitHub API 401 Error: "OAuth token is invalid or expired"

This error occurs when the OAuth token stored in the `Repo` model is invalid or expired. The token is validated before attempting PR creation.

**Common causes**:

1. Token expired (GitHub OAuth tokens can expire)
2. Token was revoked by user
3. Token was never valid

**Fix**:

1. Reconnect the repository through the ConnectRepoWizard
2. Ensure you're using a valid GitHub OAuth App
3. Check that the OAuth App has 'repo' scope enabled

**Token validation**: The [`githubService.js`](backend/services/githubService.js) now validates tokens before attempting PR creation, providing early detection of expired tokens.

## 11) Maintenance ideas (future)

- Add a tiny CI workflow that runs `npm test` for `backend` and `frontend` on PR.
- Add a `PR_TEMPLATE.md` and a `DEVELOPER_GUIDE.md` with keyboard shortcuts, debugging tips, and test commands.
- Implement actual diff parsing in `githubService.js` instead of simple patch text in PR body.
- Add Slack/email notifications instead of console.log stubs in `watcher.js`.

---

If you need this summarized into a single-line LLM prompt template or want a stricter JSON manifest version (machine-parseable), ask and I'll add it as `LLM_CONTEXT.json`.

## Recent manual edits (keep this up to date)

Note: the repo has had manual frontend edits. When you start a session, load this section first so the LLM knows about the latest local changes.

- Files changed manually on or after 2026-03-27:
  - `frontend/index.html` — added Google Fonts preconnect and font link (Inter, Merriweather, Roboto Mono) and updated page title to `SmartHeal`.
  - `frontend/src/index.css` — replaced simple font import with Tailwind preflight imports, added CSS variables for font families, set global typography defaults (Inter for body, Merriweather for headings, Roboto Mono for code), and added small helpers like `.lead`.
  - `frontend/tailwind.config.js` — extended theme `fontFamily` to include `sans: Inter`, `serif: Merriweather`, and `mono: Roboto Mono` so Tailwind utilities map to the selected fonts.
  - `frontend/src/components/layout/Topbar.jsx` — contains the topbar heading (`<h1 className="text-2xl font-semibold">Overview</h1`) which will inherit the serif heading styling from `index.css`.

  ### New/changed backend files
  - `backend/models/Job.js` — Mongoose model for Job records. Key fields:
    - `error`, `stack`, `projectId`, `env`, `source` — core error/context information.
    - `status` — lifecycle (NEW → PROCESSING → DONE / FAILED / AWAITING_APPROVAL).
    - `agentResult` — AI-produced result object (confidence, fix, rca, patch).
    - `execution` — execution output object.
    - `timeline` — array of step/time/reason records.
    - `decision` — AUTO, MANUAL, or REJECTED.

  - `backend/models/Repo.js` — Mongoose model for GitHub repositories. Key fields:
    - `projectId` — associated project identifier.
    - `name` — repository name.
    - `fullName` — full repository name (owner/repo).
    - `accessToken` — GitHub OAuth access token.
    - `createdAt` — timestamp.

  - `backend/daemon/watcher.js` — Background job processing daemon:
    - Polls for NEW jobs every 2 seconds.
    - Atomically picks up jobs using findOneAndUpdate.
    - Runs agent with retry logic (up to 2 attempts).
    - Routes jobs based on confidence score (REJECTED, AWAITING_APPROVAL, AUTO).
    - Creates GitHub PRs via githubService.js when repo is connected.
    - Updates job timeline with all processing steps.
    - **Enhanced error handling**: Updates job timeline with detailed error information when PR creation fails.

  - `backend/services/githubService.js` — GitHub API integration:
    - `createPR({ repo, patch })` — Creates a PR with automated fix.
    - `validateToken(token)` — Validates GitHub OAuth token before use.
    - Gets default branch and latest commit SHA.
    - Creates new branch (`smartheal-fix-{timestamp}`).
    - Creates PR with patch content in body.
    - **Enhanced error handling**: Provides detailed error messages for common GitHub API issues (403, 401, 404).
    - **Token validation**: Validates token before attempting PR creation to catch expired tokens early.
    - **Improved error messages**: Specific guidance for permission issues and expired tokens.

  - `backend/routes/github.js` — GitHub OAuth and repo management:
    - `GET /api/github/auth` — Initiates GitHub OAuth flow.
    - `GET /api/github/callback` — Handles OAuth callback, stores token in session.
    - `GET /api/github/repos` — Lists user's GitHub repositories.
    - `POST /api/github/select-repo` — Saves selected repository to database.

  - `backend/guardrails/validate.js` — Main validation orchestrator:
    - Runs all guardrail checks (syntax, security, scope, quality).
    - Returns first failing check or { valid: true } if all pass.

  - `backend/guardrails/rules/` — Individual guardrail rule files:
    - `syntax.js` — Checks for invalid syntax patterns (e.g., `;;`, `== =`, `return return`).
    - `security.js` — Blocks dangerous patterns (e.g., `process.exit`, `eval(`, `rm -rf`).
    - `scope.js` — Limits patch size (max 200 chars) and prevents global structure changes.
    - `quality.js` — Ensures patches include condition handling and are not trivial.

  - `backend/app/smartheal.js` — SmartHeal SDK for error capture:
    - `init({ endpoint, projectId })` — Initializes SDK with backend endpoint.
    - `capture(error)` — Captures and sends errors to backend.
    - `intercept()` — Intercepts console.error calls for automatic capture.

  ### New/changed frontend files
  - `frontend/src/components/connector/ConnectRepoWizard.jsx` — GitHub repository connection wizard:
    - Step 1: Form to enter Project ID and environment (prod/staging).
    - Step 2: OAuth redirect to GitHub, then repo selection.
    - Saves selected repo to backend via `/api/github/select-repo`.
    - Uses session-based authentication with credentials.

  - `frontend/src/components/layout/Skeleton.tsx` — Loading skeleton component:
    - Animated placeholder for loading states.
    - Uses Tailwind CSS for styling.

  - `frontend/src/smartheal.js` — SmartHeal SDK for frontend error capture:
    - Same as backend version, adapted for browser environment.
    - Captures errors and sends to backend endpoint.

  - `frontend/src/features/config/` — Placeholder directory for config-related features.
  - `frontend/src/features/dashboard/` — Placeholder directory for dashboard-related features.

  ### New documentation files
  - `backend/README.md` - Comprehensive backend setup and architecture documentation:
    - Setup instructions for MongoDB and GitHub OAuth
    - Job processing flow documentation
    - API endpoints reference
    - Troubleshooting guide for common issues

  - `backend/.env.example` - Example environment variables file:
    - MongoDB connection string
    - GitHub OAuth App credentials
    - Session secret
    - Server configuration

  Other repo-level events:
  - `git push` was run from the repo root recently (local branch pushed to remote). Include this context when creating PR-ready patches.

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

Generated on: 2026-03-29
Last updated: 2026-03-29 (GitHub API error handling and token validation improvements)
