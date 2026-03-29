import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

/**
 * POST /api/projects
 * Register a new project and receive a projectId to use in the SDK.
 *
 * Body: { name, description?, envs? }
 * Returns: { projectId, name, ... }
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, envs } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Project name is required (min 2 chars)" });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      envs,
    });

    res.status(201).json({
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      envs: project.envs,
      createdAt: project.createdAt,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Project name already exists" });
    }
    console.error("POST /api/projects error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

/**
 * GET /api/projects
 * List all registered projects (for the dashboard).
 */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({}, "-__v").sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/**
 * GET /api/projects/:projectId
 * Get a single project by its SDK projectId.
 */
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne(
      { projectId: req.params.projectId },
      "-__v",
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("GET /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

/**
 * DELETE /api/projects/:projectId
 * Remove a project registration.
 */
router.delete("/:projectId", async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({
      projectId: req.params.projectId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted", projectId: req.params.projectId });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
