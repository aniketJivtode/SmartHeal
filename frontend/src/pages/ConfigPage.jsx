import { useState } from "react";
import { Settings, Mail, MessageSquareShare } from "lucide-react";

export default function ConfigPage() {
  const [type, setType] = useState("email");
  const [value, setValue] = useState("");
  const [savedConfig, setSavedConfig] = useState(null);

  const handleSave = () => {
    if (!value) return;

    const config = {
      type,
      value,
      createdAt: new Date(),
    };

    setSavedConfig(config);
    console.log("Saved config:", config);
    setValue("");
  };

  return (
    <div className="space-y-6">
      {/* 🔝 Title */}
      <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Settings size={20} className="text-gray-700" />
        Alert Configuration
      </h1>

      {/* 🧾 Form Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-5 max-w-xl">
        {/* Type Selector */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Alert Type</label>

          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
            </select>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500 flex items-center gap-1">
            {type === "email" ? (
              <Mail size={14} />
            ) : (
              <MessageSquareShare size={14} />
            )}
            {type === "email" ? "Email Address" : "Slack Channel"}
          </label>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "email" ? "dev@company.com" : "#alerts"}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* 📋 Preview */}
      {savedConfig && (
        <div className="bg-white p-5 rounded-xl border shadow-sm max-w-xl space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Saved Configuration
          </h2>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="text-gray-400">Type:</span> {savedConfig.type}
            </p>
            <p>
              <span className="text-gray-400">Value:</span> {savedConfig.value}
            </p>
            <p className="text-xs text-gray-400">
              Saved at: {savedConfig.createdAt.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
