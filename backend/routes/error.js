import express from "express";
import { getUser } from "../app/app.js";

const router = express.Router();

router.get("/trigger", (req, res) => {
  try {
    getUser(null); // force error
  } catch (err) {
    const jobId = Date.now().toString();
    global.currentJob = {
      id: jobId,
      error: {
        message: err.message,
        stack: err.stack,
        time: new Date(),
      },
      status: "NEW",
      agentResult: null,
      timeline: [],
    };

    console.log("🔥 Error captured:", err.message);
  }

  res.json({ status: "error triggered" });
});

router.get("/log", (req, res) => {
  res.json(global.errorLog || {});
});

export default router;
