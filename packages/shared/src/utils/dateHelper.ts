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
