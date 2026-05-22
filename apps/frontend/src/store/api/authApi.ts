import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setUser, setUserId, logout } from "../slices/authSlice";
import { UserDTO } from "@career-sync/shared";

const path = "/auth";

interface UserResponseType {
  user: UserDTO;
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

    // --- Update User ---
    updateUser: builder.mutation<
      {
        firstName: string;
        lastName: string;
        email: string;
      },
      {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    >({
      query: ({ id, firstName, lastName, email }) => ({
        url: `${path}/update-user/${id}`,
        method: "PUT",
        body: { firstName, lastName, email },
      }),
      extraOptions: {
        skipReauth: true,
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (err) {
          console.error("Update user failed", err);
        }
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

    // --- update Password ---
    updatePassword: builder.mutation<
      void,
      {
        id: string;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `${path}/update-password/${id}`,
        method: "PUT",
        body: { currentPassword, newPassword, confirmPassword },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Forgot Password ---
    forgotPassword: builder.mutation<
      { userId: UserDTO["userId"]; email: UserDTO["email"]; expiresIn: number },
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
      { userId: UserDTO["userId"]; email: UserDTO["email"]; expiresIn: number },
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
      { userId: UserDTO["userId"]; verificationCode: string }
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
      { expiresIn: number },
      { userId: UserDTO["userId"] }
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
        userId: UserDTO["userId"];
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
  useUpdateUserMutation,
  useRegisterMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useVerifyResetPasswordMutation,
  useResendResetVerificationCodeMutation,
  useRefreshResetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
