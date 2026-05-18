import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import {
  setDocuments,
  setLoadMoreDocuments,
  setPagination,
} from "../slices/documentSlice";
import { Documents } from "@career-sync/shared";
import axios from "axios";
import { BASE_URL } from "@/utils/apiPath";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "../store";
import { isGetJobsQuery, JobsResponse } from "./jobsApi";
import { jobsApi } from "./jobsApi";

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
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<
      { data: Documents },
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
      {
        documents: Documents[];
        pagination: {
          page: number;
          limit: number;
          totalPages: number;
          total: number;
        };
      },
      {
        fileId?: string;
        sort?: string;
        page?: number;
        search?: string;
        fileType?: string;
        limit?: number;
      }
    >({
      query: ({ fileId, sort, page, search, fileType, limit }) => ({
        url: path,
        method: "GET",
        params: {
          sort,
          page,
          limit,
          search,
          fileType,
          fileId,
        },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const { page } = args;
        try {
          const { data } = await queryFulfilled;
          if (page && page === 1) {
            dispatch(setDocuments(data.documents));
          } else {
            dispatch(setLoadMoreDocuments(data.documents));
          }

          dispatch(setPagination(data.pagination));
        } catch (err) {
          console.log("Fetch jobs failed", err);
        }
      },
    }),
    deleteDocuments: builder.mutation<void, { ids: string[] }>({
      query: ({ ids }) => ({
        url: `${path}/delete`,
        method: "DELETE",
        body: { fileId: ids },
      }),
      async onQueryStarted({ ids }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;

        const queries = state.jobsApi.queries;

        const patchResults: Array<{ undo: () => void }> = [];

        Object.values(queries).forEach((q) => {
          if (!isGetJobsQuery(q)) return;

          const result = dispatch(
            jobsApi.util.updateQueryData(
              "getJobs",
              q.originalArgs,
              (draft: JobsResponse) => {
                draft.jobs.forEach((job) => {
                  const shouldRemoveCv =
                    job.cvId != null && ids.includes(job.cvId);

                  const shouldRemoveCoverLetter =
                    job.coverLetterId != null &&
                    ids.includes(job.coverLetterId);

                  if (shouldRemoveCv) {
                    job.cvId = undefined;
                    job.cv = undefined;
                  }

                  if (shouldRemoveCoverLetter) {
                    job.coverLetterId = undefined;
                    job.coverLetter = undefined;
                  }
                });
              },
            ),
          );

          patchResults.push(result);
        });

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((p) => p.undo());
        }
      },
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useLazyGetDocumentsQuery,
  useDeleteDocumentsMutation,
} = documentApi;
