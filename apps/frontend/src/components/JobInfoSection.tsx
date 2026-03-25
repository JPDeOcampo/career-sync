import { Controller, useFormContext, FieldError } from "react-hook-form";
import { JobFormField } from "./shared/JobFormField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { jobTypes, workSetups } from "@/constant/jobSelectList";

const JobInfoSection = ({
  isJobViewOnly = false,
}: {
  isJobViewOnly?: boolean;
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JobFormField
          label="Company"
          isRequired
          {...register("company")}
          error={errors.company?.message as FieldError["message"]}
        />
        <JobFormField
          label="Role Title"
          isRequired
          {...register("roleTitle")}
          error={errors.roleTitle?.message as FieldError["message"]}
        />
      </div>
      <JobFormField
        label="Job Description"
        isRequired
        as="textarea"
        rows={3}
        {...register("jobDescription")}
        error={errors.jobDescription?.message as FieldError["message"]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="jobType"
          control={control}
          defaultValue={jobTypes[0]}
          render={({ field }) => (
            <Dropdown
              label="Job Type"
              value={field.value}
              isViewOnly={isJobViewOnly}
              align="left"
            >
              {jobTypes.map((t) => (
                <DropdownItem
                  key={t}
                  item={t}
                  selectedItem={field.value}
                  onSelect={field.onChange}
                />
              ))}
            </Dropdown>
          )}
        />

        <Controller
          name="workSetup"
          control={control}
          defaultValue={workSetups[0]}
          render={({ field }) => (
            <Dropdown
              label="Work Setup"
              value={field.value}
              isViewOnly={isJobViewOnly}
              align="left"
            >
              {workSetups.map((s) => (
                <DropdownItem
                  key={s}
                  item={s}
                  selectedItem={field.value}
                  onSelect={field.onChange}
                />
              ))}
            </Dropdown>
          )}
        />

        <JobFormField
          label="Work Schedule"
          placeholder="e.g., 9am - 5pm"
          {...register("workSchedule")}
        />
        <JobFormField
          label="Salary"
          placeholder="e.g. $80k"
          {...register("salary")}
        />
        <JobFormField
          label="Location"
          placeholder="e.g. Manila"
          {...register("location")}
        />
        <div className="md:col-span-2">
          <JobFormField
            label="Job Link"
            type="text"
            placeholder="https://..."
            {...register("jobLink")}
          />
        </div>
      </div>
    </div>
  );
};

export default JobInfoSection;
