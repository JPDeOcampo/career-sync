import { Controller, useFormContext } from "react-hook-form";
import { DefaultField } from "./shared/JobField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/shared/Checkbox";
import {
  applicationMethods,
  priorities,
  statuses,
} from "@/constant/jobSelectList";

const JobApplicationSection = ({
  isJobViewOnly = false,
}: {
  isJobViewOnly?: boolean;
}) => {
  const { register, control } = useFormContext();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Method
          </label>
          <Controller
            name="applicationMethod"
            control={control}
            render={({ field }) =>
              isJobViewOnly ? (
                <p className="text-left font-medium">{field.value}</p>
              ) : (
                <Dropdown label={field.value || "Select Method"} align="left">
                  {applicationMethods.map((m) => (
                    <DropdownItem key={m} label={m} onSelect={field.onChange} />
                  ))}
                </Dropdown>
              )
            }
          />
        </div>
        <DefaultField
          type="date"
          label="Application Date"
          {...register("applicationDate")}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) =>
              isJobViewOnly ? (
                <p className="text-left font-medium">{field.value}</p>
              ) : (
                <Dropdown label={field.value || "Select Status"} align="left">
                  {statuses.map((s) => (
                    <DropdownItem key={s} label={s} onSelect={field.onChange} />
                  ))}
                </Dropdown>
              )
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
            Priority
          </label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) =>
              isJobViewOnly ? (
                <p className="text-left font-medium">{field.value}</p>
              ) : (
                <Dropdown label={field.value || "Select Priority"} align="left">
                  {priorities.map((p) => (
                    <DropdownItem key={p} label={p} onSelect={field.onChange} />
                  ))}
                </Dropdown>
              )
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <DefaultField
          label="CV Version"
          placeholder="v1.0"
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
            disabled={isJobViewOnly}
            {...register("coverLetterSent")}
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicationSection;
