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
import { randomColorHex } from "@/utils/colors";
import { firebaseAdmin } from "@/config/firebase.js";

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

      profile: {
        create: {
          profileType: "COLOR",
          profileValue: randomColorHex(),
        },
      },

      settings: {
        create: {},
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
        loginCount: true,

        profile: {
          select: {
            profileType: true,
            profileValue: true,
            coverType: true,
            coverValue: true,
          },
        },

        settings: {
          select: {
            darkMode: true,
          },
        },

        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });
  });

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

export const userOAuthLogin = async ({
  idToken,
  provider,
}: {
  idToken: string;
  provider: "GOOGLE" | "GITHUB";
}) => {
  const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

  const { uid, email, name, picture, email_verified } = decoded;

  if (!email) {
    throw new AppError("OAuth account email not found.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      loginCount: true,

      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },

      profile: {
        select: {
          profileType: true,
          profileValue: true,
          coverType: true,
          coverValue: true,
        },
      },

      settings: {
        select: {
          darkMode: true,
        },
      },
    },
  });

  if (!user) {
    const nameParts = (name ?? "").split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";

    user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        emailVerified: email_verified ?? true,

        accounts: {
          create: {
            provider,
            providerAccountId: uid,
          },
        },

        profile: {
          create: {
            profileType: picture ? "IMAGE" : "COLOR",
            profileValue: picture || randomColorHex(),
          },
        },

        settings: {
          create: {},
        },
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        loginCount: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        profile: {
          select: {
            profileType: true,
            profileValue: true,
            coverType: true,
            coverValue: true,
          },
        },
        settings: {
          select: {
            darkMode: true,
          },
        },
      },
    });
  } else {
    // User already exists, linked account
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider,
      },
    });

    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId: uid,
        },
      });
    }

    if (email_verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }
  }

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

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user,
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
  idToken,
}: {
  userId: string;
  password?: string;
  idToken?: string;
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

  //LOCAL ACCOUNT FLOW
  if (account?.passwordHash) {
    if (!password) {
      throw new AppError("Password is required.", 400);
    }

    const valid = await verifyPassword(password, account.passwordHash);

    if (!valid) {
      throw new AppError("Incorrect password.", 401);
    }
  } else {
    // OAUTH
    if (!idToken) {
      throw new AppError("Reauthentication required.", 401);
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        accounts: {
          select: {
            providerAccountId: true,
          },
        },
      },
    });

    const hasMatchingAccount = user?.accounts.some(
      (account) => account.providerAccountId === decoded.uid,
    );

    if (!user || !hasMatchingAccount) {
      throw new AppError("Unauthorized.", 401);
    }

    // Require recent login (5 mins)
    const authTime = decoded.auth_time * 1000;
    const now = Date.now();

    const FIVE_MINUTES = 5 * 60 * 1000;

    if (now - authTime > FIVE_MINUTES) {
      throw new AppError("Recent login required.", 401);
    }
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
