import { createApi } from "@reduxjs/toolkit/query/react";
import { JobApplication } from "@career-sync/shared";
import { setJobs } from "../slices/jobSlice";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const jobs = data.jobs ?? [];
          dispatch(setJobs(jobs));
        } catch (err) {
          console.log("Fetch jobs failed", err);
        }
      },
    }),
  }),
});

export const { useAddJobMutation, useGetJobsQuery } = jobsApi;
