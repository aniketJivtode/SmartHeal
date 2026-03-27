import express from "express";
import Job from "../models/Job.js";

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
  const { status, page = 1, limit = 10, from, to } = req.query;
  console.log("req.query", req.query);
  const query = {};

  if (status) query.status = status;

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),

    Job.countDocuments(query),
  ]);

  res.json({
    data: jobs,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
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

export default router;
