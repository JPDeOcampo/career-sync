import * as React from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantStyles: Record<string, string> = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400",

    ghost:
      "bg-transparent text-gray-500 hover:text-gray-900 focus-visible:ring-gray-400 dark:text-gray-200 dark:hover:bg-transparent dark:hover:text-gray-500",

    link: "text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
  };

  const sizeStyles: Record<string, string> = {
    default: "h-9 px-4",
    sm: "h-8 px-3 text-sm",
    lg: "h-10 px-6 text-lg",
    icon: "h-9 w-9 p-2",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
