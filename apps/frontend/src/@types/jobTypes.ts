import { z } from "zod";
import { jobSchema } from "@/validators/jobValidator";

export type JobFormData = z.infer<typeof jobSchema>;

export type JobType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Freelance";
export type WorkSetup = "On-site" | "Remote" | "Hybrid";

export type ApplicationMethod =
  | "LinkedIn"
  | "Company Website"
  | "Referral"
  | "Email"
  | "Other";

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type PriorityType = "Low" | "Medium" | "High";

export type InterviewTypes =
  | "HR Screening"
  | "Technical Interview"
  | "Assessment"
  | "Final Interview"
  | "Offer Stage";

export type InterviewInfo = {
  interviewID: string;
  interviewType: InterviewTypes;
  interviewDate: string;
  interviewTime: string;
  interviewerName: string;
  interviewComment?: string;
};

export type InterviewStages = {
  interviewStages: InterviewInfo[];
};

export interface JobApplication {
  id: string;

  // Job Info
  company: string;
  roleTitle: string;
  jobDescription: string;
  jobType: JobType;
  salary?: string;
  workSetup: WorkSetup;
  workSchedule?: string;
  location?: string;
  jobLink?: string;

  // Application Info
  applicationMethod: ApplicationMethod;
  applicationDate: string;
  status: ApplicationStatus;
  priority: PriorityType;
  cvVersion?: string;
  coverLetterSent: boolean;
  contact?: string;

  // Interview Info
  interviewStages?: InterviewInfo[];
  offer: boolean;

  // Extra
  notes?: string;
}

export interface JobFilters {
  search: string;
  status: ApplicationStatus | "All";
  priority: PriorityType | "All";
  dateFrom?: string;
  dateTo?: string;
}

export interface JobState {
  jobs: JobApplication[];
  selectedJob: JobApplication | undefined;
  filters: JobFilters;
  sortBy: "applicationDate" | "company" | "priority";
  sortOrder: "asc" | "desc";
}
