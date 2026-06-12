import { useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { useDeleteAllJobMutation } from "@/store/api/jobsApi";
import { LoadingSpinner } from "@/components/shared/Loading";
import { toast } from "sonner";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import { cn } from "@/utils/cn";
import Input from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleApiError } from "@/utils/handleApi";
import { Checkbox } from "@/components/shared/Checkbox";
import useDataManagementHooks from "@/hooks/useDataManagement";

const deleteAllJobsSchema = z.object({
  confirmation: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val === "DELETE ALL JOBS", {
      message: 'You must type "DELETE ALL JOBS" exactly to confirm.',
    }),
});

type DeleteAllJobsFormData = z.input<typeof deleteAllJobsSchema>;

type ActionButtonProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "danger";
  children?: React.ReactNode;
};

const baseButtonClass =
  "flex w-full items-center justify-between rounded-lg border p-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variantClass = {
  default: "border-foreground/50 hover:bg-foreground/5",
  danger: "border-red-400 bg-red-300/10 hover:bg-red-300/15",
};

const ActionButton = ({
  title,
  description,
  icon,
  onClick,
  disabled,
  loading,
  variant = "default",
  children,
}: ActionButtonProps) => {
  return (
    <button
      className={`${baseButtonClass} ${variantClass[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="text-left">
        <p
          className={`font-medium ${
            variant === "danger" ? "text-red-400" : "text-foreground"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-sm ${
            variant === "danger"
              ? "text-foreground/60"
              : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner className="h-5 w-5 text-muted-foreground" />
      ) : (
        icon
      )}

      {children}
    </button>
  );
};

const DataManagementSettings = ({ onClose }: { onClose?: () => void }) => {
  const [isShowConfirm, setIsShowDeleteConfirm] = useState(false);

  const [deleteAllJob, { isLoading: isDeleting }] = useDeleteAllJobMutation();
  const {
    isExport,
    setIsExport,
    handleExport,
    isFetchingJobs,
    handleImport,
    isAdding,
  } = useDataManagementHooks();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const methods = useForm<DeleteAllJobsFormData>({
    resolver: zodResolver(deleteAllJobsSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseDeleteConfirm = () => {
    setIsShowDeleteConfirm(false);
  };

  const onSubmit = async () => {
    try {
      if (isExport) {
        await handleExport();
      }
      const result = await deleteAllJob().unwrap();
      toast.success(result.message);
      handleCloseDeleteConfirm();
      onClose?.();
    } catch (error) {
      toast.error(handleApiError(error));
      handleCloseDeleteConfirm();
    }
  };

  return (
    <div className="md:pt-6 p-4">
      <h3 className="text-lg font-semibold text-foreground">Data Management</h3>

      <p className="mt-1 text-sm text-muted-foreground">
        Import, export, or delete your job tracking data.
      </p>

      <div className="mt-6 space-y-4">
        {/* IMPORT */}
        <ActionButton
          title="Import Jobs"
          description="Upload a CSV or Excel file."
          icon={<Upload className="h-5 w-5 text-muted-foreground" />}
          onClick={handleClick}
          disabled={isAdding || isFetchingJobs || isDeleting}
          loading={isAdding}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={(e) => handleImport(e, onClose)}
            className="hidden"
          />
        </ActionButton>

        {/* EXPORT */}
        <ActionButton
          title="Export Jobs"
          description="Download all applications as Excel."
          icon={<Download className="h-5 w-5 text-muted-foreground" />}
          onClick={handleExport}
          disabled={isFetchingJobs || isAdding || isDeleting}
          loading={isFetchingJobs}
        />

        {/* DELETE */}
        <div className="border-t border-foreground/10 pt-4">
          <ActionButton
            title="Delete All Jobs"
            description="Permanently remove all job applications."
            icon={<Trash2 className="h-5 w-5 text-red-400" />}
            variant="danger"
            onClick={() => setIsShowDeleteConfirm(true)}
            disabled={isFetchingJobs || isAdding}
          />
          {isShowConfirm && (
            <Modal
              headerText="Delete All Jobs"
              headerClassName="text-md font-semibold text-default"
              containerClassName={cn("w-full flex flex-col h-auto max-w-2xl")}
              onClose={handleCloseDeleteConfirm}
            >
              <div className="flex-1 overflow-y-auto px-6 my-6">
                <>
                  <p className="mb-4 text-sm text-foreground">
                    This will delete all job applications from all accounts
                    linked. Action cannot be undone.
                  </p>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 justify-between gap-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="confirmation">Confirmation</Label>
                      <Input
                        id="confirmation"
                        type="text"
                        placeholder="Type `DELETE ALL JOBS` to confirm"
                        autoFocus={true}
                        className={`h-11 pr-10 ${errors.confirmation ? "border border-red-500" : ""}`}
                        {...register("confirmation")}
                      />
                      {errors && (
                        <p className="text-red-500 text-sm">
                          {errors.confirmation?.message}
                        </p>
                      )}
                      <Checkbox
                        label="Export job applications before deleting."
                        defaultChecked={isExport}
                        onChange={(e) => {
                          setIsExport(e.target.checked);
                        }}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        className="w-full h-10"
                        onClick={handleCloseDeleteConfirm}
                        disabled={isDeleting}
                        variant="secondary"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full h-10"
                        disabled={isDeleting || isSubmitting}
                      >
                        Delete All Jobs
                        {(isDeleting || isSubmitting) && <LoadingSpinner />}
                      </Button>
                    </div>
                  </form>
                </>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagementSettings;
