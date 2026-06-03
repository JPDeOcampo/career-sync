import { prisma } from "@/lib/prisma.js";
import crypto from "crypto";
import { sendEmail } from "@/utils/mailer/sendEmail.js";
import { verifyEmailTemplate } from "@/utils/mailer/templates/verifyEmail.js";

export const sendNewVerificationEmail = async (
  user: {
    id: string;
    email: string;
    firstName: string;
  },
  ipAddress?: string,
  userAgent?: string,
) => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

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
        tokenHash,
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
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate({
      firstName: user.firstName,
      verificationLink,
    }),
  });
};
