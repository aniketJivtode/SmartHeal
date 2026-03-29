// routes/alerts.js
import express from "express";
import { sendAlert } from "../services/alertService.js";

const router = express.Router();

/**
 * POST /api/alerts/test
 * Body: { channel: "email" | "slack" | "all" }
 * Sends a test alert on the requested channel regardless of ALERT_* env flags.
 */
router.post("/test", async (req, res) => {
  const { channel = "all" } = req.body;

  const original = {
    email: process.env.ALERT_EMAIL,
    slack: process.env.ALERT_SLACK,
  };

  // Temporarily override so the test fires even if channels are disabled
  if (channel === "email" || channel === "all")
    process.env.ALERT_EMAIL = "true";
  if (channel === "slack" || channel === "all")
    process.env.ALERT_SLACK = "true";

  try {
    await sendAlert("🧪 SmartHeal test alert — channels are working!", {
      error: "Test error from alert test endpoint",
      projectId: process.env.SMARTHEAL_PROJECT_ID || "proj_test",
      status: "DONE",
      agentResult: { confidence: 0.99, fix: "This is a test message" },
      prUrl: null,
    });
    res.json({ ok: true, message: `Test alert sent via ${channel}` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    // Restore original values
    process.env.ALERT_EMAIL = original.email;
    process.env.ALERT_SLACK = original.slack;
  }
});

/**
 * GET /api/alerts/config
 * Returns which channels are currently enabled (no secrets exposed).
 */
router.get("/config", (req, res) => {
  res.json({
    email: {
      enabled: process.env.ALERT_EMAIL === "true",
      configured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      to: process.env.ALERT_EMAIL_TO || process.env.GMAIL_USER || null,
    },
    slack: {
      enabled: process.env.ALERT_SLACK === "true",
      configured: !!process.env.SLACK_WEBHOOK_URL?.startsWith(
        "https://hooks.slack.com",
      ),
    },
  });
});

export default router;
