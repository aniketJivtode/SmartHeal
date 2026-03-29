import express from "express";
import cors from "cors";
import healthHandler from "./routes/health.js";
import errorRoutes from "./routes/error.js";
import agentRoutes from "./routes/agent.js";
import { startWatcher } from "./daemon/watcher.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";
import SmartHeal from "./app/smartheal.js";
import session from "express-session";
import githubRoutes from "./routes/github.js";
import projectRoutes from "./routes/projects.js";
import alertRoutes from "./routes/alerts.js";

connectDB();
// start daemon

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// ✅ session MUST be registered before any route that reads req.session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smartheal-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // ✅ for localhost (set true in production with HTTPS)
    },
  }),
);

app.use("/health", healthHandler);
app.use("/error", errorRoutes);
app.use("/", agentRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/alerts", alertRoutes);

startWatcher();
app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = 3001;

app.listen(PORT, () => {
  SmartHeal.init({
    endpoint: "http://localhost:5000/jobs",
    projectId: "test-app",
  });
  console.log(`Server running on port ${PORT}`);
});
