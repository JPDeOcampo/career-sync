import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as tokenService from "@/services/auth/token.service.js";
import { getCookieConfig } from "@/config/cookie.config.js";

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
      loginCount: user.loginCount,
      emailStatus: user.emailStatus,
      emailChangeRequests: user.emailChangeRequests,
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
