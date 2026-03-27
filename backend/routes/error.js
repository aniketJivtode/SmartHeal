import express from "express";
import { getUser } from "../app/app.js";

const router = express.Router();

router.get("/trigger", (req, res) => {
  try {
    getUser(null); // force error
  } catch (err) {
    global.errorLog = {
      message: err.message,
      stack: err.stack,
      time: new Date(),
      status: "NEW",
      id: Date.now(),
    };

    console.log("🔥 Error captured:", err.message);
  }

  res.json({ status: "error triggered" });
});

router.get("/log", (req, res) => {
  res.json(global.errorLog || {});
});

export default router;
