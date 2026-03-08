import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as tokenService from "@/services/auth/tokenService.js";

export const refreshToken = async (req: Request, res: Response) => {
  const { user, newAccessToken, newRefreshToken } =
    await tokenService.refreshToken(req.cookies.refreshToken);

  // Set the new refresh token in the cookie
  res.setHeader(
    "Set-Cookie",
    serialize("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    }),
  );

  return res.status(200).json({
    user: {
      userId: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
    },
    accessToken: newAccessToken,
  });
};
