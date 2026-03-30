import { Star } from "lucide-react";
import { colorStyles } from "@/lib/colorStyles";
import CustomTooltip from "@/components/shared/CustomTooltip";

export const JobTagStatus = ({ status }: { status: string }) => {
  const statusColorMap: Record<string, string> = {
    Applied: "blue",
    Interview: "orange",
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

export const JobTagPriorityText = ({ priority }: { priority: string }) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        priority === "High"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : priority === "Medium"
            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      }`}
    >
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
