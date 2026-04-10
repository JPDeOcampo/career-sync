import { z } from "zod";
import { jobSchema } from "../validators/jobValidator";

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
  | "All"
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
  id: string;
  jobId: string;
  interviewType: InterviewTypes;
  interviewDate: string;
  interviewTime: string;
  interviewerName: string;
  interviewComment?: string;
};

export type InterviewStages = {
  interviewStages: InterviewInfo[];
};

export type Documents = {
  id: string;
  userId: string;
  type: string;
  fileUrl: string;
  filePath: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  isUploading?: boolean;
  progress?: number;
};

export interface JobApplication {
  id: string;
  userId: string;
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
  cvId?: string;
  cv?: Documents;
  coverLetterId?: string;
  coverLetter?: Documents;
  contact?: string;

  // Interview Info
  interviewStages?: InterviewInfo[];
  offer: boolean;

  // Extra
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search: string;
  status: ApplicationStatus | string | undefined;
  priority: PriorityType | string | undefined;
  dateFrom?: string;
  dateTo?: string;
}

export interface JobQueryTypes {
  sort?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JobState {
  jobs: JobApplication[];
  recentJobs: JobApplication[] | undefined;
  selectedItems: string[];
  selectedJob: JobApplication | undefined;
  filters: JobFilters;
  sortBy: "applicationDate" | "company" | "priority";
  sortOrder: "asc" | "desc";
  jobQuery: {
    [key: string]: Partial<JobQueryTypes>;
  };
}
