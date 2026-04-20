import { useState, useMemo } from "react";
import {
  ApplicationStatus,
  JobApplication,
  statuses,
} from "@career-sync/shared";
import KanbanColumn from "@/components/KanbanColumn";
import { motion } from "motion/react";
import { useGetJobsQuery, useUpdateJobMutation } from "@/store/api/jobsApi";
import useJobHooks from "@/hooks/useJob";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import KabanCard from "@/components/KabanCard";
import { toast } from "sonner";

const Kanban = () => {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [activeDropStatus, setActiveDropStatus] =
    useState<ApplicationStatus | null>(null);
  const { jobQueryBuilder, handleSaveJob } = useJobHooks();
  const getJobsQuery = jobQueryBuilder("jobs", { limit: 0 });

  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const { data, isFetching, isError } = useGetJobsQuery(getJobsQuery);

  const jobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs;
  }, [data]);

  const groupedJobs = statuses.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, JobApplication[]>,
  );

  const onUpdateStatus = async (data: JobApplication) => {
    try {
      const result = await updateJob({
        id: data.id,
        data: data,
      }).unwrap();

      handleSaveJob(result.data);

      toast.success("Job updated successfully.");
    } catch (error) {
      console.error("Error updating job:", error);

      toast.error("Error updating job. Please try again later.");
    }
  };

  const getNewStatus = (newStatus: ApplicationStatus) => {
    setActiveDropStatus(newStatus);
  };

  const moveMobileJob = (job: JobApplication, direction: "left" | "right") => {
    const currentIndex = statuses.indexOf(job.status);

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= statuses.length) return;

    const newStatus = statuses[newIndex];

    getNewStatus(newStatus);

    onUpdateStatus({
      ...job,
      cvId: job.cv?.id || "",
      coverLetterId: job.coverLetter?.id || "",
      status: newStatus,
    });
  };

  const handleDragStart = (event: DragEndEvent) => {
    const job = event.active.data.current?.job;
    if (!job) {
      setActiveJob(null);
      return;
    }

    setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as ApplicationStatus;
    const activeJob = active.data.current?.job;
    const updatedJob = {
      ...activeJob,
      cvId: activeJob?.cv?.id || "",
      coverLetterId: activeJob?.coverLetter?.id || "",
      status: newStatus,
    };

    getNewStatus(newStatus);
    // To prevent unnecessary updates
    const draggedJob = jobs.find((j) => j.id === jobId);
    if (!draggedJob || draggedJob.status === newStatus) return;

    onUpdateStatus(updatedJob);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kanban Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visualize your application pipeline
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-x-auto p-4 relative"
      >
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToWindowEdges]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveJob(null)}
        >
          <div className="grid grid-cols-6 gap-4 min-w-max">
            {statuses.map((status, index) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <KanbanColumn
                  status={status}
                  jobs={groupedJobs[status]}
                  getJobsQuery={getJobsQuery}
                  isLoading={isFetching}
                  isUpdating={isUpdating}
                  isError={isError}
                  isActiveDrop={activeDropStatus === status}
                  mobileMoveJob={moveMobileJob}
                />
              </motion.div>
            ))}
          </div>

          {/* FLOATING DRAG PREVIEW ONLY */}
          <DragOverlay>
            {activeJob && (
              <div className="w-80">
                <KabanCard job={activeJob} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </motion.div>
    </div>
  );
};

export default Kanban;
