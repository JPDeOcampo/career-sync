"use client";
import { useRouter } from "next/router";
import { Logo } from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { InputEmail } from "@/components/shared/CustomUserInput";
import { emailSchema } from "@career-sync/shared";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleApiResponse, handleApiError } from "@/utils/handleApi";
import { useAppDispatch } from "@/hooks/useRedux";
import { setSessionExpiry } from "@/store/slices/authSlice";
import { LoadingSpinner } from "@/components/shared/Loading";

type EmailFormData = z.infer<typeof emailSchema>;

const ForgotPassword = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [userForgotPassword, { isLoading }] = useForgotPasswordMutation();

  const methods = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: EmailFormData) => {
    const email = data.email;

    try {
      const response = await userForgotPassword({ email }).unwrap();
      handleApiResponse(response, (data) => {
        dispatch(setSessionExpiry(data.expiresIn));
        router.push(`/verify-code`);
      });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="auth-card">
      <button
        onClick={() => router.push("/login")}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </button>

      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-3xl font-bold text-default mb-2">
          Forgot password?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          No worries, we&apos;ll send you reset verification code
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputEmail
            label="Email Address"
            {...register("email")}
            error={errors.email?.message}
            subtext="Enter the email associated with your account"
          />

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? <LoadingSpinner /> : "Send Verification Code"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ForgotPassword;
