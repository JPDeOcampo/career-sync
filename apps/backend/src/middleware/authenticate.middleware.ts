import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors/appError.js";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback to cookie if no Bearer token in header
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as DecodedToken;

    req.user = { id: decoded.id };

    next();
  } catch {
    throw new AppError(
      "Token invalid or expired. Please try again later.",
      401,
    );
  }
};
