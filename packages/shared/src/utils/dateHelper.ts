import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  subDays,
  differenceInDays,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";

export const formatDate = (
  date: string | Date,
  formatStr: string = "MMM dd, yyyy",
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : "Invalid date";
  } catch {
    return "Invalid date";
  }
};

export const formatTime = (time: string): string => {
  try {
    // Handle time in HH:mm format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

export const isDateInRange = (
  date: string,
  from?: string,
  to?: string,
): boolean => {
  if (!from && !to) return true;

  try {
    const dateObj = parseISO(date);
    const fromObj = from ? parseISO(from) : null;
    const toObj = to ? parseISO(to) : null;

    if (fromObj && dateObj < fromObj) return false;
    if (toObj && dateObj > toObj) return false;

    return true;
  } catch {
    return true;
  }
};

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const isSameDayHelper = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const isSameMonthHelper = (date1: Date, date2: Date): boolean => {
  return isSameMonth(date1, date2);
};

export const getTodayString = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

export const getRecentDate = (daysAgo: number = 7): Date => {
  return subDays(new Date(), daysAgo);
};

export const getTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid date";

    const now = new Date();

    // Check if time is exactly midnight (00:00:00)
    const isMidnight =
      dateObj.getUTCHours() === 0 &&
      dateObj.getUTCMinutes() === 0 &&
      dateObj.getUTCSeconds() === 0;

    const days = differenceInDays(now, dateObj);

    // If same day and no time info → "today"
    if (days === 0 && isMidnight) {
      return "Today";
    }

    // If same day and has time → show minutes/hours
    if (days === 0) {
      const minutes = differenceInMinutes(now, dateObj);

      if (minutes <= 0) return "just now";
      if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }

      const hours = differenceInHours(now, dateObj);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Days
    if (days < 7) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    // Weeks
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } catch {
    return "Invalid date";
  }
};
