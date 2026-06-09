import type { Request, Response } from "express";
import * as userService from "@/services/user/profile.service.js";

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;

  const user = await userService.updateProfile(id as string, {
    firstName,
    lastName,
  });

  return res.status(200).json({
    message: "Profile updated successfully!",
    user,
  });
};
