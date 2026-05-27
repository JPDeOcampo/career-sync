/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  InputName,
  InputEmail,
  InputPassword,
} from "@/components/shared/CustomUserInput";
import { motion } from "motion/react";
import Button from "@/components/shared/Button";
import {
  userUpdateSchema,
  updatePasswordSchema,
  passwordSchema,
  UserDTO,
  UpdatePasswordDTO,
} from "@career-sync/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomTooltip from "./shared/CustomTooltip";
import { SquarePen } from "lucide-react";
import {
  useUpdateUserMutation,
  useUpdatePasswordMutation,
  useDeleteUserMutation,
} from "@/store/api/authApi";
import useAuthHooks from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/router";

type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
type DeleteAccountFormData = z.infer<typeof passwordSchema>;

const ModalSectionHeader = ({
  title,
  isViewOnly,
  onClick,
}: {
  title: string;
  isViewOnly?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div className="job-modal-section-header">
      <h3>{title}</h3>

      {isViewOnly && (
        <button
          type="button"
          className="flex gap-2 items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
          aria-label="edit"
          onClick={onClick}
        >
          <CustomTooltip label="Edit" position="bottom">
            <SquarePen className="h-4.5 w-4.5" />
          </CustomTooltip>
        </button>
      )}
    </div>
  );
};

const PersonalInformation = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuthHooks();

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: UserDTO) => {
    const { firstName, lastName, email } = data;
    if (isLoading) return;

    try {
      const response = (await updateUser({
        id: user?.userId as string,
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
      }).unwrap()) as unknown as { user: UserDTO };

      dispatch(setUser(response.user));
      onViewOnly();
      toast.success("Profile updated successfully!");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  useEffect(() => {
    reset(user as UserDTO);
  }, []);

  return (
    <div>
      <ModalSectionHeader
        title="Personal Information"
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
          <div className="grid grid-cols-2 gap-4">
            <InputName
              {...register("firstName")}
              label="First Name"
              placeholder="John"
              autofocus
              error={errors.firstName?.message}
              isViewOnly={isViewOnly}
            />

            <InputName
              {...register("lastName")}
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              isViewOnly={isViewOnly}
            />
          </div>
          <InputEmail
            {...register("email")}
            error={errors.email?.message}
            isViewOnly={isViewOnly}
          />
          {!isViewOnly && (
            <div className="flex gap-2 max-w-35">
              <Button
                type="button"
                className="w-full h-10"
                onClick={onViewOnly}
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
                Update{" "}
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                )}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

const UpdatePassword = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user } = useAuthHooks();

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const methods = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: UpdatePasswordDTO) => {
    const { currentPassword, newPassword, confirmPassword } = data;
    if (isLoading) return;

    try {
      await updatePassword({
        id: user?.userId as string,
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
      <ModalSectionHeader
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
                showPassword={showCurrentPassword}
                setShowPassword={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
                autofocus
                isRequired
              />
              <InputPassword
                showPassword={showNewPassword}
                setShowPassword={() => setShowNewPassword(!showNewPassword)}
                {...register("newPassword")}
                error={errors.newPassword?.message}
                isRequired
              />
              <InputPassword
                {...register("confirmPassword")}
                label="Confirm Password"
                showPassword={showConfirmPassword}
                setShowPassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                error={errors.confirmPassword?.message}
                isRequired
              />
              <div className="flex gap-2 max-w-35">
                <Button
                  type="button"
                  className="w-full h-10"
                  onClick={onViewOnly}
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
                  Update{" "}
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

const DeleteAccount = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { user } = useAuthHooks();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const methods = useForm<DeleteAccountFormData>({
    resolver: zodResolver(passwordSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: { password: string }) => {
    const { password } = data;
    if (isDeleting) return;

    try {
      await deleteUser({
        id: user?.userId as string,
        password,
      }).unwrap();

      onViewOnly();
      router.push("/login");
      toast.success("Account deleted successfully!");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  return (
    <div>
      <ModalSectionHeader
        title="Delete Account"
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
                {...register("password")}
                label="Password"
                showPassword={showPassword}
                setShowPassword={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
                isRequired
              />
              <div className="flex gap-2 max-w-45">
                <Button
                  type="button"
                  className="w-full h-10"
                  onClick={onViewOnly}
                  disabled={isDeleting || isSubmitting}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full h-10"
                  disabled={isDeleting || isSubmitting}
                >
                  Delete Account{" "}
                  {isDeleting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

const AccountSetting = () => {
  const [viewOnly, setViewOnly] = useState({
    personalInformation: true,
    password: true,
    deleteAccount: true,
  });

  const handleViewOnly = (field: string) => {
    setViewOnly((prev) => ({
      personalInformation:
        field === "personalInformation" ? !prev.personalInformation : true,

      password: field === "password" ? !prev.password : true,

      deleteAccount: field === "deleteAccount" ? !prev.deleteAccount : true,
    }));
  };

  return (
    <div className="space-y-10 md:pt-6 px-4 h-full">
      <PersonalInformation
        isViewOnly={viewOnly.personalInformation}
        onViewOnly={() => handleViewOnly("personalInformation")}
      />
      <UpdatePassword
        isViewOnly={viewOnly.password}
        onViewOnly={() => handleViewOnly("password")}
      />
      <DeleteAccount
        isViewOnly={viewOnly.deleteAccount}
        onViewOnly={() => handleViewOnly("deleteAccount")}
      />
    </div>
  );
};

export default AccountSetting;
