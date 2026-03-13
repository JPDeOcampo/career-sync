import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { LucideIcon } from "lucide-react";
import { useEffect } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1,
      delay,
    });

    return controls.stop;
  }, [value, count, delay]);

  const colorStyles: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    yellow:
      "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    green:
      "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
    purple:
      "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="surface rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <motion.p className="text-3xl font-semibold text-default">
            {rounded}
          </motion.p>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
