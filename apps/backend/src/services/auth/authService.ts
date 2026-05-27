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
  const { firstName, lastName, email, password, ipAddress, userAgent } =
    userData;

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

      accounts: {
        create: {
          provider: "LOCAL",
          providerAccountId: normalizedEmail,
          passwordHash: hashedPassword,
        },
      },

      authTokens: {
        create: {
          tokenHash: hashedToken,
          type: "EMAIL_VERIFICATION",
          expiresAt,
          ipAddress,
          userAgent,
        },
      },
    },

    include: {
      accounts: true,
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

  const authToken = await prisma.authToken.findFirst({
    where: {
      tokenHash: hashedToken,

      type: "EMAIL_VERIFICATION",

      usedAt: null,
      revokedAt: null,

      expiresAt: {
        gt: new Date(),
      },
    },

    include: {
      user: true,
    },
  });

  if (!authToken) {
    return false;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: authToken.user.id,
      },
      data: {
        emailVerified: true,
      },
    }),

    prisma.authToken.delete({
      where: {
        id: authToken.id,
      },
      // data: {
      //   usedAt: new Date(),
      // },
    }),
  ]);

  return true;
};

// --- Login Logic ---
export const loginUser = async (credentials: LoginUserDTO) => {
  const { email, password, ipAddress, userAgent } = credentials;
  const normalizedEmail = email.toLowerCase().trim();

  const authError = new AppError("Invalid email or password.", 401);

  // Find LOCAL account + user
  const account = await prisma.account.findFirst({
    where: {
      provider: "LOCAL",
      providerAccountId: normalizedEmail,
    },
    include: {
      user: true,
    },
  });

  if (!account || !account.user) {
    throw authError;
  }

  const user = account.user;

  const now = new Date();

  // Check account status
  if (user.status !== "ACTIVE") {
    throw new AppError("Account is not active.", 403);
  }

  // Lockout check
  if (user.lockoutUntil && user.lockoutUntil > now) {
    const msLeft = user.lockoutUntil.getTime() - now.getTime();
    const minutesLeft = Math.ceil(msLeft / 1000 / 60);

    throw new AppError(
      `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      403,
    );
  }

  // Reset lockout if expired
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
    const token = await prisma.authToken.findFirst({
      where: {
        userId: user.id as unknown as string,
        type: "EMAIL_VERIFICATION",
        usedAt: null,
        revokedAt: null,
      },
    });

    const verificationExpired =
      !token || !token.expiresAt || token.expiresAt < new Date();

    if (verificationExpired) {
      const newToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(newToken)
        .digest("hex");

      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.authToken.update({
        where: {
          id: token?.id,
        },
        data: {
          tokenHash: hashedToken,
          expiresAt: expires,
          ipAddress,
          userAgent,
        },
      });
      const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${newToken}`;

      await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html: verifyEmailTemplate({
          firstName: user.firstName,
          verificationLink,
        }),
      });

      throw new AppError(
        "A new verification email has been sent. Please check your inbox and verify your email before logging in.",
        403,
      );
    }

    throw new AppError(
      "Please check your inbox and verify your email before logging in.",
      403,
    );
  }

  // Validate password
  if (!account.passwordHash) {
    throw authError;
  }

  const isValid = await verifyPassword(password, account.passwordHash);

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

    if (newAttempts >= maxAttempts) {
      throw new AppError(
        "Too many failed attempts. Account locked for 15 minutes.",
        403,
      );
    }

    throw new AppError(
      `Invalid email or password. ${attemptsLeft} attempt(s) left.`,
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

  // Session + user update transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Clean expired sessions
    await tx.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    // Get active sessions
    const sessions = await tx.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Keep max 5 sessions
    if (sessions.length >= 5) {
      const toDelete = sessions.slice(4);

      await tx.refreshToken.deleteMany({
        where: {
          id: { in: toDelete.map((s) => s.id) },
        },
      });
    }

    // Create new session
    await tx.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Update user login state
    return tx.user.update({
      where: { id: user.id },
      data: {
        loginCount: { increment: 1 },
        loginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
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

export const userDeleteAccount = async ({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "LOCAL",
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!account?.passwordHash) {
    throw new AppError(
      "Password verification unavailable for this account.",
      400,
    );
  }

  const valid = await verifyPassword(password, account.passwordHash);

  if (!valid) {
    throw new AppError("Incorrect password.", 401);
  }

  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: { userId },
    });

    const deletedUser = await tx.user.delete({
      where: { id: userId },
    });

    return deletedUser;
  });
};
