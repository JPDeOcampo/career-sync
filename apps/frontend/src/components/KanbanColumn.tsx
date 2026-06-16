import {
  JobApplication,
  ApplicationStatus,
  JobQueryTypes,
} from "@career-sync/shared";
import KanbanCard from "@/components/KanbanCard";
import useJobHooks from "@/hooks/useJob";
import { useDroppable } from "@dnd-kit/core";
import { LoadingSpinner } from "@/components/shared/Loading";

interface KanbanColumnProps {
  status: ApplicationStatus;
  jobs: JobApplication[];
  getJobsQuery: JobQueryTypes;
  isLoading?: boolean;
  isUpdating?: boolean;
  isError?: boolean;
  isActiveDrop?: boolean;
  mobileMoveJob?: (job: JobApplication, direction: "left" | "right") => void;
}

type StatusWithoutAll = Exclude<ApplicationStatus, "All">;

const statusColors: Record<StatusWithoutAll, string> = {
  Applied: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  "Under Review":
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  Interview:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  Offer: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  Withdrawn: "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

const KanbanColumn = ({
  status,
  jobs,
  getJobsQuery,
  isLoading,
  isUpdating,
  isError,
  isActiveDrop,
  mobileMoveJob,
}: KanbanColumnProps) => {
  const { handleViewOnly } = useJobHooks();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="shrink-0 w-80 h-full">
      <div
        ref={setNodeRef}
        className={`bg-gray-100 dark:bg-gray-800/50 rounded-xl py-4 h-full transition ${
          isOver ? "ring-2 ring-blue-400" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-4 px-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {status}
          </h3>

          {(isUpdating || isLoading) && isActiveDrop ? (
            <span className="px-2.5 py-1">
              <LoadingSpinner />
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status as StatusWithoutAll]}`}
            >
              {jobs.length}
            </span>
          )}
        </div>

        <div className="space-y-3 min-h-130 max-h-130 px-4 overflow-y-auto overflow-x-visible">
          {" "}
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <KanbanCard key={i} isLoading />
              ))
            : jobs.map((job) => {
                return (
                  <KanbanCard
                    key={job.id}
                    job={job}
                    onClick={() => handleViewOnly(job, getJobsQuery)}
                    mobileMoveJob={mobileMoveJob}
                  />
                );
              })}
          {jobs.length === 0 && !isLoading && !isError && (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
              No jobs in this status
            </div>
          )}
          {isError && !isLoading && (
            <div className="text-center py-8 text-sm text-red-500">
              Error loading jobs in this status. <br /> Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
