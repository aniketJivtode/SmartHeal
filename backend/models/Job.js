import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  // 🧠 Core error info
  error: { type: String, required: true },
  stack: String,
  projectId: String,
  env: String,
  source: String,

  // ⚙️ Execution lifecycle
  status: {
    type: String,
    enum: [
      "NEW",
      "RECEIVED",
      "PROCESSING",
      "AWAITING_APPROVAL",
      "DONE",
      "FAILED",
    ],
    default: "NEW",
    index: true, // 🔥 important for worker query
  },

  // 🧭 Decision engine (NEW)
  decision: {
    type: String,
    enum: ["AUTO", "MANUAL", "REJECTED"],
  },

  // 🤖 AI result
  agentResult: {
    confidence: Number,
    fix: String,
    rca: String,
    patch: String,
  },

  // 🔧 Execution output
  execution: mongoose.Schema.Types.Mixed,

  // � GitHub PR (if created)
  prUrl: String,

  // �🔁 Retry metadata (NEW)
  attempts: {
    type: Number,
    default: 0,
  },

  // ⏱ Timeline
  timeline: [
    {
      step: String,
      time: { type: Date, default: Date.now },
      reason: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // 🔥 helps sorting in worker
  },
});

export default mongoose.model("Job", JobSchema);
