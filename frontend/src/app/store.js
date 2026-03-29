import { configureStore } from "@reduxjs/toolkit";
import jobReducer from "../features/jobs/jobSlice";
import projectReducer from "../features/projects/projectSlice";

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
    projects: projectReducer,
  },
});
