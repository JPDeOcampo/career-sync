import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma.js";

export const updateProfile = async (
  userId: string,
  settingsData: { darkMode: boolean },
) => {
  const { darkMode } = settingsData;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const settings = await prisma.userSettings.update({
    where: { userId: userId },
    data: {
      darkMode,
    },
    select: {
      darkMode: true,
    },
  });

  return settings;
};
