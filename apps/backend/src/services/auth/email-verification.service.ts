import { prisma } from "@/lib/prisma.js";
import { generateSecureToken } from "@/utils/token.js";
import { sendEmail } from "@/utils/mailer/sendEmail.js";
import { verifyEmailTemplate } from "@/utils/mailer/templates/verifyEmail.js";

export const sendNewVerificationEmail = async (
  user: {
    id: string;
    email: string;
    firstName: string;
    loginCount?: number;
  },
  ipAddress?: string,
  userAgent?: string,
) => {
  const { token, hashedToken, expiresAt } = generateSecureToken();

  const existingToken = await prisma.authToken.findFirst({
    where: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
      revokedAt: null,
    },
  });

  if (existingToken) {
    await prisma.authToken.update({
      where: {
        id: existingToken.id,
      },
      data: {
        tokenHash: hashedToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  } else {
    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        tokenHash: hashedToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate({
      firstName: user.firstName,
      verificationLink,
      loginCount: user.loginCount,
    }),
  });

  return expiresAt;
};
