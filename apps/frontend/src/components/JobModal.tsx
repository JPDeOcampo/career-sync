/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setViewOnly,
  setReviewJobApplication,
} from "@/store/slices/jobModalSlice";
import { selectJobModal } from "@/store/selectors";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  Check,
  Briefcase,
  FileText,
  Calendar,
  Notebook,
} from "lucide-react";
import {
  JobFormData,
  JobApplication,
  jobSchema,
  getTodayString,
} from "@career-sync/shared";
import { selectAuth } from "@/store/selectors";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import JobInfoSection from "@/components/JobInfoSection";
import JobApplicationSection from "@/components/JobApplicationSection";
import JobInterviewSection from "@/components/JobInterviewSection";
import JobNotesSection from "@/components/JobNotesSection";
import { useAddJobMutation, useUpdateJobMutation } from "@/store/api/jobsApi";
import { LoadingSpinner } from "@/components/shared/Loading";
import { capitalizeSmart } from "@/utils/stringHelper";
import { toast } from "sonner";
import useJobHooks from "@/hooks/useJob";
import { SquarePen } from "lucide-react";
import CustomTooltip from "@/components/shared/CustomTooltip";
import Modal from "@/components/shared/Modal";

type JobFormKeys = keyof JobFormData;

const STEPS = [
  { id: 1, title: "Job Info", icon: Briefcase },
  { id: 2, title: "Application", icon: FileText },
  { id: 3, title: "Interview", icon: Calendar },
  { id: 4, title: "Notes", icon: Notebook },
];

const stepFields: Record<number, JobFormKeys[]> = {
  1: ["company", "roleTitle", "jobDescription"],
  2: ["applicationMethod", "status", "priority"],
  3: ["interviewStages"],
  4: ["notes"],
};

const JobModalStepper = ({ currentStep }: { currentStep: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const currentStepData = STEPS.find((s) => s.id === currentStep);
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="relative bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700">
      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden relative px-6 py-4" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between background p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              {currentStepData && <currentStepData.icon className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-blue-600 font-bold uppercase">
                Step {currentStep} of {STEPS.length}
              </p>
              <h3 className="text-sm font-bold dark:text-white uppercase">
                {currentStepData?.title}
              </h3>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Vertical Progress Dropdown */}
        {isOpen && (
          <div className="absolute left-6 right-6 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-4">
            <div className="relative">
              {/* Vertical Track Line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />

              {/* Vertical Progress Fill */}
              <div
                className="absolute left-2.5 top-2 w-0.5 bg-blue-600 transition-all duration-500"
                style={{ height: `${progressPercent}%` }}
              />

              <ul className="space-y-6">
                {STEPS.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  return (
                    <li
                      key={step.id}
                      className="relative z-10 flex items-center gap-4 w-full text-left group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted || isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {step.id}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold uppercase tracking-wide ${
                          isCurrent
                            ? "text-blue-600"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block relative px-14 py-8 max-w-5xl mx-auto">
        {/* Horizontal Track */}
        <div className="absolute top-14 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-800" />

        {/* Horizontal Progress Fill */}
        <div
          className="absolute top-14 left-[10%] h-0.5 bg-blue-600 transition-all duration-700"
          style={{ width: `calc(${progressPercent}% * 0.8)` }} // 0.8 matches the 10% margins
        />

        <ul className="flex items-center justify-between relative z-10">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li
                key={step.id}
                className="flex flex-col items-center gap-4 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted || isCurrent
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "surface border-2 border-gray-200 dark:border-gray-700 text-gray-400"
                  } ${isCurrent ? "ring-8 ring-blue-400/20 dark:ring-blue-900/20 scale-100" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    isCurrent || isCompleted ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const JobModalSectionHeader = ({
  title,
  editableFields,
  onClick,
}: {
  title: string;
  editableFields: string[];
  onClick?: () => void;
}) => {
  const dispatch = useAppDispatch();
  return (
    <div className="job-modal-section-header">
      {/* <div className="flex gap-2">
        <CustomTooltip label="Edit" position="bottom">
          <ArrowLeft className="h-4.5 w-4.5" />
        </CustomTooltip>
        <h3>{title}</h3>
      </div> */}
      <h3>{title}</h3>

      {editableFields.length === 0 && (
        <button
          type="button"
          className="flex gap-2 items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
          aria-label="edit"
          onClick={() => {
            if (onClick) onClick();
            dispatch(
              setReviewJobApplication({
                isToReview: false,
                isOnReview: false,
              }),
            );
          }}
        >
          <CustomTooltip label="Edit" position="bottom">
            <SquarePen className="h-4.5 w-4.5" />
          </CustomTooltip>
        </button>
      )}
    </div>
  );
};

const JobModal = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [currentStep, setCurrentStep] = useState(1);

  const [addJob, { isLoading: isAdding }] = useAddJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const { viewOnly, reviewJobApplication } = useAppSelector(selectJobModal);

  const {
    isJobModalShow,
    isViewOnly,
    editableFields,
    fieldsToRender,
    selectedJob,
    handleCloseModal,
    onConfirmModal,
    handleSaveJob,
  } = useJobHooks();

  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      userId: user?.userId as string,
    },
  });

  const { reset, handleSubmit, trigger, formState } = methods;

  const { isDirty } = formState;

  const onClose = () => {
    if (isAdding || isUpdating) return;
    handleCloseModal(isDirty);
  };

  const getStepFromFields = () => {
    if (fieldsToRender.includes("info")) return 1;
    if (fieldsToRender.includes("applicationMethod")) return 2;
    if (fieldsToRender.includes("interviewStages")) return 3;
    if (fieldsToRender.includes("notes")) return 4;
    return 0;
  };

  const setAllViewOnly = () => {
    dispatch(
      setViewOnly({
        info: true,
        applicationMethod: true,
        interviewStages: true,
        notes: true,
      }),
    );
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep];

    if (!fieldsToValidate) {
      console.warn(`No fields defined for step ${currentStep}`);
      return;
    }

    const isValid = await trigger(fieldsToValidate);

    if (!isValid) return;

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));

    if (currentStep === 3) {
      dispatch(
        setReviewJobApplication({
          isToReview: true,
          isOnReview: false,
        }),
      );
    }
  };

  const handleReview = async () => {
    const step = getStepFromFields();
    const fieldsToValidate = stepFields[step];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) return;

    dispatch(
      setReviewJobApplication({
        isToReview: false,
        isOnReview: true,
      }),
    );

    setAllViewOnly();
  };

  const handleCancel = async () => {
    const step = getStepFromFields();

    // Case: fields are not dirty and not select job
    if (editableFields.length > 0 && !isDirty && selectedJob) {
      setAllViewOnly();
      return;
    }

    // Case: fields are dirty and a job is selected
    if (editableFields.length > 0 && isDirty && selectedJob) {
      const onConfirm = () => {
        reset(selectedJob);
        setAllViewOnly();
      };
      return onConfirmModal(onConfirm);
    }

    // Case: fields are dirty, no job selected, and not on first step
    if (
      editableFields.length > 0 &&
      currentStep !== 1 &&
      isDirty &&
      !selectedJob
    ) {
      const fieldsToValidate = stepFields[step];
      const isValid = await trigger(fieldsToValidate);

      if (isValid) {
        const onConfirm = () => {
          dispatch(
            setReviewJobApplication({ isToReview: false, isOnReview: true }),
          );
          setAllViewOnly();
        };
        return onConfirmModal(onConfirm);
      }
    }

    onClose();
  };

  const handleBack = () => {
    if (isViewOnly) {
      dispatch(
        setReviewJobApplication({ isToReview: true, isOnReview: false }),
      );
      dispatch(setViewOnly({}));
      return;
    }

    dispatch(setReviewJobApplication({ isToReview: false, isOnReview: false }));
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: JobFormData) => {
    const jobData: JobApplication = {
      ...data,
      ...(selectedJob ? {} : { id: uuidv4() }),
      applicationDate: data.applicationDate || getTodayString(),
      company: capitalizeSmart(data.company),
      roleTitle: capitalizeSmart(data.roleTitle),
      contact: capitalizeSmart(data.contact),
      location: capitalizeSmart(data.location),
    } as JobApplication;

    try {
      const result = selectedJob
        ? await updateJob({
            id: selectedJob.id,
            data: jobData,
          }).unwrap()
        : await addJob({ data: jobData }).unwrap();

      handleSaveJob(result.data);
      if (selectedJob) {
        toast.success("Job updated successfully.");
      } else {
        toast.success("Job added successfully.");
      }
    } catch (error) {
      console.error("Error adding job:", error);
      if (selectedJob) {
        toast.error("Error updating job. Please try again later.");
      } else {
        toast.error("Error adding job. Please try again later.");
      }
    } finally {
      dispatch(
        setReviewJobApplication({ isToReview: false, isOnReview: false }),
      );
      dispatch(setViewOnly({}));
    }
  };

  const headerText = () => {
    if (
      isViewOnly &&
      editableFields.length === 0 &&
      !reviewJobApplication.isOnReview
    ) {
      return "View Job Details";
    } else if (reviewJobApplication.isOnReview) {
      return "Review Application";
    } else if (selectedJob) {
      return "Edit Application";
    } else {
      return "New Application";
    }
  };

  useEffect(() => {
    const updatedJob = {
      ...selectedJob,
      cvId: selectedJob?.cvId || "",
      coverLetterId: selectedJob?.coverLetterId || "",
    };

    if (isJobModalShow) {
      setCurrentStep(1);
      reset(updatedJob);
    }
  }, [selectedJob, isJobModalShow]);

  if (!isJobModalShow) return null;

  return (
    <Modal headerText={headerText()} onClose={onClose}>
      {/* Stepper Progress Indicator (Hidden in View Only) */}
      {!isViewOnly && <JobModalStepper currentStep={currentStep} />}

      {/* Form Content */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          // onSubmit={handleSubmit(
          //   (data) => {
          //     console.log("VALID SUBMIT", data);
          //   },
          //   (errors) => {
          //     console.log("FORM ERRORS", errors);
          //   },
          // )}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
            {isViewOnly ? (
              <div className="space-y-8">
                {fieldsToRender.includes("info") && (
                  <>
                    <JobModalSectionHeader
                      title={STEPS[0].title}
                      editableFields={editableFields}
                      onClick={() => dispatch(setViewOnly({ info: false }))}
                    />
                    <JobInfoSection isViewOnly={viewOnly.info} />
                  </>
                )}

                {fieldsToRender.includes("applicationMethod") && (
                  <>
                    <JobModalSectionHeader
                      title={STEPS[1].title}
                      editableFields={editableFields}
                      onClick={() =>
                        dispatch(setViewOnly({ applicationMethod: false }))
                      }
                    />
                    <JobApplicationSection
                      isViewOnly={viewOnly.applicationMethod}
                    />
                  </>
                )}

                {fieldsToRender.includes("interviewStages") && (
                  <>
                    <JobModalSectionHeader
                      title={`${STEPS[2].title} Stages`}
                      editableFields={editableFields}
                      onClick={() =>
                        dispatch(setViewOnly({ interviewStages: false }))
                      }
                    />
                    <JobInterviewSection
                      isViewOnly={viewOnly.interviewStages}
                    />
                  </>
                )}

                {fieldsToRender.includes("notes") && (
                  <>
                    <JobModalSectionHeader
                      title="Notes"
                      editableFields={editableFields}
                      onClick={() => dispatch(setViewOnly({ notes: false }))}
                    />
                    <JobNotesSection isViewOnly={viewOnly.notes} />
                  </>
                )}
              </div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && <JobInfoSection />}
                {currentStep === 2 && <JobApplicationSection />}
                {currentStep === 3 && <JobInterviewSection />}
                {currentStep === 4 && <JobNotesSection />}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <JobModalFooter
            editableFields={editableFields}
            selectedJob={selectedJob}
            currentStep={currentStep}
            isJobViewOnly={isViewOnly}
            isLoading={isAdding || isUpdating}
            isDirty={isDirty}
            reviewJob={reviewJobApplication}
            onReviewJob={handleReview}
            onClose={handleCancel}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        </form>
      </FormProvider>
    </Modal>
  );
};

const JobModalFooter = ({
  editableFields,
  selectedJob,
  currentStep,
  isJobViewOnly,
  isLoading,
  isDirty,
  reviewJob,
  onReviewJob,
  onClose,
  handleBack,
  handleNext,
}: {
  editableFields: string[];
  selectedJob?: JobApplication | null;
  currentStep: number;
  isJobViewOnly: boolean;
  isLoading: boolean;
  isDirty: boolean;
  reviewJob: { isToReview: boolean; isOnReview: boolean };
  onReviewJob: () => void;
  onClose: () => void;
  handleBack: () => void;
  handleNext: () => void;
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const isNotOnReview = !reviewJob.isOnReview;

  const showCancel =
    (isFirstStep ||
      (editableFields.length > 0 && editableFields.length !== 4)) &&
    (isJobViewOnly || reviewJob.isToReview || (isNotOnReview && !selectedJob));

  const showClose =
    isJobViewOnly &&
    !reviewJob.isToReview &&
    !reviewJob.isOnReview &&
    editableFields.length === 0;

  let actionButton;

  if (
    !isLastStep &&
    !reviewJob.isOnReview &&
    !isJobViewOnly &&
    editableFields.length > 0
  ) {
    actionButton = (
      <button
        type="button"
        onClick={handleNext}
        className="btn-primary flex items-center gap-2"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    );
  } else if (
    (reviewJob.isToReview && !reviewJob.isOnReview) ||
    editableFields.length > 0
  ) {
    actionButton = (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReviewJob();
        }}
        className="btn-primary flex items-center gap-2"
      >
        Review <ChevronRight className="w-4 h-4" />
      </button>
    );
  } else if (reviewJob.isOnReview) {
    actionButton = (
      <button
        type="submit"
        disabled={isLoading}
        className="btn-success flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedJob ? "Update" : "Save Job"}
        {isLoading && <LoadingSpinner />}
      </button>
    );
  }

  return (
    <div className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-[0_-4px_6px_rgba(0,0,0,0.05),0_-10px_20px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        onClick={showCancel ? onClose : handleBack}
        className="px-4 py-2 text-sm font-medium text-cancel transition-colors"
      >
        {showClose ? "Close" : showCancel ? "Cancel" : "Back"}
      </button>
      {isDirty && <div className="flex gap-3">{actionButton}</div>}
    </div>
  );
};

export default JobModal;
