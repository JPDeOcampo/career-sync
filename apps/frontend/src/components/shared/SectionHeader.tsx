import CustomTooltip from "@/components/shared/CustomTooltip";
import { SquarePen } from "lucide-react";

export const SectionHeaderWithEdit = ({
  title,
  isViewOnly,
  onClick,
}: {
  title: string;
  isViewOnly?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div className="job-modal-section-header">
      <h3>{title}</h3>

      {isViewOnly && (
        <button
          type="button"
          className="flex gap-2 items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
          aria-label="edit"
          onClick={onClick}
        >
          <CustomTooltip label="Edit" position="bottom">
            <SquarePen className="h-4.5 w-4.5" />
          </CustomTooltip>
        </button>
      )}
    </div>
  );
};
