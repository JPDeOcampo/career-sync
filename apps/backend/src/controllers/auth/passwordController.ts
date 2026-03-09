import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as passwordService from "@/services/auth/passwordService.js";
import { clearCookieConfig, getCookieConfig } from "@/config/cookieConfig.js";

// --- User Update Password ---
export const updatePassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  await passwordService.updatePassword({ id, currentPassword, newPassword });
  return res.status(200).json({ message: "Password changed successfully" });
};

// --- Forgot Password ---
export const forgotPassword = async (req: Request, res: Response) => {
  const { verificationCodeToken, userId, email } =
    (await passwordService.forgotPassword(req.body.email)) as {
      verificationCodeToken: string;
      userId: string;
      email: string;
    };

  res.cookie(
    "verificationCodeToken",
    verificationCodeToken,
    getCookieConfig({ maxAge: 5 * 60 }),
  ); // 5 minutes

  return res.status(200).json({
    userId,
    email,
    message: "Reset code is sent to your email",
  });
};

// --- Verify Reset Password ---
export const verifyResetPWVerificationCode = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const verificationCodeToken = req.cookies.verificationCodeToken;
  const userId = req.params.id;
  const { verificationCode } = req.body;

  const resetToken = await passwordService.verifyResetPWVerificationCode({
    verificationCodeToken,
    userId,
    verificationCode,
  });

  res.setHeader("Set-Cookie", [
    serialize("verificationCodeToken", "", clearCookieConfig({})),
    serialize("resetToken", resetToken, getCookieConfig({ maxAge: 5 * 60 })),
  ]);

  return res.status(200).json({
    userId,
    message: "Verification code is valid",
  });
};

// --- Reset Password ---
export const resetPassword = async (req: Request, res: Response) => {
  const resetToken = req.cookies.resetToken;
  const userId = req.params.id;
  const { newPassword } = req.body;

  await passwordService.resetPassword({ resetToken, userId, newPassword });

  res.cookie("resetToken", "", clearCookieConfig({}));

  return res.status(200).json({ message: "Password reset successfully" });
};

// --- Refresh Reset Password Code ---
export const refreshResetPassword = async (req: Request, res: Response) => {
  const { userId, email } = await passwordService.refreshResetPassword(
    req.cookies.verificationCodeToken || req.cookies.resetToken,
  );

  return res.status(200).json({
    userId,
    email,
    message: "Reset token is valid",
  });
};

// --- Resend Reset Verification Code ---
export const resendResetVerificationCode = async (
  req: Request,
  res: Response,
) => {
  const resetToken =
    req.cookies.verificationCodeToken || req.cookies.resetToken;
  const userId = req.params.id;
  await passwordService.resendResetVerificationCode({ userId, resetToken });

  return res.status(200).json({ message: "Reset code is sent to your email" });
};
