import type { Request, Response } from "express";
import * as userService from "@/services/user/settings.service.js";
import { serialize } from "cookie";
import { getCookieConfig } from "@/config/cookie.config.js";

export const updateSettings = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { darkMode } = req.body;

  const settings = await userService.updateProfile(id as string, {
    darkMode,
  });

  res.setHeader("Set-Cookie", [
    serialize(
      "is_dark_mode",
      `${settings.darkMode}`,
      getCookieConfig({ httpOnly: false }),
    ),
  ]);

  return res.status(200).json({
    message: "Settings updated successfully!",
    settings,
  });
};
