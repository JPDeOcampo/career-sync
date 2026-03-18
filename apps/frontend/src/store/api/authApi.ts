import { createApi } from "@reduxjs/toolkit/query/react";
import { UserType } from "@/@types/userTypes";
import { logout, setUserId } from "../slices/authSlice";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

const path = "/auth";

interface UserResponseType {
  user: UserType;
  accessToken: string;
}
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    userLogin: builder.mutation<
      UserResponseType,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: `${path}/login`,
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
        url: `${path}/register`,
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
        url: `${path}/forgot-password`,
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
        url: `${path}/reset/refresh-reset-password`,
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
        url: `${path}/reset/verify-reset-password/${userId}`,
        method: "POST",
        body: { verificationCode },
      }),
    }),
    userResendResetVerificationCode: builder.mutation<
      void,
      { userId?: UserType["userId"] }
    >({
      query: (userId) => ({
        url: `${path}/reset/resend-reset-verification-code/${userId}`,
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
        url: `${path}/reset/reset-password/${userId}`,
        method: "POST",
        body: { newPassword, confirmPassword },
      }),
    }),

    singleLogout: builder.mutation<void, void>({
      query: () => ({
        url: `${path}/single-logout`,
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
  useSingleLogoutMutation,
} = authApi;
