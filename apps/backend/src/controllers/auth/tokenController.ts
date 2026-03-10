import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as tokenService from "@/services/auth/tokenService.js";
import { clearCookieConfig, getCookieConfig } from "@/config/cookieConfig.js";

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { user, newAccessToken, newRefreshToken } =
      await tokenService.refreshToken(req.cookies.refreshToken);

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
  } catch (error) {
    res.setHeader("Set-Cookie", [
      serialize("refreshToken", "", clearCookieConfig({})),
      serialize("is_logged_in", "", getCookieConfig({ httpOnly: false })),
    ]);
    throw error;
  }
};
