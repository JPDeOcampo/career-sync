import { motion } from "motion/react";
import { cn } from "@/utils/cn";

export const LoadingSpinner = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        "border-2 border-white border-t-transparent rounded-full",
        className,
      )}
    />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
}) => {
  // Base styles for the pulsing effect
  const baseClasses = "bg-gray-200 dark:bg-gray-700 animate-pulse";

  // Shape variants
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

type ProgressBarProps = {
  progress?: number;
  variant?: "circular" | "bar";
  size?: number;
  strokeWidth?: number;
  barHeight?: number;
  color?: string;
  bgColor?: string;
  textSize?: string;
  hasText?: boolean;
};

export const ProgressBar = ({
  progress = 0,
  variant = "circular",
  size = 18,
  strokeWidth = 2,
  barHeight = 10,
  color = "#2563eb",
  bgColor = "#e5e7eb",
  textSize = "text-xs",
  hasText = false,
}: ProgressBarProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      {/* Circular */}
      {variant === "circular" && (
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={bgColor}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Text */}
          {hasText && (
            <div
              className={`absolute inset-0 flex items-center justify-center font-semibold ${textSize}`}
            >
              {progress}%
            </div>
          )}
        </div>
      )}

      {/* Bar */}
      {variant === "bar" && (
        <div className="w-full">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ backgroundColor: bgColor, height: barHeight }}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: color,
                height: "100%",
              }}
            />
          </div>

          {/* Text */}
          {hasText && (
            <p className={`mt-1 text-gray-500 ${textSize}`}>
              Uploading: {progress}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
