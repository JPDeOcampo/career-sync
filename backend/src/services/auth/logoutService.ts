import { AppError } from "@/utils/errors/appError.js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma.js";

export const userSingleLogout = async (token: string) => {
  if (token) {
    // Hash the token to find the match in our DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // This ensures logging out on Web doesn't log you out on Mobile.
    return await prisma.user.updateMany({
      where: {
        refreshTokens: {
          some: {
            token: hashedToken,
          },
        },
      },
      data: {
        refreshTokens: {
          deleteMany: {
            where: {
              token: hashedToken,
            },
          },
        },
      },
    });
  }
};

export const logoutAllDevices = async (userId: string | undefined) => {
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  return await prisma.user.update({
    where: { 
      id: userId 
    },
    data: {
      refreshTokens: {
        set: [],
      },
    },
  });
};
