import { useAppSelector } from "@/hooks/useRedux";
import { selectGlobal } from "@/store/selectors";
import { useFormContext } from "react-hook-form";
import Label from "./Label";
import Input from "./Input";
import TextArea from "./TextArea";
import { BaseFormFieldProps } from "@/@types/fieldTypes";
import { cn } from "@/utils/cn";
import { JobFormData } from "@/@types/jobTypes";

type DefaultFieldProps = BaseFormFieldProps & {
  as?: "input" | "textarea";
  rows?: number;
  disabled?: boolean;
  isRequired?: boolean;
  type?: string;
  className?: string;
};

const DefaultField = ({
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
}: DefaultFieldProps) => {
  const { viewOnly } = useAppSelector(selectGlobal);
  const { watch } = useFormContext<JobFormData>();
  const value = watch(registerProps.name as keyof JobFormData);

  const baseClass = `w-full ${as === "input" ? "h-10.5" : ""} px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`;

  const borderClass = error
    ? "border border-red-500"
    : "border border-gray-300 dark:border-gray-600";

  return (
    <div className="space-y-2">
      <Label
        htmlFor={registerProps.name}
        className={`block text-sm font-medium mb-1 ${error ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}
      >
        {label}
        {/* Hide (Optional) and * marks in viewOnly mode for a cleaner look */}
        {!viewOnly &&
          (isRequired ? (
            <span className="text-sm ml-1">*</span>
          ) : (
            label && (
              <span className="text-gray-400 dark:text-gray-500 text-sm ml-1">
                (Optional)
              </span>
            )
          ))}
      </Label>

      {viewOnly ? (
        // View Only State: Renders a styled div or p instead of an input
        <p className="text-job-value">{value || "N/A"}</p>
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
              className={cn(baseClass, borderClass, className)}
              autoFocus={autofocus}
              disabled={disabled}
              {...registerProps}
            />
          )}
        </>
      )}

      {/* Only show errors if not in viewOnly mode */}
      {!viewOnly && error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export { DefaultField };
