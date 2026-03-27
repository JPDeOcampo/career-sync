"use client";
import { useState, ReactElement, cloneElement, HTMLAttributes } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  label: string;
  position?: TooltipPosition;
  className?: string;
}

const CustomTooltip = ({
  children,
  label,
  position = "top",
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses: Record<TooltipPosition, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    top: "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r",
    bottom: "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
    left: "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r",
    right: "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l",
  };

  const trigger = cloneElement(children, {
    "aria-label": children.props["aria-label"] || label,
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
  } as HTMLAttributes<HTMLElement>);

  return (
    <div className="relative inline-flex items-center justify-center">
      {trigger}

      <div
        role="tooltip"
        aria-hidden={!isVisible}
        className={`
          absolute z-50 pointer-events-none whitespace-nowrap
          rounded-md px-2.5 py-1.5 text-xs font-medium
          transition-all duration-200 ease-in-out
          
          /* Visual Styles: Background, Text, Border, and Shadow */
          bg-zinc-50 dark:bg-zinc-900 
          text-zinc-700 dark:text-zinc-200
          border border-zinc-200 dark:border-zinc-800
          shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)]

          /* Visibility Logic */
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          ${positionClasses[position]}
          ${className}
        `}
      >
        {label}
        <div
          className={`
            absolute h-2 w-2 rotate-45 
            bg-zinc-50 dark:bg-zinc-900 
            border-zinc-200 dark:border-zinc-800
            ${arrowClasses[position]}
          `}
        />
      </div>
    </div>
  );
};

export default CustomTooltip;
