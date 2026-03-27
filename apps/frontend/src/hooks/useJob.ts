import { store } from "@/store/store";
import { addJob, selectJob, updateJob } from "@/store/slices/jobSlice";
import { JobApplication } from "@career-sync/shared";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setViewOnly,
  setReviewJobApplication,
  setIsJobModalShow,
  setIsShowModal,
} from "@/store/slices/globalSlice";
import { addDocument } from "@/store/slices/documentSlice";
import { selectGlobal, selectJobs } from "@/store/selectors";
import { useGlobalModal } from "@/context/GlobalModalContext";

const useJobHooks = () => {
  const dispatch = useAppDispatch();
  const { isJobModalShow, viewOnly } = useAppSelector(selectGlobal);
  const { selectedJob } = useAppSelector(selectJobs);
  const isViewOnly = Object.values(viewOnly).some((value) => value === true);
  const viewOnlyKeys = Object.keys(viewOnly) as Array<keyof typeof viewOnly>;

  // Find which fields are editable (false)
  const editableFields = viewOnlyKeys.filter((key) => viewOnly[key] === false);

  // To check which fields to render
  // If there is at least one editable field, show only that/those
  const fieldsToRender =
    editableFields.length > 0 ? editableFields : viewOnlyKeys;

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

  const onResetCloseModal = () => {
    dispatch(setIsJobModalShow(false));
    dispatch(selectJob());
    dispatch(setViewOnly({}));
    dispatch(setIsShowModal(true));
    dispatch(setReviewJobApplication({ isToReview: false, isOnReview: false }));
  };

  const onConfirmModal = () => {
    handleGlobalModal({
      variant: "default",
      title: "Confirm Discard",
      description:
        "Closing this form will discard your changes. Do you want to proceed?",
      confirmText: "Discard",
      onConfirm: onResetCloseModal,
    });
  };

  const handleCloseModal = (isDirty: boolean) => {
    if (!isDirty) {
      return onResetCloseModal();
    }

    onConfirmModal();
  };

  const handleViewOnly = (job: JobApplication) => {
    dispatch(addDocument([job.cv, job.coverLetter].filter(isDefined)));
    dispatch(selectJob(job.id));
    dispatch(setIsJobModalShow(true));
    dispatch(
      setViewOnly({
        info: true,
        applicationMethod: true,
        interviewStages: true,
        notes: true,
      }),
    );
  };

  return {
    isJobModalShow,
    selectedJob,
    isViewOnly,
    viewOnlyKeys,
    editableFields,
    fieldsToRender,
    handleAddJob,
    handleEditJob,
    handleSaveJob,
    handleCloseModal,
    handleViewOnly,
  };
};

export default useJobHooks;
