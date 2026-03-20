import type { RootState } from "./store";

export const selectAuth = (state: RootState) => state.auth;
export const selectJobs = (state: RootState) => state.jobs;
export const selectDocuments = (state: RootState) => state.documents;
export const selectGlobal = (state: RootState) => state.global;
