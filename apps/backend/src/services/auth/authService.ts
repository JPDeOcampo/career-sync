import { hashPassword, verifyPassword } from "@/utils/authUtils.js";
import { generateSignToken } from "@/utils/generateSignToken.js";
import { AppError } from "@/utils/errors/appError.js";
import type {
  RegisterUserDTO,
  LoginUserDTO,
  UserDTO,
} from "@career-sync/shared";
import crypto from "crypto";
import { prisma } from "@/lib/prisma.js";
import { sendEmail } from "@/utils/mailer/sendEmail.js";
import { verifyEmailTemplate } from "@/utils/mailer/templates/verifyEmail.js";

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

  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,

      emailVerified: false,
      verificationCode: hashedToken,
      verificationCodeExpires: expiresAt,
    },
  });

  const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${token}`;

  await sendEmail({
    to: newUser.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate({
      firstName: newUser.firstName,
      verificationLink,
    }),
  });

  return newUser;
};

// --- Email Verification Logic ---
export const userVerifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      verificationCode: hashedToken,
      verificationCodeExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    // throw new AppError("Invalid verification token.", 400);
    return false;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  return true;
};

// --- Login Logic ---
export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password } = credentials;
  const authError = new AppError("Invalid email or password.", 401);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) throw authError;

  const now = new Date();

  // If user is locked, throw error
  if (user.lockoutUntil && user.lockoutUntil > now) {
    throw new AppError(
      `Too many failed attempts. Account locked. Try again after ${user.lockoutUntil.toLocaleTimeString()}.`,
      403,
    );
  }

  // If lockout expired, reset user login attempts and lockout status
  if (user.lockoutUntil && user.lockoutUntil <= now) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });
  }

  // Email verification check
  if (!user.emailVerified) {
    const verificationExpired =
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date();

    if (verificationExpired) {
      const token = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verificationCode: hashedToken,
          verificationCodeExpires: expires,
        },
      });
      const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html: verifyEmailTemplate({
          firstName: user.firstName,
          verificationLink,
        }),
      });

      throw new AppError(
        "Verification expired. A new email has been sent.",
        403,
      );
    }

    throw new AppError("Please verify your email. Check your inbox.", 403);
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    const maxAttempts = 5;
    const newAttempts = user.loginAttempts + 1;
    const attemptsLeft = maxAttempts - newAttempts;
    let lockoutUntil: Date | null = null;

    // Trigger 15-minute lockout on the 5th failed attempt
    if (newAttempts >= maxAttempts) {
      lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: { increment: 1 },
        lockoutUntil,
      },
    });

    // If user has reached the maximum number of attempts, locked out
    if (newAttempts >= maxAttempts) {
      throw new AppError(
        "Too many failed attempts. Your account has been locked for 15 minutes.",
        403,
      );
    }

    throw new AppError(
      `Invalid email or password. You have ${attemptsLeft} ${attemptsLeft === 1 ? "attempt" : "attempts"} left before your account is locked.`,
      401,
    );
  }

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
    // Delete anything already expired
    await tx.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

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

    return tx.user.update({
      where: { id: user.id },
      data: { loginCount: { increment: 1 } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        refreshTokens: true,
        loginCount: true,
      },
    });
  });

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

export const userUpdate = async (
  userId: string | string[],
  userData: Partial<UserDTO>,
) => {
  const { firstName, lastName, email } = userData;

  const dataToUpdate: Partial<UserDTO> = {};

  if (firstName !== undefined) dataToUpdate.firstName = firstName;
  if (lastName !== undefined) dataToUpdate.lastName = lastName;

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError("The email is already taken.", 400, "email");
    }

    dataToUpdate.email = normalizedEmail;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId as unknown as string },
    data: dataToUpdate,
  });

  return {
    userId: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    updatedAt: updatedUser.updatedAt,
    createdAt: updatedUser.createdAt,
  };
};
