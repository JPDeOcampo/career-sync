import express, { type Router } from "express";
import { authLimiter } from "@/middleware/rate-limiters.middleware.js";
import { protect } from "@/middleware/authenticate.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import {
  registerSchema,
  emailSchema,
  userUpdateSchema,
  updatePasswordSchema,
  resetPasswordSchema,
  passwordSchema,
} from "@career-sync/shared";
import { asyncHandler } from "@/utils/asyncHandler.js";

// -- Auth Controllers --
import {
  userRegister,
  userLogin,
  userOAuthLogin,
  userUpdate,
  userVerifyEmail,
  userLocalDeleteAccount,
  userOAuthDeleteAccount,
} from "@/controllers/auth/auth.controller.js";

// -- Password Controllers --
import {
  updatePassword,
  forgotPassword,
  verifyResetPassword,
  resendResetPassword,
  refreshResetPassword,
  resetPassword,
} from "@/controllers/auth/password.controller.js";

import { userSingleLogout } from "@/controllers/auth/logout.controller.js";

import { refreshToken } from "@/controllers/auth/token.controller.js";

const router: Router = express.Router();

// -- Auth Routes --
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(userRegister),
);

router.get("/verify-email", authLimiter, asyncHandler(userVerifyEmail));

router.post("/login", authLimiter, asyncHandler(userLogin));

router.post("/oauth-login", authLimiter, asyncHandler(userOAuthLogin));

router.put(
  "/update-user/:id",
  authLimiter,
  protect,
  validate(userUpdateSchema),
  asyncHandler(userUpdate),
);

router.post(
  "/delete-user/:id",
  authLimiter,
  protect,
  validate(passwordSchema),
  asyncHandler(userLocalDeleteAccount),
);

router.post(
  "/delete-user-oauth/:id",
  authLimiter,
  protect,
  asyncHandler(userOAuthDeleteAccount),
);

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
  asyncHandler(verifyResetPassword),
);
router.post(
  "/reset/resend-reset-password/:id",
  asyncHandler(resendResetPassword),
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
