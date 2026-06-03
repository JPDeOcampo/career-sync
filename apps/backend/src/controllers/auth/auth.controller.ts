import type { Request, Response } from "express";
import * as authService from "@/services/auth/auth.service.js";
import { serialize } from "cookie";
import { getCookieConfig } from "@/config/cookie.config";
import { clearCookieConfig } from "@/config/cookie.config";

// --- User Registration ---
export const userRegister = async (req: Request, res: Response) => {
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  await authService.registerUser({ ...req.body, ipAddress, userAgent });

  return res.status(201).json({
    message:
      "Registration was successful. Please check your inbox to verify your email address before logging in.",
  });
};

// --- User Login ---
export const userLogin = async (req: Request, res: Response) => {
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  const { user, accessToken, refreshToken } = await authService.loginUser({
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

export const userOAuthLogin = async (req: Request, res: Response) => {
  const result = await authService.userOAuthLogin({
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

export const userUpdate = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  const updatedUser = await authService.userUpdate(id, {
    firstName,
    lastName,
    email,
  });

  return res.status(200).json({
    message: "User information updated successfully",
    user: updatedUser,
  });
};

export const userVerifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.query.token as string;

  const isVerified = await authService.userVerifyEmail(token);

  res.setHeader("Set-Cookie", [
    serialize(
      "is_verified",
      isVerified.toString(),
      getCookieConfig({ httpOnly: false, maxAge: 2 }),
    ),
  ]);

  return res.redirect(`${process.env.ORIGIN}/login`);
};

export const userLocalDeleteAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { password } = req.body;

  await authService.userDeleteAccount({
    userId: id as string,
    password,
  });

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({})),
  ]);

  return res.status(200).json({ message: "Account deleted successfully!" });
};

export const userOAuthDeleteAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { idToken } = req.body;

  await authService.userDeleteAccount({
    userId: id as string,
    idToken,
  });

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({})),
  ]);

  return res.status(200).json({ message: "Account deleted successfully!" });
};
