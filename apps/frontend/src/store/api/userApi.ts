import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setUser, updateSettings } from "../slices/authSlice";

const path = "/user";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /* --- -- UPDATE PROFILE -- --- */
    updateProfile: builder.mutation<
      {
        firstName: string;
        lastName: string;
        email: string;
      },
      {
        id: string;
        firstName: string;
        lastName: string;
      }
    >({
      query: ({ id, firstName, lastName }) => ({
        url: `${path}/update-profile/${id}`,
        method: "PUT",
        body: { firstName, lastName },
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

    updateSettings: builder.mutation<
      {
        settings: { darkMode: boolean };
      },
      {
        id: string;
        darkMode: boolean;
      }
    >({
      query: ({ id, darkMode }) => ({
        url: `${path}/update-settings/${id}`,
        method: "PUT",
        body: { darkMode },
      }),
      extraOptions: {
        skipReauth: true,
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateSettings(data));
        } catch (err) {
          console.error("Update user failed", err);
        }
      },
    }),
  }),
});

export const {
  /* --- -- UPDATE PROFILE -- --- */
  useUpdateProfileMutation,

  /* --- -- UPDATE SETTINGS -- --- */
  useUpdateSettingsMutation,
} = userApi;
