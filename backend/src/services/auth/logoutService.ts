import { AppError } from "@/utils/errors/appError.js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma.js";

export const userSingleLogout = async (token: string) => {
  if (token) {
    // Hash the token to find the match in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    return await prisma.refreshToken.delete({
      where: {
        token: hashedToken,
      },
    });
  }
};

export const logoutAllDevices = async (userId: string | undefined) => {
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  return await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
