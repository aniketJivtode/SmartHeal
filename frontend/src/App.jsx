import { useState } from "react";
import { useDispatch } from "react-redux";

import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ConfigPage from "./pages/ConfigPage";

import { triggerError } from "./services/api";
import { fetchJob } from "./features/jobs/jobSlice";

function App() {
  const [page, setPage] = useState("dashboard");
  const dispatch = useDispatch();

  // 🔥 Trigger flow (backend + redux)
  const handleTrigger = async () => {
    try {
      await triggerError();

      // wait for daemon to process
      setTimeout(() => {
        dispatch(fetchJob());
      }, 3000);
    } catch (err) {
      console.error("Error triggering job:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🧭 Sidebar */}
      <Sidebar setPage={setPage} />

      {/* 📄 Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {page === "dashboard" && <DashboardPage onTrigger={handleTrigger} />}

        {page === "jobs" && <JobsPage />}

        {page === "config" && <ConfigPage />}
      </div>
    </div>
  );
}

export default App;
