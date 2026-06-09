import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as logoutService from "@/services/auth/logout.service.js";
import { clearAuthCookies } from "@/utils/cookies.js";

// --- Single Logout Controller ---
export const userSingleLogout = async (req: Request, res: Response) => {
  await logoutService.userSingleLogout(req.cookies.refreshToken);

  clearAuthCookies(res);

  return res.status(200).json({ message: "Logged out successfully" });
};

// --- Logout All Devices Controller ---
export const logoutAllDevices = async (req: Request, res: Response) => {
  await logoutService.logoutAllDevices(req.user?.id);

  clearAuthCookies(res);

  return res
    .status(200)
    .json({ message: "Logged out from all devices successfully" });
};
