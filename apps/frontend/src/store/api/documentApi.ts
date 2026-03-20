import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { setDocuments } from "../slices/documentSlice";
import { DocumentType } from "@/@types/document.types";
import axios from "axios";
import { BASE_URL } from "@/utils/apiPath";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const toRtkError = (err: unknown): FetchBaseQueryError => {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      return {
        status: err.response.status,
        data: err.response.data,
      };
    }

    return {
      status: "FETCH_ERROR",
      error: err.message,
    };
  }

  return {
    status: "FETCH_ERROR",
    error: err instanceof Error ? err.message : "Unknown error",
  };
};

const path = "/document";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<
      { data: DocumentType },
      { formData: FormData; onProgress: (p: number) => void }
    >({
      queryFn: async ({ formData, onProgress }, api) => {
        try {
          const token = (api.getState() as { auth?: { accessToken?: string } })
            .auth?.accessToken;

          const res = await axios.post(`${BASE_URL}${path}/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },

            onUploadProgress: (e) => {
              if (e.total) {
                const percent = Math.round((e.loaded * 100) / e.total);
                onProgress(percent);
              }
            },
          });

          return { data: res.data };
        } catch (err: unknown) {
          return {
            error: toRtkError(err),
          };
        }
      },
    }),
    getDocuments: builder.query<
      { documents: DocumentType[] },
      {
        sort?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ sort, page, limit }) => ({
        url: path,
        method: "GET",
        params: {
          sort,
          page,
          limit,
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const sortedDocuments = [...data.documents].sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime(),
          );
          dispatch(setDocuments(sortedDocuments));
        } catch (err) {
          console.log("Fetch jobs failed", err);
        }
      },
    }),
  }),
});

export const { useUploadDocumentMutation, useLazyGetDocumentsQuery } =
  documentApi;
