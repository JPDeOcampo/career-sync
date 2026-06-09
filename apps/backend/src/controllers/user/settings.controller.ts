import type { Request, Response } from "express";
import * as userService from "@/services/user/settings.service.js";

export const updateSettings = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { darkMode } = req.body;

  const settings = await userService.updateProfile(id as string, {
    darkMode,
  });

  return res.status(200).json({
    message: "Settings updated successfully!",
    settings,
  });
};
