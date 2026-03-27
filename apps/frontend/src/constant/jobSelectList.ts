import {
  JobType,
  WorkSetup,
  ApplicationMethod,
  ApplicationStatus,
  PriorityType,
  InterviewTypes,
} from "@career-sync/shared";

export const jobTypes: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
export const workSetups: WorkSetup[] = ["On-site", "Remote", "Hybrid"];

export const applicationMethods: ApplicationMethod[] = [
  "LinkedIn",
  "Company Website",
  "Referral",
  "Email",
  "Other",
];

export const statuses: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export const priorities: PriorityType[] = ["Low", "Medium", "High"];

export const interviewTypes: InterviewTypes[] = [
  "HR Screening",
  "Technical Interview",
  "Assessment",
  "Final Interview",
  "Offer Stage",
];
