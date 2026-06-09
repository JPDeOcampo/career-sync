import { serialize } from "cookie";
import { Response } from "express";
import { clearCookieConfig } from "@/config/cookie.config.js";

export const clearAuthCookies = (res: Response) => {
  res.setHeader("Set-Cookie", [
    serialize("resend_verification_expires_at", "", clearCookieConfig({})),
    serialize("refreshToken", "", clearCookieConfig({})),
    serialize("is_logged_in", "", clearCookieConfig({})),
  ]);
};
