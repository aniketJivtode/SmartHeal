import { useState } from "react";
import {
  BookOpen,
  Zap,
  GitBranch,
  Terminal,
  Shield,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Radio,
  Cpu,
} from "lucide-react";

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-200 my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-gray-400 text-xs">
        <span>{language}</span>
        <button onClick={copy} className="flex items-center gap-1 hover:text-white transition">
          {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-gray-950 text-green-300 text-xs p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Callout ─────────────────────────────────────────────────────────────────
function Callout({ type = "info", children }) {
  const styles = {
    info:    { bg: "bg-blue-50 border-blue-200",   icon: <Radio size={14} className="text-blue-500 shrink-0 mt-0.5" />,    text: "text-blue-800" },
    warn:    { bg: "bg-yellow-50 border-yellow-200", icon: <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />, text: "text-yellow-800" },
    success: { bg: "bg-green-50 border-green-200",  icon: <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />,  text: "text-green-800" },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-2.5 border rounded-lg p-3 my-3 ${s.bg}`}>
      {s.icon}
      <p className={`text-xs leading-relaxed ${s.text}`}>{children}</p>
    </div>
  );
}

// ─── Section (collapsible) ───────────────────────────────────────────────────
function Section({ id, icon: Icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="border rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition text-left"
      >
        <div className="p-1.5 bg-indigo-50 rounded-md">
          <Icon size={15} className="text-indigo-600" />
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-800">{title}</span>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 mr-2">
            {badge}
          </span>
        )}
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t text-sm text-gray-700 leading-relaxed">{children}</div>}
    </div>
  );
}

// ─── TOC Link ────────────────────────────────────────────────────────────────
function TocLink({ href, label, sub }) {
  return (
    <a
      href={`#${href}`}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(href)?.scrollIntoView({ behavior: "smooth" });
      }}
      className={`block text-xs py-1 hover:text-indigo-600 transition ${
        sub ? "pl-4 text-gray-400 hover:text-indigo-500" : "text-gray-600 font-medium"
      }`}
    >
      {label}
    </a>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto flex gap-8">
      {/* ── Sticky TOC ── */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-4 space-y-0.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</p>
          <TocLink href="overview"    label="Overview" />
          <TocLink href="quickstart"  label="Quick Start" />
          <TocLink href="sdk"         label="SDK Integration" />
          <TocLink href="projects"    label="Projects & projectId" />
          <TocLink href="github"      label="GitHub Integration" />
          <TocLink href="agent"       label="How the Agent Works" />
          <TocLink href="guardrails"  label="Guardrails" />
          <TocLink href="jobs"        label="Issue Explorer" />
          <TocLink href="api"         label="REST API Reference" />
          <TocLink href="faq"         label="FAQ" />
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 space-y-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Smart<span className="text-indigo-600">Heal</span> Docs
            </h1>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Everything you need to integrate, configure, and operate SmartHeal — the AI-powered self-healing agent for your applications.
          </p>
        </div>

        {/* ── 1. Overview ── */}
        <Section id="overview" icon={Layers} title="Overview" defaultOpen={true}>
          <p>
            <strong>SmartHeal</strong> is an autonomous error-remediation platform. It watches your application for runtime errors,
            uses an LLM-powered agent to diagnose root causes, generates a patch, validates it through guardrails,
            and — if confidence is high enough — opens a GitHub Pull Request automatically.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: Radio,    title: "Detect",   desc: "SDK intercepts console.error and ships errors to the backend in real-time." },
              { icon: Cpu,      title: "Diagnose", desc: "Agent runs root-cause analysis and generates a fix with a confidence score." },
              { icon: GitBranch, title: "Heal",   desc: "High-confidence fixes are committed to a new branch and a PR is opened automatically." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700">{title}</span>
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 2. Quick Start ── */}
        <Section id="quickstart" icon={Zap} title="Quick Start" badge="5 min" defaultOpen={true}>
          <p className="font-medium text-gray-800">Step 1 — Register a project</p>
          <p className="text-xs text-gray-500">Go to <strong>Projects</strong> in the sidebar → click <strong>New Project</strong> → fill in name and environments.</p>
          <p className="font-medium text-gray-800 mt-3">Step 2 — Copy your projectId</p>
          <CodeBlock language="text" code="proj_a1b2c3d4e5f6g7h8" />
          <p className="font-medium text-gray-800 mt-3">Step 3 — Install the SDK snippet</p>
          <CodeBlock language="javascript" code={`// Place this at the top of your app entry point
import SmartHeal from "./smartheal";

SmartHeal.init({
  endpoint: "https://your-backend.com/jobs",
  projectId: "proj_a1b2c3d4e5f6g7h8",
});`} />
          <p className="font-medium text-gray-800 mt-3">Step 4 — Connect your GitHub repo</p>
          <p className="text-xs text-gray-500">In the Projects page, click <strong>Connect Repo</strong> on your project card → authorize with GitHub → select the repository.</p>
          <Callout type="success">That's it! SmartHeal will now detect errors, diagnose them, and open PRs automatically.</Callout>
        </Section>

        {/* ── 3. SDK ── */}
        <Section id="sdk" icon={Terminal} title="SDK Integration">
          <p>The SmartHeal SDK is a tiny browser/Node.js shim that patches <code className="text-indigo-600 bg-indigo-50 px-1 rounded">console.error</code> and forwards captured errors to your SmartHeal backend.</p>

          <p className="font-medium text-gray-800 mt-4">Full configuration options</p>
          <CodeBlock language="javascript" code={`SmartHeal.init({
  // Required
  endpoint:  "http://localhost:3001/jobs",  // your backend /jobs URL
  projectId: "proj_xxxxxxxxxxxx",           // from Projects page

  // Optional
  env:       "prod",          // "prod" | "staging" | "dev"  (default: "prod")
  source:    "frontend",      // free-form label for the error source
  silent:    false,           // true = don't log SDK activity to console
});`} />

          <p className="font-medium text-gray-800 mt-4">Manual error capture</p>
          <p className="text-xs text-gray-500">You can also send errors programmatically:</p>
          <CodeBlock language="javascript" code={`try {
  riskyOperation();
} catch (err) {
  SmartHeal.capture(err.message, { stack: err.stack, env: "prod" });
}`} />

          <p className="font-medium text-gray-800 mt-4">What gets sent</p>
          <CodeBlock language="json" code={`{
  "message":   "TypeError: Cannot read properties of undefined",
  "projectId": "proj_xxxxxxxxxxxx",
  "source":    "frontend",
  "env":       "prod"
}`} />
          <Callout type="warn">The SDK only captures <code>console.error</code> calls and uncaught promise rejections. It does NOT capture <code>console.warn</code> or <code>console.log</code>.</Callout>
        </Section>

        {/* ── 4. Projects ── */}
        <Section id="projects" icon={Layers} title="Projects & projectId">
          <p>
            A <strong>Project</strong> is the top-level resource in SmartHeal. Every error report must carry a <code className="text-indigo-600 bg-indigo-50 px-1 rounded">projectId</code> so the agent knows which GitHub repo to push fixes to.
          </p>

          <p className="font-medium text-gray-800 mt-4">projectId format</p>
          <CodeBlock language="text" code="proj_<16 hex chars>   e.g.  proj_04f73ed1812aa16c" />

          <p className="font-medium text-gray-800 mt-4">Project fields</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {["Field", "Type", "Description"].map(h => (
                    <th key={h} className="border px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["name",        "string",   "Human-readable project name"],
                  ["projectId",   "string",   "Auto-generated unique identifier (read-only)"],
                  ["description", "string?",  "Optional description"],
                  ["envs",        "string[]", "Environments this project covers (e.g. prod, staging, dev)"],
                  ["createdAt",   "Date",     "Creation timestamp"],
                ].map(([f, t, d]) => (
                  <tr key={f} className="border-t">
                    <td className="border px-3 py-2 font-mono text-indigo-600">{f}</td>
                    <td className="border px-3 py-2 text-gray-500">{t}</td>
                    <td className="border px-3 py-2 text-gray-600">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout type="info">
            Every <code>POST /agent/jobs</code> request is validated against the Projects collection. Requests with unknown projectIds are rejected with <code>404</code>.
          </Callout>
        </Section>

        {/* ── 5. GitHub ── */}
        <Section id="github" icon={GitBranch} title="GitHub Integration">
          <p>SmartHeal uses a <strong>GitHub OAuth App</strong> to create branches and open pull requests on your behalf.</p>

          <p className="font-medium text-gray-800 mt-4">OAuth flow</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
            <li>Click <strong>Connect Repo</strong> on a project card</li>
            <li>You're redirected to GitHub to authorize the SmartHeal OAuth App</li>
            <li>GitHub redirects back with <code>?step=select</code></li>
            <li>Select a repository from the list — it's saved in the database</li>
          </ol>

          <p className="font-medium text-gray-800 mt-4">What SmartHeal creates</p>
          <CodeBlock language="text" code={`Branch:  smartheal-fix-<timestamp>
File:    smartheal-patches/fix-<timestamp>.patch
PR:      "🤖 SmartHeal Auto Fix" → base branch`} />

          <p className="font-medium text-gray-800 mt-4">Required OAuth scopes</p>
          <div className="flex gap-2 flex-wrap">
            {["repo", "read:user"].map(s => (
              <code key={s} className="text-xs bg-gray-100 border px-2 py-0.5 rounded">{s}</code>
            ))}
          </div>

          <Callout type="warn">
            Tokens are stored in MongoDB. For production use, encrypt tokens at rest using a KMS or secrets manager.
          </Callout>
        </Section>

        {/* ── 6. Agent ── */}
        <Section id="agent" icon={Cpu} title="How the Agent Works">
          <p>When a job is picked up by the daemon, the following pipeline runs:</p>
          <div className="space-y-2 mt-2">
            {[
              { step: "1", label: "Lock",         desc: "Job atomically moves from NEW → PROCESSING via findOneAndUpdate." },
              { step: "2", label: "Run Agent",     desc: "LLM analyzes the error message, generates a fix + root cause analysis + confidence score (0–1). Retried once if confidence < 0.6." },
              { step: "3", label: "Decision gate", desc: "confidence < 0.5 → REJECTED. 0.5–0.85 → AWAITING_APPROVAL (manual review). ≥ 0.85 → AUTO (continues)." },
              { step: "4", label: "Guardrails",    desc: "Patch validated for security patterns, scope limits, syntax errors, and quality rules." },
              { step: "5", label: "Create PR",     desc: "New branch created, patch committed as a file, PR opened against the default branch." },
              { step: "6", label: "Done",          desc: "Job status → DONE, prUrl stored, alert sent." },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {step}
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-800">{label}</span>
                  <span className="text-xs text-gray-500"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="font-medium text-gray-800 mt-4">Confidence thresholds</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {["Range", "Decision", "Action"].map(h => (
                    <th key={h} className="border px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["< 0.50",        "REJECTED",          "Job fails, alert sent"],
                  ["0.50 – 0.84",   "MANUAL",            "Job paused, awaits human approval"],
                  ["≥ 0.85",        "AUTO",              "Guardrails → PR created automatically"],
                ].map(([r, d, a]) => (
                  <tr key={r} className="border-t">
                    <td className="border px-3 py-2 font-mono">{r}</td>
                    <td className="border px-3 py-2"><code className="bg-gray-100 px-1 rounded">{d}</code></td>
                    <td className="border px-3 py-2 text-gray-600">{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 7. Guardrails ── */}
        <Section id="guardrails" icon={Shield} title="Guardrails">
          <p>Before any patch is applied, it passes through four validation rules:</p>
          <div className="space-y-3 mt-2">
            {[
              { name: "Security",  file: "security.js",  desc: "Blocks patches containing eval(), exec(), child_process, or dangerous shell patterns." },
              { name: "Scope",     file: "scope.js",     desc: "Ensures the patch targets only source files (src/, app/, lib/) and doesn't touch config or infra files." },
              { name: "Syntax",    file: "syntax.js",    desc: "Checks for balanced brackets, braces, and parentheses. Rejects incomplete code blocks." },
              { name: "Quality",   file: "quality.js",   desc: "Enforces minimum patch length and rejects trivially empty or placeholder fixes." },
            ].map(({ name, file, desc }) => (
              <div key={name} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                <Shield size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{name}</span>
                    <code className="text-[10px] text-gray-400">{file}</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Callout type="info">Guardrails are currently commented out in production to unblock the MVP. Re-enable in <code>daemon/watcher.js</code> by uncommenting the <code>validatePatch</code> block.</Callout>
        </Section>

        {/* ── 8. Jobs ── */}
        <Section id="jobs" icon={Radio} title="Issue Explorer">
          <p>The <strong>Issue Explorer</strong> page shows all jobs processed by SmartHeal with their full execution timeline.</p>

          <p className="font-medium text-gray-800 mt-4">Job statuses</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { label: "NEW",               color: "bg-gray-100 text-gray-600" },
              { label: "PROCESSING",        color: "bg-blue-100 text-blue-700" },
              { label: "AWAITING_APPROVAL", color: "bg-yellow-100 text-yellow-700" },
              { label: "DONE",              color: "bg-green-100 text-green-700" },
              { label: "FAILED",            color: "bg-red-100 text-red-700" },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
            ))}
          </div>

          <p className="font-medium text-gray-800 mt-4">Reading the timeline</p>
          <p className="text-xs text-gray-500">Each job has a timeline of steps. When a PR is created, a green banner appears at the top of the detail panel with a direct link to the GitHub PR.</p>

          <Callout type="info">Jobs auto-refresh every time you navigate to the Issue Explorer. For real-time updates, socket.io integration is on the roadmap.</Callout>
        </Section>

        {/* ── 9. API ── */}
        <Section id="api" icon={Terminal} title="REST API Reference">
          <p className="text-xs text-gray-500 mb-3">Base URL: <code className="text-indigo-600 bg-indigo-50 px-1 rounded">http://localhost:3001</code></p>

          {[
            {
              method: "POST", path: "/agent/jobs",
              desc: "Submit a new error for the agent to process.",
              body: `{
  "message":   "TypeError: Cannot read...",  // required
  "projectId": "proj_xxxxxxxxxxxx",           // required
  "source":    "frontend",                    // optional
  "env":       "prod"                         // optional
}`,
              response: `{ "_id": "...", "status": "NEW", "projectId": "...", ... }`,
            },
            {
              method: "GET", path: "/agent/jobs",
              desc: "List all jobs (paginated).",
              body: null,
              response: `{ "jobs": [...], "total": 42, "page": 1, "totalPages": 5 }`,
            },
            {
              method: "POST", path: "/api/projects",
              desc: "Register a new project.",
              body: `{ "name": "my-app", "description": "...", "envs": ["prod","staging"] }`,
              response: `{ "projectId": "proj_xxxxxxxxxxxx", "name": "my-app", ... }`,
            },
            {
              method: "GET", path: "/api/projects",
              desc: "List all registered projects.",
              body: null,
              response: `[{ "projectId": "...", "name": "...", "envs": [...] }, ...]`,
            },
            {
              method: "DELETE", path: "/api/projects/:projectId",
              desc: "Delete a project by its projectId.",
              body: null,
              response: `{ "message": "Deleted" }`,
            },
            {
              method: "GET", path: "/api/github/repos",
              desc: "List GitHub repos (requires active OAuth session).",
              body: null,
              response: `[{ "id": 1, "full_name": "owner/repo", ... }]`,
            },
            {
              method: "POST", path: "/api/github/select-repo",
              desc: "Save a selected repo for a project.",
              body: `{ "name": "repo", "fullName": "owner/repo", "projectId": "proj_xxx" }`,
              response: `{ "_id": "...", "fullName": "owner/repo", "projectId": "proj_xxx" }`,
            },
          ].map(({ method, path, desc, body, response }) => (
            <div key={path} className="border rounded-lg overflow-hidden mb-3">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                  method === "GET"    ? "bg-blue-100 text-blue-700" :
                  method === "POST"   ? "bg-green-100 text-green-700" :
                  method === "DELETE" ? "bg-red-100 text-red-700" : "bg-gray-100"
                }`}>{method}</span>
                <code className="text-xs font-mono text-gray-700">{path}</code>
                <span className="text-xs text-gray-400 ml-auto">{desc}</span>
              </div>
              {body && (
                <div className="px-4 pt-2">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Request body</p>
                  <pre className="bg-gray-950 text-green-300 text-xs p-3 rounded overflow-x-auto">{body}</pre>
                </div>
              )}
              <div className="px-4 pt-2 pb-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Response</p>
                <pre className="bg-gray-950 text-blue-300 text-xs p-3 rounded overflow-x-auto">{response}</pre>
              </div>
            </div>
          ))}
        </Section>

        {/* ── 10. FAQ ── */}
        <Section id="faq" icon={BookOpen} title="FAQ">
          {[
            {
              q: "Why is `repo found: no` in the backend logs?",
              a: "The Repo record in MongoDB has an empty projectId. This happens when the OAuth flow completes but the select-repo call doesn't include the projectId. Fix: go to Projects → Connect Repo and re-select the repository.",
            },
            {
              q: "The PR says 'No commits between base and head'",
              a: "SmartHeal auto-commits a patch file to the branch before opening the PR. If you see this error it means the file commit step failed — check the backend logs for a GitHub 422 error.",
            },
            {
              q: "Jobs are stuck in PROCESSING",
              a: "The daemon polls every 2 seconds. If a job is stuck, the agent likely crashed mid-run. Check the timeline in Issue Explorer for an 'Agent crashed' entry and the error message.",
            },
            {
              q: "Why is confidence always 0.9?",
              a: "The current agent uses a rule-based heuristic that returns 0.9 for all patterns. To get variable confidence, swap the agent for a real LLM call in agent/agent.js.",
            },
            {
              q: "Can I run SmartHeal in production?",
              a: "Not yet. The OAuth tokens are stored unencrypted and there is no user authentication. These are on the roadmap. For now, SmartHeal is suitable for internal dev/staging environments.",
            },
            {
              q: "How do I re-enable guardrails?",
              a: "In backend/daemon/watcher.js, uncomment the validatePatch block around line 120.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="border rounded-lg overflow-hidden group">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 list-none">
                {q}
                <ChevronRight size={13} className="text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="px-4 pb-4 pt-1 text-xs text-gray-500 leading-relaxed border-t">{a}</p>
            </details>
          ))}
        </Section>

      </div>
    </div>
  );
}
