import express, { type Router } from "express";
import { authLimiter } from "@/middleware/rateLimiters.js";
import { protect } from "@/middleware/authenticate.js";
import { validate } from "@/middleware/validate.js";
import {
  registerSchema,
  emailSchema,
  updatePasswordSchema,
} from "@/validators/userValidator.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

// -- Auth Controllers --
import { userRegister, userLogin } from "@/controllers/auth/authController.js";

// -- Password Controllers --
import {
  updatePassword,
  forgotPassword,
  verifyResetPWVerificationCode,
  resendResetVerificationCode,
  refreshResetPassword,
  resetPassword,
} from "@/controllers/auth/passwordController.js";

import { userSingleLogout } from "@/controllers/auth/logoutController.js";

import { refreshToken } from "@/controllers/auth/tokenController.js";

const router: Router = express.Router();

// -- Auth Routes --
router.post(
  "/v1/user/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(userRegister),
);
router.post("/v1/user/login", asyncHandler(userLogin));

router.get("/v1/user/refresh-token", authLimiter, asyncHandler(refreshToken));

// -- Password Routes --
router.put(
  "/v1/user/update-password/:id",
  authLimiter,
  protect,
  validate(updatePasswordSchema),
  asyncHandler(updatePassword),
);

// Password reset flow
router.post(
  "/v1/user/forgot-password",
  authLimiter,
  validate(emailSchema),
  asyncHandler(forgotPassword),
);
router.post(
  "/v1/user/reset/verify-reset-password/:id",
  asyncHandler(verifyResetPWVerificationCode),
);
router.get(
  "/v1/user/reset/resend-reset-verification-code/:id",
  asyncHandler(resendResetVerificationCode),
);

router.get(
  "/v1/user/reset/refresh-reset-password",
  asyncHandler(refreshResetPassword),
);

router.post("/v1/user/reset/reset-password/:id", asyncHandler(resetPassword));

// Logout
router.get("/v1/user/single-logout", protect, asyncHandler(userSingleLogout));

export default router;
