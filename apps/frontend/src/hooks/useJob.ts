import { store } from "@/store/store";
import { addJob, selectJob, updateJob } from "@/store/slices/jobSlice";
import { JobApplication } from "@/@types/jobTypes";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setIsViewOnly, setIsModalOpen } from "@/store/slices/globalSlice";
import { selectGlobal, selectJobs } from "@/store/selectors";
import { getTodayString } from "@/utils/dateHelper";

const useJobHooks = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen } = useAppSelector(selectGlobal);
  const { selectedJob } = useAppSelector(selectJobs);

  const defaultJob: JobApplication = {
    id: "",
    company: "",
    roleTitle: "",
    jobDescription: "",
    jobType: "Full-time",
    salary: "",
    workSetup: "Remote",
    workSchedule: "",
    location: "",
    jobLink: "",
    applicationMethod: "LinkedIn",
    applicationDate: getTodayString(),
    status: "Applied",
    priority: "Medium",
    cvVersion: "",
    coverLetterSent: false,
    contact: "",
    interviewStage: "None",
    interviewDate: "",
    interviewTime: "",
    interviewerName: "",
    offer: false,
    notes: "",
  };

  const handleAddJob = () => {
    dispatch(selectJob(defaultJob));
    dispatch(setIsModalOpen(true));
  };

  const handleEditJob = (job: JobApplication) => {
    dispatch(selectJob(job));
    dispatch(setIsModalOpen(true));
  };

  const handleSaveJob = (job: JobApplication) => {
    if (selectedJob) {
      store.dispatch(updateJob(job));
    } else {
      store.dispatch(addJob(job));
    }
    dispatch(setIsModalOpen(false));
    dispatch(selectJob(defaultJob));
  };

  const handleCloseModal = () => {
    dispatch(setIsModalOpen(false));
    dispatch(selectJob(defaultJob));
    dispatch(setIsViewOnly(false));
  };

  const handleViewOnly = (job: JobApplication) => {
    dispatch(selectJob(job));
    dispatch(setIsModalOpen(true));
    dispatch(setIsViewOnly(true));
  };

  return {
    isModalOpen,
    selectedJob,
    defaultJob,
    handleAddJob,
    handleEditJob,
    handleSaveJob,
    handleCloseModal,
    handleViewOnly,
  };
};

export default useJobHooks;
