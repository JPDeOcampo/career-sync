/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setIsViewOnly } from "@/store/slices/globalSlice";
import { selectGlobal } from "@/store/selectors";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { JobFormData, JobApplication } from "@/@types/jobTypes";
import { getTodayString } from "@/utils/dateHelper";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "@/validators/jobValidator";
import { DefaultField } from "./shared/JobField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/shared/Checkbox";
import {
  jobTypes,
  workSetups,
  applicationMethods,
  statuses,
  priorities,
  interviewStages,
} from "@/constant/jobSelectList";
import { v4 as uuidv4 } from "uuid";
import useJobHooks from "@/hooks/useJob";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  selectedJob?: JobApplication | null;
}

const JobModal = ({ isOpen, onClose, onSave, selectedJob }: JobModalProps) => {
  const dispatch = useAppDispatch();
  const { isViewOnly } = useAppSelector(selectGlobal);
  const jobID = uuidv4();
  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    // mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    control,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { defaultJob } = useJobHooks();

  const getModalTitle = () => {
    if (isViewOnly) return "View Job Application";
    if (selectedJob) return "Edit Job Application";
    return "Add New Job Application";
  };

  useEffect(() => {
    if (selectedJob) {
      reset(selectedJob);
    } else {
      reset(defaultJob);
    }
  }, [selectedJob, isOpen]);

  const onSubmit = (data: JobFormData) => {
    const formData = { ...data };

    const jobData: JobApplication = {
      id: selectedJob?.id || jobID,
      company: formData.company || "",
      roleTitle: formData.roleTitle || "",
      jobDescription: formData.jobDescription || "",
      jobType: formData.jobType || "Full-time",
      salary: formData.salary,
      workSetup: formData.workSetup || "Remote",
      workSchedule: formData.workSchedule,
      location: formData.location,
      jobLink: formData.jobLink,
      applicationMethod: formData.applicationMethod || "LinkedIn",
      applicationDate: formData.applicationDate || getTodayString(),
      status: formData.status || "Applied",
      priority: formData.priority || "Medium",
      cvVersion: formData.cvVersion,
      coverLetterSent: formData.coverLetterSent || false,
      contact: formData.contact,
      interviewStage: formData.interviewStage || "None",
      interviewDate: formData.interviewDate,
      interviewTime: formData.interviewTime,
      interviewerName: formData.interviewerName,
      offer: formData.offer || false,
      notes: formData.notes,
    };

    onSave(jobData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
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
              className="relative pb-22 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden my-8 z-50"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {getModalTitle()}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="overflow-y-auto max-h-[calc(90vh-140px)]"
                >
                  <div className="p-6 space-y-8">
                    {/* Job Info Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Job Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DefaultField
                          label="Company"
                          isRequired
                          {...register("company")}
                          error={errors.company?.message}
                        />

                        <DefaultField
                          label="Role Title"
                          isRequired
                          {...register("roleTitle")}
                          error={errors.roleTitle?.message}
                        />

                        <div className="md:col-span-2">
                          <DefaultField
                            label="Job Description"
                            isRequired
                            as="textarea"
                            {...register("jobDescription")}
                            error={errors.jobDescription?.message}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Type
                          </label>
                          <Controller
                            name="jobType"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "-"}
                                  align="left"
                                >
                                  {jobTypes.map((type) => (
                                    <DropdownItem
                                      key={type}
                                      label={type}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Work Setup
                          </label>
                          <Controller
                            name="workSetup"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "-"}
                                  align="left"
                                >
                                  {workSetups.map((setup) => (
                                    <DropdownItem
                                      key={setup}
                                      label={setup}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <DefaultField
                          label="Salary / Rate"
                          placeholder="e.g., $80,000 - $100,000"
                          {...register("salary")}
                        />

                        <DefaultField
                          label="Location"
                          placeholder="e.g., Manila, Philippines"
                          {...register("location")}
                        />

                        <DefaultField
                          label="Work Schedule"
                          placeholder="e.g., 9am - 5pm"
                          {...register("workSchedule")}
                        />

                        <div className="md:col-span-2">
                          <DefaultField
                            label="Job Link"
                            type="text"
                            placeholder="https://..."
                            {...register("jobLink")}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Application Info Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Application Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Application Method
                          </label>
                          <Controller
                            name="applicationMethod"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "-"}
                                  align="left"
                                >
                                  {applicationMethods.map((method) => (
                                    <DropdownItem
                                      key={method}
                                      label={method}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <DefaultField
                          type="date"
                          label="Application Date"
                          className="block"
                          {...register("applicationDate")}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <Controller
                            name="status"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "-"}
                                  align="left"
                                >
                                  {statuses.map((status) => (
                                    <DropdownItem
                                      key={status}
                                      label={status}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <Controller
                            name="priority"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "Select stage"}
                                  align="left"
                                >
                                  {priorities.map((priority) => (
                                    <DropdownItem
                                      key={priority}
                                      label={priority}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <DefaultField
                          label="CV Version"
                          placeholder="e.g., CV_v2.1"
                          {...register("cvVersion")}
                        />

                        <DefaultField
                          label="Contact"
                          placeholder="e.g., recruiter@company.com"
                          {...register("contact")}
                        />

                        <div className="md:col-span-2">
                          <Checkbox
                            label="Cover letter sent"
                            {...register("coverLetterSent")}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Interview Info Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Interview Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Interview Stage
                          </label>

                          <Controller
                            name="interviewStage"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              if (isViewOnly) {
                                return (
                                  <p className="text-job-value">
                                    {field.value}
                                  </p>
                                );
                              }

                              return (
                                <Dropdown
                                  label={field.value || "Select stage"}
                                  align="left"
                                >
                                  {interviewStages.map((stage) => (
                                    <DropdownItem
                                      key={stage}
                                      label={stage}
                                      onSelect={field.onChange}
                                    />
                                  ))}
                                </Dropdown>
                              );
                            }}
                          />
                        </div>

                        <DefaultField
                          label="Interviewer Name"
                          placeholder="e.g., John Doe"
                          {...register("interviewerName")}
                        />

                        <DefaultField
                          type="date"
                          label=" Interview Date"
                          className="block"
                          {...register("interviewDate")}
                        />

                        <DefaultField
                          type="time"
                          label=" Interview Time"
                          className="block"
                          {...register("interviewTime")}
                        />

                        <div className="md:col-span-2">
                          <Checkbox
                            label="  Received offer"
                            {...register("offer")}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Notes Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Notes
                      </h3>
                      <DefaultField
                        as="textarea"
                        placeholder="Add any additional notes..."
                        rows={4}
                        {...register("notes")}
                      />
                    </section>
                  </div>
                  <div className="absolute w-full bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isViewOnly ? "Close" : "Cancel"}
                    </button>
                    {isViewOnly && (
                      <button
                        type="button"
                        onClick={() => dispatch(setIsViewOnly(false))}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit
                      </button>
                    )}

                    {!isViewOnly && (
                      <>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          {selectedJob ? "Update Job" : "Add Job"}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </FormProvider>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobModal;
