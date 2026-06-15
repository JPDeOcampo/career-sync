import { Controller, useFormContext, FieldError } from "react-hook-form";
import { JobFormField } from "./shared/JobFormField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { jobTypes, workSetups } from "@/constant/jobSelectList";

const JobInfoSection = ({ isViewOnly }: { isViewOnly?: boolean }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <JobFormField
          label="Company"
          isRequired
          isViewOnly={isViewOnly}
          {...register("company")}
          error={errors.company?.message as FieldError["message"]}
        />
        <JobFormField
          label="Role Title"
          isRequired
          isViewOnly={isViewOnly}
          {...register("roleTitle")}
          error={errors.roleTitle?.message as FieldError["message"]}
        />
      </div>
      <JobFormField
        label="Job Description"
        isRequired
        isViewOnly={isViewOnly}
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
              isViewOnly={isViewOnly}
              showAfterLabel={false}
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
              isViewOnly={isViewOnly}
              showAfterLabel={false}
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
          isViewOnly={isViewOnly}
          {...register("workSchedule")}
        />
        <JobFormField
          label="Salary"
          placeholder="e.g. $80k"
          isViewOnly={isViewOnly}
          {...register("salary")}
        />
        <JobFormField
          label="Location"
          placeholder="e.g. Manila"
          isViewOnly={isViewOnly}
          {...register("location")}
        />
        <div className="md:col-span-2">
          <JobFormField
            label="Job Link"
            type="text"
            placeholder="https://..."
            isViewOnly={isViewOnly}
            {...register("jobLink")}
          />
        </div>
      </div>
    </div>
  );
};

export default JobInfoSection;
