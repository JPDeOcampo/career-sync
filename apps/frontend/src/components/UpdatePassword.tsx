import { useForm, FormProvider } from "react-hook-form";
import { InputPassword } from "@/components/shared/CustomUserInput";
import { LoadingSpinner } from "@/components/shared/Loading";
import Button from "@/components/shared/Button";
import { updatePasswordSchema, UpdatePasswordDTO } from "@career-sync/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeaderWithEdit } from "@/components/shared/SectionHeader";
import { useUpdatePasswordMutation } from "@/store/api/authApi";
import useAuthHooks from "@/hooks/useAuth";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { usePasswordVisibility } from "@/hooks/usePassword";

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const currentPassword = usePasswordVisibility();
  const newPassword = usePasswordVisibility();
  const confirmPassword = usePasswordVisibility();

  const { user } = useAuthHooks();

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const methods = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: UpdatePasswordDTO) => {
    const { currentPassword, newPassword, confirmPassword } = data;
    if (isLoading) return;

    try {
      await updatePassword({
        id: user?.id as string,
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      onViewOnly();
      toast.success("Password updated successfully!");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  return (
    <div>
      <SectionHeaderWithEdit
        title="Update Password"
        isViewOnly={isViewOnly}
        onClick={onViewOnly}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          // onSubmit={handleSubmit(
          //   (data) => {
          //     console.log("VALID SUBMIT", data);
          //   },
          //   (errors) => {
          //     console.log("FORM ERRORS", errors);
          //   },
          // )}
          className="space-y-5"
        >
          {!isViewOnly && (
            <div className="max-w-85 space-y-5">
              <InputPassword
                label="Current Password"
                showPassword={currentPassword.visible}
                setShowPassword={currentPassword.toggle}
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
                autofocus
                isRequired
              />
              <InputPassword
                showPassword={newPassword.visible}
                setShowPassword={newPassword.toggle}
                {...register("newPassword")}
                error={errors.newPassword?.message}
                isRequired
              />
              <InputPassword
                {...register("confirmPassword")}
                label="Confirm Password"
                showPassword={confirmPassword.visible}
                setShowPassword={confirmPassword.toggle}
                error={errors.confirmPassword?.message}
                isRequired
              />
              <div className="flex gap-2 max-w-35">
                <Button
                  type="button"
                  className="w-full h-10"
                  onClick={() => {
                    reset();
                    onViewOnly();
                  }}
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
                  Update {isLoading && <LoadingSpinner />}
                </Button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdatePassword;
