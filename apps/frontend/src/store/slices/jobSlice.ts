import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  JobApplication,
  JobState,
  ApplicationStatus,
  PriorityType,
  JobFilters,
} from "@career-sync/shared";

const initialFilters: JobFilters = {
  search: "",
  status: "All",
  priority: "All",
  dateFrom: undefined,
  dateTo: undefined,
};

const initialState: JobState = {
  jobs: [],
  recentJobs: [],
  selectedJob: undefined,
  filters: initialFilters,
  sortBy: "applicationDate",
  sortOrder: "desc",
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<JobApplication[]>) => {
      state.jobs = action.payload;
    },
    addJob: (state, action: PayloadAction<JobApplication>) => {
      state.jobs.unshift(action.payload);
    },
    selectJob: (state, action: PayloadAction<JobApplication | undefined>) => {
      if (!action.payload) {
        state.selectedJob = undefined;
        return;
      }

      state.selectedJob = action.payload;
    },
    updateJob: (state, action: PayloadAction<JobApplication>) => {
      const index = state.jobs.findIndex((job) => job.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },

    deleteJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter((job) => job.id !== action.payload);
    },

    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: ApplicationStatus }>,
    ) => {
      const job = state.jobs.find((job) => job.id === action.payload.id);
      if (job) {
        job.status = action.payload.status;
      }
    },

    setPriority: (
      state,
      action: PayloadAction<{ id: string; priority: PriorityType }>,
    ) => {
      const job = state.jobs.find((job) => job.id === action.payload.id);
      if (job) {
        job.priority = action.payload.priority;
      }
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },

    setFilter: (state, action: PayloadAction<Partial<JobFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setSort: (
      state,
      action: PayloadAction<{
        sortBy: "applicationDate" | "company" | "priority";
        sortOrder: "asc" | "desc";
      }>,
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setDateFilter: (
      state,
      action: PayloadAction<{ dateFrom?: string; dateTo?: string }>,
    ) => {
      state.filters.dateFrom = action.payload.dateFrom;
      state.filters.dateTo = action.payload.dateTo;
    },

    resetFilters: (state) => {
      state.filters = initialFilters;
    },
  },
});

export const {
  setJobs,
  addJob,
  selectJob,
  updateJob,
  deleteJob,
  updateStatus,
  setPriority,
  setSearch,
  setFilter,
  setSort,
  setDateFilter,
  resetFilters,
} = jobSlice.actions;

export default jobSlice.reducer;
