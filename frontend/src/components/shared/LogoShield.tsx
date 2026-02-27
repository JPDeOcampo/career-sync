import { motion } from "motion/react";
import { Shield } from "lucide-react";

const LogoShield = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4"
    >
      <Shield className="w-8 h-8 text-white" />
    </motion.div>
  );
};

export default LogoShield;
