import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "@/utils/errors/appError.js";
import { verifyJwt } from "@/lib/verifyJwt.js";
import { RefreshResetPasswordDTO } from "@/@types/password.types";

export const checkSignToken = (token?: string) => {
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

export const generateSignToken = async ({
  id,
  type = "access",
  purpose = "auth",
  expiresIn = "15m",
}: {
  id: string;
  type: "access" | "refresh";
  purpose?: string;
  expiresIn?: SignOptions["expiresIn"];
}) => {
  const secrets = {
    access: process.env.JWT_ACCESS_SECRET,
    refresh: process.env.JWT_REFRESH_SECRET,
  };

  const secret = secrets[type];

  if (!secret) {
    throw new Error(`JWT secret for ${type} token is not defined`);
  }

  return jwt.sign({ id, purpose }, secret, {
    expiresIn,
  });
};

interface SecureTokenOptions {
  expiryMinutes?: number;
  byteLength?: number;
  token?: string;
}

interface SecureTokenResult {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export const generateSecureToken = ({
  expiryMinutes = 15,
  byteLength = 32,
  token: customToken,
}: SecureTokenOptions = {}): SecureTokenResult => {
  const token = customToken || crypto.randomBytes(byteLength).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return { token, hashedToken, expiresAt };
};
