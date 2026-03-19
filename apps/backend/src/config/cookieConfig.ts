import type { SerializeOptions } from "cookie";

const isProduction = process.env.NODE_ENV === "production";
const sameSite = "lax";
const domain = isProduction ? process.env.DOMAIN : undefined;

export const getCookieConfig = ({
  httpOnly = true,
  maxAge = 7 * 24 * 60 * 60, // 7 days
  path = "/",
}: {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
} = {}): SerializeOptions => ({
  httpOnly,
  secure: isProduction,
  sameSite,
  domain,
  maxAge,
  path,
});

export const clearCookieConfig = (options = {}): SerializeOptions => ({
  ...getCookieConfig(options),
  maxAge: 0,
  expires: new Date(0),
});
