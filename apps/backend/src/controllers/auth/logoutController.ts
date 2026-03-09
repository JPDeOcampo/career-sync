import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as logoutService from "@/services/auth/logoutService.js";
import { clearCookieConfig } from "@/config/cookieConfig.js";

// --- Single Logout Controller ---
export const userSingleLogout = async (req: Request, res: Response) => {
  await logoutService.userSingleLogout(req.cookies.refreshToken);
  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({ httpOnly: false })),
  ]);

  return res.status(200).json({ message: "Logged out successfully" });
};

// --- Logout All Devices Controller ---
export const logoutAllDevices = async (req: Request, res: Response) => {
  await logoutService.logoutAllDevices(req.user?.id);

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({ httpOnly: false })),
  ]);

  return res
    .status(200)
    .json({ message: "Logged out from all devices successfully" });
};
