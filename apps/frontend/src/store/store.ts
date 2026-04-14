import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { jobsApi } from "./api/jobsApi";
import { documentApi } from "./api/documentApi";
import authReducer from "./slices/authSlice";
import jobReducer from "./slices/jobSlice";
import jobModalReducer from "./slices/jobModalSlice";
import documentReducer from "./slices/documentSlice";
import paginationReducer from "./slices/paginationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    jobModal: jobModalReducer,
    pagination: paginationReducer,
    documents: documentReducer,
    [authApi.reducerPath]: authApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      jobsApi.middleware,
      documentApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
