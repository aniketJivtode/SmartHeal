import express from "express";
import cors from "cors";
import healthHandler from "./routes/health.js";
import errorRoutes from "./routes/error.js";
import agentRoutes from "./routes/agent.js";
import { startWatcher } from "./daemon/watcher.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";

connectDB();
// start daemon

const app = express();

app.use(cors());
app.use(express.json());
app.use("/health", healthHandler);
app.use("/error", errorRoutes);
app.use("/", agentRoutes);

startWatcher();
app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
