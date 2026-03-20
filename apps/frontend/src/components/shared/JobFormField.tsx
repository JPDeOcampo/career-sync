import { useAppSelector } from "@/hooks/useRedux";
import { selectGlobal } from "@/store/selectors";
import { useFormContext } from "react-hook-form";
import Label from "./Label";
import Input from "./Input";
import TextArea from "./TextArea";
import { BaseFormFieldProps } from "@/@types/fieldTypes";
import { cn } from "@/utils/cn";
import { JobFormData } from "@/@types/jobTypes";

type JobFormFieldProps = BaseFormFieldProps & {
  as?: "input" | "textarea";
  rows?: number;
  disabled?: boolean;
  isRequired?: boolean;
  type?: string;
  className?: string;
};

const JobFormField = ({
  label = "",
  placeholder = "",
  error,
  autofocus = false,
  as = "input",
  rows = 3,
  disabled = false,
  isRequired = false,
  type = "text",
  className,
  ...registerProps
}: JobFormFieldProps) => {
  const { isJobViewOnly } = useAppSelector(selectGlobal);
  const { watch } = useFormContext<JobFormData>();
  const value = watch(
    registerProps.name as keyof JobFormData,
  ) as JobFormData[keyof JobFormData];

  const baseClass = `w-full ${as === "input" ? "h-10.5" : ""} px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground`;

  const borderClass = error
    ? "border border-red-500"
    : "border border-gray-300 dark:border-gray-600";

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label
        htmlFor={registerProps.name}
        className={`block text-sm font-medium ${error ? "text-red-500" : "job-form-label"}`}
      >
        {label}
        {/* Hide (Optional) and * marks in isJobViewOnly mode for a cleaner look */}
        {!isJobViewOnly &&
          (isRequired ? (
            <span className="ml-1">*</span>
          ) : (
            label && (
              <span className="text-gray-400 dark:text-gray-500 ml-1">
                (Optional)
              </span>
            )
          ))}
      </Label>

      {isJobViewOnly ? (
        // View Only State: Renders a styled div or p instead of an input
        <p className="text-job-value">{String(value ?? "N/A")}</p>
      ) : (
        // Editable State
        <>
          {as === "textarea" ? (
            <TextArea
              id={registerProps.name}
              placeholder={placeholder}
              className={cn(baseClass, borderClass, className)}
              autoFocus={autofocus}
              rows={rows}
              disabled={disabled}
              {...registerProps}
            />
          ) : (
            <Input
              id={registerProps.name}
              type={type}
              placeholder={placeholder}
              className={cn(
                baseClass,
                borderClass,
                className,
                type === "date" || type === "time" ? "inline-block" : "",
              )}
              autoFocus={autofocus}
              disabled={disabled}
              {...registerProps}
            />
          )}
        </>
      )}

      {/* Only show errors if not in isJobViewOnly mode */}
      {!isJobViewOnly && error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export { JobFormField };
