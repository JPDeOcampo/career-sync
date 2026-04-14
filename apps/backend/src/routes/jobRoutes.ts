import express, { type Router } from "express";
import {
  getJobsController,
  getJobByIdController,
  createJobController,
  updateJobController,
  deleteJobController,
} from "@/controllers/job/jobController";
import { jobSchema } from "@career-sync/shared";
import { protect } from "@/middleware/authenticate";
import { authLimiter } from "@/middleware/rateLimiters";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";

const router: Router = express.Router();

// GET jobs with filters
// GET /jobs?page=1&limit=10
// GET /jobs?page=2&limit=10
// GET /jobs?sort=recent&page=1&limit=5
router.get("/", protect, authLimiter, asyncHandler(getJobsController));

router.get("/:jobId", protect, authLimiter, asyncHandler(getJobByIdController));

router.post(
  "/",
  protect,
  authLimiter,
  validate(jobSchema),
  asyncHandler(createJobController),
);

router.patch(
  "/:id",
  protect,
  authLimiter,
  validate(jobSchema),
  asyncHandler(updateJobController),
);

router.delete("/", protect, authLimiter, asyncHandler(deleteJobController));

export default router;
