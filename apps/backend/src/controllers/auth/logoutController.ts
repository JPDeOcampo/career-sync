import type { Request, Response } from "express";
import { serialize } from "cookie";
import * as logoutService from "@/services/auth/logoutService.js";

// --- Single Logout Controller ---
export const userSingleLogout = async (req: Request, res: Response) => {
  await logoutService.userSingleLogout(req.cookies.refreshToken);
  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    }),
    serialize("is_logged_in", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    }),
  ]);

  return res.status(200).json({ message: "Logged out successfully" });
};

// --- Logout All Devices Controller ---
export const logoutAllDevices = async (req: Request, res: Response) => {
  await logoutService.logoutAllDevices(req.user?.id);

  res.setHeader("Set-Cookie", [
    serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    }),
    serialize("is_logged_in", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    }),
  ]);

  return res
    .status(200)
    .json({ message: "Logged out from all devices successfully" });
};
