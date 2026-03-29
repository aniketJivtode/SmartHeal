import mongoose from "mongoose";

const RepoSchema = new mongoose.Schema({
  projectId: String,
  name: String,
  fullName: String,
  accessToken: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Repo", RepoSchema);
