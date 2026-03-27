import { configureStore } from "@reduxjs/toolkit";
import jobReducer from "../features/jobs/jobSlice";

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
  },
});
