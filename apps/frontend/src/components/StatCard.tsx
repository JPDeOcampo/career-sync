import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import Skeleton from "@/components/shared/Skeleton";
import { colorStyles } from "@/lib/colorStyles";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  isLoading = false,
}: StatCardProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isLoading) return;
    const controls = animate(count, value, {
      duration: 1,
      delay,
    });

    return controls.stop;
  }, [value, count, delay, isLoading]);

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
          {isLoading ? (
            <Skeleton variant="text" />
          ) : (
            <motion.p className="text-3xl font-semibold text-default">
              {rounded}
            </motion.p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon
            className={`w-6 h-6 ${title === "High Priority" ? "fill-yellow-500" : ""}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
