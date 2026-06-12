import type { Request, Response } from "express";
import * as jobService from "@/services/job/job.service.js";

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

  const { sort, status, search, priority, page, limit } = req.query;

  const result = await jobService.getJobs(userID, {
    sort: sort as string,
    status: status as string,
    search: search as string,
    priority: priority as string,
    page: Number(page) || 1,
    limit: Number(limit),
  });

  setTimeout(() => {
    res.status(200).json({
      success: true,
      ...result,
    });
  }, 1500);
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
  const { ids } = req.body;
  const userId = req.user?.id as string;

  const referenceId = ids;

  const result = await jobService.deleteJob(referenceId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

export const deleteAllJobs = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await jobService.deleteAllJobs(userId);
  res.status(200).json({
    success: true,
    message: result.message,
  });
};
