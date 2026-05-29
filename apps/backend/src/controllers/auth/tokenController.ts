import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as tokenService from "@/services/auth/tokenService.js";
import { getCookieConfig } from "@/config/cookieConfig.js";

export const refreshToken = async (req: Request, res: Response) => {
  const { user, newAccessToken, newRefreshToken } =
    await tokenService.refreshToken(req.cookies.refreshToken);

  res.setHeader(
    "Set-Cookie",
    serialize("refreshToken", newRefreshToken, getCookieConfig({})),
  );

  return res.status(200).json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profile: {
        profileType: user.profile?.profileType,
        profileValue: user.profile?.profileValue,
        coverType: user.profile?.coverType,
        coverValue: user.profile?.coverValue,
      },
      settings: {
        darkMode: user.settings?.darkMode,
      },
      accounts: user.accounts?.map(({ provider, providerAccountId }) => ({
        provider,
        providerAccountId,
      })),
    },
    accessToken: newAccessToken,
  });
};
