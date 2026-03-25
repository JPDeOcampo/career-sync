import type { Request, Response } from "express";
import * as jobService from "@/services/job/jobService.js";

// --- Add Job ---
export const createJobController = async (req: Request, res: Response) => {
  const userID = req.user?.id as string;
  const data = req.body;

  const job = await jobService.addJob(data, userID);
  return res.status(201).json({
    message: "New Job added successfully!",
    data: job,
  });
};

// --- Get Jobs ---
export const getJobsController = async (req: Request, res: Response) => {
  const userID = req.user?.id as string;

  const { sort, status, priority, page, limit } = req.query;

  const result = await jobService.getJobs(userID, {
    sort: sort as string,
    status: status as string,
    priority: priority as string,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

// --- Get Job By Id ---
export const getJobByIdController = async (req: Request, res: Response) => {
  const { referenceId } = req.params;
  const userID = req.user?.id as string;

  const job = await jobService.getJobById(referenceId, userID);

  res.status(200).json({
    success: true,
    data: job,
  });
};

// --- Update Job ---
export const updateJobController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = req.user?.id as string;
  const data = req.body;

  const job = await jobService.updateJob(id, userID, data);

  res.status(200).json({
    success: true,
    data: job,
  });
};

// --- Delete Job ---
export const deleteJobController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userID = req.user?.id as string;

  const result = await jobService.deleteJob(id, userID);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};
