import { createApi } from "@reduxjs/toolkit/query/react";
import { JobApplication } from "@career-sync/shared";
import { setJobs } from "../slices/jobSlice";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { formatDate } from "@/utils/dateHelper";

const path = "/jobs";

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    addJob: builder.mutation<
      JobApplication,
      {
        id: string;
        company: string;
        roleTitle: string;
        jobDescription: string;
        jobType: string;
        salary: string;
        workSetup: string;
        workSchedule: string;
        location: string;
        jobLink: string;
        applicationMethod: string;
        applicationDate: string;
        status: string;
        priority: string;
        cvId: string;
        coverLetterId: string;
        contact: string;
        interviewStages: string;
        offer: boolean;
        notes: string;
      }
    >({
      query: (credentials) => ({
        url: path,
        method: "POST",
        body: credentials,
      }),
    }),

    // --- get jobs ---
    getJobs: builder.query<
      { jobs: JobApplication[] },
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
        params: {
          sort,
          status,
          priority,
          page,
          limit,
        },
      }),
      transformResponse: (response: { jobs: JobApplication[] }) => {
        return {
          ...response,
          jobs: (response.jobs ?? []).map((job) => ({
            ...job,
            // Convert ISO "2026-02-15T..." to "2026-02-15" for HTML Date inputs
            applicationDate: job.applicationDate
              ? formatDate(job.applicationDate, "yyyy-MM-dd")
              : "",

            // Clean up nested interview dates as well
            interviewStages:
              job.interviewStages?.map((stage) => ({
                ...stage,
                interviewDate: stage.interviewDate
                  ? formatDate(stage.interviewDate, "yyyy-MM-dd")
                  : "",
              })) ?? [],
          })),
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setJobs(data.jobs));
        } catch (err) {
          console.log("Fetch jobs failed", err);
        }
      },
    }),
  }),
});

export const { useAddJobMutation, useGetJobsQuery } = jobsApi;
