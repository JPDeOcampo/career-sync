import jwt, { type SignOptions } from "jsonwebtoken";

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
