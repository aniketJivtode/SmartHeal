import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export const triggerError = () => api.get("/error/trigger");
export const getJob = () => api.get("/agent/job");
