import { z } from "zod";
import {
  jobTypes,
  workSetups,
  applicationMethods,
  statuses,
  priorities,
  interviewTypes,
} from "../constant/jobSelectList";

const company = z
  .string()
  .nonempty("Company name is required")
  .min(2, "Company name is too short, must be at least 2 characters long");

const roleTitle = z
  .string()
  .nonempty("Job title is required")
  .min(2, "Job title is too short, must be at least 2 characters long");

const jobDescription = z
  .string()
  .nonempty("Job description is required")
  .min(10, "Job description is too short, must be at least 10 characters long");

const id = z.string().optional();

const cvVersionSchema = z.object({
  id: id,
  jobId: id,
  fileUrl: z.string().url("Invalid file URL"),
  name: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

const interviewStagesSchema = z.object({
  id: id,
  jobId: id,
  interviewType: z.enum(interviewTypes),
  interviewDate: z.string(),
  interviewTime: z.string().nullish().optional(),
  interviewerName: z.string().optional(),
  interviewComment: z.string().optional(),
});

export const jobSchema = z.object({
  id: id,
  userId: id,
  company: company,
  roleTitle: roleTitle,
  jobDescription: jobDescription,
  jobType: z.enum(jobTypes),
  salary: z.string(),
  workSetup: z.enum(workSetups),
  workSchedule: z.string(),
  location: z.string(),
  jobLink: z.string().url("Invalid URL format"),
  applicationMethod: z.enum(applicationMethods),
  applicationDate: z.string().nonempty("Application date is required"),
  status: z.enum(statuses),
  priority: z.enum(priorities),
  cvVersions: z.array(cvVersionSchema).optional(),
  coverLetterSent: z.boolean(),
  contact: z.string(),
  interviewStages: z.array(interviewStagesSchema).optional(),
  offer: z.boolean(),
  notes: z.string(),
});
