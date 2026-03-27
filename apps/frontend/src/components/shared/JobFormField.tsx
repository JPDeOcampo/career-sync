import { useFormContext } from "react-hook-form";
import { FieldLabel } from "./Label";
import Input from "./Input";
import TextArea from "./TextArea";
import { BaseFormFieldProps } from "@/@types/fieldTypes";
import { cn } from "@/utils/cn";
import { JobFormData } from "@career-sync/shared";
import { capitalizeSmart } from "@/utils/stringHelper";

type JobFormFieldProps = BaseFormFieldProps & {
  as?: "input" | "textarea";
  rows?: number;
  disabled?: boolean;
  isRequired?: boolean;
  isViewOnly?: boolean;
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
  isViewOnly,
  type = "text",
  className,
  ...registerProps
}: JobFormFieldProps) => {
  const { watch, setValue } = useFormContext<JobFormData>();
  const value = watch(
    registerProps.name as keyof JobFormData,
  ) as JobFormData[keyof JobFormData];

  const baseClass = `w-full ${as === "input" ? "h-10.5" : ""} px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground`;

  const borderClass = error
    ? "border border-red-500"
    : "border border-gray-300 dark:border-gray-600";

  const registerPropsWithCapitalize = {
    ...registerProps,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      // Call the original RHF onBlur
      registerProps.onBlur?.(e);

      // Apply capitalization
      const value = capitalizeSmart(e.target.value);
      setValue(registerProps.name as keyof JobFormData, value, {
        shouldValidate: true,
      });
    },
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <FieldLabel
        name={registerProps.name}
        label={label}
        error={error}
        isRequired={isRequired}
        isViewOnly={isViewOnly}
      />

      {isViewOnly ? (
        // View Only State: Renders a styled div or p instead of an input

        registerProps.name === "jobLink" &&
        typeof value === "string" &&
        value !== "" ? (
          <a href={value as string} className="text-job-value" target="_blank">
            {value}
          </a>
        ) : (
          <p className="text-job-value">
            {typeof value === "string" && value !== "" ? value : "-"}
          </p>
        )
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
              {...registerPropsWithCapitalize}
            />
          )}
        </>
      )}

      {/* Only show errors if not in isJobViewOnly mode */}
      {!isViewOnly && error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export { JobFormField };
