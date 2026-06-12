import { useState } from "react";
import { useLazyGetJobsQuery, useAddJobsMutation } from "@/store/api/jobsApi";
import useJobHooks from "@/hooks/useJob";
import { importJobsFromExcel, exportJobsToExcel } from "@/utils/dataManagement";
import { toast } from "sonner";
import {
  JobApplication,
  InterviewInfo,
  getTodayString,
} from "@career-sync/shared";
import { capitalizeSmart } from "@/utils/stringHelper";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "@/hooks/useRedux";
import { selectAuth } from "@/store/selectors";
import { handleApiError } from "@/utils/handleApi";

const useDataManagementHooks = () => {
  const [isExport, setIsExport] = useState(true);

  const { user } = useAppSelector(selectAuth);

  const [triggerGetJobs, { isFetching: isFetchingJobs }] =
    useLazyGetJobsQuery();

  const [addJobs, { isLoading: isAdding }] = useAddJobsMutation();

  const { jobQueryBuilder } = useJobHooks();

  const getJobsQuery = jobQueryBuilder("jobs", {
    limit: 0,
    sort: "oldest",
  });

  const normalizeJobData = (data: JobApplication[]): JobApplication[] => {
    return data.map((job) => {
      const jobId = job.id || uuidv4();

      return {
        ...job,
        id: jobId,
        userId: user?.id as string,
        company: capitalizeSmart(job.company),
        roleTitle: capitalizeSmart(job.roleTitle),
        contact: capitalizeSmart(job.contact || ""),
        location: capitalizeSmart(job.location || ""),
        applicationDate: job.applicationDate || getTodayString(),
        interviewStages: job.interviewStages?.map((stage: InterviewInfo) => ({
          ...stage,
          id: stage.id || uuidv4(),
          jobId,
        })),
      };
    });
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onSuccess?: () => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    try {
      const data = await importJobsFromExcel(file);
      const jobData = normalizeJobData(data);

      await addJobs({ data: jobData }).unwrap();

      onSuccess?.();
      toast.success("Job applications imported successfully!");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleExport = async () => {
    try {
      const result = await triggerGetJobs(getJobsQuery).unwrap();

      if (!result.jobs) {
        toast.error(
          "No job applications found. Please add some job applications first before exporting.",
        );
        return;
      }

      exportJobsToExcel(result.jobs);
    } catch (error) {
      console.error(error);
      toast.error("Error exporting job applications. Please try again later.");
    }
  };

  return {
    isExport,
    setIsExport,
    isAdding,
    isFetchingJobs,
    handleImport,
    handleExport,
  };
};

export default useDataManagementHooks;
