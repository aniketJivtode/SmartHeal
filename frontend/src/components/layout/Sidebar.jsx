export default function Sidebar({ setPage }) {
  return (
    <div className="w-60 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-6">🧠 Agent</h2>

      <div className="space-y-4">
        <button
          onClick={() => setPage("dashboard")}
          className="block w-full text-left hover:text-blue-400"
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => setPage("jobs")}
          className="block w-full text-left hover:text-blue-400"
        >
          📋 Jobs
        </button>

        <button
          onClick={() => setPage("config")}
          className="block w-full text-left hover:text-blue-400"
        >
          ⚙️ Config
        </button>
      </div>
    </div>
  );
}
