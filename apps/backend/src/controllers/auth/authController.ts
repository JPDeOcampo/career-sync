import type { Request, Response } from "express";
import * as authService from "@/services/auth/authService.js";
import { serialize } from "cookie";
import { getCookieConfig } from "@/config/cookieConfig";

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
    serialize("refreshToken", refreshToken, getCookieConfig({})),
    serialize("is_logged_in", "true", getCookieConfig({ httpOnly: false })),
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
