export const maskEmail = (email?: string): string => {
  if (!email || !email.includes("@")) return "";

  const [name = "", domain = ""] = email.split("@");
  if (!name || !domain) return "";

  const len = name.length;

  // 1 character → fully mask
  if (len === 1) {
    return `*@${domain}`;
  }

  // 2 characters → show first, mask second
  if (len === 2) {
    return `${name[0]}*@${domain}`;
  }

  // 3–6 characters → show first 2, mask rest
  if (len <= 6) {
    const visible = name.slice(0, 2);
    const masked = "*".repeat(len - 2);
    return `${visible}${masked}@${domain}`;
  }

  // More than 6 → show first 3 + last 3
  const first = name.slice(0, 3);
  const last = name.slice(-3);
  const masked = "*".repeat(len - 6);

  return `${first}${masked}${last}@${domain}`;
};
