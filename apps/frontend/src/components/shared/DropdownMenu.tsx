"use client";
import * as React from "react";
import { cn } from "@/utils/cn";

const DropdownContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  // Close on click outside
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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
  const context = React.useContext(DropdownContext);
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
  const context = React.useContext(DropdownContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "bg-popover text-popover-foreground absolute z-50 mt-2 min-w-32 rounded-md border p-1 shadow-md animate-in fade-in zoom-in-95",
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
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" }) => {
  const context = React.useContext(DropdownContext);
  return (
    <div
      onClick={(e) => {
        props.onClick?.(e);
        context?.setOpen(false);
      }}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
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
