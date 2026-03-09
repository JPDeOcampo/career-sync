import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as tokenService from "@/services/auth/tokenService.js";
import { getCookieConfig } from "@/config/cookieConfig.js";

export const refreshToken = async (req: Request, res: Response) => {
  const { user, newAccessToken, newRefreshToken } =
    await tokenService.refreshToken(req.cookies.refreshToken);

  // Set the new refresh token in the cookie
  res.setHeader(
    "Set-Cookie",
    serialize("refreshToken", newRefreshToken, getCookieConfig({})),
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
