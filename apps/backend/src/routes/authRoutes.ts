import express, { type Router } from "express";
import { authLimiter } from "@/middleware/rateLimiters.js";
import { protect } from "@/middleware/authenticate.js";
import { validate } from "@/middleware/validate.js";
import {
  registerSchema,
  emailSchema,
  updatePasswordSchema,
  resetPasswordSchema,
} from "@career-sync/shared";
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
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(userRegister),
);
router.post("/login", asyncHandler(userLogin));

router.post("/refresh-token", authLimiter, asyncHandler(refreshToken));

// -- Password Routes --
router.put(
  "/update-password/:id",
  authLimiter,
  protect,
  validate(updatePasswordSchema),
  asyncHandler(updatePassword),
);

// -- Password reset flow --
router.post(
  "/forgot-password",
  authLimiter,
  validate(emailSchema),
  asyncHandler(forgotPassword),
);
router.post(
  "/reset/verify-reset-password/:id",
  asyncHandler(verifyResetPWVerificationCode),
);
router.post(
  "/reset/resend-reset-verification-code/:id",
  asyncHandler(resendResetVerificationCode),
);

router.get("/reset/refresh-reset-password", asyncHandler(refreshResetPassword));

router.post(
  "/reset/reset-password/:id",
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

// -- Logout --
router.post("/single-logout", asyncHandler(userSingleLogout));

export default router;
