import {
  LayoutDashboard,
  List,
  BarChart3,
  Settings,
  FolderPlus,
  HelpCircle,
} from "lucide-react";
import { Brain, CheckCircle, SquareTerminal } from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar({ setPage, page }) {
  const [repo, setRepo] = useState(null);

  // Load connected repo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("connectedRepo");
    if (stored) {
      try {
        setRepo(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const items = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "jobs", label: "Issue Explorer", icon: List },
    { key: "projects", label: "Projects", icon: FolderPlus },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "config", label: "Settings", icon: Settings },
  ];

  const bottomItems = [{ key: "docs", label: "Help & Docs", icon: HelpCircle }];

  return (
    <>
      <div className="w-60 bg-white border-r h-full p-4 flex flex-col">
        {/* Logo */}
        <h1 className="flex items-center gap-2 text-lg font-semibold mb-6 tracking-tight">
          <div className="p-1.5 bg-indigo-50 rounded-md">
            <Brain size={18} className="text-indigo-600" />
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">
            Smart<span className="text-indigo-600">Heal</span>
          </span>
        </h1>

        {/* Nav */}
        <div className="space-y-1 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition ${
                  page === item.key
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom nav (Help, etc.) */}
        <div className="space-y-1 mb-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition ${
                  page === item.key
                    ? "bg-indigo-50 text-indigo-600"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Repo status */}
        <div className="mt-4">
          {repo ? (
            <div className="border rounded-xl p-3 bg-green-50">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Repo Connected</span>
              </div>
              <div className="text-xs text-gray-600 mt-1 truncate">
                {repo.fullName}
              </div>
              <button
                onClick={() => setPage("projects")}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Manage in Projects →
              </button>
            </div>
          ) : (
            <div
              onClick={() => setPage("projects")}
              className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
            >
              <SquareTerminal size={16} />
              <span className="text-sm">Connect Repository</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
