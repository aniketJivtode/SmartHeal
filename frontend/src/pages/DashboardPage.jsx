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
import { useDispatch } from "react-redux";
import { setSelectedJob } from "../features/jobs/jobSlice";
import Topbar from "../components/layout/Topbar";
import Metrics from "../components/dashboard/Metrics";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardPage({ onTrigger }) {
  const { history } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();
  console.log(history);
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
    const msg = job.error || "Unknown";
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
          <h3 className="font-semibold mb-3">Resolved vs Failure</h3>

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
          <h3 className="flex items-center gap-2 font-semibold mb-3">
            <TrendingUp size={16} className="text-gray-600" />
            <span>Confidence Trend</span>
          </h3>

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
          <h3 className="flex items-center gap-2 font-semibold mb-3">
            <AlertTriangle size={16} className="text-gray-600" />
            <span>Error Frequency</span>
          </h3>

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
        <h3 className="flex items-center gap-2 font-semibold mb-3">
          <Activity size={16} className="text-gray-600" />
          <span>Recent Runs</span>
        </h3>

        {history.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-6">
            No jobs yet
          </div>
        )}

        {history.slice(0, 5).map((job) => (
          <div
            key={job._id}
            onClick={() => {
              dispatch(setSelectedJob(job));
              window.navigateToJobs();
            }}
            className="group flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          >
            {/* Left */}
            <div className="flex items-start gap-3">
              {/* status dot */}
              <div
                className={`mt-1 w-2.5 h-2.5 rounded-full ${
                  job.status === "DONE" ? "bg-green-500" : "bg-red-500"
                }`}
              />

              {/* text */}
              <div className="flex flex-col">
                <span
                  className="text-sm text-gray-800 group-hover:underline"
                  title={job.error}
                >
                  {job.error?.length > 50
                    ? job.error.slice(0, 50) + "..."
                    : job.error}
                </span>

                <span className="text-xs text-gray-400">
                  Click to view details
                </span>
              </div>
            </div>

            {/* Right badge */}
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium ${
                job.status === "DONE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
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
