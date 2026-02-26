import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserType } from "@/@types/userTypes";
import { login, logout } from "../slices/authSlice";
import apiPath from "@/utils/apiPath";

interface ResponseType {
  user: UserType;
  accessToken: string;
}
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiPath.USER_REFRESH_TOKEN.endpoint,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getMe: builder.query<ResponseType, void>({
      query: () => "",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        console.log("test................");
        try {
          const { data } = await queryFulfilled;
          console.log(data, "test");
          dispatch(login(data));
        } catch (err) {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const { useGetMeQuery } = authApi;
