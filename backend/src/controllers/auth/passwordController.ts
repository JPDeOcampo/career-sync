import type { Request, Response } from "express";
import { serialize } from "cookie";
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
  const { verificationCodeToken, userId, email } =
    (await passwordService.forgotPassword(req.body.email)) as {
      verificationCodeToken: string;
      userId: string;
      email: string;
    };

  res.cookie("verificationCodeToken", verificationCodeToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 60 * 1000, // 5 minutes
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
  const verificationCodeToken = req.cookies.verificationCodeToken;
  const userId = req.params.id;
  const { verificationCode } = req.body;

  const resetToken = await passwordService.verifyResetPWVerificationCode({
    verificationCodeToken,
    userId,
    verificationCode,
  });

  res.setHeader("Set-Cookie", [
    serialize("verificationCodeToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    }),
    serialize("resetToken", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: "/",
    }),
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
