import { prisma } from "@/lib/prisma.js";
import crypto from "crypto";

export const createSession = async (userId: string, refreshToken: string) => {
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    await tx.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId,
        expiresAt,
      },
    });

    const sessions = await tx.refreshToken.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sessions.length > 5) {
      await tx.refreshToken.deleteMany({
        where: {
          id: {
            in: sessions.slice(5).map((s) => s.id),
          },
        },
      });
    }
  });
};
