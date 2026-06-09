import Button from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/Loading";

type FormActionsProps = {
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export const FormActions = ({
  onCancel,
  isLoading,
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

    <Button
      type="submit"
      className="w-full h-10"
      disabled={isSubmitting || isLoading}
    >
      {submitLabel}
      {isLoading && <LoadingSpinner />}
    </Button>
  </div>
);
