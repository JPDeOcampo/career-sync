import { motion } from "motion/react";
import { cn } from "@/utils/cn";
const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.form
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      }}
      className={cn(
        "p-5 border border-border bg-background/20 rounded-lg transition-all shadow-sm dark:bg-gray-800/50 dark:border-gray-700/50",
        className,
      )}
      style={{ transition: "none" }}
    >
      {children}
    </motion.form>
  );
};

export default Card;
