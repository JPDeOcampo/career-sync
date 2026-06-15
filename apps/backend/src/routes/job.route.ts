import express, { type Router } from "express";
import {
  getJobs,
  getJobById,
  createJobs,
  updateJob,
  deleteJob,
  deleteAllJobs,
} from "@/controllers/job/job.controller";
import { jobSchema, jobsSchema } from "@career-sync/shared";
import { protect } from "@/middleware/authenticate.middleware";
import { authLimiter } from "@/middleware/rate-limiters.middleware";
import { validate } from "@/middleware/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router: Router = express.Router();

// GET jobs with filters
// GET /jobs?page=1&limit=10
// GET /jobs?page=2&limit=10
// GET /jobs?sort=recent&page=1&limit=5
router.get("/", protect, authLimiter, asyncHandler(getJobs));

router.get("/:jobId", protect, authLimiter, asyncHandler(getJobById));

// Create job
router.post(
  "/",
  protect,
  authLimiter,
  validate(jobSchema),
  asyncHandler(createJobs),
);

// Bulk Create jobs
router.post(
  "/bulk-add",
  protect,
  authLimiter,
  validate(jobsSchema),
  asyncHandler(createJobs),
);

router.patch(
  "/:id",
  protect,
  authLimiter,
  validate(jobSchema),
  asyncHandler(updateJob),
);

router.delete("/", protect, authLimiter, asyncHandler(deleteJob));

router.delete("/delete-all", protect, authLimiter, asyncHandler(deleteAllJobs));

export default router;
