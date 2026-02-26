import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { cn } from "@/utils/cn";

const Logo = ({ className = "w-16 h-16 mb-4" }: { className?: string }) => {
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
      <Briefcase className="w-8 h-8 text-white" />
    </motion.div>
  );
};

export default Logo;
