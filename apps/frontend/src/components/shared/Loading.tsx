import { motion } from "motion/react";

export const LoadingSpinner = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
