/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import LogoShield from "@/components/shared/LogoShield";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { useRouter } from "next/router";
import useAuthHooks from "@/hooks/useAuth";
import { InputPassword } from "@/components/shared/CustomUserInput";
import { resetPasswordSchema } from "@career-sync/shared";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { LoadingSpinner } from "@/components/shared/Loading";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userResetPassword, { isLoading }] = useResetPasswordMutation();
  const { user, refreshResetPassword } = useAuthHooks();

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: ResetPasswordFormData) => {
    const { newPassword, confirmPassword } = data;
    if (isLoading) return;

    try {
      await userResetPassword({
        userId: user?.userId as string,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      }).unwrap();
      toast.success("Password reset successfully!");
      router.push("/");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  useEffect(() => {
    if (user?.userId) return;
    refreshResetPassword();
  }, []);

  return (
    <div className="auth-card">
      <div className="text-center mb-8">
        <LogoShield />
        <h1 className="text-3xl font-bold text-default mb-2">Reset Password</h1>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputPassword
            showPassword={showPassword}
            setShowPassword={() => setShowPassword(!showPassword)}
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />

          <InputPassword
            {...register("confirmPassword")}
            label="Confirm Password"
            showPassword={showConfirmPassword}
            setShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? <LoadingSpinner /> : "Reset Password"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ResetPassword;
