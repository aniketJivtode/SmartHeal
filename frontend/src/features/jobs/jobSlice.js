import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Async thunk (paginated + filters)
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, status, from, to } = getState().jobs;

      const query = new URLSearchParams({
        page,
        limit: 5,
        status,
        from,
        to,
      });

      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const res = await fetch(`${BASE_URL}/jobs?${query}`);
      const data = await res.json();

      return data;
    } catch (err) {
      return rejectWithValue("Failed to fetch jobs");
    }
  },
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    currentJob: null,
    history: [],
    selectedJob: null,

    loading: false,
    error: null,

    page: 1,
    totalPages: 1,

    status: "",
    from: "",
    to: "",
  },

  reducers: {
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },

    setPage: (state, action) => {
      state.page = action.payload;
    },

    setFilters: (state, action) => {
      const { status, from, to } = action.payload;

      if (status !== undefined) state.status = status;
      if (from !== undefined) state.from = from;
      if (to !== undefined) state.to = to;

      state.page = 1; // reset page on filter change
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;

        const { data, pages } = action.payload;

        state.history = data;
        state.totalPages = pages;
        state.currentJob = data[0] || null;
      })

      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default jobSlice.reducer;

export const { setSelectedJob, setPage, setFilters } = jobSlice.actions;
