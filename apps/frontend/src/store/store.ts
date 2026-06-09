import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import jobReducer from "./slices/jobSlice";
import jobModalReducer from "./slices/jobModalSlice";
import documentReducer from "./slices/documentSlice";
import paginationReducer from "./slices/paginationSlice";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { jobsApi } from "./api/jobsApi";
import { documentApi } from "./api/documentApi";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    jobs: jobReducer,
    jobModal: jobModalReducer,
    pagination: paginationReducer,
    documents: documentReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      jobsApi.middleware,
      documentApi.middleware,
    ),
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    document.body.classList.toggle("dark", state.theme.isDarkMode);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
