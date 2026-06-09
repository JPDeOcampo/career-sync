import { hashPassword, verifyPassword } from "@/utils/authUtils.js";
import { AppError } from "@/utils/errors/appError.js";
import type {
  RegisterUserDTO,
  LoginUserDTO,
  UserUpdateDTO,
  OAuthProviderDTO,
} from "@career-sync/shared";
import { prisma } from "@/lib/prisma.js";
import { randomColorHex } from "@/utils/colors";
import { firebaseAdmin } from "@/config/firebase.config.js";
import { USER_SELECT } from "@/constants/prisma-selects.constant";
import { createSession } from "./session.service";
import { generateAuthTokens } from "./token.service";
import { generateSecureToken } from "@/utils/token.js";
import { sendNewVerificationEmail } from "./email-verification.service";

const handleEmailVerificationCheck = async (
  user: { id: string; email: string; firstName: string; loginCount?: number },
  ipAddress?: string,
  userAgent?: string,
): Promise<{ sentNewEmail: boolean; expiresAt?: Date }> => {
  const token = await prisma.authToken.findFirst({
    where: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
      revokedAt: null,
    },
  });

  const verificationExpired = !token || token.expiresAt < new Date();

  if (verificationExpired) {
    if (token) {
      await prisma.authToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });
    }

    const expiresAt = await sendNewVerificationEmail(
      user,
      ipAddress,
      userAgent,
    );
    return {
      sentNewEmail: true,
      expiresAt,
    };
  }

  return {
    sentNewEmail: false,
  };
};

// --- Registration Logic ---
export const register = async (userData: RegisterUserDTO) => {
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

  const { hashedToken, expiresAt } = generateSecureToken();

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      loginCount: 0,

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

  return await sendNewVerificationEmail(newUser, ipAddress, userAgent);
};

// --- Email Verification Logic ---
export const verifyEmail = async (token: string) => {
  const { hashedToken } = generateSecureToken({ token });

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

  const emailChangeRequest = await prisma.emailChangeRequest.findFirst({
    where: {
      userId: authToken.user.id,
    },
  });

  if (emailChangeRequest) {
    await prisma.$transaction([
      // Update the email
      prisma.user.update({
        where: {
          id: authToken.user.id,
        },
        data: {
          email: emailChangeRequest.newEmail,
        },
      }),

      // Update the providerAccountId
      prisma.account.update({
        where: {
          userId_provider: {
            userId: authToken.user.id,
            provider: "LOCAL",
          },
        },
        data: {
          providerAccountId: emailChangeRequest.newEmail,
        },
      }),

      // Delete the verification token
      prisma.authToken.delete({
        where: {
          id: authToken.id,
        },
      }),

      // Delete the email change request
      prisma.emailChangeRequest.delete({
        where: {
          userId: authToken.user.id,
          newEmail: emailChangeRequest.newEmail,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: authToken.user.id,
        },
        data: {
          emailStatus: "VERIFIED",
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
  }

  return true;
};

export const resendVerificationEmail = async (
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const account = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!account) {
    throw new AppError("Account not found. Please try logging in again.", 401);
  }

  const user = {
    id: account.id,
    email: normalizedEmail,
    firstName: account.firstName,
    lastName: account.lastName,
    loginCount: account.loginCount,
  };

  const result = await handleEmailVerificationCheck(user, ipAddress, userAgent);

  if (!result.sentNewEmail) {
    throw new AppError(
      "A valid verification link was already sent recently. Please check your spam folder or try again later.",
      429,
    );
  }

  return result.expiresAt && new Date(result.expiresAt).toISOString();
};

// --- Login Logic ---
export const login = async (credentials: LoginUserDTO) => {
  const { email, password, ipAddress, userAgent } = credentials;

  const normalizedEmail = email.toLowerCase().trim();

  const authError = new AppError("Invalid email or password.", 401);

  const account = await prisma.account.findFirst({
    where: {
      provider: "LOCAL",
      providerAccountId: normalizedEmail,
    },
    include: {
      user: true,
    },
  });

  if (!account?.user) {
    throw authError;
  }

  const user = account.user;
  const now = new Date();

  // Account status
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

  // Reset expired lockout
  if (user.lockoutUntil && user.lockoutUntil <= now) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });
  }

  // Email verification
  if (user.emailStatus === "UNVERIFIED" && user.loginCount === 0) {
    const result = await handleEmailVerificationCheck(
      user,
      ipAddress,
      userAgent,
    );

    if (result.sentNewEmail) {
      await sendNewVerificationEmail(user, ipAddress, userAgent);

      throw new AppError(
        "A new verification email has been sent. Please check your inbox and verify your email before logging in.",
        403,
      );
    }

    throw new AppError(
      "A valid verification link was already sent recently. Please check your spam folder or try again later.",
      403,
    );
  }

  // Password validation
  if (!account.passwordHash) {
    throw authError;
  }

  const isValid = await verifyPassword(password, account.passwordHash);

  if (!isValid) {
    const maxAttempts = 5;
    const newAttempts = user.loginAttempts + 1;

    const attemptsLeft = maxAttempts - newAttempts;

    let lockoutUntil: Date | null = null;

    if (newAttempts >= maxAttempts) {
      lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: {
          increment: 1,
        },
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

  const { accessToken, refreshToken } = await generateAuthTokens(user.id);

  await createSession(user.id, refreshToken);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      loginCount: {
        increment: 1,
      },
      loginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: new Date(),
    },
    select: USER_SELECT,
  });

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

export const oauthLogin = async ({
  idToken,
  provider,
}: {
  idToken: string;
  provider: OAuthProviderDTO;
}) => {
  const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

  const { uid, email, name, picture, email_verified } = decoded;

  if (!email) {
    throw new AppError("OAuth account email not found.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      status: true,
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

        emailStatus: email_verified ? "VERIFIED" : "UNVERIFIED",

        loginCount: 0,

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
        status: true,
      },
    });
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is not active.", 403);
  }

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
  } else if (existingAccount.providerAccountId !== uid) {
    await prisma.account.update({
      where: {
        id: existingAccount.id,
      },
      data: {
        providerAccountId: uid,
      },
    });
  }

  if (email_verified) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailStatus: "VERIFIED",
      },
    });
  }

  const { accessToken, refreshToken } = await generateAuthTokens(user.id);

  await createSession(user.id, refreshToken);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      loginCount: {
        increment: 1,
      },
      lastLoginAt: new Date(),
    },
    select: USER_SELECT,
  });

  return {
    user: updatedUser,
    accessToken,
    refreshToken,
  };
};

export const updateEmail = async (
  userId: string,
  userData: Partial<UserUpdateDTO>,
  ipAddress?: string,
  userAgent?: string,
) => {
  const { email } = userData;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!currentUser) {
    throw new AppError("User not found.", 404);
  }

  if (!email) {
    throw new AppError("Email is required.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if the email is already taken by another user
  const existingUserWithEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (currentUser.email === normalizedEmail) {
    throw new AppError(
      "The email is already in use. Please use a different email.",
      400,
    );
  }

  if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
    throw new AppError("The email is already taken.", 400);
  }

  const emailChangeRequest = await prisma.emailChangeRequest.create({
    data: {
      newEmail: normalizedEmail,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,

      user: {
        connect: {
          id: userId,
        },
      },
    },

    select: {
      id: true,
      userId: true,
      newEmail: true,
      ipAddress: true,
      userAgent: true,
    },
  });

  // Send verification email using fallback to database values if not being updated
  const emailPayload = {
    id: userId,
    email: normalizedEmail,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    loginCount: currentUser.loginCount,
  };

  const expiresAt = await sendNewVerificationEmail(
    emailPayload,
    ipAddress,
    userAgent,
  );

  return {
    emailChangeRequest,
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

export const removeNewEmail = async (userId: string, email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const authToken = await prisma.authToken.findFirst({
    where: {
      userId,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
      revokedAt: null,
    },
  });

  if (!authToken) {
    throw new AppError("No email verification token found.", 404);
  }

  await prisma.authToken.delete({
    where: { id: authToken.id },
  });

  return prisma.emailChangeRequest.delete({
    where: {
      userId,
      newEmail: normalizedEmail,
    },
  });
};

export const deleteAccount = async ({
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
      throw new AppError("Re-authentication required.", 401);
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
      throw new AppError(
        "Unauthorized account, please select a different account.",
        401,
      );
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
