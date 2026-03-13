import { store } from "@/store/store";
import { addJob, selectJob, updateJob } from "@/store/slices/jobSlice";
import { JobApplication } from "@/@types/jobTypes";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setIsViewOnly, setIsJobModalShow } from "@/store/slices/globalSlice";
import { selectGlobal, selectJobs } from "@/store/selectors";
import { getTodayString } from "@/utils/dateHelper";

const useJobHooks = () => {
  const dispatch = useAppDispatch();
  const { isJobModalShow } = useAppSelector(selectGlobal);
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
    interviewStages: [],
    offer: false,
    notes: "",
  };

  const handleAddJob = () => {
    dispatch(selectJob(defaultJob));
    dispatch(setIsJobModalShow(true));
  };

  const handleEditJob = (job: JobApplication) => {
    dispatch(selectJob(job));
    dispatch(setIsJobModalShow(true));
  };

  const handleSaveJob = (job: JobApplication) => {
    if (selectedJob) {
      store.dispatch(updateJob(job));
    } else {
      store.dispatch(addJob(job));
    }
    dispatch(setIsJobModalShow(false));
    dispatch(selectJob(defaultJob));
  };

  const handleCloseModal = () => {
    dispatch(setIsJobModalShow(false));
    dispatch(selectJob(defaultJob));
    dispatch(setIsViewOnly(false));
  };

  const handleViewOnly = (job: JobApplication) => {
    dispatch(selectJob(job));
    dispatch(setIsJobModalShow(true));
    dispatch(setIsViewOnly(true));
  };

  return {
    isJobModalShow,
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
