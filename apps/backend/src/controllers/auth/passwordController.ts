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
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const {
    newSignToken,
    signTokenExpiresAt,
    expiresAt,
    expiresIn,
    userId,
    email,
  } = (await passwordService.forgotPassword({
    email: req.body.email,
    ipAddress,
    userAgent,
  })) as {
    newSignToken: string;
    signTokenExpiresAt: number;
    expiresIn: number;
    expiresAt: number;
    userId: string;
    email: string;
  };

  res.setHeader("Set-Cookie", [
    serialize(
      "verificationToken",
      newSignToken,
      getCookieConfig({ maxAge: signTokenExpiresAt }),
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
    message: "Reset code is sent to your email.",
  });
};

// --- Verify Reset Password ---
export const verifyResetPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const signToken = req.cookies.verificationToken;
  const userId = req.params.id;
  const { otp } = req.body;

  const resetToken = await passwordService.verifyResetPassword({
    signToken,
    userId,
    otp,
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
  const signToken = req.cookies.resetToken;
  const userId = req.params.id;
  const { newPassword } = req.body;

  await passwordService.resetPassword({ signToken, userId, newPassword });

  res.cookie("resetToken", "", clearCookieConfig({}));

  return res.status(200).json({ message: "Password reset successfully" });
};

// --- Refresh Reset Password Code ---
export const refreshResetPassword = async (req: Request, res: Response) => {
  const { userId, email, expiresIn } =
    await passwordService.refreshResetPassword({
      signToken: req.cookies.verificationToken || req.cookies.resetToken,
      expiresAt: req.cookies.expiresAt,
    });

  return res.status(200).json({
    userId,
    email,
    expiresIn,
    message: "Reset token is valid",
  });
};

// --- Resend Reset Password Code ---
export const resendResetPassword = async (req: Request, res: Response) => {
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const signToken = req.cookies.verificationToken || req.cookies.resetToken;
  const userId = req.params.id;

  const { expiresIn, newSignToken, signTokenExpiresAt, expiresAt } =
    await passwordService.resendResetPassword({
      ipAddress,
      userAgent,
      userId,
      signToken,
    });

  res.setHeader("Set-Cookie", [
    serialize(
      "verificationToken",
      newSignToken,
      getCookieConfig({ maxAge: signTokenExpiresAt }),
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
