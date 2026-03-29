import express from "express";

import Repo from "../models/Repo.js";
import axios from "axios";

const router = express.Router();

router.get("/auth", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  const redirectUri = "http://localhost:3001/api/github/callback";

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;

  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    console.log("TOKEN RESPONSE:", tokenRes.data); // 🔥 ADD THIS

    const access_token = tokenRes.data.access_token;

    if (!access_token) {
      throw new Error("No access token received");
    }

    req.session.githubToken = access_token;

    // ✅ Redirect back to frontend root; frontend wizard detects ?step=select
    res.redirect("http://localhost:5173/?step=select");
  } catch (err) {
    console.error("OAuth ERROR:", err.response?.data || err.message); // 🔥 IMPORTANT
    res.status(500).send("OAuth failed");
  }
});

router.get("/repos", async (req, res) => {
  try {
    const token = req.session.githubToken;

    if (!token) {
      return res.status(401).json({
        error: "Not authenticated with GitHub",
      });
    }

    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch repos",
    });
  }
});

router.post("/select-repo", async (req, res) => {
  try {
    const { name, fullName, projectId } = req.body;

    const token = req.session.githubToken;

    if (!token) {
      return res.status(401).json({
        error: "Missing GitHub session",
      });
    }

    console.log(
      "Saving repo with token (first 10 chars):",
      token?.substring(0, 10) + "...",
    );

    const repo = await Repo.create({
      name,
      fullName,
      projectId,
      accessToken: token,
    });

    console.log("Repo saved successfully:", repo._id);

    res.json(repo);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to save repo",
    });
  }
});

export default router;
