import type { Request, Response } from "express";
import * as passwordService from "@/services/auth/passwordService.js";

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
  const { resetToken, userId, email } = (await passwordService.forgotPassword(
    req.body.email,
  )) as { resetToken: string; userId: string; email: string };

  res.cookie("resetToken", resetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 1000, // 2 minutes
    path: "/",
  });

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
  const userId = req.params.id;
  const { verificationCode } = req.body;

  await passwordService.verifyResetPWVerificationCode({
    userId,
    verificationCode,
  });

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

  res.cookie("resetToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return res.status(200).json({ message: "Password reset successfully" });
};

// --- Refresh Reset Password Code ---
export const refreshResetPassword = async (req: Request, res: Response) => {
  const { userId, email } = await passwordService.refreshResetPassword(
    req.cookies.resetToken,
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
  await passwordService.resendResetVerificationCode(req.params.id as string);

  return res.status(200).json({ message: "Reset code is sent to your email" });
};
