/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setIsViewOnly,
  setCurrentStep,
  setReviewJobApplication,
} from "@/store/slices/globalSlice";
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
import { JobFormData, JobApplication } from "@/@types/jobTypes";
import { getTodayString } from "@/utils/dateHelper";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "@/validators/jobValidator";
import { v4 as uuidv4 } from "uuid";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import useJobHooks from "@/hooks/useJob";
import JobInfoSection from "./JobInfoSection";
import JobApplicationSection from "./JobApplicationSection";
import JobInterviewSection from "./JobInterviewSection";
import JobNotesSection from "./JobNotesSection";

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
  const { isViewOnly, currentStep, reviewJobApplication } =
    useAppSelector(selectGlobal);
  const { defaultJob } = useJobHooks();

  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    reValidateMode: "onChange",
  });

  const { reset, handleSubmit, trigger } = methods;

  useEffect(() => {
    if (isShow) {
      dispatch(setCurrentStep(1));
      reset(selectedJob || defaultJob);
    }
  }, [selectedJob, isShow]);

  const handleNext = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = {
      1: ["company", "roleTitle", "jobDescription"],
      2: ["applicationMethod", "status", "priority"],
      // 3: ["interviewStage"],
      3: ["notes"],
    }[currentStep] as any;

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      dispatch(setCurrentStep(Math.min(currentStep + 1, STEPS.length)));
      if (currentStep === 3) {
        dispatch(
          setReviewJobApplication({
            isToReview: true,
            isOnReview: false,
          }),
        );
      }
    }
  };

  const handleBack = () => {
    if (isViewOnly) {
      dispatch(
        setReviewJobApplication({ isToReview: true, isOnReview: false }),
      );
      dispatch(setIsViewOnly(false));
      return;
    }
    dispatch(setReviewJobApplication({ isToReview: false, isOnReview: false }));
    dispatch(setCurrentStep(Math.max(currentStep - 1, 1)));
  };

  const onSubmit = (data: JobFormData) => {
    const jobData: JobApplication = {
      ...data,
      id: selectedJob?.id || uuidv4(),
      applicationDate: data.applicationDate || getTodayString(),
    } as JobApplication;

    onSave(jobData);
    onClose();
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
          className="relative surface rounded-2xl shadow-2xl w-full max-w-5xl min-h-[75vh] max-h-[90vh] overflow-hidden z-50 flex my-8 flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-default">
              {isViewOnly
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
          {!isViewOnly && <JobModalStepper currentStep={currentStep} />}

          {/* Form Content */}
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto p-6"
            >
              {isViewOnly ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="job-modal-section-header">
                      {STEPS[0].title}
                    </h3>
                    <JobInfoSection isViewOnly />
                  </div>
                  <div>
                    <h3 className="job-modal-section-header">
                      {STEPS[1].title} Method
                    </h3>
                    <JobApplicationSection isViewOnly />
                  </div>
                  <div>
                    <h3 className="job-modal-section-header">
                      {STEPS[2].title} Stage
                    </h3>
                    <JobInterviewSection isViewOnly />
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
            </form>
          </FormProvider>

          {/* Footer */}
          <JobModalFooter
            selectedJob={selectedJob}
            currentStep={currentStep}
            isViewOnly={isViewOnly}
            reviewJob={reviewJobApplication}
            onReviewJob={() => {
              dispatch(
                setReviewJobApplication({
                  isToReview: false,
                  isOnReview: true,
                }),
              );
              dispatch(setIsViewOnly(true));
            }}
            onEditJob={() => dispatch(setIsViewOnly(false))}
            onClose={onClose}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const JobModalFooter = ({
  selectedJob,
  currentStep,
  isViewOnly,
  reviewJob,
  onEditJob,
  onReviewJob,
  onClose,
  handleBack,
  handleNext,
}: {
  selectedJob?: JobApplication | null;
  currentStep: number;
  isViewOnly: boolean;
  reviewJob: { isToReview: boolean; isOnReview: boolean };
  onReviewJob: () => void;
  onEditJob: () => void;
  onClose: () => void;
  handleBack: () => void;
  handleNext: () => void;
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
      <button
        type="button"
        onClick={
          (currentStep === 1 || isViewOnly) && !reviewJob.isOnReview
            ? onClose
            : handleBack
        }
        className="px-4 py-2 text-sm font-medium text-cancel transition-colors"
      >
        {(currentStep === 1 || isViewOnly) && !reviewJob.isOnReview
          ? "Cancel"
          : "Back"}
      </button>

      <div className="flex gap-3">
        {isViewOnly && !reviewJob.isOnReview ? (
          <button
            type="button"
            onClick={onEditJob}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all"
          >
            Edit Job
          </button>
        ) : (
          <>
            {currentStep < STEPS.length && !reviewJob.isOnReview ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : reviewJob.isToReview && !reviewJob.isOnReview ? (
              <button
                type="button"
                onClick={onReviewJob}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                Review <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-lg shadow-green-500/30 transition-all"
              >
                <Check className="w-4 h-4" />{" "}
                {selectedJob ? "Update" : "Save Job"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobModal;
