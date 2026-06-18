import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setUserId, logout } from "../slices/authSlice";
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
    /* --- -- REGISTER -- --- */
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
        url: `${path}/signup`,
        method: "POST",
        body: credentials,
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    /* --- -- LOGIN -- --- */
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

    /* --- -- FORGOT PASSWORD -- --- */
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

    /* --- -- REFRESH RESET PASSWORD -- --- */
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

    /* --- -- VERIFY RESET PASSWORD -- --- */
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

    /* --- -- RESEND RESET PASSWORD CODE -- --- */
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

    /* --- -- RESET PASSWORD -- --- */
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

    /* --- -- UPDATE EMAIL -- --- */
    updateEmail: builder.mutation<
      {
        email: string;
      },
      {
        id: string;
        email: string;
      }
    >({
      query: ({ id, email }) => ({
        url: `${path}/update-email/${id}`,
        method: "POST",
        body: { email },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    removeNewEmail: builder.mutation<
      {
        message: string;
      },
      {
        id: string;
        email: string;
      }
    >({
      query: ({ id, email }) => ({
        url: `${path}/remove-new-email/${id}`,
        method: "POST",
        body: { email },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    /* --- -- RESEND EMAIL VERIFICATION -- --- */
    resendVerificationEmail: builder.mutation<
      { message: string },
      { id: string; email: string }
    >({
      query: ({ id, email }) => ({
        url: `${path}/resend-verification-email/${id}`,
        method: "POST",
        body: { email },
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),

    /* --- -- UPDATE USER PASSWORD -- --- */
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

    /* --- -- DELETE LOCAL USER -- --- */
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

    /* --- -- DELETE OAUTH USER -- --- */
    deleteAccountOAuth: builder.mutation<
      { message: string },
      { id: string; idToken: string }
    >({
      query: ({ id, idToken }) => {
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

    /* --- -- LOGOUT -- --- */
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${path}/single-logout`,
        method: "POST",
      }),
      extraOptions: {
        skipReauth: true,
      },
    }),
  }),
});

export const {
  /* --- -- REGISTER -- --- */
  useRegisterMutation,

  /* --- -- LOGIN -- --- */
  useLoginMutation,

  /* --- -- OAUTH LOGIN -- --- */
  useOAuthLoginMutation,

  /* --- -- FORGOT PASSWORD -- --- */
  useForgotPasswordMutation,
  useVerifyResetPasswordMutation,
  useResendResetVerificationCodeMutation,
  useRefreshResetPasswordMutation,
  useResetPasswordMutation,

  /* --- -- UPDATE EMAIL-- --- */
  useUpdateEmailMutation,
  useRemoveNewEmailMutation,

  /* --- -- RESEND EMAIL VERIFICATION -- --- */
  useResendVerificationEmailMutation,

  /* --- -- UPDATE USER PASSWORD -- --- */
  useUpdatePasswordMutation,

  /* --- -- DELETE USER -- --- */
  useDeleteLocalAccountMutation,
  useDeleteAccountOAuthMutation,

  /* --- -- LOGOUT -- --- */
  useLogoutMutation,
} = authApi;
