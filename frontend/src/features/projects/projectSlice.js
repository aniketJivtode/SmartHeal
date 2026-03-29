import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/projects");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  },
);

export const createProject = createAsyncThunk(
  "projects/create",
  async ({ name, description, envs }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/projects", { name, description, envs });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  },
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${projectId}`);
      return projectId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    loading: false,
    error: null,
    // the active project the user selected/registered (persisted in localStorage)
    activeProjectId: localStorage.getItem("activeProjectId") || null,
  },
  reducers: {
    setActiveProject(state, action) {
      state.activeProjectId = action.payload;
      localStorage.setItem("activeProjectId", action.payload);
    },
    clearActiveProject(state) {
      state.activeProjectId = null;
      localStorage.removeItem("activeProjectId");
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProjects.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchProjects.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // createProject
      .addCase(createProject.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createProject.fulfilled, (s, a) => {
        s.loading = false;
        s.list.unshift(a.payload);
        // auto-select the newly created project
        s.activeProjectId = a.payload.projectId;
        localStorage.setItem("activeProjectId", a.payload.projectId);
      })
      .addCase(createProject.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // deleteProject
      .addCase(deleteProject.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p.projectId !== a.payload);
        if (s.activeProjectId === a.payload) {
          s.activeProjectId = null;
          localStorage.removeItem("activeProjectId");
        }
      });
  },
});

export const { setActiveProject, clearActiveProject } = projectSlice.actions;
export default projectSlice.reducer;
