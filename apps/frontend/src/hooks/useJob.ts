import { store } from "@/store/store";
import { addJob, selectJob, updateJob } from "@/store/slices/jobSlice";
import { JobApplication } from "@career-sync/shared";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setIsJobViewOnly,
  setIsJobModalShow,
  setIsShowModal,
} from "@/store/slices/globalSlice";
import { addDocument } from "@/store/slices/documentSlice";
import { selectGlobal, selectJobs } from "@/store/selectors";
import { useGlobalModal } from "@/context/GlobalModalContext";

const useJobHooks = () => {
  const dispatch = useAppDispatch();
  const { isJobModalShow, isJobViewOnly } = useAppSelector(selectGlobal);
  const { selectedJob } = useAppSelector(selectJobs);
  const { handleGlobalModal } = useGlobalModal();
  const isDefined = <T>(value: T | null | undefined): value is T =>
    value != null;

  const handleAddJob = () => {
    dispatch(selectJob());
    dispatch(setIsJobModalShow(true));
  };

  const handleEditJob = (job: JobApplication) => {
    dispatch(selectJob(job.id));
    dispatch(setIsJobModalShow(true));
  };

  const handleSaveJob = (job: JobApplication) => {
    if (selectedJob) {
      store.dispatch(updateJob(job));
    } else {
      store.dispatch(addJob(job));
    }
    dispatch(setIsJobModalShow(false));
    dispatch(selectJob());
  };

  const handleCloseModal = () => {
    const onClose = () => {
      dispatch(setIsJobModalShow(false));
      dispatch(selectJob());
      dispatch(setIsJobViewOnly(false));
      dispatch(setIsShowModal(true));
    };

    if (isJobViewOnly) return onClose();

    handleGlobalModal({
      variant: "default",
      title: "Discard changes",
      description: "Are you sure you want to discard changes?",
      confirmText: "Discard",
      onConfirm: onClose,
    });
  };

  const handleViewOnly = (job: JobApplication) => {
    dispatch(addDocument([job.cv, job.coverLetter].filter(isDefined)));
    dispatch(selectJob(job.id));
    dispatch(setIsJobModalShow(true));
    dispatch(setIsJobViewOnly(true));
  };

  return {
    isJobModalShow,
    selectedJob,
    handleAddJob,
    handleEditJob,
    handleSaveJob,
    handleCloseModal,
    handleViewOnly,
  };
};

export default useJobHooks;
