import { AppError } from "@/utils/errors/appError.js";
import type { UserUpdateDTO } from "@career-sync/shared";
import { prisma } from "@/lib/prisma.js";
import { USER_SELECT } from "@/constants/prisma-selects.constant";

export const updateProfile = async (
  userId: string,
  userData: Partial<UserUpdateDTO>,
) => {
  const { firstName, lastName } = userData;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!firstName && !lastName) {
    throw new AppError(
      "At least one field (firstName or lastName) is required.",
      400,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
    },
    select: USER_SELECT,
  });

  return updatedUser;
};
