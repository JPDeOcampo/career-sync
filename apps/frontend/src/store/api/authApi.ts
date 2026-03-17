import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserType } from "@/@types/userTypes";
import { login, logout, setUserId } from "../slices/authSlice";
import type { RootState } from "../store";
import { toast } from "sonner";
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth`;

interface UserResponseType {
  user: UserType;
  accessToken: string;
}
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.accessToken;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),
  endpoints: (builder) => ({
    userLogin: builder.mutation<
      UserResponseType,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // --- Register User ---
    userRegister: builder.mutation<
      void,
      {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        confirmPassword: string;
      }
    >({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),

    // --- Forgot Password ---
    userForgotPassword: builder.mutation<
      { userId: UserType["userId"]; email: UserType["email"] },
      { email: string }
    >({
      query: (credentials) => ({
        url: "/forgot-password",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserId({ userId: data.userId, email: data.email }));
        } catch (err) {
          console.log("Refresh token failed", err);
          dispatch(logout());
        }
      },
    }),

    // --- Refresh Reset Password ---
    userRefreshResetPassword: builder.mutation<
      { userId: UserType["userId"]; email: UserType["email"] },
      void
    >({
      query: (credentials) => ({
        url: "/reset/refresh-reset-password",
        method: "GET",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserId({ userId: data.userId, email: data.email }));
        } catch (err) {
          console.log("Refresh token failed", err);
        }
      },
    }),

    // --- Verify Reset Password ---
    userVerifyResetPassword: builder.mutation<
      void,
      { userId?: UserType["userId"]; verificationCode: string }
    >({
      query: ({ userId, verificationCode }) => ({
        url: `/reset/verify-reset-password/${userId}`,
        method: "POST",
        body: { verificationCode },
      }),
    }),
    userResendResetVerificationCode: builder.mutation<
      void,
      { userId?: UserType["userId"] }
    >({
      query: (userId) => ({
        url: `/reset/resend-reset-verification-code/${userId}`,
        method: "POST",
      }),
    }),

    // --- Reset Password ---
    userResetPassword: builder.mutation<
      void,
      {
        userId?: UserType["userId"];
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: ({ userId, newPassword, confirmPassword }) => ({
        url: `/reset/reset-password/${userId}`,
        method: "POST",
        body: { newPassword, confirmPassword },
      }),
    }),

    // --- Refresh Token ---
    refreshToken: builder.mutation<UserResponseType, void>({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(login(data));
        } catch (err) {
          console.log("Refresh token failed", err);
          toast.error("Session expired");
          dispatch(logout());
        }
      },
    }),
    singleLogout: builder.mutation<void, void>({
      query: () => ({
        url: "/single-logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          console.log("Logout failed", err);
        }
      },
    }),
  }),
});

export const {
  useUserLoginMutation,
  useUserRegisterMutation,
  useUserForgotPasswordMutation,
  useUserVerifyResetPasswordMutation,
  useUserResendResetVerificationCodeMutation,
  useUserRefreshResetPasswordMutation,
  useUserResetPasswordMutation,
  useRefreshTokenMutation,
  useSingleLogoutMutation,
} = authApi;
