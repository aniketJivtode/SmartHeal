# Project context for ChatGPT (SmartHeal frontend)

Generated: 2026-03-27
Repository: SmartHeal (frontend folder)

Purpose

- Short summary: this is the frontend application for the SmartHeal project (React + Vite). It uses React 19, Redux Toolkit for state management, Tailwind for styling, and Axios for API calls. Vite is used as the dev server/build tool.

Top-level structure (important files and folders)

- index.html — app host; mounts the React app by including `/src/main.jsx`.
- package.json — dependencies and scripts (dev/build/preview/lint).
- vite.config.js — Vite config; uses `@vitejs/plugin-react` and Tailwind plugin.
- tailwind.config.js — Tailwind content paths for `.js` and `.jsx` files.
- src/
  - main.jsx — React entrypoint. Wraps `<App />` with Redux Provider and `store`.
  - App.jsx — root React component (currently minimal placeholder text).
  - App.css, index.css — global styles (index.css imports tailwind; App.css contains app-specific styles).
  - app/
    - store.js — configures Redux store using `configureStore` from Redux Toolkit. Registers the `jobs` reducer.
  - features/
    - jobs/jobSlice.js — Redux slice for `jobs` feature. Current initialState: { currentJob: null, history: [] } and no reducers (empty object).
  - services/
    - api.js — axios instance connected to `http://localhost:3001`. Exports `triggerError()` and `getJob()` wrappers.
  - assets/ — images (vite/react logos, demo hero)

Entrypoints and wiring (high level)

- Browser loads `index.html` -> script `/src/main.jsx`.
- `main.jsx` imports `store` from `src/app/store.js` and wraps `<App />` in `<Provider store={store}>`.
- `store.js` configures the Redux store with a `jobs` slice reducer (imported from `src/features/jobs/jobSlice.js`). Additional reducers would be registered here as features are added.
- `App.jsx` is the top-level React component. Components/pages are expected to be placed under `src/components/` and `src/pages/` (present as folders in the repo root structure).

Redux specifics

- store: created via `configureStore({ reducer: { jobs: jobReducer } })`.
- jobs slice: created with `createSlice`, name `jobs`, initialState: { currentJob: null, history: [] }, reducers: {} (no synchronous action creators defined yet).
- No async thunks or middleware configured explicitly (store uses RTK default middleware). If async thunks are added, they will integrate via createAsyncThunk in slices or separate thunk files.

API wiring

- `src/services/api.js` creates an axios instance:
  - baseURL: `http://localhost:3001`
  - exported functions:
    - `triggerError()` -> GET `/error/trigger`

    # SmartHeal frontend — LLM-friendly context snapshot

    Generated: 2026-03-27 (updated)
    Repository: SmartHeal (frontend folder)

    ## Short description

    This is the SmartHeal frontend: a small React (v19) + Vite app that visualizes and manages automated "jobs" produced by an agent. It uses Redux Toolkit for state, Tailwind for styling, Axios for HTTP to a backend at `http://localhost:3001`, and Recharts for dashboard charts.

    Purpose of this document
    - Provide a compact, explicit snapshot of the app state, wiring, and data shapes so any LLM can pick up from here and continue development, testing, or debugging.

    ## Project layout (essential files)
    - `index.html` — host page, mounts React at `#root` loading `/src/main.jsx`.
    - `package.json` — scripts and dependencies.
    - `vite.config.js`, `tailwind.config.js`, `eslint.config.js` — build and lint configuration.
    - `src/main.jsx` — app entrypoint, wraps `<App />` with Redux `<Provider store={store}>`.
    - `src/App.jsx` — current root component (small placeholder; pages exist under `src/pages/`).
    - `src/app/store.js` — Redux store configuration; registers `jobs` reducer.
    - `src/features/jobs/jobSlice.js` — jobs slice (initialState provided; reducers minimal).
    - `src/services/api.js` — axios instance (baseURL: `http://localhost:3001`) and helpers: `triggerError()`, `getJob()`.
    - `src/pages/DashboardPage.jsx` — dashboard page using Recharts to display metrics and job history.
    - `src/pages/JobsPage.jsx` — job history list + detail view.
    - `src/pages/ConfigPage.jsx` — simple UI to create and preview alert configuration (email/slack) — currently local-only.
    - `src/components/layout/Topbar.jsx` and `src/components/dashboard/Metrics.jsx` — small reusable UI used by the dashboard.

    ## Entrypoint and wiring
    - Browser -> `index.html` -> `/src/main.jsx`.
    - `main.jsx` configures Redux Provider and renders `<App />`.
    - `store.js` uses `configureStore({ reducer: { jobs: jobReducer } })`.
    - Pages read from `state.jobs` (particularly `state.jobs.history`).

    ## Redux: store & expected shapes
    - store shape (current):

      {
      jobs: {
      currentJob: null | JobObject,
      history: JobObject[],
      }
      }

    - JobObject (observed / expected shape):

      {
      id: string | number,
      status: "DONE" | "FAILED" | string,
      error?: { message: string },
      agentResult?: {
      fix?: string,
      rca?: string,
      confidence?: number
      },
      timeline?: [{ step: string }],
      // other fields may exist depending on backend
      }

    - Current `jobSlice` implementation: initialState provided but reducers are empty. No async thunks exist yet.

    ## API endpoints and expected responses
    - Base URL: `http://localhost:3001` (hard-coded in `src/services/api.js`).
    - Exposed helpers:
      - `triggerError()` — GET `/error/trigger` (used to simulate/trigger agent behavior).
      - `getJob()` — GET `/agent/job` (expected to return a JobObject or an array — inspect backend; UI expects a JobObject to append to `history`).

    Example responses (recommended as canonical examples for an LLM to assume unless backend differs):

    GET /agent/job -> 200
    {
    "id": "job-123",
    "status": "FAILED",
    "error": { "message": "Connection timeout to DB" },
    "agentResult": {
    "fix": "Restart DB service",
    "rca": "Connection pool exhausted",
    "confidence": 0.82
    },
    "timeline": [ { "step": "detect" }, { "step": "analyse" }, { "step": "suggest" } ]
    }

    If backend returns a different shape (e.g., a wrapper { data: job } or an array), LLM should adapt by inspecting the backend or adding a small adapter function in `src/services/api.js`.

    ## Pages & components responsibilities (brief)
    - `DashboardPage.jsx` — consumes `state.jobs.history`, computes summary metrics (success/failure counts), confidence trend, error frequency, and renders charts via Recharts. Imports `Topbar` and `Metrics` components and expects `Topbar` to accept an `onTrigger` callback prop.
    - `JobsPage.jsx` — renders a two-column layout: list of jobs (left) and selected job details (right).
    - `ConfigPage.jsx` — simple form to create alert configs (email/slack). Saves locally only; TODO: persist to backend or localStorage.

    ## Known gaps & current TODOs (explicit tasks an LLM can pick up)
    1. Implement `fetchJob` async thunk in `src/features/jobs/jobSlice.js` that:
       - Calls `getJob()` from `src/services/api.js`.
       - Normalizes the response to a JobObject (use the adapter if needed).
       - Appends the job to `history` and sets `currentJob`.
       - Handles errors (stores error state or returns rejected action).

    2. Wire a trigger UI:
       - `Topbar` already accepts `onTrigger` prop in `DashboardPage.jsx`.
       - Implement a button in `Topbar` that calls the action creator that dispatches `fetchJob()`.

    3. Add client-side routing (optional but recommended):
       - Add `react-router-dom` and a small `Nav` so `Dashboard`, `Jobs`, `Config` pages are reachable.

    4. Persist `ConfigPage` settings: localStorage or backend endpoint (create API route and wire to `src/services/api.js`).

    5. Tests and QA:
       - Add unit tests for `jobSlice` reducers and the `fetchJob` thunk (mock axios).
       - Add a smoke test that mounts `DashboardPage` with mocked store and sample `history` data.

    ## How an LLM should continue from this state (explicit instructions)

    When you receive this repository snapshot and are asked to continue work, follow these steps (high-confidence path):
    1. Read `src/features/jobs/jobSlice.js` and `src/services/api.js` to decide how to implement the thunk and adapter.
    2. Implement `fetchJob` using `createAsyncThunk` in `jobSlice.js`. The fulfilled reducer should push the new job onto `state.history` and update `state.currentJob`.
    3. Update `src/components/layout/Topbar.jsx` to dispatch the thunk when the trigger button is clicked. If `Topbar.jsx` doesn't exist, create it per `DashboardPage.jsx` imports.
    4. Run the dev server locally and trigger a job to verify that `history` grows and charts update (use the `triggerError()` API if you need the backend to generate jobs).

    If you are uncertain about backend response shapes, add a small adapter function in `src/services/api.js` that returns a normalized JobObject and log the raw response for inspection.

    ## How to run locally (commands)

    Install and start:

    ```bash
    npm install
    npm run dev
    ```

    Build and preview:

    ```bash
    npm run build
    npm run preview
    ```

    ## Conventions and coding notes
    - Use Redux Toolkit's `createSlice` + `createAsyncThunk` for async flows.
    - Keep API helpers small and centralized in `src/services/api.js`.
    - Tailwind classes are used for layout and theming; avoid adding global CSS where Tailwind can be used.

    ## Quick sample unit-test plan (suggested)
    - Test `jobSlice` reducers: initial state, adding a job, handling thunk rejected state.
    - Test `fetchJob` thunk using jest + msw or jest.mock('axios') to simulate responses.

    ## Final checklist for the LLM before editing files
    - Confirm the backend URL and response shape by checking `src/services/api.js` and optionally calling the endpoint.
    - Run `npm install` if dependencies are missing (e.g., `recharts` or `react-router-dom`).
    - Make small, incremental changes and run the dev server to verify no build errors.

    ***

    If you want, I can implement tasks (1) and (2) now: add `fetchJob` thunk, wire `Topbar` to dispatch it, and run a local smoke test to confirm charts and job list update. Otherwise, tell me which tasks to prioritize and I'll proceed.
