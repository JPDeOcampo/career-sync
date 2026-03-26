import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setUserId, logout } from "../slices/authSlice";
import { UserType } from "@/@types/userTypes";

const path = "/auth";

interface UserResponseType {
  user: UserType;
  accessToken: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // --- Login ---
    login: builder.mutation<
      UserResponseType,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: `${path}/login`,
        method: "POST",
        body: credentials,
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Register ---
    register: builder.mutation<
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
        url: `${path}/register`,
        method: "POST",
        body: credentials,
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Forgot Password ---
    forgotPassword: builder.mutation<
      { userId: UserType["userId"]; email: UserType["email"] },
      { email: string }
    >({
      query: (credentials) => ({
        url: `${path}/forgot-password`,
        method: "POST",
        body: credentials,
      }),
      extraOptions: {
        skipReauth: true,
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserId({ userId: data.userId, email: data.email }));
        } catch (err) {
          console.error("Forgot password failed", err);
          dispatch(logout());
        }
      },
    }),

    // --- Refresh Reset Password ---
    refreshResetPassword: builder.mutation<
      { userId: UserType["userId"]; email: UserType["email"] },
      void
    >({
      query: () => ({
        url: `${path}/reset/refresh-reset-password`,
        method: "GET",
      }),
      extraOptions: {
        skipReauth: true,
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserId({ userId: data.userId, email: data.email }));
        } catch (err) {
          console.error("Refresh reset password failed", err);
        }
      },
    }),

    // --- Verify Reset Password ---
    verifyResetPassword: builder.mutation<
      void,
      { userId: UserType["userId"]; verificationCode: string }
    >({
      query: ({ userId, verificationCode }) => ({
        url: `${path}/reset/verify-reset-password/${userId}`,
        method: "POST",
        body: { verificationCode },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Resend Verification Code ---
    resendResetVerificationCode: builder.mutation<
      void,
      { userId: UserType["userId"] }
    >({
      query: ({ userId }) => ({
        url: `${path}/reset/resend-reset-verification-code/${userId}`,
        method: "POST",
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Reset Password ---
    resetPassword: builder.mutation<
      void,
      {
        userId: UserType["userId"];
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: ({ userId, newPassword, confirmPassword }) => ({
        url: `${path}/reset/reset-password/${userId}`,
        method: "POST",
        body: { newPassword, confirmPassword },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Logout ---
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${path}/single-logout`,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          console.error("Logout failed", err);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useVerifyResetPasswordMutation,
  useResendResetVerificationCodeMutation,
  useRefreshResetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
