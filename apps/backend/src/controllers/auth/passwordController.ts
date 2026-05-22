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
  const {
    verificationToken,
    verificationTokenExpiresAt,
    expiresAt,
    expiresIn,
    userId,
    email,
  } = (await passwordService.forgotPassword(req.body.email)) as {
    verificationToken: string;
    verificationTokenExpiresAt: number;
    expiresIn: number;
    expiresAt: number;
    userId: string;
    email: string;
  };

  res.setHeader("Set-Cookie", [
    serialize(
      "verificationToken",
      verificationToken,
      getCookieConfig({ maxAge: verificationTokenExpiresAt }),
    ),
    serialize(
      "expiresAt",
      expiresAt.toString(),
      getCookieConfig({ maxAge: expiresIn }),
    ),
  ]);

  return res.status(200).json({
    userId,
    email,
    expiresIn,
    expiresAt,
    message: "Reset code is sent to your email",
  });
};

// --- Verify Reset Password ---
export const verifyResetPWVerificationCode = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const verificationToken = req.cookies.verificationToken;
  const userId = req.params.id;
  const { verificationCode } = req.body;

  const resetToken = await passwordService.verifyResetPWVerificationCode({
    verificationToken,
    userId,
    verificationCode,
  });

  res.setHeader("Set-Cookie", [
    serialize("verificationToken", "", clearCookieConfig({})),
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
  const { userId, email, expiresIn } =
    await passwordService.refreshResetPassword({
      refreshToken: req.cookies.verificationToken || req.cookies.resetToken,
      expiresAt: req.cookies.expiresAt,
    });

  return res.status(200).json({
    userId,
    email,
    expiresIn,
    message: "Reset token is valid",
  });
};

// --- Resend Reset Verification Code ---
export const resendResetVerificationCode = async (
  req: Request,
  res: Response,
) => {
  const resetToken = req.cookies.verificationToken || req.cookies.resetToken;
  const userId = req.params.id;
  const {
    expiresIn,
    verificationToken,
    verificationTokenExpiresAt,
    expiresAt,
  } = await passwordService.resendResetVerificationCode({
    userId,
    resetToken,
  });

  res.setHeader("Set-Cookie", [
    serialize(
      "verificationToken",
      verificationToken,
      getCookieConfig({ maxAge: verificationTokenExpiresAt }),
    ),
    serialize(
      "expiresAt",
      expiresAt.toString(),
      getCookieConfig({ maxAge: expiresIn }),
    ),
  ]);

  return res.status(200).json({
    expiresIn,
    message: "Reset code is sent to your email",
  });
};
