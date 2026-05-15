/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useState,
  ReactElement,
  cloneElement,
  HTMLAttributes,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

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

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);

  const positionClasses: Record<TooltipPosition, string> = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-y-1/2 -translate-x-full",
    right: "-translate-y-1/2",
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    top: "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r",
    bottom: "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
    left: "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r",
    right: "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l",
  };

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 10;

    switch (position) {
      case "top":
        setCoords({
          top: rect.top - gap,
          left: rect.left + rect.width / 2,
        });
        break;

      case "bottom":
        setCoords({
          top: rect.bottom + gap,
          left: rect.left + rect.width / 2,
        });
        break;

      case "left":
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.left - gap,
        });
        break;

      case "right":
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + gap,
        });
        break;
    }
  }, [isVisible, position]);

  const trigger = cloneElement(children, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
    },
    "aria-label": (children.props as any)["aria-label"] || label,
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => {
      setIsVisible(false);
      setCoords(null);
    },
    onFocus: () => setIsVisible(true),
    onBlur: () => {
      setIsVisible(false);
      setCoords(null);
    },
  } as HTMLAttributes<HTMLElement>);

  return (
    <>
      {trigger}

      {typeof document !== "undefined" &&
        isVisible &&
        coords &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden={!isVisible}
            style={{
              top: coords.top,
              left: coords.left,
            }}
            className={`
              fixed z-50 pointer-events-none whitespace-nowrap
              rounded-md px-2.5 py-1.5 text-xs font-medium
              transition-all duration-200 ease-in-out
              
              bg-zinc-50 dark:bg-zinc-900 
              text-zinc-700 dark:text-zinc-200
              border border-zinc-200 dark:border-zinc-800
              shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)]

              opacity-100 scale-100
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
          </div>,
          document.body,
        )}
    </>
  );
};

export default CustomTooltip;
