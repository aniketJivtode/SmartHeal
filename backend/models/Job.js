import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  status: String,
  error: String,
  agentResult: Object,
  execution: Object,
  timeline: [
    {
      step: String,
      time: Date,
      reason: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Job", JobSchema);
