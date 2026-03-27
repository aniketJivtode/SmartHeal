import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import Topbar from "../components/layout/Topbar";
import Metrics from "../components/dashboard/Metrics";

export default function DashboardPage({ onTrigger }) {
  const { history } = useSelector((state) => state.jobs);

  // 📊 Metrics
  const successCount = history.filter((j) => j.status === "DONE").length;
  const failureCount = history.filter((j) => j.status === "FAILED").length;

  const pieData = [
    { name: "Success", value: successCount },
    { name: "Failure", value: failureCount },
  ];

  // 📈 Confidence trend
  const lineData = history.map((job, i) => ({
    name: `Job ${i + 1}`,
    confidence: job.agentResult?.confidence || 0,
  }));

  // 📊 Error frequency
  const errorMap = {};
  history.forEach((job) => {
    const msg = job.error?.message || "Unknown";
    errorMap[msg] = (errorMap[msg] || 0) + 1;
  });

  const errorData = Object.keys(errorMap).map((key) => ({
    error: key.slice(0, 20), // short label
    fullError: key, // full message
    count: errorMap[key],
  }));

  return (
    <div className="space-y-6">
      {/* 🔝 TOPBAR */}
      <Topbar onTrigger={onTrigger} />

      {/* 📊 METRICS */}
      <Metrics
        success={successCount}
        failure={failureCount}
        total={history.length}
      />

      {/* 📈 CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🔴 Success vs Failure */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Success vs Failure</h3>

          <PieChart width={300} height={250}>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              {pieData.map((_, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        {/* 📈 Confidence Trend */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Confidence Trend</h3>

          <LineChart width={350} height={250} data={lineData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="confidence" />
          </LineChart>
        </div>
        {/* 📊 Error Frequency */}
        {console.log("errorData", errorData)}
        <div className="bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2">
          <h3 className="font-semibold mb-3">Error Frequency</h3>
          <LineChart width={700} height={250} data={errorData}>
            <XAxis dataKey="error" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="count" />
          </LineChart>
        </div>
      </div>

      {/* 📜 RECENT JOBS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Recent Jobs</h3>

        {history.length === 0 && <p className="text-gray-500">No jobs yet</p>}

        {history.slice(0, 5).map((job) => (
          <div
            key={job.id}
            className="flex justify-between items-center border-b py-2"
          >
            <span
              className="text-sm cursor-pointer underline"
              title={job.error?.message}
            >
              {job.error?.message?.length > 40
                ? job.error.message.slice(0, 40) + "..."
                : job.error?.message}
            </span>

            <span
              className={`text-xs px-2 py-1 rounded ${
                job.status === "DONE"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-2 border rounded shadow text-sm">
        <p>
          <b>Error:</b> {data.fullError}
        </p>
        <p>
          <b>Count:</b> {data.count}
        </p>
      </div>
    );
  }

  return null;
};
