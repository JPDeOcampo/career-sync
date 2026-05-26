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
