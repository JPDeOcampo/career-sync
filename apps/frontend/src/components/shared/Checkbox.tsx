/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";
import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn("inline-flex items-center cursor-pointer", className)}
      >
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "peer w-4 h-4 rounded-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600",
            className,
          )}
          {...props}
        />
        {/* Indicator */}
        <span className="absolute pointer-events-none flex items-center justify-center w-4 h-4 text-white">
          {props.checked && <CheckIcon className="w-3.5 h-3.5" />}
        </span>
        {props.children}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
