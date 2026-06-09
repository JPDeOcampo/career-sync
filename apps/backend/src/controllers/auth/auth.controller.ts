import type { Request, Response } from "express";
import * as authService from "@/services/auth/auth.service.js";
import { serialize } from "cookie";
import { getCookieConfig, clearCookieConfig } from "@/config/cookie.config";

// --- User Registration ---
export const register = async (req: Request, res: Response) => {
  const { ipAddress, userAgent } = req;

  await authService.register({ ...req.body, ipAddress, userAgent });

  return res.status(201).json({
    message:
      "Registration was successful. Please check your inbox to verify your email address before logging in.",
  });
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id: userId } = req.params;
  const { email, ipAddress, userAgent } = req.body;

  const result = await authService.resendVerificationEmail(
    userId as string,
    email,
    ipAddress,
    userAgent,
  );

  res.setHeader("Set-Cookie", [
    serialize(
      "resend_verification_expires_at",
      result || "",
      getCookieConfig({ httpOnly: false, maxAge: 15 * 60 }),
    ),
  ]);

  return res.status(200).json({
    message:
      "New verification email sent successfully! Please check your inbox.",
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.query.token as string;

  const isVerified = await authService.verifyEmail(token);

  res.setHeader("Set-Cookie", [
    serialize(
      "is_verified",
      isVerified.toString(),
      getCookieConfig({ httpOnly: false, maxAge: 4 }),
    ),
    serialize("is_logged_in", "", clearCookieConfig({})),
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("resend_verification_expires_at", "", clearCookieConfig({})),
  ]);

  return res.redirect(`${process.env.ORIGIN}/login`);
};

// --- User Login ---
export const login = async (req: Request, res: Response) => {
  const { ipAddress, userAgent } = req;
  const { user, accessToken, refreshToken } = await authService.login({
    ...req.body,
    ipAddress,
    userAgent,
  });

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", refreshToken, getCookieConfig({})),
    serialize("is_logged_in", "true", getCookieConfig({ httpOnly: false })),
  ]);

  return res.status(200).json({
    accessToken,
    user,
  });
};

export const oauthLogin = async (req: Request, res: Response) => {
  const result = await authService.oauthLogin({
    ...req.body,
  });

  if (!result) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const { user, accessToken, refreshToken } = result;

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", refreshToken, getCookieConfig({})),
    serialize("is_logged_in", "true", getCookieConfig({ httpOnly: false })),
  ]);

  return res.status(200).json({
    accessToken,
    user,
  });
};

export const updateEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { email } = req.body;

  const result = await authService.updateEmail(id as string, {
    email,
    ipAddress: req.ipAddress,
    userAgent: req.userAgent,
  });

  res.setHeader("Set-Cookie", [
    serialize(
      "resend_verification_expires_at",
      result.expiresAt || "",
      getCookieConfig({ httpOnly: false, maxAge: 15 * 60 }),
    ),
  ]);

  return res.status(200).json({
    message: "Email change requested. Please verify your new email address.",
    newEmail: result.emailChangeRequest,
  });
};

export const removeNewEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id: userId } = req.params;
  const { email } = req.body;

  await authService.removeNewEmail(userId as string, email);

  res.setHeader("Set-Cookie", [
    serialize("resend_verification_expires_at", "", clearCookieConfig({})),
  ]);

  return res
    .status(200)
    .json({ message: "Removed unverified email successfully!" });
};

export const localDeleteAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { password } = req.body;

  await authService.deleteAccount({
    userId: id as string,
    password,
  });

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({})),
  ]);

  return res.status(200).json({ message: "Account deleted successfully!" });
};

export const oauthDeleteAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { idToken } = req.body;

  await authService.deleteAccount({
    userId: id as string,
    idToken,
  });

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({})),
  ]);

  return res.status(200).json({ message: "Account deleted successfully!" });
};
