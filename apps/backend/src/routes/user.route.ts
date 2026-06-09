import express, { type Router } from "express";
import { authLimiter } from "@/middleware/rate-limiters.middleware.js";
import { protect } from "@/middleware/authenticate.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { updateProfileSchema } from "@career-sync/shared";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { updateProfile } from "@/controllers/user/profile.controller.js";
import { updateSettings } from "@/controllers/user/settings.controller.js";

const router: Router = express.Router();

/* -- UPDATE PROFILE -- */
router.put(
  "/update-profile/:id",
  authLimiter,
  protect,
  validate(updateProfileSchema),
  asyncHandler(updateProfile),
);

router.put(
  "/update-settings/:id",
  authLimiter,
  protect,
  asyncHandler(updateSettings),
);

export default router;
