import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import authReducer from "./slices/authSlice";
import jobReducer from "./slices/jobSlice";
import globalReducer from "./slices/globalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    global: globalReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// TRIGGER ON REFRESH:
// This starts the cookie verification as soon as the JS bundle loads
if (typeof window !== "undefined") {
  const hasCookie = document.cookie.includes("is_logged_in=true");

  if (hasCookie) {
    store.dispatch(authApi.endpoints.refreshToken.initiate());
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
