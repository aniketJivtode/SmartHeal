import { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({
  icon: Icon,
  title,
  color,
  enabled,
  configured,
  detail,
  setupSteps,
  onTest,
  testing,
  testResult,
}) {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configured ? (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> configured
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <XCircle size={11} /> not set
            </span>
          )}
          {enabled && configured && (
            <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              enabled
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTest}
          disabled={!configured || testing}
          className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition"
        >
          <Send size={12} />
          {testing ? "Sending…" : "Send Test"}
        </button>
        <button
          onClick={() => setShowSetup((v) => !v)}
          className="text-xs text-indigo-600 hover:underline"
        >
          {showSetup ? "Hide setup" : "How to set up →"}
        </button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
            testResult.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Setup guide */}
      {showSetup && (
        <div className="bg-gray-50 border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            Setup steps
          </p>
          {setupSteps.map((step, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-600">
              <span className="shrink-0 font-mono text-indigo-500">
                {i + 1}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: step }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ConfigPage() {
  const [config, setConfig] = useState(null);
  const [testing, setTesting] = useState({ email: false, slack: false });
  const [results, setResults] = useState({ email: null, slack: null });

  useEffect(() => {
    api
      .get("/api/alerts/config")
      .then((r) => setConfig(r.data))
      .catch(() => setConfig(null));
  }, []);

  const sendTest = async (channel) => {
    setTesting((t) => ({ ...t, [channel]: true }));
    setResults((r) => ({ ...r, [channel]: null }));
    try {
      const res = await api.post("/api/alerts/test", { channel });
      setResults((r) => ({
        ...r,
        [channel]: { ok: true, message: res.data.message },
      }));
    } catch (err) {
      setResults((r) => ({
        ...r,
        [channel]: {
          ok: false,
          message: err.response?.data?.error || "Failed to send test alert",
        },
      }));
    } finally {
      setTesting((t) => ({ ...t, [channel]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Settings size={20} className="text-gray-700" />
          Alert Settings
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Configure where SmartHeal sends notifications when jobs complete,
          fail, or need approval.
        </p>
      </div>

      {/* How it works banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-xs text-indigo-700 space-y-1">
        <p className="font-semibold">How alerts work</p>
        <p>
          Alerts fire automatically from{" "}
          <code className="bg-indigo-100 px-1 rounded">watcher.js</code> on
          every job event — auto-fix ✅, needs approval ⚠️, failure ❌, crash
          💥.
        </p>
        <p>
          Enable channels by editing{" "}
          <code className="bg-indigo-100 px-1 rounded">backend/.env</code> and
          restarting the server.
        </p>
      </div>

      {/* .env snippet */}
      <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-gray-200 space-y-0.5 overflow-x-auto">
        <p className="text-gray-500 mb-2"># backend/.env</p>
        <p>
          <span className="text-indigo-400">ALERT_EMAIL</span>=
          <span className="text-green-400">true</span>
        </p>
        <p>
          <span className="text-indigo-400">GMAIL_USER</span>=
          <span className="text-yellow-300">you@gmail.com</span>
        </p>
        <p>
          <span className="text-indigo-400">GMAIL_APP_PASSWORD</span>=
          <span className="text-yellow-300">xxxx-xxxx-xxxx-xxxx</span>
        </p>
        <p>
          <span className="text-indigo-400">ALERT_EMAIL_TO</span>=
          <span className="text-yellow-300">team@yourco.com</span>
        </p>
        <p className="mt-2 text-gray-500"># Slack</p>
        <p>
          <span className="text-indigo-400">ALERT_SLACK</span>=
          <span className="text-green-400">true</span>
        </p>
        <p>
          <span className="text-indigo-400">SLACK_WEBHOOK_URL</span>=
          <span className="text-yellow-300">
            https://hooks.slack.com/services/…
          </span>
        </p>
      </div>

      {/* Channel cards */}
      <ChannelCard
        icon={Mail}
        title="Email"
        color="bg-blue-500"
        enabled={config?.email?.enabled}
        configured={config?.email?.configured}
        detail={
          config?.email?.to
            ? `Sending to: ${config.email.to}`
            : "Nodemailer + Gmail App Password · free forever"
        }
        onTest={() => sendTest("email")}
        testing={testing.email}
        testResult={results.email}
        setupSteps={[
          "Go to <a class='text-indigo-600 underline' href='https://myaccount.google.com/security' target='_blank'>myaccount.google.com → Security</a>",
          "Enable <strong>2-Step Verification</strong> if not already on",
          "Search <strong>App Passwords</strong> → generate one for <em>Mail / Other</em>",
          "Copy the 16-char password into <code class='bg-gray-200 px-1 rounded'>GMAIL_APP_PASSWORD</code> in <code class='bg-gray-200 px-1 rounded'>backend/.env</code>",
          "Set <code class='bg-gray-200 px-1 rounded'>ALERT_EMAIL=true</code> and restart the backend",
        ]}
      />

      <ChannelCard
        icon={MessageSquare}
        title="Slack"
        color="bg-purple-500"
        enabled={config?.slack?.enabled}
        configured={config?.slack?.configured}
        detail="Incoming Webhook · free on all Slack plans"
        onTest={() => sendTest("slack")}
        testing={testing.slack}
        testResult={results.slack}
        setupSteps={[
          "Go to <a class='text-indigo-600 underline' href='https://api.slack.com/apps' target='_blank'>api.slack.com/apps</a> → <strong>Create New App → From scratch</strong>",
          "Pick any name (e.g. <em>SmartHeal</em>) and select your workspace",
          "In the left sidebar click <strong>Incoming Webhooks</strong> → toggle <strong>Activate Incoming Webhooks: On</strong>",
          "Click <strong>Add New Webhook to Workspace</strong> → pick a channel (e.g. #alerts) → Allow",
          "Copy the webhook URL into <code class='bg-gray-200 px-1 rounded'>SLACK_WEBHOOK_URL</code> in <code class='bg-gray-200 px-1 rounded'>backend/.env</code>",
          "Set <code class='bg-gray-200 px-1 rounded'>ALERT_SLACK=true</code> and restart the backend",
        ]}
      />
    </div>
  );
}
