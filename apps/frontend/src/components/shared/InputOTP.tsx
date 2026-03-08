"use client";
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) => {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
};

const InputOTPGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
};

const FakeCaret = () => {
  return (
    <>
      <style>
        {`
          @keyframes otp-caret-blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}
      </style>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-4 w-px bg-foreground"
          style={{
            animation: "otp-caret-blink 1s step-end infinite",
          }}
        />
      </div>
    </>
  );
};

const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      aria-invalid={props["aria-invalid"]}
      className={cn(
        // Base styles
        "relative flex h-12 w-12 items-center justify-center text-sm outline-none transition-all",
        "border-y border-r border-input bg-input-background dark:bg-input/30",
        "first:rounded-l-md first:border-l last:rounded-r-md",

        // Active state
        "data-[active=true]:z-10",
        "data-[active=true]:border-ring",
        "data-[active=true]:ring-[3px]",
        "data-[active=true]:ring-ring/50",

        // Invalid state
        "aria-invalid:border-destructive",
        "data-[active=true]:aria-invalid:border-destructive",
        "data-[active=true]:aria-invalid:ring-destructive/20",
        "dark:data-[active=true]:aria-invalid:ring-destructive/40",

        className,
      )}
      {...props}
    >
      {char ?? <span className="opacity-0">0</span>}

      {hasFakeCaret && <FakeCaret />}
    </div>
  );
};

const InputOTPSeparator = ({ ...props }: React.ComponentProps<"div">) => {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
};

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
