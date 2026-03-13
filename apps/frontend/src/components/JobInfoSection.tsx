import { Controller, useFormContext, FieldError } from "react-hook-form";
import { DefaultField } from "./shared/JobField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { jobTypes, workSetups } from "@/constant/jobSelectList";

const JobInfoSection = ({ isViewOnly = false }: { isViewOnly?: boolean }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DefaultField
          label="Company"
          isRequired
          {...register("company")}
          error={errors.company?.message as FieldError["message"]}
        />
        <DefaultField
          label="Role Title"
          isRequired
          {...register("roleTitle")}
          error={errors.roleTitle?.message as FieldError["message"]}
        />
      </div>
      <DefaultField
        label="Job Description"
        isRequired
        as="textarea"
        rows={3}
        {...register("jobDescription")}
        error={errors.jobDescription?.message as FieldError["message"]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Job Type
          </label>
          <Controller
            name="jobType"
            control={control}
            render={({ field }) =>
              isViewOnly ? (
                <p className="text-left font-medium">{field.value}</p>
              ) : (
                <Dropdown label={field.value || "Select Type"} align="left">
                  {jobTypes.map((t) => (
                    <DropdownItem key={t} label={t} onSelect={field.onChange} />
                  ))}
                </Dropdown>
              )
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Work Setup
          </label>
          <Controller
            name="workSetup"
            control={control}
            render={({ field }) =>
              isViewOnly ? (
                <p className="text-left font-medium">{field.value}</p>
              ) : (
                <Dropdown label={field.value || "Select Setup"} align="left">
                  {workSetups.map((s) => (
                    <DropdownItem key={s} label={s} onSelect={field.onChange} />
                  ))}
                </Dropdown>
              )
            }
          />
        </div>
        <DefaultField
          label="Salary"
          placeholder="e.g. $80k"
          {...register("salary")}
        />
        <DefaultField
          label="Location"
          placeholder="e.g. Manila"
          {...register("location")}
        />
      </div>
    </div>
  );
};

export default JobInfoSection;
