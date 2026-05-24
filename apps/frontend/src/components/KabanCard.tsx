import { JobApplication, formatDate, statuses } from "@career-sync/shared";
import { JobTagPriorityText } from "@/components/shared/JobTag";
import { Calendar, MapPin, Briefcase, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/shared/Loading";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMdBelow } from "@/utils/responsive";

interface JobCardProps {
  job?: JobApplication;
  onClick?: () => void;
  isLoading?: boolean;
  mobileMoveJob?: (job: JobApplication, direction: "left" | "right") => void;
}

const KabanCard = ({
  job,
  onClick,
  isLoading,
  mobileMoveJob,
}: JobCardProps) => {
  const isMobile = useMdBelow();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job?.id || "",
      data: {
        job,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0 : 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8,
      }}
      {...(!isMobile ? listeners : {})}
      {...(!isMobile ? attributes : {})}
      style={style}
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-500`}
    >
      <div className="flex md:hidden justify-between mb-2">
        <div>
          {job.status !== statuses[0] && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                mobileMoveJob?.(job, "left");
              }}
              disabled={job.status === statuses[0]}
              className="p-1 disabled:opacity-30 bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
        <div>
          {job.status !== statuses[statuses.length - 1] && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                mobileMoveJob?.(job, "right");
              }}
              disabled={job.status === statuses[statuses.length - 1]}
              className="p-1 disabled:opacity-30 bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <button
            className="min-w-0 group text-left"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (isDragging) return;
              onClick?.();
            }}
          >
            <h3 className="group-hover:underline font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-40">
              {job.company}
            </h3>
            <p className="group-hover:underline text-sm text-gray-600 dark:text-gray-400 truncate max-w-40">
              {job.roleTitle}
            </p>
          </button>
        </div>
        <JobTagPriorityText priority={job.priority} showIcon />
      </div>
      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{job.jobType}</span>
          <span className="mx-1">•</span>
          <span>{job.workSetup}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(job.applicationDate)}</span>
        </div>
      </div>
      {job.interviewStages &&
        job.interviewStages?.length > 0 &&
        (() => {
          const latestStage =
            job.interviewStages[job.interviewStages.length - 1];

          return (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                <Calendar className="w-3.5 h-3.5 mt-0.5" />
                <div>
                  <div>
                    <span className="font-semibold">Interview:</span>{" "}
                    {formatDate(latestStage.interviewDate)} -{" "}
                    {latestStage.interviewTime ?? "Time TBD"}
                  </div>
                  <div>
                    <span className="font-semibold">
                      Interview-{job.interviewStages.length}:
                    </span>{" "}
                    {latestStage.interviewType}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </motion.div>
  );
};

export default KabanCard;
