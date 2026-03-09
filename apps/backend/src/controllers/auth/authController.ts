import type { Request, Response } from "express";
import * as authService from "@/services/auth/authService.js";
import { serialize } from "cookie";

// --- User Registration ---
export const userRegister = async (req: Request, res: Response) => {
  await authService.registerUser(req.body);
  return res.status(201).json({
    message: "User registered successfully! You can now log in.",
  });
};

// --- User Login ---
export const userLogin = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(
    req.body,
  );

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    }),
    serialize("is_logged_in", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    }),
  ]);

  return res.status(200).json({
    accessToken,
    user: {
      userId: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
    },
  });
};
