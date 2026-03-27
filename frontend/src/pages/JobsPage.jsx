import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchJobs, setPage, setFilters } from "../features/jobs/jobSlice";

import {
  Bug,
  CheckCircle2,
  XCircle,
  Brain,
  Wrench,
  AlertTriangle,
  Activity,
} from "lucide-react";
import Skeleton from "../components/layout/Skeleton";

export default function JobsPage() {
  const dispatch = useDispatch();

  const {
    history: jobs,
    loading,
    error,
    page,
    totalPages,
    status,
    from,
    to,
  } = useSelector((state) => state.jobs);

  const selectedFromStore = useSelector((state) => state.jobs.selectedJob);
  const [selected, setSelected] = useState(null);

  // sync selected from store
  useEffect(() => {
    if (selectedFromStore) {
      setSelected(selectedFromStore);
    }
  }, [selectedFromStore]);

  // fetch jobs
  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch, page, status, from, to]);

  // auto select first job
  useEffect(() => {
    if (jobs.length > 0 && !selected) {
      setSelected(jobs[0]);
    }
  }, [jobs]);

  return (
    <div className="h-full flex flex-col">
      {/* 🔝 HEADER */}
      <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity size={18} />
          Issue Explorer
        </h2>

        <div className="text-sm text-gray-500">
          {loading ? <Skeleton/> : `${jobs.length} runs`}
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="px-6 py-3 bg-gray-50 border-b flex gap-6 text-sm">
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 size={14} />
          Resolved: {jobs.filter((j) => j.status === "DONE").length}
        </span>

        <span className="flex items-center gap-1 text-red-600">
          <XCircle size={14} />
          Failed: {jobs.filter((j) => j.status === "FAILED").length}
        </span>
      </div>

      {/* 🔍 FILTERS */}
      <div className="px-6 py-3 bg-white border-b flex gap-3 text-sm">
        <select
          value={status}
          onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="DONE">Resolved</option>
          <option value="FAILED">Failed</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => dispatch(setFilters({ from: e.target.value }))}
          className="border rounded px-2 py-1"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => dispatch(setFilters({ to: e.target.value }))}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* 🧩 MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-[35%] border-r bg-white overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              No runs yet
            </p>
          ) : (
            <>
              {jobs.map((job) => {
                const isResolved = job.status === "DONE";

                return (
                  <div
                    key={job._id}
                    onClick={() => setSelected(job)}
                    className={`p-3 rounded-lg cursor-pointer transition border ${
                      selected?._id === job._id
                        ? "border-blue-400 bg-blue-50 shadow-sm"
                        : "hover:bg-gray-100 hover:shadow-sm border-transparent"
                    }`}
                  >
                    {/* TITLE */}
                    <div className="flex items-start gap-2">
                      {isResolved ? (
                        <CheckCircle2 size={18} className="text-green-600" />
                      ) : (
                        <XCircle size={18} className="text-red-600" />
                      )}

                      <div className="flex-1">
                        <p
                          className="text-sm font-medium truncate"
                          title={job.error}
                        >
                          {job.error?.length > 60
                            ? job.error.slice(0, 60) + "..."
                            : job.error}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* META */}
                    <div className="flex justify-between mt-3 text-xs items-center">
                      <span
                        className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                          isResolved
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isResolved ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {isResolved ? "Resolved" : "Failed"}
                      </span>

                      <span className="text-gray-500 flex items-center gap-1">
                        <Brain size={12} />
                        {job.agentResult?.confidence
                          ? job.agentResult.confidence.toFixed(2)
                          : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4 text-xs">
                <button
                  disabled={page === 1}
                  onClick={() => dispatch(setPage(page - 1))}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-gray-500">
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => dispatch(setPage(page + 1))}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* ISSUE */}
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bug size={16} />
                  Detected Issue
                </h3>
                <p className="text-sm wrap-break-word">{selected.error}</p>
              </div>

              {/* AI DETAILS */}
              <div className="bg-white p-5 rounded-xl shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Wrench size={12} />
                    Suggested Fix
                  </p>
                  <p className="text-sm">{selected.agentResult?.fix || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Root Cause
                  </p>
                  <p className="text-sm">{selected.agentResult?.rca || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Brain size={12} />
                    AI Confidence
                  </p>
                  <p className="text-sm font-semibold">
                    {selected.agentResult?.confidence
                      ? selected.agentResult.confidence.toFixed(2)
                      : "-"}
                  </p>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Execution Timeline
                </h4>

                <div className="border-l pl-4 space-y-3">
                  {selected.timeline?.map((t, i) => {
                    const isFail =
                      t.step.toLowerCase().includes("fail") ||
                      t.step.toLowerCase().includes("reject");

                    return (
                      <div key={i} className="relative">
                        <span
                          className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${
                            isFail ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></span>

                        <p className="text-sm">{t.step}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(t.time).toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a run to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
