export const hasLoginHint = () => {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("is_logged_in="));
};
