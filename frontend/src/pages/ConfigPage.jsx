import { useState } from "react";

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

    // later: send to backend
    console.log("Saved config:", config);

    setValue("");
  };

  return (
    <div className="space-y-6">
      {/* 🔝 Title */}
      <h1 className="text-2xl font-semibold">⚙️ Alert Configuration</h1>

      {/* 🧾 Form Card */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm mb-1">Alert Type</label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="email">Email</option>
            <option value="slack">Slack</option>
          </select>
        </div>

        {/* Input Field */}
        <div>
          <label className="block text-sm mb-1">
            {type === "email" ? "Email Address" : "Slack Channel"}
          </label>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              type === "email"
                ? "Enter email (e.g. dev@company.com)"
                : "Enter channel (e.g. #alerts)"
            }
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Save Configuration
        </button>
      </div>

      {/* 📋 Preview */}
      {savedConfig && (
        <div className="bg-gray-50 p-4 rounded-xl border">
          <h2 className="font-semibold mb-2">Saved Configuration</h2>

          <p>
            <b>Type:</b> {savedConfig.type}
          </p>
          <p>
            <b>Value:</b> {savedConfig.value}
          </p>
          <p className="text-sm text-gray-500">
            Saved at: {savedConfig.createdAt.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
