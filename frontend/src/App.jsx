import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ConfigPage from "./pages/ConfigPage";
import ProjectsPage from "./pages/ProjectsPage";
import DocsPage from "./pages/DocsPage";

import { triggerError } from "./services/api";
import { fetchJobs } from "./features/jobs/jobSlice";
import SmartHeal from "./smartheal";

function App() {
  const dispatch = useDispatch();
  const [page, setPage] = useState("dashboard");

  // Read the active projectId registered in the Projects page
  // Falls back to env var (Vite exposes VITE_* vars to the browser)
  const activeProjectId =
    localStorage.getItem("activeProjectId") ||
    import.meta.env.VITE_SMARTHEAL_PROJECT_ID ||
    null;

  // Init SmartHeal SDK with the real projectId — this intercepts console.error
  // and forwards errors to the backend automatically
  SmartHeal.init({
    endpoint: "http://localhost:3001/jobs",
    projectId: activeProjectId,
  });

  // ✅ ProjectsPage handles the ?step=select OAuth redirect internally
  useEffect(() => {
    dispatch(fetchJobs());
  }, []);
  window.navigateToJobs = () => setPage("jobs");

  // 🔥 Trigger flow (backend + redux)
  const handleTrigger = async () => {
    try {
      await triggerError();

      // wait for daemon to process
      setTimeout(() => {
        dispatch(fetchJobs());
      }, 3000);
    } catch (err) {
      console.error("Error triggering job:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🧭 Sidebar */}
      <Sidebar setPage={setPage} page={page} />

      {/* 📄 Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {page === "dashboard" && <DashboardPage onTrigger={handleTrigger} />}
        {page === "jobs" && <JobsPage />}
        {page === "projects" && <ProjectsPage />}
        {page === "config" && <ConfigPage />}
        {page === "docs" && <DocsPage />}
      </div>
    </div>
  );
}

export default App;
