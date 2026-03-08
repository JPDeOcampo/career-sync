/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";
import * as React from "react";
import { cn } from "@/utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = ({ className, ...props }: LabelProps) => {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-foreground",
        className,
      )}
      {...props}
    />
  );
};

export default Label;
