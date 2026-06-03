import { prisma } from "@/lib/prisma.js";
import { hashPassword, verifyPassword } from "@/utils/authUtils.js";
import { AppError } from "@/utils/errors/appError.js";
import { maskEmail } from "@/utils/maskEmail.js";
import type {
  UpdatePasswordDTO,
  VerifyResetPasswordDTO,
  ResetPasswordDTO,
  RefreshResetPasswordDTO,
  ResendResetPasswordDTO,
} from "@/@types/password.types.js";
import { resetPasswordTemplate } from "@/utils/mailer/templates/resetPassword.js";
import { sendEmail } from "@/utils/mailer/sendEmail.js";
import { generate6DigitCode } from "@/utils/globalUtils.js";
import { generateSignToken } from "@/utils/generateSignToken.js";
import { verifyJwt } from "@/lib/verifyJwt.js";
import { getRemainingTime } from "@/utils/session.js";
import crypto, { randomUUID } from "crypto";

// --- Send Reset Password OTP Logic ---
const sendResetPasswordOTP = async ({
  user,
}: {
  user: {
    id: string;
    firstName: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
  };
}) => {
  const expiresIn = 2 * 60;
  const expiresAt = Date.now() + expiresIn * 1000;
  const signTokenExpiresIn = 5 * 60;
  const signTokenExpiresAt = Date.now() + signTokenExpiresIn * 1000;

  // Generate a 6 random code and set expiration time (2 minutes) for reset token
  const otp = generate6DigitCode();
  const otpExpiresAt = new Date(Date.now() + expiresIn * 1000);

  // Hash OTP before saving
  const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

  // Store in AuthToken
  await prisma.authToken.create({
    data: {
      tokenHash,
      type: "PASSWORD_RESET",
      expiresAt: otpExpiresAt,
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    },
  });

  // Send the reset email
  const emailSent = await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: resetPasswordTemplate({
      firstName: user.firstName,
      resetCode: otp,
    }),
  });

  if (!emailSent) {
    throw new AppError("Failed to send reset email", 500);
  }
  // Generate a sign token
  const newSignToken = await generateSignToken({
    id: user.id,
    type: "access",
    purpose: "password-reset",
    expiresIn: signTokenExpiresIn,
  });

  return {
    newSignToken,
    signTokenExpiresAt,
    expiresAt,
    expiresIn,
  };
};

const checkSignToken = (token?: string) => {
  if (!token) {
    throw new AppError("Invalid or expired session.", 400);
  }
  let payload: RefreshResetPasswordDTO;
  try {
    payload = verifyJwt<RefreshResetPasswordDTO>(
      token,
      process.env.JWT_ACCESS_SECRET!,
    );
  } catch {
    throw new AppError("Session expired.", 400);
  }
  return payload;
};

// --- Update Password Logic ---
export const updatePassword = async (data: UpdatePasswordDTO) => {
  const { id, currentPassword, newPassword } = data;

  // Find LOCAL account
  const account = await prisma.account.findFirst({
    where: {
      userId: id as unknown as string,
      provider: "LOCAL",
    },
    select: {
      id: true,
      passwordHash: true,
      userId: true,
    },
  });

  if (!account || !account.passwordHash) {
    throw new AppError("Password account not found.", 404);
  }

  // Verify current password
  const isMatch = await verifyPassword(currentPassword, account.passwordHash);

  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 401);
  }

  // Prevent password reuse
  const isSamePassword = await verifyPassword(
    newPassword,
    account.passwordHash,
  );

  if (isSamePassword) {
    throw new AppError("New password cannot be same as old password.", 400);
  }

  // Hash new password
  const hashed = await hashPassword(newPassword);

  return await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      passwordHash: hashed,
    },
  });
};

// --- Forgot Password Logic ---
export const forgotPassword = async (data: {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const { email, ipAddress, userAgent } = data;
  const normalizedEmail = email.toLowerCase().trim();

  // Create fake/mock tokens and expiry dates ahead of time.
  // This ensures that even if the user doesn't exist, the response structure match.
  const mockExpiresIn = 2 * 60;
  const mockExpiresAt = Date.now() + mockExpiresIn * 1000;
  const mockUUID = randomUUID();
  const mockSignToken = await generateSignToken({
    id: mockUUID,
    type: "access",
    purpose: "password-reset",
    expiresIn: mockExpiresIn,
  });

  const mockUpReturn = {
    newSignToken: mockSignToken,
    signTokenExpiresAt: mockExpiresAt,
    expiresIn: mockExpiresIn,
    expiresAt: mockExpiresAt,
    userId: mockUUID,
    email: maskEmail(normalizedEmail),
  };

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return mockUpReturn;
  }

  // Check if user has LOCAL account
  const localAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      provider: "LOCAL",
    },
  });

  // If no local account → no password reset allowed
  if (!localAccount || !localAccount.passwordHash) {
    return mockUpReturn;
  }

  const { newSignToken, signTokenExpiresAt, expiresIn, expiresAt } =
    await sendResetPasswordOTP({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        ipAddress,
        userAgent,
      },
    });

  return {
    newSignToken,
    signTokenExpiresAt,
    expiresIn,
    expiresAt,
    userId: user.id,
    email: maskEmail(user.email),
  };
};

// --- Verify Reset Password Verification Code Logic ---
export const verifyResetPassword = async (data: VerifyResetPasswordDTO) => {
  const { signToken, userId, otp } = data;
  checkSignToken(signToken);

  if (!userId || !otp) {
    throw new AppError("User ID and OTP are required", 400);
  }

  // Hash incoming OTP
  const hashedCode = crypto.createHash("sha256").update(otp).digest("hex");

  // Find valid auth token
  const token = await prisma.authToken.findFirst({
    where: {
      userId: userId as unknown as string,
      type: "PASSWORD_RESET",
      tokenHash: hashedCode,

      usedAt: null,
      revokedAt: null,

      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!token) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  // Mark token as used (prevents reuse)
  await prisma.authToken.update({
    where: {
      id: token.id,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate short-lived reset token (2 minutes)
  const resetToken = await generateSignToken({
    id: token.userId,
    type: "access",
    purpose: "password-reset",
    expiresIn: "2m",
  });

  return resetToken;
};

// --- Reset Password Logic ---
export const resetPassword = async (data: ResetPasswordDTO) => {
  const { signToken, userId, newPassword } = data;
  checkSignToken(signToken);

  if (!userId || !newPassword) {
    throw new AppError("Missing required fields", 400);
  }

  // Find LOCAL account
  const account = await prisma.account.findFirst({
    where: {
      userId: userId as unknown as string,
      provider: "LOCAL",
    },
  });

  if (!account || !account.passwordHash) {
    throw new AppError("Password account not found", 404);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      passwordHash: hashedPassword,
    },
  });

  // Revoke all sessions
  await prisma.refreshToken.deleteMany({
    where: {
      userId: userId as unknown as string,
    },
  });

  // Revoke all reset tokens
  return await prisma.authToken.deleteMany({
    where: {
      userId: userId as unknown as string,
      type: "PASSWORD_RESET",
      // usedAt: null,
    },
    // data: {
    //   revokedAt: new Date(),
    // },
  });
};

// --- Refresh Reset Password Logic ---
export const refreshResetPassword = async ({
  signToken,
  expiresAt,
}: {
  signToken: string;
  expiresAt: number;
}) => {
  const token = checkSignToken(signToken);
  const expiresIn = getRemainingTime(expiresAt);

  if (!token.id) {
    throw new AppError("Invalid or expired session.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as unknown as string },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired session.", 401);
  }

  // Check if there is still a valid reset token
  // const activeResetToken = await prisma.authToken.findFirst({
  //   where: {
  //     userId: user.id,
  //     type: "PASSWORD_RESET",
  //     usedAt: null,
  //     revokedAt: null,
  //     expiresAt: {
  //       gt: new Date(),
  //     },
  //   },
  // });

  // if (!activeResetToken) {
  //   throw new AppError("Session expired.", 400);
  // }

  return {
    userId: user.id,
    expiresIn,
    email: maskEmail(user.email),
  };
};

// --- Resend Reset Password Logic ---
export const resendResetPassword = async ({
  ipAddress,
  userAgent,
  userId,
  signToken,
}: ResendResetPasswordDTO) => {
  checkSignToken(signToken);

  if (!userId) {
    throw new AppError("Invalid or expired session.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as unknown as string },
  });

  if (!user) {
    throw new AppError("Invalid or expired session.", 404);
  }

  // Invalidate previous reset tokens
  await prisma.authToken.deleteMany({
    where: {
      userId: userId as unknown as string,
      type: "PASSWORD_RESET",
      // usedAt: null,
      // revokedAt: null,
    },
  });

  // Create NEW reset OTP
  const { newSignToken, signTokenExpiresAt, expiresAt, expiresIn } =
    await sendResetPasswordOTP({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        ipAddress,
        userAgent,
      },
    });

  return {
    newSignToken,
    signTokenExpiresAt,
    expiresIn,
    expiresAt,
  };
};
