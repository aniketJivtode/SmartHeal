import { useSelector } from "react-redux";
import { useState } from "react";

export default function JobsPage() {
  const jobs = useSelector((state) => state.jobs.history);
  const [selected, setSelected] = useState(null);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">📋 Job History</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* LEFT: List */}
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelected(job)}
              className="border p-3 mb-2 rounded cursor-pointer hover:bg-gray-100"
            >
              <p>
                <b>ID:</b> {job.id}
              </p>
              <p>
                <b>Status:</b> {job.status}
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT: Details */}
        <div>
          {selected ? (
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-bold mb-2">🔍 Job Details</h3>

              <p>
                <b>Error:</b> {selected.error?.message}
              </p>
              <p>
                <b>Fix:</b> {selected.agentResult?.fix}
              </p>
              <p>
                <b>RCA:</b> {selected.agentResult?.rca}
              </p>
              <p>
                <b>Confidence:</b> {selected.agentResult?.confidence}
              </p>

              <div className="mt-3">
                <h4 className="font-semibold">⏱ Timeline</h4>
                {selected.timeline?.map((t, i) => (
                  <p key={i} className="text-sm">
                    {t.step}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p>Select a job to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
