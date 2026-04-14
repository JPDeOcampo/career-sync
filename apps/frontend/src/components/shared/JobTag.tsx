import { Star, AlertCircle, Circle } from "lucide-react";
import { colorStyles } from "@/lib/colorStyles";
import CustomTooltip from "@/components/shared/CustomTooltip";
import { PriorityType } from "@career-sync/shared";

interface JobTagPriorityProps {
  priority: PriorityType;
  showIcon?: boolean;
}

const priorityStyles: Record<
  PriorityType,
  { class: string; icon: typeof Circle }
> = {
  High: {
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: AlertCircle,
  },
  Medium: {
    class:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: AlertCircle,
  },
  Low: {
    class: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400",
    icon: Circle,
  },
};

export const JobTagStatus = ({ status }: { status: string }) => {
  const statusColorMap: Record<string, string> = {
    Applied: "blue",
    Interview: "yellow",
    Offer: "green",
    Rejected: "red",
    "Under Review": "purple",
  };

  const colorKey = statusColorMap[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorStyles[colorKey]}`}
    >
      {status}
    </span>
  );
};

export const JobTagPriorityText = ({
  priority,
  showIcon = false,
}: JobTagPriorityProps) => {
  const { class: className, icon: Icon } = priorityStyles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {priority}
    </span>
  );
};

export const JobTagPriorityIcon = ({ priority }: { priority: string }) => {
  const config =
    priority === "High"
      ? "text-yellow-500 fill-yellow-500"
      : priority === "Medium"
        ? "text-yellow-500"
        : "text-gray-400";

  return (
    <CustomTooltip label={`${priority}`} className={priority} position="bottom">
      <span className="inline-flex items-center justify-center rounded-full">
        <Star className={`w-4 h-4 ${config}`} />
      </span>
    </CustomTooltip>
  );
};
