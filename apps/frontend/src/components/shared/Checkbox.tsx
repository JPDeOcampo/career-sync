"use client";
import * as React from "react";
import { CheckIcon, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import { useFormContext } from "react-hook-form";
import { JobFormData } from "@career-sync/shared";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  variantSize?: "sm" | "md" | "lg";
  isViewOnly?: boolean;
  items?: number;
  state?: "indeterminate" | "checked" | "unchecked";
}

const sizeClasses = {
  sm: {
    box: "w-3.5 h-3.5",
    icon: "w-2.5 h-2.5",
  },
  md: {
    box: "w-4.5 h-4.5",
    icon: "w-3.5 h-3.5",
  },
  lg: {
    box: "w-6 h-6",
    icon: "w-4 h-4",
  },
} as const;

const messages = {
  coverLetterSent: {
    true: "Yes, cover letter was sent",
    false: "No, cover letter was not sent",
  },
  offer: {
    true: "Yes, an offer has been received",
    false: "No offer has been received yet",
  },
} as const;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      labelClassName = "text-sm text-gray-600 dark:text-gray-400",
      variantSize = "md",
      state,
      ...props
    },
    ref,
  ) => {
    const sizes = sizeClasses[variantSize];
    const isIndeterminate = state === "indeterminate";
    const isChecked = !state || state === "checked";

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            ref={ref}
            id={props.name}
            className={cn(
              "peer shrink-0 appearance-none rounded-sm border cursor-pointer",
              "bg-white border-gray-300 dark:border-gray-600",
              "shadow-sm outline-none transition-all",
              "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500",
              "checked:bg-blue-600 checked:border-blue-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizes.box,
            )}
            {...props}
          />

          <span
            className={cn(
              "absolute pointer-events-none hidden peer-checked:flex items-center justify-center text-white",
              sizes.box,
            )}
          >
            {isIndeterminate && <Minus className={sizes.icon} />}

            {isChecked && <CheckIcon className={sizes.icon} />}
          </span>
        </div>

        {label && (
          <label
            htmlFor={props.name}
            className={cn(" cursor-pointer", labelClassName)}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export const FormCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ isViewOnly, name, variantSize = "md", ...props }, ref) => {
    const { watch } = useFormContext<JobFormData>();
    const value = watch(name as keyof JobFormData);
    const boolValue = typeof value !== undefined ? value : false;

    /* View-only mode */
    if (isViewOnly) {
      const message =
        name && name in messages
          ? messages[name as keyof typeof messages][
              String(boolValue) as "true" | "false"
            ]
          : "";

      return (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      );
    }

    /* Editable mode */
    return (
      <Checkbox ref={ref} name={name} variantSize={variantSize} {...props} />
    );
  },
);

FormCheckbox.displayName = "FormCheckbox";
