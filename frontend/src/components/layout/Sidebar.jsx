import { LayoutDashboard, List, BarChart3, Settings } from "lucide-react";
import { Brain } from "lucide-react";
export default function Sidebar({ setPage, page }) {
  const items = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "jobs", label: "Issue Explorer", icon: List },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "config", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-60 bg-white border-r h-full p-4">
      <h1 className="flex items-center gap-2 text-lg font-semibold mb-6 tracking-tight">
        <div className="p-1.5 bg-indigo-50 rounded-md">
          <Brain size={18} className="text-indigo-600" />
        </div>
        <span className="font-semibold text-gray-900 tracking-tight">
          Smart<span className="text-indigo-600">Heal</span>
        </span>
      </h1>

      <div className="space-y-2">
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
    </div>
  );
}
