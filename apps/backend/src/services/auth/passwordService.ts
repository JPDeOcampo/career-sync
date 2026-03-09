import { prisma } from "@/lib/prisma.js";
import { hashPassword, verifyPassword } from "@/utils/authUtils.js";
import { AppError } from "@/utils/errors/appError.js";
import { maskEmail } from "@/utils/maskEmail.js";
import type {
  UpdatePasswordDTO,
  VerifyResetPWVerificationCodeDTO,
  ResetPasswordDTO,
  RefreshResetPasswordCodeDTO,
  ResendResetVerificationCodeDTO,
} from "@/@types/password.types.js";
import { sendResetPassword } from "@/utils/mailer/sendResetPassword.js";
import { generate6DigitCode } from "@/utils/globalUtils.js";
import bcrypt from "bcrypt";
import { generateSignToken } from "@/utils/generateSignToken.js";
import { verifyJwt } from "@/lib/verifyJwt.js";

const checkResetToken = (token?: string) => {
  if (!token) {
    throw new AppError("Reset token is missing or expired", 400);
  }
  let payload: RefreshResetPasswordCodeDTO;
  try {
    payload = verifyJwt<RefreshResetPasswordCodeDTO>(
      token,
      process.env.JWT_ACCESS_SECRET!,
    );
  } catch {
    throw new AppError("Reset token is invalid or expired", 400);
  }
  return payload;
};

// --- Update Password Logic ---
export const updatePassword = async (data: UpdatePasswordDTO) => {
  const { id, currentPassword, newPassword } = data;

  // Validate ObjectId first
  if (id as unknown as string) {
    throw new AppError("Invalid user ID.", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: id as unknown as string },
    select: { password: true },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Verify current password
  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 401);
  }

  // Prevent password reuse
  const isSamePassword = await verifyPassword(newPassword, user.password);

  if (isSamePassword) {
    throw new AppError("New password cannot be same as old password.", 400);
  }

  // Hash new password
  return await prisma.user.update({
    where: {
      id: id as unknown as string,
    },
    data: {
      password: await hashPassword(newPassword),
    },
  });
};

// --- Forgot Password Logic ---
export const forgotPassword = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // Check if the user exists and is not a social account
  if (!existingUser || existingUser.socialAccount) {
    return;
  }

  // Generate a 6 digit random code and set expiration time (2 minutes)
  const verificationCode = generate6DigitCode();
  const verificationCodeExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  // Send the reset email
  const emailSent = await sendResetPassword({
    email,
    resetCode: verificationCode,
  });

  if (!emailSent) {
    throw new AppError("Failed to send reset email", 500);
  }

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      verificationCode: await bcrypt.hash(verificationCode, 10),
      verificationCodeExpires,
    },
  });

  // Generate short-lived reset token (2 minutes)
  const verificationCodeToken = await generateSignToken({
    id: existingUser.id,
    type: "access",
    purpose: "password-reset",
    expiresIn: "2m",
  });

  return {
    verificationCodeToken,
    userId: existingUser.id,
    email: maskEmail(email),
  };
};

// --- Verify Reset Password Verification Code Logic ---
export const verifyResetPWVerificationCode = async (
  data: VerifyResetPWVerificationCodeDTO,
) => {
  const { verificationCodeToken, userId, verificationCode } = data;
  checkResetToken(verificationCodeToken);
  if (!userId || !verificationCode) {
    throw new AppError("Email and verification code are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as unknown as string },
    select: {
      id: true,
      verificationCode: true,
      verificationCodeExpires: true,
    },
  });

  if (!user || !user.verificationCode || !user.verificationCodeExpires) {
    throw new AppError("Invalid verification code", 400);
  }

  const now = new Date();
  const validCode = await bcrypt.compare(
    verificationCode,
    user.verificationCode,
  );

  // Check if code matches
  if (!validCode) {
    throw new AppError("Invalid verification code", 400);
  }

  // Check if code is expired
  if (user.verificationCodeExpires < now) {
    throw new AppError("Verification code has expired", 400);
  }

  // Generate short-lived reset token (2 minutes)
  const resetToken = await generateSignToken({
    id: user.id,
    type: "access",
    purpose: "password-reset",
    expiresIn: "2m",
  });

  return resetToken;
};

// --- Reset Password Logic ---
export const resetPassword = async (data: ResetPasswordDTO) => {
  const { resetToken, userId, newPassword } = data;
  checkResetToken(resetToken);

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { id: userId as unknown as string },
  });

  if (
    !user ||
    !user.verificationCode ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < new Date()
  ) {
    throw new AppError("Invalid verification code", 400);
  }

  // Update user password and clear verification code
  return await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(newPassword),
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });
};

// --- Refresh Reset Password Logic ---
export const refreshResetPassword = async (refreshToken: string) => {
  const resetToken = checkResetToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: resetToken.id },
    select: {
      id: true,
      email: true,
    },
  });

  return {
    userId: user?.id,
    email: maskEmail(user?.email),
  };
};

// --- Resend Reset Verification Code Logic ---
export const resendResetVerificationCode = async ({
  userId,
  resetToken,
}: ResendResetVerificationCodeDTO) => {
  checkResetToken(resetToken);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId as unknown as string },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Generate a 6 random code and set expiration time (2 minutes) for reset token
  const verificationCode = generate6DigitCode();
  const verificationCodeExpires = new Date(Date.now() + 2 * 60 * 1000);

  // Send the reset email
  const emailSent = await sendResetPassword({
    email: existingUser.email,
    resetCode: verificationCode,
  });

  if (!emailSent) {
    throw new AppError("Failed to send reset email", 500);
  }

  return await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      verificationCode: await bcrypt.hash(verificationCode, 10),
      verificationCodeExpires: verificationCodeExpires,
    },
  });
};
