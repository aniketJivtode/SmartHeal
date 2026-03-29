// services/alertService.js
import nodemailer from "nodemailer";
import axios from "axios";

// ─── Email ────────────────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return _transporter;
}

async function sendEmail(subject, body) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"SmartHeal 🤖" <${process.env.GMAIL_USER}>`,
    to: process.env.ALERT_EMAIL_TO || process.env.GMAIL_USER,
    subject,
    html: body,
  });
}

// ─── Slack ────────────────────────────────────────────────────────────────────

async function sendSlack(message) {
  await axios.post(
    process.env.SLACK_WEBHOOK_URL,
    { text: message },
    { headers: { "Content-Type": "application/json" } },
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Pick an emoji + colour for the email header based on the message prefix.
 */
function parseAlert(message) {
  if (message.startsWith("✅"))
    return { emoji: "✅", color: "#16a34a", label: "Auto-Fixed" };
  if (message.startsWith("⚠️"))
    return { emoji: "⚠️", color: "#d97706", label: "Needs Approval" };
  if (message.startsWith("❌"))
    return { emoji: "❌", color: "#dc2626", label: "Rejected" };
  if (message.startsWith("🚨"))
    return { emoji: "🚨", color: "#9333ea", label: "Critical" };
  if (message.startsWith("💥"))
    return { emoji: "💥", color: "#dc2626", label: "Agent Crash" };
  return { emoji: "🔔", color: "#4f46e5", label: "Alert" };
}

function buildEmailHtml(message, job) {
  const { emoji, color, label } = parseAlert(message);
  const now = new Date().toLocaleString();

  const rows = job
    ? `
    <tr><td style="color:#6b7280;padding:6px 0;font-size:13px">Error</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600">${job.error || "—"}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;font-size:13px">Project ID</td>
        <td style="padding:6px 0;font-size:13px;font-family:monospace">${job.projectId || "—"}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;font-size:13px">Status</td>
        <td style="padding:6px 0;font-size:13px">${job.status || "—"}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;font-size:13px">Confidence</td>
        <td style="padding:6px 0;font-size:13px">${job.agentResult?.confidence?.toFixed(2) ?? "—"}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;font-size:13px">Fix</td>
        <td style="padding:6px 0;font-size:13px">${job.agentResult?.fix || "—"}</td></tr>
    ${
      job.prUrl
        ? `<tr><td style="color:#6b7280;padding:6px 0;font-size:13px">PR</td>
        <td style="padding:6px 0;font-size:13px"><a href="${job.prUrl}" style="color:#4f46e5">${job.prUrl}</a></td></tr>`
        : ""
    }
  `
    : "";

  return `
  <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f9fafb;padding:24px">
    <div style="background:${color};color:#fff;border-radius:12px 12px 0 0;padding:20px 24px">
      <div style="font-size:28px">${emoji}</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px">${label}</div>
      <div style="font-size:13px;opacity:0.85;margin-top:2px">${now}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;border:1px solid #e5e7eb;border-top:none">
      <p style="margin:0 0 16px;font-size:15px;color:#111827">${message}</p>
      ${rows ? `<table style="width:100%;border-collapse:collapse">${rows}</table>` : ""}
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Sent by SmartHeal · self-healing agent</p>
    </div>
  </div>`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Send an alert to all enabled channels.
 * @param {string} message  - Human-readable alert message (with emoji prefix)
 * @param {object} [job]    - Optional Job document for rich context
 */
export async function sendAlert(message, job = null) {
  // Always log to console
  console.log("🔔 ALERT:", message);

  const errors = [];

  // ── Email ──
  if (process.env.ALERT_EMAIL === "true") {
    try {
      const { label } = parseAlert(message);
      await sendEmail(
        `SmartHeal · ${label} — ${new Date().toLocaleTimeString()}`,
        buildEmailHtml(message, job),
      );
      console.log("📧 Email alert sent");
    } catch (err) {
      console.error("📧 Email alert failed:", err.message);
      errors.push(`email: ${err.message}`);
    }
  }

  // ── Slack ──
  if (process.env.ALERT_SLACK === "true") {
    try {
      const jobLines = job
        ? [
            `*Error:* ${job.error}`,
            `*Project:* \`${job.projectId}\``,
            `*Status:* ${job.status}`,
            job.agentResult?.fix ? `*Fix:* ${job.agentResult.fix}` : null,
            job.prUrl ? `*PR:* ${job.prUrl}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        : "";

      const slackText = jobLines ? `${message}\n\n${jobLines}` : message;
      await sendSlack(slackText);
      console.log("💬 Slack alert sent");
    } catch (err) {
      console.error("💬 Slack alert failed:", err.message);
      errors.push(`slack: ${err.message}`);
    }
  }

  if (errors.length) {
    console.warn("⚠️  Some alert channels failed:", errors.join(", "));
  }
}
