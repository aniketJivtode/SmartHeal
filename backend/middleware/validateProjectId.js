import Project from "../models/Project.js";

/**
 * validateProjectId middleware
 *
 * Rejects POST /jobs requests that carry an unknown projectId.
 * Attaches `req.project` for downstream handlers to use.
 *
 * Usage:
 *   router.post("/jobs", validateProjectId, handler)
 */
export async function validateProjectId(req, res, next) {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({
      error:
        "projectId is required. Register your project at /api/projects first.",
    });
  }

  try {
    const project = await Project.findOne({ projectId });

    if (!project) {
      return res.status(403).json({
        error: `Unknown projectId: "${projectId}". Register at POST /api/projects.`,
      });
    }

    // Attach for use in downstream handlers
    req.project = project;
    next();
  } catch (err) {
    console.error("validateProjectId error:", err);
    res.status(500).json({ error: "Project validation failed" });
  }
}
