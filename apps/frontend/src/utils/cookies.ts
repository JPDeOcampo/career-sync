export const hasLoginHint = () => {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("is_logged_in="));
};

export const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  // Check the cookie that starts with "is_verified="
  const cookieValue = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(name));

  // If the cookie doesn't exist, return null
  if (!cookieValue) return null;

  // Split by "=" and return the value side
  return cookieValue.split("=")[1] || null;
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
