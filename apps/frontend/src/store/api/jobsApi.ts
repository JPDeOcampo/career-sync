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
    getJobs: builder.query<JobsResponse, JobQueryTypes>({
      query: ({ sort, status, search, priority, page = 1, limit = 5 }) => ({
        url: path,
        method: "GET",
        params: { sort, status, search, priority, page, limit },
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
      { data: JobApplication }
    >({
      query: ({ data }) => ({ url: path, method: "POST", body: data }),
      // async onQueryStarted(
      //   { jobQuery },
      //   { dispatch, queryFulfilled, getState },
      // ) {
      //   try {
      //     const { data: response } = await queryFulfilled;
      //     const addedJob = response.data;
      //     let movingItem: JobApplication | undefined = addedJob;
      //     let currentPage = 1;
      //     const limit = jobQuery.limit || 5;

      //     while (movingItem) {
      //       const pageQuery = { ...jobQuery, page: currentPage };
      //       const cacheState =
      //         jobsApi.endpoints.getJobs.select(pageQuery)(getState());

      //       if (!cacheState.data) break;

      //       let nextMovingItem: JobApplication | undefined = undefined;

      //       dispatch(
      //         jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
      //           draft.jobs.unshift(movingItem!);
      //           if (draft.jobs.length > limit) {
      //             const popped = draft.jobs.pop();
      //             if (popped) nextMovingItem = current(popped);
      //           }

      //           /** * Update Stats
      //            * Only pass addedJob to 'newJob' parameter.
      //            * DO NOT pass 'popped' to 'oldJob' because the job isn't deleted,
      //            * it's just moving to another page. The global total remains +1.
      //            */
      //           updateJobStats(draft, null, addedJob, limit);
      //         }),
      //       );

      //       movingItem = nextMovingItem;
      //       currentPage++;
      //     }
      //   } catch (err) {
      //     console.error("Waterfall update failed:", err);
      //   }
      // },
      // async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
      //   try {
      //     const { data: response } = await queryFulfilled;
      //     const addedJob = response.data;

      //     const state = getState();
      //     const queries = state[jobsApi.reducerPath].queries;

      //     // --- TYPE GUARD ---
      //     const isGetJobsQuery = (
      //       q: unknown,
      //     ): q is {
      //       endpointName: "getJobs";
      //       originalArgs: JobQueryTypes;
      //     } => {
      //       return (
      //         typeof q === "object" &&
      //         q !== null &&
      //         "endpointName" in q &&
      //         (q as { endpointName?: string }).endpointName === "getJobs" &&
      //         "originalArgs" in q
      //       );
      //     };

      //     // --- FILTER FUNCTION ---
      //     const matchesQuery = (
      //       job: JobApplication,
      //       query: JobQueryTypes,
      //     ): boolean => {
      //       if (query.status && job.status !== query.status) return false;
      //       if (query.priority && job.priority !== query.priority) return false;

      //       if (query.search) {
      //         const search = query.search.toLowerCase();
      //         const target = `${job.roleTitle} ${job.company}`.toLowerCase();
      //         if (!target.includes(search)) return false;
      //       }

      //       return true;
      //     };

      //     // --- GROUP QUERIES BY FILTER (excluding page) ---
      //     const grouped = new Map<string, JobQueryTypes[]>();

      //     Object.values(queries).forEach((q) => {
      //       if (!isGetJobsQuery(q)) return;

      //       const { page = 1, ...rest } = q.originalArgs;

      //       const key = JSON.stringify(rest);

      //       if (!grouped.has(key)) {
      //         grouped.set(key, []);
      //       }

      //       grouped.get(key)!.push(q.originalArgs);
      //     });

      //     // --- PROCESS EACH FILTER GROUP ---
      //     grouped.forEach((queryList) => {
      //       // sort pages (1 → N)
      //       const sortedQueries = queryList.sort(
      //         (a, b) => (a.page ?? 1) - (b.page ?? 1),
      //       );

      //       const baseQuery = sortedQueries[0];

      //       // skip if doesn't match filter
      //       if (!matchesQuery(addedJob, baseQuery)) return;

      //       let movingItem: JobApplication | undefined = addedJob;

      //       for (let i = 0; i < sortedQueries.length && movingItem; i++) {
      //         const pageQuery = sortedQueries[i];
      //         const limit = pageQuery.limit ?? 5;

      //         let nextMovingItem: JobApplication | undefined;

      //         dispatch(
      //           jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
      //             draft.jobs.unshift(movingItem!);

      //             if (draft.jobs.length > limit) {
      //               const popped = draft.jobs.pop();
      //               if (popped) nextMovingItem = popped;
      //             }

      //             updateJobStats(draft, null, addedJob, limit);
      //           }),
      //         );

      //         movingItem = nextMovingItem;
      //       }
      //     });
      //   } catch (err) {
      //     console.error("Add job waterfall failed:", err);
      //   }
      // },
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const addedJob = response.data;

          const state = getState();
          const queries = state[jobsApi.reducerPath].queries;

          // Type guard for getJobs queries
          const isGetJobsQuery = (
            q: unknown,
          ): q is { endpointName: "getJobs"; originalArgs: JobQueryTypes } =>
            typeof q === "object" &&
            q !== null &&
            "endpointName" in q &&
            (q as { endpointName?: string }).endpointName === "getJobs" &&
            "originalArgs" in q;

          // Filter matching function
          const matchesQuery = (job: JobApplication, query: JobQueryTypes) => {
            if (query.status && job.status !== query.status) return false;
            if (query.priority && job.priority !== query.priority) return false;
            return true;
          };

          // Iterate all cached getJobs queries
          Object.values(queries).forEach((q) => {
            if (!isGetJobsQuery(q)) return;

            const args = q.originalArgs;
            const limit = args.limit ?? 5;

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
                  const alreadyExists = draft.jobs.some(
                    (job) => job.id === movingItem!.id,
                  );

                  if (alreadyExists) return;
                  // Insert at the top
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
          console.error("Add job waterfall failed:", err);
        }
      },
    }),

    // --- UPDATE JOB ---
    updateJob: builder.mutation<
      { data: JobApplication },
      { id: string; data: JobApplication }
    >({
      query: ({ id, data }) => ({
        url: `${path}/${id}`,
        method: "PATCH",
        body: data,
      }),

      // invalidatesTags: [{ type: "Jobs", id: "LIST" }],

      // --- UPDATE JOB ---
      // async onQueryStarted({ id, jobQuery }, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data: response } = await queryFulfilled;
      //     const updatedJob = response.data;
      //     dispatch(
      //       jobsApi.util.updateQueryData("getJobs", jobQuery, (draft) => {
      //         const index = draft.jobs.findIndex((j) => j.id === id);
      //         const oldJob = index !== -1 ? draft.jobs[index] : null;
      //         console.log("OLD JOB", oldJob);
      //         console.log("UPDATED JOB", updatedJob);
      //         if (index !== -1) {
      //           draft.jobs[index] = updatedJob;
      //         }
      //         updateJobStats(draft, oldJob, updatedJob);
      //       }),
      //     );
      //   } catch (err) {
      //     console.error("Update job failed", err);
      //   }
      // },
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedJob = response.data;

          const state = getState();

          const queries = state[jobsApi.reducerPath].queries;

          Object.values(queries).forEach((q) => {
            if (q?.endpointName !== "getJobs" || !q.originalArgs) return;

            const args = q.originalArgs as JobQueryTypes;

            dispatch(
              jobsApi.util.updateQueryData("getJobs", args, (draft) => {
                const index = draft.jobs.findIndex((j) => j.id === id);
                const oldJob = index !== -1 ? draft.jobs[index] : null;

                // --- FILTER LOGIC ---
                const matchesQuery = (
                  job: JobApplication,
                  query: JobQueryTypes,
                ): boolean => {
                  if (
                    query.status &&
                    job.status !== query.status &&
                    query.status !== "All"
                  )
                    return false;
                  if (
                    query.priority &&
                    job.priority !== query.priority &&
                    query.priority !== "All"
                  )
                    return false;

                  if (query.search) {
                    const search = query.search.toLowerCase();
                    const target =
                      `${job.roleTitle} ${job.company}`.toLowerCase();
                    if (!target.includes(search)) return false;
                  }

                  return true;
                };

                const shouldExist = matchesQuery(updatedJob, args);

                // --- UPDATE / REMOVE / ADD ---
                if (index !== -1) {
                  if (shouldExist) {
                    draft.jobs[index] = updatedJob;
                  } else {
                    draft.jobs.splice(index, 1);
                  }
                } else if (shouldExist) {
                  const exists = draft.jobs.some((j) => j.id === updatedJob.id);
                  if (!exists) {
                    draft.jobs.unshift(updatedJob);
                  }
                }

                // --- SORT ---
                if (args.sort === "oldest") {
                  draft.jobs.sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime(),
                  );
                } else {
                  draft.jobs.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  );
                }

                // --- PAGINATION LIMIT ---
                if (args.limit && draft.jobs.length > args.limit) {
                  draft.jobs.pop();
                }

                // --- STATS ---
                updateJobStats(draft, oldJob, updatedJob);
              }),
            );
          });
        } catch (err) {
          console.error("Update job failed", err);
        }
      },
    }),

    // --- DELETE JOB ---
    deleteJob: builder.mutation<
      void,
      { ids: string[]; jobQuery: JobQueryTypes }
    >({
      query: ({ ids }) => ({
        url: `${path}`,
        method: "DELETE",
        body: { ids },
      }),
      async onQueryStarted(
        { ids: deletedIds, jobQuery },
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          await queryFulfilled;

          const limit = jobQuery.limit || 5;

          // Check the page where the first deleted item exists
          let startPage = 1;
          let found = false;

          while (true) {
            const pageQuery = { ...jobQuery, page: startPage };
            const cacheState =
              jobsApi.endpoints.getJobs.select(pageQuery)(getState());

            if (!cacheState.data) break; // stop if page not cached

            if (cacheState.data.jobs.some((j) => deletedIds.includes(j.id))) {
              found = true;
              break;
            }

            startPage++;
          }

          if (!found) return; // nothing to delete in cached pages

          // 2Waterfall deletion from startPage onward
          let currentPage = startPage;

          while (true) {
            const pageQuery = { ...jobQuery, page: currentPage };
            const cacheState =
              jobsApi.endpoints.getJobs.select(pageQuery)(getState());

            if (!cacheState.data) break; // no cached page

            const draftJobs = cacheState.data.jobs;

            // Determine how many slots are empty after deletion
            const deletedOnPage = draftJobs.filter((j) =>
              deletedIds.includes(j.id),
            ).length;
            const slotsToFill = deletedOnPage;

            // Stop if nothing to delete and not the first affected page
            if (slotsToFill === 0 && currentPage > startPage) break;

            // Pull items from next page
            const nextPageQuery = { ...jobQuery, page: currentPage + 1 };
            const nextCache =
              jobsApi.endpoints.getJobs.select(nextPageQuery)(getState());

            const pulledItems: JobApplication[] = [];
            if (nextCache?.data?.jobs?.length) {
              pulledItems.push(
                ...nextCache.data.jobs
                  .slice(0, slotsToFill)
                  .map((j) => structuredClone(j) as JobApplication),
              );
            }

            dispatch(
              jobsApi.util.updateQueryData("getJobs", pageQuery, (draft) => {
                // Remove deleted items on this page
                draft.jobs = draft.jobs.filter(
                  (j) => !deletedIds.includes(j.id),
                );

                // Add pulled items to fill the page
                pulledItems.forEach((item) => {
                  const exists = draft.jobs.some((j) => j.id === item.id);
                  if (!exists) draft.jobs.push(item);
                });

                // Update stats for UI
                updateJobStats(draft, null, null, limit);
              }),
            );

            currentPage++;

            // Stop if nothing left to pull
            if (!pulledItems.length) break;
          }
        } catch (err) {
          console.error("Delete waterfall failed:", err);
        }
      },
    }),
  }),
});

export const {
  useGetJobsQuery,
  useAddJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobsApi;
