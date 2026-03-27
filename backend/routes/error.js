import express from "express";
import { getUser } from "../app/app.js";
const router = express.Router();
import Job from "../models/Job.js";

router.get("/trigger", async (req, res) => {
  try {
    getUser(null); // force error
  } catch (err) {
    const jobId = Date.now().toString();
    await Job.create({
      status: "NEW",
      error: "Cannot read property xyz",
    });
    console.log("🔥 Error captured:", err.message);
  }

  res.json({ status: "error triggered" });
});

router.get("/log", (req, res) => {
  res.json(global.errorLog || {});
});

export default router;
