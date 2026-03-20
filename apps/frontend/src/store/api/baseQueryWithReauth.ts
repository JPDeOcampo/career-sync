import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex, withTimeout, E_TIMEOUT } from "async-mutex";
import { RootState } from "../store";
import { UserType } from "@/@types/userTypes";
import { login, logout } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { BASE_URL } from "@/utils/apiPath";

interface UserResponseType {
  user: UserType;
  accessToken: string;
}

// Wrap the Mutex with a 10-second timeout
const mutex = withTimeout(new Mutex(), 10000);

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  try {
    // To wait for the mutex to be available before even trying the first call
    // This prevents calls from firing while a refresh is already in progress
    await mutex.waitForUnlock();
  } catch (e) {
    // Handle timeout if the "Waiting Room" takes too long
    if (e === E_TIMEOUT) {
      api.dispatch(logout());
      return {
        error: { status: "CUSTOM_ERROR", error: "Mutex Timeout" },
      };
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // To check if the mutex is already locked by another request
    if (!mutex.isLocked()) {
      let release;
      try {
        // Acquire the lock (will throw E_TIMEOUT if it takes > 10s)
        release = await mutex.acquire();

        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          api.dispatch(login(refreshResult.data as UserResponseType));
          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        } else {
          toast.error("Session expired. Please log in again.", {
            id: "session-expired",
          });
          api.dispatch(logout());
        }
      } catch (e) {
        // If acquiring the lock or the refresh process hangs
        if (e === E_TIMEOUT) {
          toast.error("Auth server busy. Please try again.", {
            id: "auth-timeout",
          });
          api.dispatch(logout());
        }
      } finally {
        // Release the lock so other waiting requests can proceed
        if (release) release();
      }
    } else {
      try {
        // Wait for the ongoing refresh to finish
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      } catch (e) {
        if (e === E_TIMEOUT) api.dispatch(logout());
      }
    }
  }
  return result;
};
