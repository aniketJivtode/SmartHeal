import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  createProject,
  deleteProject,
  setActiveProject,
} from "../features/projects/projectSlice";
import {
  FolderPlus,
  CheckCircle2,
  Copy,
  Trash2,
  Computer,
  ChevronRight,
  RefreshCw,
  Star,
  AlertCircle,
  GitBranch,
} from "lucide-react";
import axios from "axios";

// ─── helpers ────────────────────────────────────────────────────────────────
function Badge({ children, color = "gray" }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100  text-blue-700",
    gray: "bg-gray-100  text-gray-600",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition"
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Step 1: Register Project ────────────────────────────────────────────────
function RegisterProjectPanel({ onCreated }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.projects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [envs, setEnvs] = useState(["prod", "staging"]);

  const toggleEnv = (env) =>
    setEnvs((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await dispatch(
      createProject({ name: name.trim(), description, envs }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      onCreated(result.payload);
    }
  };

  const ENV_OPTIONS = ["prod", "staging", "dev", "test"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">
          Project Name *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. my-ecommerce-app"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">
          Description (optional)
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the project"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">
          Environments
        </label>
        <div className="flex gap-2 flex-wrap">
          {ENV_OPTIONS.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => toggleEnv(env)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                envs.includes(env)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition font-medium"
      >
        {loading ? "Creating…" : "Create Project"}
      </button>
    </form>
  );
}

// ─── Step 2: Connect Computer Repo ─────────────────────────────────────────────
function ConnectRepoPanel({ project, onConnected, autoLoad = false }) {
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(false);

  // If parent detected OAuth return, auto-load repos immediately
  useEffect(() => {
    if (autoLoad) loadRepos();
  }, [autoLoad]);

  const loadRepos = async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3001/api/github/repos", {
        withCredentials: true,
      });
      setRepos(res.data || []);
      setAuthed(true);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthed(false);
      } else {
        setError("Failed to load repos. Try again.");
      }
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleAuth = () => {
    // Store selected project so we can restore it after OAuth redirect
    localStorage.setItem("pendingProjectId", project.projectId);
    window.location.href = "http://localhost:3001/api/github/auth";
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://localhost:3001/api/github/select-repo",
        {
          name: selected.name,
          fullName: selected.full_name,
          projectId: project.projectId,
        },
        { withCredentials: true },
      );
      localStorage.setItem("connectedRepo", JSON.stringify(res.data));
      onConnected(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save repo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Project badge */}
      <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <CheckCircle2 size={16} className="text-indigo-600" />
        <div>
          <p className="text-xs text-gray-500">Connecting repo for project</p>
          <p className="text-sm font-semibold text-gray-800">{project.name}</p>
        </div>
        <code className="ml-auto text-xs bg-white border px-2 py-0.5 rounded text-indigo-600 font-mono">
          {project.projectId}
        </code>
      </div>

      {!authed ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Authorize SmartHeal to access your Github repositories.
          </p>
          <button
            onClick={handleAuth}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <Computer size={16} />
            Authorize with Github
          </button>
          <button
            onClick={loadRepos}
            className="flex items-center gap-2 text-xs text-indigo-600 hover:underline"
          >
            <RefreshCw size={12} /> Already authorized? Load repos
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {repos.length} repositories found
            </span>
            <button
              onClick={loadRepos}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {loadingRepos ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              Loading repos…
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto border rounded-lg divide-y">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => setSelected(repo)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                    selected?.id === repo.id
                      ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Computer size={14} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {repo.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {repo.full_name}
                    </p>
                  </div>
                  {repo.private && <Badge color="yellow">private</Badge>}
                  {selected?.id === repo.id && (
                    <CheckCircle2
                      size={15}
                      className="text-indigo-600 shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            disabled={!selected || saving}
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition font-medium"
          >
            {saving ? "Connecting…" : `Connect "${selected?.name || "…"}"`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: SDK Snippet ──────────────────────────────────────────────────────
function SdkSnippet({ project, repo }) {
  const snippet = `// Install the SmartHeal SDK in your app
// npm install smartheal  (or copy app/smartheal.js)

import SmartHeal from "smartheal";

SmartHeal.init({
  endpoint: "http://localhost:3001/jobs",
  projectId: "${project.projectId}",
});`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 size={16} className="text-green-600" />
        <div>
          <p className="text-sm font-semibold text-gray-800">All set! 🎉</p>
          <p className="text-xs text-gray-500">
            {repo.fullName} is connected to <strong>{project.name}</strong>
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500">
            SDK Setup Snippet
          </label>
          <CopyButton text={snippet} />
        </div>
        <pre className="bg-gray-900 text-green-300 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
          {snippet}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-400">Project ID</p>
          <div className="flex items-center justify-between">
            <code className="text-xs font-mono text-indigo-600">
              {project.projectId}
            </code>
            <CopyButton text={project.projectId} />
          </div>
        </div>
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-400">Connected Repo</p>
          <p className="text-xs font-medium text-gray-700 truncate">
            {repo.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, isActive, onSelect, onDelete, onConnect }) {
  const dispatch = useDispatch();
  const connectedRepo = (() => {
    try {
      return JSON.parse(localStorage.getItem("connectedRepo"));
    } catch {
      return null;
    }
  })();

  // Match by projectId OR by fullName (handles stale localStorage from before projectId was set)
  const isConnected =
    connectedRepo &&
    (connectedRepo.projectId === project.projectId ||
      (connectedRepo.projectId === "" && connectedRepo.fullName));

  // If matched by fallback, silently patch localStorage so future checks work
  if (
    isConnected &&
    connectedRepo.projectId !== project.projectId &&
    connectedRepo.fullName
  ) {
    const patched = { ...connectedRepo, projectId: project.projectId };
    localStorage.setItem("connectedRepo", JSON.stringify(patched));
  }

  return (
    <div
      className={`border rounded-xl p-4 space-y-3 transition ${
        isActive
          ? "border-indigo-400 bg-indigo-50/40 shadow-sm"
          : "bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {project.name}
            </h3>
            {isActive && <Badge color="blue">active</Badge>}
            {isConnected && <Badge color="green">repo connected</Badge>}
          </div>
          {project.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isActive && (
            <button
              onClick={() => onSelect(project)}
              title="Set as active project"
              className="p-1.5 hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 rounded-lg transition"
            >
              <Star size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(project.projectId)}
            title="Delete project"
            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {project.envs?.map((env) => (
            <Badge key={env} color="gray">
              {env}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <code className="text-xs text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
            {project.projectId}
          </code>
          <CopyButton text={project.projectId} />
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-green-700 min-w-0">
            <CheckCircle2 size={13} className="shrink-0 text-green-600" />
            <span className="truncate font-medium">{connectedRepo.fullName}</span>
          </div>
          <button
            onClick={() => onConnect(project)}
            className="shrink-0 text-xs text-indigo-600 hover:underline whitespace-nowrap"
          >
            Change Repo
          </button>
        </div>
      ) : (
        <button
          onClick={() => onConnect(project)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg py-1.5 px-3 transition"
        >
          <GitBranch size={12} />
          Connect Repo
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { list, loading, activeProjectId } = useSelector((s) => s.projects);

  // wizard state: null | 'register' | 'connect' | 'done'
  const [wizardStep, setWizardStep] = useState(null);
  const [newProject, setNewProject] = useState(null);
  const [connectedRepo, setConnectedRepo] = useState(null);
  const [oauthReturn, setOauthReturn] = useState(false);
  const [connectAutoLoad, setConnectAutoLoad] = useState(false); // ← new

  useEffect(() => {
    dispatch(fetchProjects());

    // Came back from GitHub OAuth? Detect here (before ConnectRepoPanel mounts)
    const pendingId = localStorage.getItem("pendingProjectId");
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "select" && pendingId) {
      localStorage.removeItem("pendingProjectId");
      window.history.replaceState({}, "", window.location.pathname);
      // We'll open wizard once the project list loads (see effect below)
      setOauthReturn(pendingId); // store the id, not a boolean
    }
  }, []);

  // Once projects list loads AND we have an oauthReturn id, open the wizard
  useEffect(() => {
    if (!oauthReturn || list.length === 0) return;
    const realProject = list.find((p) => p.projectId === oauthReturn) ?? {
      projectId: oauthReturn,
      name: oauthReturn,
    }; // fallback stub
    setNewProject(realProject);
    setConnectAutoLoad(true);
    setWizardStep("connect");
    setOauthReturn(false);
  }, [oauthReturn, list]);

  const handleDelete = (projectId) => {
    if (confirm("Delete this project?")) dispatch(deleteProject(projectId));
  };

  const handleSelect = (project) => {
    dispatch(setActiveProject(project.projectId));
  };

  const handleConnect = (project) => {
    setNewProject(project);
    setConnectedRepo(null);
    setWizardStep("connect");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <FolderPlus size={20} className="text-gray-700" />
            Projects
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Register a project to get a{" "}
            <code className="text-indigo-600">projectId</code> for your SDK,
            then connect its GitHub repo.
          </p>
        </div>
        <button
          onClick={() => {
            setNewProject(null);
            setConnectedRepo(null);
            setWizardStep("register");
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition shadow-sm"
        >
          <FolderPlus size={15} />
          New Project
        </button>
      </div>

      {/* ── Wizard ── */}
      {wizardStep && (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {/* Steps bar */}
          <div className="flex border-b">
            {[
              { key: "register", label: "1. Register" },
              { key: "connect", label: "2. Connect Repo" },
              { key: "done", label: "3. Get SDK Key" },
            ].map((s, i, arr) => (
              <div
                key={s.key}
                className={`flex-1 py-3 px-4 text-xs font-medium flex items-center gap-1.5 ${
                  s.key === wizardStep
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500"
                    : wizardStep === "done" ||
                        (wizardStep === "connect" && s.key === "register")
                      ? "text-gray-400 bg-gray-50"
                      : "text-gray-400"
                }`}
              >
                {s.label}
                {i < arr.length - 1 && (
                  <ChevronRight size={12} className="ml-auto text-gray-300" />
                )}
              </div>
            ))}
          </div>

          <div className="p-6">
            {wizardStep === "register" && (
              <RegisterProjectPanel
                onCreated={(proj) => {
                  setNewProject(proj);
                  setWizardStep("connect");
                }}
              />
            )}
            {wizardStep === "connect" && newProject && (
              <ConnectRepoPanel
                project={newProject}
                autoLoad={connectAutoLoad}
                onConnected={(repo) => {
                  setConnectedRepo(repo);
                  setConnectAutoLoad(false);
                  setWizardStep("done");
                }}
              />
            )}
            {wizardStep === "done" && newProject && connectedRepo && (
              <SdkSnippet project={newProject} repo={connectedRepo} />
            )}
          </div>

          {wizardStep !== "register" && (
            <div className="px-6 pb-5 flex justify-between">
              {wizardStep === "connect" && (
                <button
                  onClick={() => setWizardStep("register")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => {
                  setWizardStep(null);
                  dispatch(fetchProjects());
                }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
              >
                {wizardStep === "done" ? "Close" : "Skip for now"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Project list ── */}
      {loading && !list.length ? (
        <div className="text-sm text-gray-400">Loading projects…</div>
      ) : list.length === 0 && !wizardStep ? (
        <div className="text-center py-16 text-gray-400 space-y-3">
          <FolderPlus size={40} className="mx-auto text-gray-300" />
          <p className="text-sm">No projects yet.</p>
          <button
            onClick={() => setWizardStep("register")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Create your first project →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              isActive={project.projectId === activeProjectId}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
