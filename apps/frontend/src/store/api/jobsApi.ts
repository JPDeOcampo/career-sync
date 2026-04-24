import { createApi } from "@reduxjs/toolkit/query/react";
import { JobApplication, JobQueryTypes, formatDate } from "@career-sync/shared";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
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

const isWithinDays = (date: string | Date, days: number): boolean => {
  const parsed = new Date(String(date).replace(/\//g, "-"));
  if (isNaN(parsed.getTime())) return false;

  const diff = Date.now() - parsed.getTime();
  const limit = days * 24 * 60 * 60 * 1000;

  return diff >= 0 && diff <= limit;
};

// --- STATS HELPERS ---
const applyStatDelta = (
  stats: JobsResponse["stats"],
  job: JobApplication,
  delta: 1 | -1,
) => {
  switch (job.status?.toLowerCase()) {
    case "interview":
      stats.interviews += delta;
      break;
    case "offer":
      stats.offers += delta;
      break;
    case "rejected":
      stats.rejected += delta;
      break;
    case "applied":
      stats.applied += delta;
      break;
  }

  if (job.priority?.toLowerCase() === "high") {
    stats.highPriority += delta;
  }
};

// SAFE version
const updateJobStats = (
  draft: JobsResponse,
  oldJob: JobApplication | null,
  newJob: JobApplication | null,
  limit?: number,
) => {
  if (!draft.stats) return;

  if (oldJob && newJob) {
    // Only adjust status counts (total unchanged)
    applyStatDelta(draft.stats, oldJob, -1);
    applyStatDelta(draft.stats, newJob, 1);
  } else if (oldJob) {
    applyStatDelta(draft.stats, oldJob, -1);
    draft.stats.total -= 1;
  } else if (newJob) {
    applyStatDelta(draft.stats, newJob, 1);
    draft.stats.total += 1;
  }

  if (draft.pagination && limit) {
    draft.pagination.totalPages = Math.ceil(draft.stats.total / limit);
  }
};

const matchesQuery = (job: JobApplication, query: JobQueryTypes): boolean => {
  if (query.sort === "recent") return false;

  if (query.status && query.status !== "All" && job.status !== query.status)
    return false;

  if (
    query.priority &&
    query.priority !== "All" &&
    job.priority !== query.priority
  )
    return false;

  if (query.search) {
    const search = query.search.toLowerCase();
    const target = `${job.roleTitle} ${job.company}`.toLowerCase();
    if (!target.includes(search)) return false;
  }

  return true;
};

const isGetJobsQuery = (
  q: unknown,
): q is { endpointName: "getJobs"; originalArgs: JobQueryTypes } =>
  typeof q === "object" &&
  q !== null &&
  "endpointName" in q &&
  (q as { endpointName?: string }).endpointName === "getJobs" &&
  "originalArgs" in q;

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Jobs"],
  endpoints: (builder) => ({
    // --- GET JOBS ---
    getJobs: builder.query<JobsResponse, JobQueryTypes>({
      query: ({ sort, status, search, priority, page = 1, limit = 5 }) => ({
        url: path,
        method: "GET",
        params: { sort, status, search, priority, page, limit },
      }),
      providesTags: () => [{ type: "Jobs", id: "LIST" }],
      transformResponse: (response: JobsResponse) => ({
        jobs: response.jobs.map((job) => ({
          ...job,
          applicationDate: job.applicationDate,
          // ? formatDate(job.applicationDate, "yyyy-MM-dd")
          // : "",
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
      { data: JobApplication }
    >({
      query: ({ data }) => ({ url: path, method: "POST", body: data }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const addedJob = response.data;

          const state = getState();
          const queries = state[jobsApi.reducerPath].queries;

          Object.values(queries).forEach((q) => {
            if (!isGetJobsQuery(q)) return;

            const args = q.originalArgs;
            const limit = args.limit ?? 5;

            if (args.sort === "recent") {
              if (isWithinDays(addedJob.applicationDate, 7)) {
                dispatch(
                  jobsApi.util.updateQueryData("getJobs", args, (draft) => {
                    updateJobStats(draft, null, addedJob, limit);
                  }),
                );
              }
              return;
            }

            // Determine if job should be inserted
            const isAllPage =
              (!args.status || args.status === "All") &&
              (!args.priority || args.priority === "All");
            const shouldInsert = isAllPage || matchesQuery(addedJob, args);

            if (!shouldInsert) return; // skip caches that don't match

            let movingItem: JobApplication | undefined = addedJob;
            let currentPage = 1;

            // Waterfall insertion
            while (movingItem) {
              const pageQuery = { ...args, page: currentPage };
              const cacheState =
                jobsApi.endpoints.getJobs.select(pageQuery)(state);

              if (!cacheState.data) break;

              let nextMovingItem: JobApplication | undefined;

              dispatch(
                jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
                  if (draft.jobs.some((job) => job.id === movingItem!.id))
                    return;

                  draft.jobs.unshift(movingItem!);

                  // Waterfall: push overflow to next page
                  if (draft.jobs.length > limit) {
                    const popped = draft.jobs.pop();
                    if (popped) nextMovingItem = current(popped);
                  }

                  // Update stats only for the new job
                  updateJobStats(draft, null, addedJob, limit);
                }),
              );

              movingItem = nextMovingItem;
              currentPage++;
            }
          });
        } catch (err) {
          console.error("Add job failed:", err);
        }
      },
    }),

    // --- UPDATE JOB ---
    updateJob: builder.mutation<
      { data: JobApplication },
      { id: string; data: JobApplication; isKanban?: boolean }
    >({
      query: ({ id, data }) => ({
        url: `${path}/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(
        { id, data, isKanban = false },
        { dispatch, getState, queryFulfilled },
      ) {
        const state = getState();
        const queries = state[jobsApi.reducerPath].queries;
        const patchResults: Array<{ undo: () => void }> = [];

        // Find the original job from any cached page before we start mutating
        let originalJob: JobApplication | null = null;
        for (const q of Object.values(queries)) {
          if (!isGetJobsQuery(q)) continue;
          const cache = jobsApi.endpoints.getJobs.select(q.originalArgs)(state);
          const found = cache.data?.jobs.find((j) => j.id === id);
          if (found) {
            originalJob = { ...found };
            break;
          }
        }

        const applyUpdate = (
          draft: JobsResponse,
          args: JobQueryTypes,
          updatedJob: JobApplication,
          updateStats: boolean,
        ) => {
          const index = draft.jobs.findIndex((j) => j.id === id);
          const didExist = index !== -1;
          const shouldExist = matchesQuery(updatedJob, args);

          if (didExist && shouldExist) {
            draft.jobs[index] = updatedJob;
            if (updateStats) updateJobStats(draft, originalJob, updatedJob);
          } else if (didExist && !shouldExist) {
            draft.jobs.splice(index, 1);
            if (updateStats) updateJobStats(draft, originalJob, updatedJob);
          } else if (!didExist && shouldExist) {
            draft.jobs.unshift(updatedJob);
            if (updateStats) updateJobStats(draft, originalJob, updatedJob);
            if (args.limit && draft.jobs.length > args.limit) draft.jobs.pop();
          }

          draft.jobs.sort((a, b) =>
            args.sort === "oldest"
              ? new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
          );
        };

        const handleRecentWaterfall = (
          updatedJob: JobApplication,
          collect: boolean,
        ) => {
          const withinDays = isWithinDays(updatedJob.applicationDate, 7);

          // Get all recent queries grouped by their filter key (excluding page)
          const recentQueries: JobQueryTypes[] = [];
          Object.values(queries).forEach((q) => {
            if (!isGetJobsQuery(q)) return;
            if (q.originalArgs.sort !== "recent") return;
            recentQueries.push(q.originalArgs);
          });

          if (!recentQueries.length) return;

          // Use first recent query as base args (same filter, different pages)
          const baseArgs = recentQueries[0];
          const limit = baseArgs.limit ?? 5;

          // Find which page the job is currently on
          let jobPage: number | null = null;
          recentQueries.forEach((args) => {
            const cache = jobsApi.endpoints.getJobs.select(args)(state);
            if (cache.data?.jobs.some((j) => j.id === id)) {
              jobPage = args.page ?? 1;
            }
          });

          if (!withinDays && jobPage !== null) {
            // --- REMOVE + WATERFALL UP ---
            // Remove from its page, pull first item from next page up to fill gap
            let currentPage = jobPage;

            while (true) {
              const currentPageArgs = { ...baseArgs, page: currentPage };
              const nextPageArgs = { ...baseArgs, page: currentPage + 1 };
              const nextCache =
                jobsApi.endpoints.getJobs.select(nextPageArgs)(state);
              const promotedItem = nextCache.data?.jobs[0];

              const result = dispatch(
                jobsApi.util.updateQueryData(
                  "getJobs",
                  currentPageArgs,
                  (draft) => {
                    if (currentPage === jobPage) {
                      // Remove the job from this page
                      const i = draft.jobs.findIndex((j) => j.id === id);
                      if (i !== -1) draft.jobs.splice(i, 1);

                      // Update stats only once
                      if (collect)
                        updateJobStats(draft, originalJob, updatedJob);
                    }

                    // Pull promoted item from next page to fill gap
                    if (
                      promotedItem &&
                      !draft.jobs.some((j) => j.id === promotedItem.id)
                    ) {
                      draft.jobs.push(promotedItem);
                    }
                  },
                ),
              );

              if (collect) patchResults.push(result);

              if (!promotedItem) break;

              // Remove promoted item from next page
              const nextResult = dispatch(
                jobsApi.util.updateQueryData(
                  "getJobs",
                  nextPageArgs,
                  (draft) => {
                    const i = draft.jobs.findIndex(
                      (j) => j.id === promotedItem.id,
                    );
                    if (i !== -1) draft.jobs.splice(i, 1);
                  },
                ),
              );

              if (collect) patchResults.push(nextResult);

              // Stop if next page still has enough items after removal
              if ((nextCache.data?.jobs.length ?? 0) - 1 >= limit) break;

              currentPage++;
            }
          } else if (withinDays && jobPage === null) {
            // --- ADD + WATERFALL DOWN ---
            // Not in recent yet, insert at page 1 and cascade overflow down
            let movingItem: JobApplication | undefined = updatedJob;
            let currentPage = 1;

            while (movingItem) {
              const pageArgs = { ...baseArgs, page: currentPage };
              const cache = jobsApi.endpoints.getJobs.select(pageArgs)(state);
              if (!cache.data) break;

              let nextMovingItem: JobApplication | undefined;

              const result = dispatch(
                jobsApi.util.updateQueryData("getJobs", pageArgs, (draft) => {
                  if (draft.jobs.some((j) => j.id === movingItem!.id)) return;

                  draft.jobs.unshift(movingItem!);

                  if (draft.jobs.length > limit) {
                    const popped = draft.jobs.pop();
                    if (popped) nextMovingItem = current(popped);
                  }

                  // Update stats only on page 1
                  if (currentPage === 1 && collect) {
                    updateJobStats(draft, originalJob, updatedJob);
                  }
                }),
              );

              if (collect) patchResults.push(result);

              movingItem = nextMovingItem;
              currentPage++;
            }
          } else if (withinDays && jobPage !== null) {
            // --- UPDATE IN PLACE ---
            const pageArgs = { ...baseArgs, page: jobPage };
            const result = dispatch(
              jobsApi.util.updateQueryData("getJobs", pageArgs, (draft) => {
                const i = draft.jobs.findIndex((j) => j.id === id);
                if (i !== -1) draft.jobs[i] = updatedJob;
                if (collect) updateJobStats(draft, originalJob, updatedJob);
              }),
            );
            if (collect) patchResults.push(result);
          } else {
            // !withinDays && jobPage === null
            // Not in recent list and date outside 7 days → no list change, but still update stats
            const firstRecentArgs = { ...baseArgs, page: 1 };
            const result = dispatch(
              jobsApi.util.updateQueryData(
                "getJobs",
                firstRecentArgs,
                (draft) => {
                  if (collect) updateJobStats(draft, originalJob, updatedJob);
                },
              ),
            );
            if (collect) patchResults.push(result);
          }
        };

        const runUpdate = (updatedJob: JobApplication, collect = false) => {
          Object.values(queries).forEach((q) => {
            if (!isGetJobsQuery(q)) return;

            // Skip recent queries — handled separately by handleRecentWaterfall
            if (q.originalArgs.sort === "recent") return;

            const result = dispatch(
              jobsApi.util.updateQueryData(
                "getJobs",
                q.originalArgs,
                (draft) => {
                  applyUpdate(draft, q.originalArgs, updatedJob, collect);
                },
              ),
            );

            if (collect) patchResults.push(result);
          });

          // Handle recent caches separately with waterfall logic
          handleRecentWaterfall(updatedJob, collect);
        };

        // Optimistic: update UI + stats for kanban only
        if (isKanban) {
          runUpdate(data, true);
        }

        try {
          const { data: response } = await queryFulfilled;
          // Reconcile: sync job data only, skip stats (already applied)
          runUpdate(response.data, false);
        } catch (err) {
          console.error("Update job failed:", err);
          patchResults.forEach((p) => p.undo());
        }
      },
    }),

    // --- DELETE JOB ---
    deleteJob: builder.mutation<void, { ids: string[] }>({
      query: ({ ids }) => ({
        url: path,
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Jobs", id: "LIST" }],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useAddJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobsApi;
