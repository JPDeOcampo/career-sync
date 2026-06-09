export const hasLoginHint = () => {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("is_logged_in="));
};

export const getVerifiedStatus = () => {
  // Check the cookie that starts with "is_verified="
  const verifiedCookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("is_verified="));

  // If the cookie doesn't exist, return null
  if (!verifiedCookie) return null;

  // Split by "=" and return the value side
  return verifiedCookie.split("=")[1];
};

export const getEmailVerificationExpiresAtDate = (): Date | null => {
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("resend_verification_expires_at="));

  if (!cookie) return null;

  const value = cookie.split("=")[1];

  const decoded = decodeURIComponent(value);

  const date = new Date(decoded);

  return isNaN(date.getTime()) ? null : date;
};
