import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJob } from "../../services/api";

// async thunk
export const fetchJob = createAsyncThunk("jobs/fetch", async () => {
  const res = await getJob();
  return res.data;
});

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    currentJob: null,
    history: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
        // avoid duplicates
        if (!state.history.find((j) => j.id === action.payload.id)) {
          state.history.unshift(action.payload);
        }

        // keep only last 10 jobs
        state.history = state.history.slice(0, 10);
      });
  },
});

export default jobSlice.reducer;
