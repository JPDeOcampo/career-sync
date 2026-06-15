/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";
import * as React from "react";
import { cn } from "@/utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = ({
  className = "text-foreground",
  ...props
}: LabelProps) => {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer form-label",
        className,
      )}
      {...props}
    />
  );
};

export const FieldLabel = ({
  name,
  label,
  error,
  isRequired = false,
  isViewOnly = false,
  showAfterLabel = true,
}: {
  name?: string;
  label: string;
  error?: string;
  isRequired?: boolean;
  isViewOnly?: boolean;
  showAfterLabel?: boolean;
}) => {
  return (
    <Label
      htmlFor={name}
      className={`font-medium ${error ? "text-red-500" : "job-form-label"}`}
    >
      {label}

      {!isViewOnly &&
        showAfterLabel &&
        (isRequired ? (
          <span>*</span>
        ) : (
          label && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              (Optional)
            </span>
          )
        ))}
    </Label>
  );
};
