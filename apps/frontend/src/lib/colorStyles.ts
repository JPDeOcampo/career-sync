export const colorStyles: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  yellow:
    "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
  emerald:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  orange:
    "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  purple:
    "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export type Color = keyof typeof colorStyles;
