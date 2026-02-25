import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateSignToken } from "@/utils/generateSignToken.js";
import { AppError } from "@/utils/errors/appError.js";

export const refreshToken = async (token: string) => {
  if (!token) throw new AppError("No refresh token", 401);

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { refreshTokens: true },
  });

  const tokenExists = user?.refreshTokens.find(
    (t) => t.token === hashedIncomingToken,
  );

  // If the JWT is valid but NOT in our database, someone else used it already.
  if (!user || !tokenExists) {
    if (user) {
      // Clear all sessions for this user (compromised account)
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    }
    throw new AppError(
      "Security alert: Session compromised. Please login again.",
      403,
    );
  }

  const newAccessToken = await generateSignToken({
    id: user.id,
    expiresIn: "15m",
  });
  const newRefreshToken = await generateSignToken({
    id: user.id,
    expiresIn: "7d",
  });

  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  // We delete the used token and create the new one in one transaction
  await prisma.$transaction([
    prisma.refreshToken.delete({
      where: { token: hashedIncomingToken },
    }),
    prisma.refreshToken.create({
      data: {
        token: newHashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),

    // Cleanup expired tokens for this user while we're at it
    prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    }),
  ]);

  return { newAccessToken, newRefreshToken };
};
