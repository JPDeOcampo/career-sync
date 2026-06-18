import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { cn } from "@/utils/cn";

export const Logo = ({
  className = "w-16 h-16 mb-4",
  iconClassName = "w-10 h-10",
}: {
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center justify-center bg-blue-500 rounded-2xl",
        className,
      )}
    >
      <Briefcase className={cn("text-white", iconClassName)} />
    </motion.div>
  );
};

export const Brand = ({
  logoClassName = "h-10 w-10 sm:h-11 sm:w-11 shrink-0",
  iconClassName = "w-6 h-6 sm:w-7 sm:h-7",
  headerClassName = "text-base sm:text-xl",
  descriptionClassName = "hidden sm:block ",
}: {
  logoClassName?: string;
  iconClassName?: string;
  headerClassName?: string;
  descriptionClassName?: string;
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <Logo className={logoClassName} iconClassName={iconClassName} />

      <div className="truncate">
        <h1 className={cn(" font-bold text-default truncate", headerClassName)}>
          CareerSync
        </h1>
        <p
          className={cn(
            "text-xs text-gray-500 dark:text-gray-400 truncate",
            descriptionClassName,
          )}
        >
          Manage your job applications
        </p>
      </div>
    </div>
  );
};
