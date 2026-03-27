import express from "express";

const router = express.Router();

router.get("/result", (req, res) => {
  res.json(global.currentJob?.agentResult || {});
});

router.get("/timeline", (req, res) => {
  res.json(global.currentJob?.timeline || []);
});

router.get("/job", (req, res) => {
  res.json(global.currentJob || {});
});

export default router;
