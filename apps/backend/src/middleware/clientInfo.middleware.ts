import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      ipAddress?: string;
      userAgent?: string;
    }
  }
}

export const clientInfoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;
  req.userAgent = req.headers["user-agent"];

  next();
};
