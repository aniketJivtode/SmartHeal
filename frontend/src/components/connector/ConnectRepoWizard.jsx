import { useEffect, useState } from "react";
import axios from "axios";

export default function ConnectRepoWizard({ onClose, onSuccess }) {
  const [step, setStep] = useState("form");
  const [projectId, setProjectId] = useState("");
  const [env, setEnv] = useState("prod");

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 detect redirect from GitHub
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "select") {
      setStep("select");
      fetchRepos();
    }
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/api/github/repos", {
        withCredentials: true, // 🔥 IMPORTANT
      });

      setRepos(res.data || []);
      return res;
    } catch (err) {
      console.error(
        "Failed to fetch repos",
        err?.response || err.message || err,
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 → OAuth
  const handleConnect = async () => {
    // Save config locally first
    localStorage.setItem("repoConfig", JSON.stringify({ projectId, env }));

    // Try to fetch repos immediately. If the user is not authenticated, redirect to OAuth.
    try {
      setLoading(true);
      const res = await fetchRepos();

      // If repos were returned, move to selection step and show them
      if (res && res.data && res.data.length > 0) {
        setStep("select");
        return;
      }

      // No repos returned but request succeeded — still go to select so user can pick when available
      setStep("select");
    } catch (err) {
      // If backend indicates not authenticated (401) or similar, initiate OAuth flow
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.location.href = "http://localhost:3001/api/github/auth";
        return;
      }

      // For other errors, fall back to redirecting to OAuth to ensure the flow continues
      console.error(
        "Fetch repos failed, redirecting to OAuth as fallback.",
        err?.response || err?.message || err,
      );
      window.location.href = "http://localhost:3001/api/github/auth";
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → Save repo
  const handleSave = async () => {
    try {
      const config = JSON.parse(localStorage.getItem("repoConfig"));

      const res = await axios.post(
        "http://localhost:3001/api/github/select-repo",
        {
          name: selectedRepo.name,
          fullName: selectedRepo.full_name,
          projectId: config.projectId,
        },
        { withCredentials: true },
      );

      // 🔥 notify parent (sidebar)
      onSuccess?.(res.data);

      // clean URL
      window.history.replaceState({}, "", "/");
    } catch (err) {
      console.error("Failed to save repo", err);
    }
  };

  // 🧩 STEP 1 UI
  if (step === "form") {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
        <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
          <h2 className="text-xl font-serif mb-4">Connect Repository</h2>

          <div className="space-y-3">
            <input
              placeholder="Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="prod">Production</option>
              <option value="staging">Staging</option>
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={onClose} className="text-gray-500">
              Cancel
            </button>

            <button
              onClick={handleConnect}
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Continue → GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🧩 STEP 2 UI (Repo selection)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-xl">
        <h2 className="text-xl font-serif mb-4">Select Repository</h2>

        {loading ? (
          <div className="text-sm text-gray-500">Loading repos...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={`p-2 border rounded cursor-pointer transition ${
                  selectedRepo?.id === repo.id
                    ? "bg-blue-50 border-blue-400"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">{repo.name}</div>
                <div className="text-xs text-gray-500">{repo.full_name}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="text-gray-500">
            Cancel
          </button>

          <button
            disabled={!selectedRepo}
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Connect Selected Repo
          </button>
        </div>
      </div>
    </div>
  );
}
