import express from "express";
import cors from "cors";
import healthHandler from "./routes/health.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/health", healthHandler);

app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
