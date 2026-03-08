import jwt, { type SignOptions } from "jsonwebtoken";

export const generateSignToken = async ({
  id,
  purpose = "auth",
  expiresIn = "15m",
}: {
  id: string;
  purpose?: string;
  expiresIn?: SignOptions["expiresIn"];
}) => {
  return jwt.sign({ id, purpose }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn,
  });
};
