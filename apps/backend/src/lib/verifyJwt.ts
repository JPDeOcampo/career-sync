import jwt from "jsonwebtoken";

export const verifyJwt = <T>(token: string, secret: string): T => {
  if (!token) {
    throw new Error("Token missing");
  }

  return jwt.verify(token, secret) as T;
};
