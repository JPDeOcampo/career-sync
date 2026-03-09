import { hashPassword, verifyPassword } from "@/utils/authUtils.js";
import { generateSignToken } from "@/utils/generateSignToken.js";
import { AppError } from "@/utils/errors/appError.js";
import type { RegisterUserDTO, LoginUserDTO } from "@/@types/auth.types.js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma.js";

// --- Registration Logic ---
export const registerUser = async (userData: RegisterUserDTO) => {
  const { firstName, lastName, email, password } = userData;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError("The email is already registered.", 400, "email");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      // refreshTokens will be an empty array by default based on the schema
    },
  });

  return newUser;
};

// --- Login Logic ---
export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password } = credentials;
  const authError = new AppError("Invalid email or password.", 401);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) throw authError;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw authError;

  // Generate tokens
  const accessToken = await generateSignToken({
    id: user.id,
    type: "access",
    expiresIn: "15m",
  });
  const refreshToken = await generateSignToken({
    id: user.id,
    type: "refresh",
    expiresIn: "7d",
  });

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const updatedUser = await prisma.$transaction(async (tx) => {
    // Delete expired sessions OR excess sessions in one go if possible
    // To prevent a growing list, we fetch current count within the transaction
    const activeSessions = await tx.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }, // Newest first
    });

    // If at limit, remove the oldest (FIFO)
    if (activeSessions.length >= 5) {
      const oldestSessions = activeSessions.slice(4); // Keep top 4, delete rest
      await tx.refreshToken.deleteMany({
        where: { id: { in: oldestSessions.map((s) => s.id) } },
      });
    }

    // Create the new session
    await tx.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    return tx.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        refreshTokens: true,
      },
    });
  });

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};
