"use client";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { cn } from "@/utils/cn";

const DropdownContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  // Close on click outside
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={ref}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) => {
  const context = useContext(DropdownContext);
  return (
    <button
      onClick={() => context?.setOpen(!context.open)}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const context = useContext(DropdownContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "surface text-popover-foreground absolute right-0 z-50 mt-2 min-w-32 rounded-md border border-gray-100 dark:border-gray-700 p-1 shadow-md animate-in fade-in zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "destructive";
}) => {
  const context = useContext(DropdownContext);
  return (
    <button
      onClick={(e) => {
        props.onClick?.(e);
        context?.setOpen(false);
      }}
      className={cn(
        "w-full text-default hover:bg-gray-100 dark:hover:text-gray-900 relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "destructive" && "text-destructive hover:bg-destructive/10",
        className,
      )}
      {...props}
    />
  );
};

const DropdownMenuSeparator = ({ className }: { className?: string }) => {
  return <div className={cn("bg-border -mx-1 my-1 h-px", className)} />;
};

const DropdownMenuLabel = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-medium", className)}>
      {children}
    </div>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
