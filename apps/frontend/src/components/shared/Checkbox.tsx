"use client";
import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAppSelector } from "@/hooks/useRedux";
import { selectGlobal } from "@/store/selectors";
import { useFormContext } from "react-hook-form";
import { JobFormData } from "@/@types/jobTypes";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const { isViewOnly } = useAppSelector(selectGlobal);
    const { watch } = useFormContext<JobFormData>();
    const value = watch(props.name as keyof JobFormData);
    const checked = value ? "Yes" : "No";

    const messages = {
      coverLetterSent: {
        Yes: "Yes, cover letter was sent",
        No: "No, cover letter was not sent",
      },
      offer: {
        Yes: "Yes, an offer has been received",
        No: "No offer has been received yet",
      },
    };

    const getViewOnlyValue = () => {
      if (!props?.name || !checked) return "";

      const field = messages[props.name as keyof typeof messages];
      return field?.[checked] || "";
    };

    return (
      <div className="flex items-center space-x-2">
        {isViewOnly && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getViewOnlyValue()}
          </p>
        )}
        {!isViewOnly && (
          <>
            <div
              className={cn(
                "relative inline-flex items-center cursor-pointer",
                className,
              )}
            >
              <input
                type="checkbox"
                ref={ref}
                id={props.name}
                className={cn(
                  "peer w-4.5 h-4.5 shrink-0 appearance-none rounded-sm border",
                  "bg-white border-gray-300 dark:border-gray-600",
                  "shadow-sm outline-none transition-all",
                  "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500",
                  "checked:bg-blue-600 checked:border-blue-600",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  className,
                )}
                {...props}
              />
              {/* Updated Indicator: uses peer-checked to show/hide */}
              <span className="absolute pointer-events-none hidden peer-checked:flex items-center justify-center w-4.5 h-4.5 text-white">
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
              {props.children}
            </div>

            <label
              htmlFor={props.name}
              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              {label}
            </label>
          </>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
