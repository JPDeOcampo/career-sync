import { createApi } from "@reduxjs/toolkit/query/react";
import { JobApplication, JobQueryTypes } from "@career-sync/shared";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { formatDate } from "@/utils/dateHelper";
import { current } from "@reduxjs/toolkit";

const path = "/jobs";

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: baseQueryWithReauth,
  // tagTypes: ["Jobs"],
  endpoints: (builder) => ({
    // --- GET JOBS ---
    getJobs: builder.query<
      {
        jobs: JobApplication[];
        stats: {
          total: number;
          interviews: number;
          offers: number;
          rejected: number;
          applied: number;
          highPriority: number;
        };

        pagination?: { page: number; limit: number; totalPages: number };
      },
      {
        sort?: string;
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ sort, status, priority, page = 1, limit = 5 }) => ({
        url: path,
        method: "GET",
        params: { sort, status, priority, page, limit },
      }),
      // providesTags: (result) => [{ type: "Jobs", id: "LIST" }],
      transformResponse: (response: {
        jobs: JobApplication[];
        stats: {
          total: number;
          interviews: number;
          offers: number;
          rejected: number;
          applied: number;
          highPriority: number;
        };
        pagination: { page: number; limit: number; totalPages: number };
      }) => ({
        jobs: response.jobs.map((job) => ({
          ...job,
          applicationDate: job.applicationDate
            ? formatDate(job.applicationDate, "yyyy-MM-dd")
            : "",
          interviewStages:
            job.interviewStages?.map((stage) => ({
              ...stage,
              interviewDate: stage.interviewDate
                ? formatDate(stage.interviewDate, "yyyy-MM-dd")
                : "",
            })) ?? [],
        })),
        stats: response.stats,
        pagination: response.pagination,
      }),
    }),

    // --- ADD JOB ---
    addJob: builder.mutation<
      { data: JobApplication },
      { data: JobApplication; jobQuery: JobQueryTypes }
    >({
      query: ({ data }) => ({ url: path, method: "POST", body: data }),
      async onQueryStarted(
        { jobQuery },
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          const { data: response } = await queryFulfilled;
          let movingItem: JobApplication | undefined = response.data;
          let currentPage = 1;
          const limit = jobQuery.limit || 5;

          while (movingItem) {
            const pageQuery = { ...jobQuery, page: currentPage };
            const cacheState =
              jobsApi.endpoints.getJobs.select(pageQuery)(getState());

            if (!cacheState.data) break;

            let nextMovingItem: JobApplication | undefined = undefined;

            dispatch(
              jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
                // Add the moving item to the top of the current page
                draft.jobs.unshift(movingItem!);

                if (draft.jobs.length > limit) {
                  // Get a plain JS copy of the item before it leaves this closure
                  const poppedItem = draft.jobs.pop();
                  if (poppedItem) {
                    // Use current() to strip the Immer proxy
                    nextMovingItem = current(poppedItem);
                  }
                }

                // Update Stats & Pagination (using the original newJob data)
                if (draft.stats) {
                  draft.stats.total += 1;
                  const status = movingItem?.status?.toLowerCase();
                  if (status === "interview") draft.stats.interviews += 1;
                  else if (status === "offer") draft.stats.offers += 1;
                  else if (status === "rejected") draft.stats.rejected += 1;
                  else if (status === "applied") draft.stats.applied += 1;

                  if (movingItem?.priority?.toLowerCase() === "high") {
                    draft.stats.highPriority += 1;
                  }
                }

                if (draft.pagination) {
                  draft.pagination.totalPages = Math.ceil(
                    draft.stats.total / limit,
                  );
                }
              }),
            );

            movingItem = nextMovingItem;
            currentPage++;
          }
        } catch (err) {
          console.error("Waterfall update failed:", err);
        }
      },
    }),

    // --- UPDATE JOB ---
    updateJob: builder.mutation<
      { data: JobApplication },
      { id: string; data: JobApplication; jobQuery: JobQueryTypes }
    >({
      query: ({ id, data }) => ({
        url: `${path}/${id}`,
        method: "PATCH",
        body: data,
      }),

      // invalidatesTags: [{ type: "Jobs", id: "LIST" }],

      async onQueryStarted({ id, jobQuery }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            jobsApi.util.updateQueryData("getJobs", jobQuery, (draft) => {
              const index = draft.jobs.findIndex((j) => j.id === id);
              if (index !== -1) {
                draft.jobs[index] = data.data;
              }
            }),
          );
        } catch {
          console.error("Update job failed");
        }
      },
    }),
  }),
});

export const { useGetJobsQuery, useAddJobMutation, useUpdateJobMutation } =
  jobsApi;
