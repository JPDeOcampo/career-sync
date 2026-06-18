import express, { type Router } from "express";
import {
  authLimiter,
  resendVerificationLimiter,
} from "@/middleware/rate-limiters.middleware.js";
import { protect } from "@/middleware/authenticate.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import {
  registerSchema,
  emailSchema,
  updatePasswordSchema,
  resetPasswordSchema,
  passwordSchema,
} from "@career-sync/shared";
import { asyncHandler } from "@/utils/asyncHandler.js";

// -- Auth Controllers --
import {
  register,
  login,
  oauthLogin,
  updateEmail,
  removeNewEmail,
  resendVerificationEmail,
  verifyEmail,
  localDeleteAccount,
  oauthDeleteAccount,
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
  "/signup",
  authLimiter,
  validate(registerSchema),
  asyncHandler(register),
);

router.post(
  "/resend-verification-email/:id",
  resendVerificationLimiter,
  asyncHandler(resendVerificationEmail),
);

router.get("/verify-email", authLimiter, asyncHandler(verifyEmail));

router.post("/login", authLimiter, asyncHandler(login));

router.post("/oauth-login", authLimiter, asyncHandler(oauthLogin));

router.post("/refresh-token", authLimiter, asyncHandler(refreshToken));

/* -- UPDATE EMAIL -- */
router.post(
  "/update-email/:id",
  authLimiter,
  protect,
  validate(emailSchema),
  asyncHandler(updateEmail),
);

router.post(
  "/remove-new-email/:id",
  authLimiter,
  protect,
  validate(emailSchema),
  asyncHandler(removeNewEmail),
);

/* -- UPDATE PASSWORD -- */
router.put(
  "/update-password/:id",
  authLimiter,
  protect,
  validate(updatePasswordSchema),
  asyncHandler(updatePassword),
);

/* -- FORGOT & RESET PASSWORD -- */
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

/* -- DELETE ACCOUNT -- */
router.post(
  "/delete-user/:id",
  authLimiter,
  protect,
  validate(passwordSchema),
  asyncHandler(localDeleteAccount),
);

router.post(
  "/delete-user-oauth/:id",
  authLimiter,
  protect,
  asyncHandler(oauthDeleteAccount),
);

/* -- SINGLE LOGOUT -- */
router.post("/single-logout", asyncHandler(userSingleLogout));

export default router;
