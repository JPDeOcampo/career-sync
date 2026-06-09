import Button from "./Button";
import { LoadingSpinner } from "./Loading";

type FormActionsProps = {
  onCancel: () => void;
  isLoading?: boolean;
  isShowSubmit?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const FormActionsSetting = ({
  onCancel,
  isLoading,
  isShowSubmit = true,
  isSubmitting,
  submitLabel = "Update",
}: FormActionsProps) => (
  <div className="flex gap-2 max-w-35">
    <Button
      type="button"
      className="w-full h-10"
      onClick={onCancel}
      disabled={isSubmitting || isLoading}
      variant="ghost"
    >
      Cancel
    </Button>

    {isShowSubmit && (
      <Button
        type="submit"
        className="w-full h-10"
        disabled={isSubmitting || isLoading}
      >
        {submitLabel}
        {isLoading && <LoadingSpinner />}
      </Button>
    )}
  </div>
);

export default FormActionsSetting;
