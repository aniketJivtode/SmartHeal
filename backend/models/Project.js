import mongoose from "mongoose";
import crypto from "crypto";

const ProjectSchema = new mongoose.Schema({
  // Human readable name e.g. "my-ecommerce-app"
  name: { type: String, required: true },

  // Auto-generated slug used as the projectId in the SDK
  // e.g. "proj_a1b2c3d4"
  projectId: {
    type: String,
    unique: true,
    default: () => "proj_" + crypto.randomBytes(8).toString("hex"),
  },

  // Optional description
  description: String,

  // Environments this project supports (informational)
  envs: {
    type: [String],
    default: ["prod", "staging", "dev"],
  },

  // Owner / created by (future: tie to user auth)
  createdBy: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Project", ProjectSchema);
