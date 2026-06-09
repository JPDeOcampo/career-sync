import type { RootState } from "./store";

export const selectTheme = (state: RootState) => state.theme;
export const selectAuth = (state: RootState) => state.auth;
export const selectJobs = (state: RootState) => state.jobs;
export const selectJobModal = (state: RootState) => state.jobModal;
export const selectDocuments = (state: RootState) => state.documents;
export const selectPagination = (state: RootState) => state.pagination;
