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
