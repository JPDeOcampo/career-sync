import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setUser, setUserId, logout } from "../slices/authSlice";
import { UserDTO, OAuthProviderDTO } from "@career-sync/shared";

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

    oAuthLogin: builder.mutation<
      UserResponseType,
      { idToken: string; provider: OAuthProviderDTO }
    >({
      query: (credentials) => ({
        url: `${path}/oauth-login`,
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

    // --- Delete User ---
    deleteLocalAccount: builder.mutation<
      { message: string },
      { id: string; password: string }
    >({
      query: ({ id, password }) => {
        return {
          url: `${path}/delete-user/${id}`,
          method: "POST",
          body: { password },
        };
      },
      extraOptions: {
        skipReauth: true,
      },
    }),

    deleteAccountOAuth: builder.mutation<
      { message: string },
      { id: string; idToken: string }
    >({
      query: ({ id, idToken }) => {
        console.log("idToken", id, idToken);
        return {
          url: `${path}/delete-user-oauth/${id}`,
          method: "POST",
          body: { idToken },
        };
      },
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Register ---
    register: builder.mutation<
      { message: string },
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
      { message: string },
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
      {
        userId: UserDTO["id"];
        email: UserDTO["email"];
        expiresIn: number;
        message: string;
      },
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
          dispatch(setUserId({ id: data.userId, email: data.email }));
        } catch (err) {
          console.error("Forgot password failed", err);
          dispatch(logout());
        }
      },
    }),

    // --- Refresh Reset Password ---
    refreshResetPassword: builder.mutation<
      { userId: UserDTO["id"]; email: UserDTO["email"]; expiresIn: number },
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
          dispatch(setUserId({ id: data.userId, email: data.email }));
        } catch (err) {
          console.error("Refresh reset password failed", err);
        }
      },
    }),

    // --- Verify Reset Password ---
    verifyResetPassword: builder.mutation<
      void,
      { userId: UserDTO["id"]; otp: string }
    >({
      query: ({ userId, otp }) => ({
        url: `${path}/reset/verify-reset-password/${userId}`,
        method: "POST",
        body: { otp },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    // --- Resend Reset Password Code ---
    resendResetVerificationCode: builder.mutation<
      { expiresIn: number; message: string },
      { userId: UserDTO["id"] }
    >({
      query: ({ userId }) => ({
        url: `${path}/reset/resend-reset-password/${userId}`,
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
        userId: UserDTO["id"];
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
  useOAuthLoginMutation,
  useUpdateUserMutation,
  useRegisterMutation,
  useUpdatePasswordMutation,
  useDeleteLocalAccountMutation,
  useDeleteAccountOAuthMutation,
  useForgotPasswordMutation,
  useVerifyResetPasswordMutation,
  useResendResetVerificationCodeMutation,
  useRefreshResetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
