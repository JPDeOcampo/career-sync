import { store } from "@/store/store";
import {
  addJob,
  selectJob,
  updateJob,
  setJobQuery,
} from "@/store/slices/jobSlice";
import { JobApplication } from "@career-sync/shared";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setViewOnly,
  setReviewJobApplication,
  setIsJobModalShow,
} from "@/store/slices/jobModalSlice";
import { addDocument } from "@/store/slices/documentSlice";
import { selectJobs, selectJobModal } from "@/store/selectors";
import { useGlobalModal } from "@/context/GlobalModalContext";
import { JobQueryTypes } from "@career-sync/shared";
import { usePathname } from "next/navigation";

const useJobHooks = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { isJobModalShow, viewOnly } = useAppSelector(selectJobModal);
  const { selectedJob, jobQuery } = useAppSelector(selectJobs);
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

  const jobQueryBuilder = (key: string, overrides?: Partial<JobQueryTypes>) => {
    const base = jobQuery[key] ?? {
      page: 1,
      limit: 5,
      sort: "",
      status: "All",
      search: "",
      priority: "All",
    };
    return { ...base, ...overrides };
  };

  const handleAddJob = () => {
    dispatch(selectJob());
    dispatch(setIsJobModalShow(true));
    // dispatch(
    //   setJobQuery({
    //     key: pathname.replace("/", ""),
    //     data: jobQuery,
    //   }),
    // );
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
    dispatch(selectJob());
  };

  const onResetCloseModal = () => {
    dispatch(setIsJobModalShow(false));
    dispatch(selectJob());
    dispatch(setViewOnly({}));
    dispatch(setReviewJobApplication({ isToReview: false, isOnReview: false }));
  };

  const onConfirmModal = (onConfirm?: () => void) => {
    handleGlobalModal({
      variant: "default",
      title: "Confirm Discard",
      description:
        "Closing this form will discard your changes. Do you want to proceed?",
      confirmText: "Discard",
      onConfirm: onConfirm,
    });
  };

  const handleCloseModal = (isDirty: boolean) => {
    if (!isDirty) {
      return onResetCloseModal();
    }

    onConfirmModal(onResetCloseModal);
  };

  const handleViewOnly = (job: JobApplication, jobQuery: JobQueryTypes) => {
    dispatch(addDocument([job.cv, job.coverLetter].filter(isDefined)));
    dispatch(
      setJobQuery({
        key: pathname.replace("/", ""),
        data: jobQuery,
      }),
    );
    dispatch(selectJob(job));
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
    jobQueryBuilder,
    handleAddJob,
    handleEditJob,
    handleSaveJob,
    handleCloseModal,
    onConfirmModal,
    handleViewOnly,
  };
};

export default useJobHooks;
