import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

// ── Error / trigger ────────────────────────────────────────────────────────
export const triggerError = () => api.get("/error/trigger");
export const getJob = () => api.get("/agent/jobs");

// ── Projects ───────────────────────────────────────────────────────────────
export const apiGetProjects = () => api.get("/api/projects");
export const apiCreateProject = (body) => api.post("/api/projects", body);
export const apiDeleteProject = (projectId) =>
  api.delete(`/api/projects/${projectId}`);

// ── GitHub ─────────────────────────────────────────────────────────────────
export const apiGetRepos = () => api.get("/api/github/repos");
export const apiSelectRepo = (body) =>
  api.post("/api/github/select-repo", body);
