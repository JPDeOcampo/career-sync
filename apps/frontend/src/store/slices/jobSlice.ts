import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  JobApplication,
  JobState,
  ApplicationStatus,
  PriorityType,
  JobFilters,
} from "@/@types/jobTypes";
import { storage, STORAGE_KEYS } from "@/utils/storage";
import { sampleJobs } from "@/constant/sample";
import { select } from "motion/react-client";

const initialFilters: JobFilters = {
  search: "",
  status: "All",
  priority: "All",
  dateFrom: undefined,
  dateTo: undefined,
};

const loadInitialState = (): JobState => {
  const savedJobs = storage.get<JobApplication[]>(STORAGE_KEYS.JOBS);

  // If no saved jobs, use sample data for demo purposes
  const jobs = savedJobs && savedJobs.length > 0 ? savedJobs : sampleJobs;

  // Save sample jobs to localStorage if this is first load
  if (!savedJobs) {
    storage.set(STORAGE_KEYS.JOBS, sampleJobs);
  }

  return {
    jobs,
    selectedJob: undefined,
    filters: initialFilters,
    sortBy: "applicationDate",
    sortOrder: "desc",
  };
};

const jobSlice = createSlice({
  name: "jobs",
  initialState: loadInitialState(),
  reducers: {
    addJob: (state, action: PayloadAction<JobApplication>) => {
      state.jobs.push(action.payload);
      storage.set(STORAGE_KEYS.JOBS, state.jobs);
    },
    selectJob: (state, action: PayloadAction<JobApplication>) => {
      state.selectedJob = state.jobs.find(
        (job) => job.id === action.payload.id,
      );
    },
    updateJob: (state, action: PayloadAction<JobApplication>) => {
      const index = state.jobs.findIndex((job) => job.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
        storage.set(STORAGE_KEYS.JOBS, state.jobs);
      }
    },

    deleteJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      storage.set(STORAGE_KEYS.JOBS, state.jobs);
    },

    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: ApplicationStatus }>,
    ) => {
      const job = state.jobs.find((job) => job.id === action.payload.id);
      if (job) {
        job.status = action.payload.status;
        storage.set(STORAGE_KEYS.JOBS, state.jobs);
      }
    },

    setPriority: (
      state,
      action: PayloadAction<{ id: string; priority: PriorityType }>,
    ) => {
      const job = state.jobs.find((job) => job.id === action.payload.id);
      if (job) {
        job.priority = action.payload.priority;
        storage.set(STORAGE_KEYS.JOBS, state.jobs);
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
