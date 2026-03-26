/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setIsJobViewOnly } from "@/store/slices/globalSlice";
import { selectGlobal } from "@/store/selectors";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Briefcase,
  FileText,
  Calendar,
  Notebook,
} from "lucide-react";
import { JobFormData, JobApplication, jobSchema } from "@career-sync/shared";
import { selectAuth } from "@/store/selectors";
import { getTodayString } from "@/utils/dateHelper";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import JobInfoSection from "./JobInfoSection";
import JobApplicationSection from "./JobApplicationSection";
import JobInterviewSection from "./JobInterviewSection";
import JobNotesSection from "./JobNotesSection";
import { useAddJobMutation, useUpdateJobMutation } from "@/store/api/jobsApi";
import { LoadingSpinner } from "./shared/Loading";
import { capitalizeSmart } from "@/utils/stringHelper";
import { toast } from "sonner";

type JobFormKeys = keyof JobFormData;

interface JobModalProps {
  isShow: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  selectedJob?: JobApplication | null;
}

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

const JobModal = ({ isShow, onClose, onSave, selectedJob }: JobModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [reviewJobApplication, setReviewJobApplication] = useState<{
    isToReview: boolean;
    isOnReview: boolean;
  }>({ isToReview: false, isOnReview: false });
  const [currentStep, setCurrentStep] = useState(1);

  const [addJob, { isLoading: isAdding }] = useAddJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const { isJobViewOnly } = useAppSelector(selectGlobal);

  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      userId: user?.userId as string,
    },
  });

  const { reset, handleSubmit, trigger } = methods;

  useEffect(() => {
    const updatedJob = {
      ...selectedJob,
      cvId: selectedJob?.cvId || "",
      coverLetterId: selectedJob?.coverLetterId || "",
    };

    if (isShow) {
      setCurrentStep(1);
      reset(updatedJob);
    }
  }, [selectedJob, isShow]);

  const handleNext = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = stepFields[currentStep];

    if (!fieldsToValidate) {
      console.warn(`No fields defined for step ${currentStep}`);
      return;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      if (currentStep === 3) {
        setReviewJobApplication({
          isToReview: true,
          isOnReview: false,
        });
      }
    }
  };

  const handleBack = () => {
    if (isJobViewOnly) {
      setReviewJobApplication({ isToReview: true, isOnReview: false });
      dispatch(setIsJobViewOnly(false));
      return;
    }
    setReviewJobApplication({ isToReview: false, isOnReview: false });
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
        ? await updateJob({ id: selectedJob.id, data: jobData }).unwrap()
        : await addJob(jobData).unwrap();

      onSave(result.data);
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
      setReviewJobApplication({ isToReview: false, isOnReview: false });
      onClose();
    }
  };

  if (!isShow) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="surface rounded-2xl shadow-2xl w-full max-w-5xl min-h-[75vh] max-h-[90vh] overflow-hidden z-50 flex my-8 flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-default">
              {isJobViewOnly
                ? "View Job Details"
                : selectedJob
                  ? "Edit Application"
                  : "New Application"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper Progress Indicator (Hidden in View Only) */}
          {!isJobViewOnly && <JobModalStepper currentStep={currentStep} />}

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
                {isJobViewOnly ? (
                  <div className="space-y-8 ">
                    <div>
                      <h3 className="job-modal-section-header">
                        {STEPS[0].title}
                      </h3>
                      <JobInfoSection isJobViewOnly />
                    </div>
                    <div>
                      <h3 className="job-modal-section-header">
                        {STEPS[1].title} Method
                      </h3>
                      <JobApplicationSection isJobViewOnly />
                    </div>
                    <div>
                      <h3 className="job-modal-section-header">
                        {STEPS[2].title} Stage
                      </h3>
                      <JobInterviewSection isJobViewOnly />
                    </div>
                    <div>
                      <h3 className="job-modal-section-header">Notes</h3>
                      <JobNotesSection />
                    </div>
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
                selectedJob={selectedJob}
                currentStep={currentStep}
                isJobViewOnly={isJobViewOnly}
                isLoading={isAdding || isUpdating}
                reviewJob={reviewJobApplication}
                onReviewJob={() => {
                  setReviewJobApplication({
                    isToReview: false,
                    isOnReview: true,
                  });

                  dispatch(setIsJobViewOnly(true));
                }}
                onEditJob={() => dispatch(setIsJobViewOnly(false))}
                onClose={onClose}
                handleBack={handleBack}
                handleNext={handleNext}
              />
            </form>
          </FormProvider>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const JobModalFooter = ({
  selectedJob,
  currentStep,
  isJobViewOnly,
  isLoading,
  reviewJob,
  onEditJob,
  onReviewJob,
  onClose,
  handleBack,
  handleNext,
}: {
  selectedJob?: JobApplication | null;
  currentStep: number;
  isJobViewOnly: boolean;
  isLoading: boolean;
  reviewJob: { isToReview: boolean; isOnReview: boolean };
  onEditJob: () => void;
  onReviewJob: () => void;
  onClose: () => void;
  handleBack: () => void;
  handleNext: () => void;
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const showCancel = (isFirstStep || isJobViewOnly) && !reviewJob.isOnReview;

  let actionButton;

  if (isJobViewOnly && !reviewJob.isOnReview) {
    actionButton = (
      <button type="button" onClick={onEditJob} className="btn-primary">
        Edit Job
      </button>
    );
  } else if (!isLastStep && !reviewJob.isOnReview) {
    actionButton = (
      <button
        type="button"
        onClick={handleNext}
        className="btn-primary flex items-center gap-2"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    );
  } else if (reviewJob.isToReview && !reviewJob.isOnReview) {
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
  } else {
    actionButton = (
      <button type="submit" className="btn-success flex items-center gap-2">
        <Check className="w-4 h-4" />
        {selectedJob ? "Update" : "Save Job"}
        {isLoading && <LoadingSpinner />}
      </button>
    );
  }

  return (
    <div className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
      <button
        type="button"
        onClick={showCancel ? onClose : handleBack}
        className="px-4 py-2 text-sm font-medium text-cancel transition-colors"
      >
        {showCancel ? "Cancel" : "Back"}
      </button>

      <div className="flex gap-3">{actionButton}</div>
    </div>
  );
};

export default JobModal;
