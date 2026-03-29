import express from "express";
import Job from "../models/Job.js";
import { validateProjectId } from "../middleware/validateProjectId.js";

const router = express.Router();

// 👉 Latest job (or you can pass id later)
router.get("/jobs/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json(job);
});

router.get("/jobs", async (req, res) => {
  try {
    let { status, page = 1, limit = 10, from, to } = req.query;

    // 🔥 convert to numbers (IMPORTANT)
    page = Number(page);
    limit = Number(limit);

    const query = {};

    // ✅ status filter
    if (status) {
      query.status = status;
    }

    // ✅ date filter (safe)
    if (from || to) {
      query.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) {
          query.createdAt.$gte = fromDate;
        }
      }

      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          query.createdAt.$lte = toDate;
        }
      }
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

      Job.countDocuments(query),
    ]);

    res.json({
      data: jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET /jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// 👉 Agent result
router.get("/result", async (req, res) => {
  const job = await Job.findOne().sort({ createdAt: -1 });
  res.json(job?.agentResult || {});
});

// 👉 Timeline
router.get("/timeline", async (req, res) => {
  const job = await Job.findOne().sort({ createdAt: -1 });
  res.json(job?.timeline || []);
});

router.post("/jobs", validateProjectId, async (req, res) => {
  try {
    const { message, stack, projectId, env, source } = req.body;

    const job = await Job.create({
      error: message,
      stack,
      projectId,
      env,
      source,
      status: "NEW", // 🔥 important
      createdAt: new Date(),
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("POST /jobs error:", err);
    res.status(500).json({ error: "Failed to save job" });
  }
});

export default router;
