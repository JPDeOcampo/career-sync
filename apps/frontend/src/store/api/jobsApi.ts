import { createApi } from "@reduxjs/toolkit/query/react";
import { JobApplication, JobQueryTypes } from "@career-sync/shared";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { formatDate } from "@/utils/dateHelper";
import { current } from "@reduxjs/toolkit";

const path = "/jobs";

interface JobsResponse {
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
}

const updateJobStats = (
  draft: JobsResponse,
  oldJob: JobApplication | null,
  newJob: JobApplication | null,
  limit?: number,
) => {
  if (!draft.stats) return;

  const applyDelta = (job: JobApplication, delta: 1 | -1) => {
    const status = job.status?.toLowerCase();
    switch (status) {
      case "interview":
        draft.stats!.interviews += delta;
        break;
      case "offer":
        draft.stats!.offers += delta;
        break;
      case "rejected":
        draft.stats!.rejected += delta;
        break;
      case "applied":
        draft.stats!.applied += delta;
        break;
    }

    if (job.priority?.toLowerCase() === "high") {
      draft.stats!.highPriority += delta;
    }
  };

  if (oldJob) {
    applyDelta(oldJob, -1);
    draft.stats.total -= 1;
  }

  if (newJob) {
    applyDelta(newJob, 1);
    draft.stats.total += 1;
  }

  if (draft.pagination && limit) {
    draft.pagination.totalPages = Math.ceil(draft.stats.total / limit);
  }
};

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: baseQueryWithReauth,
  // tagTypes: ["Jobs"],
  endpoints: (builder) => ({
    // --- GET JOBS ---
    getJobs: builder.query<
      JobsResponse,
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
      transformResponse: (response: JobsResponse) => ({
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
          const addedJob = response.data;
          let movingItem: JobApplication | undefined = addedJob;
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
                draft.jobs.unshift(movingItem!);
                if (draft.jobs.length > limit) {
                  const popped = draft.jobs.pop();
                  if (popped) nextMovingItem = current(popped);
                }

                /** * Update Stats
                 * Only pass addedJob to 'newJob' parameter.
                 * DO NOT pass 'popped' to 'oldJob' because the job isn't deleted,
                 * it's just moving to another page. The global total remains +1.
                 */
                updateJobStats(draft, null, addedJob, limit);
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

      // --- UPDATE JOB ---
      async onQueryStarted({ id, jobQuery }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedJob = response.data;

          dispatch(
            jobsApi.util.updateQueryData("getJobs", jobQuery, (draft) => {
              const index = draft.jobs.findIndex((j) => j.id === id);
              if (index !== -1) {
                const oldJob = current(draft.jobs[index]);
                draft.jobs[index] = updatedJob;

                // updateJobStats handles the -1 for old and +1 for new automatically
                updateJobStats(draft, oldJob, updatedJob);
              } else {
                // If the job wasn't on this specific page, update the stats
                // because the stats are global/shared across headers
                updateJobStats(draft, null, updatedJob);
                // If oldJob isn't in this cache, it need the old status from somewhere else to do the delta.
              }
            }),
          );
        } catch (err) {
          console.error("Update job failed", err);
        }
      },
    }),

    // --- DELETE JOB ---
    deleteJob: builder.mutation<void, { id: string; jobQuery: JobQueryTypes }>({
      query: ({ id }) => ({
        url: `${path}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { id, jobQuery },
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          await queryFulfilled;

          let currentPage = 1;
          let nextItemToPull: JobApplication | undefined = undefined;
          const limit = jobQuery.limit || 5;

          while (true) {
            const pageQuery = { ...jobQuery, page: currentPage };
            const cacheState = jobsApi.endpoints.getJobs.select(pageQuery)(
              getState() as any,
            );

            // Stop if the page isn't cached
            if (!cacheState.data) break;

            const jobsOnThisPage = cacheState.data.jobs;
            const indexOnThisPage = jobsOnThisPage.findIndex(
              (j) => j.id === id,
            );

            // If the ID isn't on this page AND haven't started pulling from a previous deletion,
            // Skip to the next page to find where the item actually was.
            if (indexOnThisPage === -1 && !nextItemToPull) {
              currentPage++;
              continue;
            }

            // Capture the item to fill the gap in this page (from the NEXT page's start)
            const nextPageQuery = { ...jobQuery, page: currentPage + 1 };
            const nextCache =
              jobsApi.endpoints.getJobs.select(nextPageQuery)(getState());

            let fetchedNextItem: JobApplication | undefined = undefined;
            if (nextCache.data && nextCache.data.jobs.length > 0) {
              fetchedNextItem = current(nextCache.data.jobs[0]);
            }

            dispatch(
              jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
                let deletedJob: JobApplication | null = null;

                // If the target is here, remove it
                const localIndex = draft.jobs.findIndex((j) => j.id === id);
                if (localIndex !== -1) {
                  deletedJob = current(draft.jobs[localIndex]);
                  draft.jobs.splice(localIndex, 1);
                }

                // If have an item carried over from the NEXT page, push it to the end of THIS page
                if (fetchedNextItem) {
                  draft.jobs.push(fetchedNextItem);
                }

                // Pass the deletedJob to decrement stats if it was found on this page
                updateJobStats(draft, deletedJob, null, limit);
              }),
            );

            // Move to next iteration
            nextItemToPull = fetchedNextItem;
            currentPage++;

            // Stop the loop if there's nothing left to "pull" forward
            if (!nextItemToPull) break;
          }
        } catch (err) {
          console.error("Delete waterfall failed:", err);
        }
      },
    }),
  }),
});

export const { useGetJobsQuery, useAddJobMutation, useUpdateJobMutation } =
  jobsApi;
