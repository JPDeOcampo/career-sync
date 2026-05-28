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
import { SquarePen, Trash2, TriangleAlert } from "lucide-react";
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
import Modal from "./shared/Modal";
import { cn } from "@/utils/cn";

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

const DeleteAccount = () => {
  const router = useRouter();
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowForm, setIsShowForm] = useState(false);
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

      router.push("/login");
      toast.success("Account deleted successfully!");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  const handleCloseModal = () => {
    setIsShowConfirm(false);
    setIsShowForm(false);
  };

  return (
    <div className="border border-red-400 bg-red-300/10 rounded-md p-4">
      <div className="space-y-4">
        <div>
          <h3 className="flex gap-2 items-center text-lg font-semibold text-red-400">
            <span>
              <TriangleAlert />
            </span>
            Danger Zone
          </h3>
        </div>

        <div className="flex justify-between items-center gap-6">
          <p className="text-sm text-foreground">
            <span className="font-semibold"> Delete this account</span>
            <br />
            <span>
              Once you delete a account all your data will be permanently
              deleted, there is no going back. Please be certain.
            </span>
          </p>
          <CustomTooltip label="Delete Account" position="bottom">
            <Button
              type="submit"
              variant="destructive"
              className="w-10 h-10 p-0 shrink-0"
              onClick={() => setIsShowConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CustomTooltip>
        </div>
      </div>
      {isShowConfirm && (
        <Modal
          headerText={`Delete Account `}
          headerClassName="text-md font-semibold text-default"
          containerClassName={cn(
            "w-full",
            isShowForm ? "max-w-md h-[35vh]" : "max-w-2xl h-[40vh]",
          )}
          onClose={handleCloseModal}
        >
          <div className="space-y-5 px-6 py-6 h-full">
            {!isShowForm && (
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex flex-col justify-center items-center gap-4 h-full">
                  <span className="text-center text-9xl">
                    <TriangleAlert className="h-16 w-16 text-red-400" />
                  </span>
                  <p className="text-center">
                    Are you sure you want to delete your account{" "}
                    <b>{user?.email}</b>?
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full h-10"
                  onClick={() => setIsShowForm(true)}
                >
                  Yes, delete my account
                </Button>
              </div>
            )}
            {isShowForm && (
              <FormProvider {...methods}>
                <div className="flex flex-col gap-4 h-full">
                  <p>Please enter your password to confirm.</p>
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
                    className="space-y-5 h-full"
                  >
                    <div className="w-full h-full flex flex-col justify-between gap-4">
                      <InputPassword
                        {...register("password")}
                        label="Password"
                        showPassword={showPassword}
                        setShowPassword={() => setShowPassword(!showPassword)}
                        error={errors.password?.message}
                        isRequired
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="w-full h-10"
                          onClick={handleCloseModal}
                          disabled={isDeleting || isSubmitting}
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
                  </form>
                </div>
              </FormProvider>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

const AccountSetting = () => {
  const [viewOnly, setViewOnly] = useState({
    personalInformation: true,
    password: true,
  });

  const handleViewOnly = (field: string) => {
    setViewOnly((prev) => ({
      personalInformation:
        field === "personalInformation" ? !prev.personalInformation : true,

      password: field === "password" ? !prev.password : true,
    }));
  };

  return (
    <div className="space-y-10 md:pt-6 px-4 h-full">
      {viewOnly.password && (
        <PersonalInformation
          isViewOnly={viewOnly.personalInformation}
          onViewOnly={() => handleViewOnly("personalInformation")}
        />
      )}

      {viewOnly.personalInformation && (
        <UpdatePassword
          isViewOnly={viewOnly.password}
          onViewOnly={() => handleViewOnly("password")}
        />
      )}
      {viewOnly.personalInformation && viewOnly.password && <DeleteAccount />}
    </div>
  );
};

export default AccountSetting;
