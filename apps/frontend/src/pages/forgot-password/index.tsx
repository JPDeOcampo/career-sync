"use client";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import Logo from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { InputEmail } from "@/components/shared/CustomUserInput";
import { emailSchema } from "@career-sync/shared";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type EmailFormData = z.infer<typeof emailSchema>;

const ForgotPassword = () => {
  const router = useRouter();
  const [userForgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: EmailFormData) => {
    const email = data.email;

    try {
      await userForgotPassword({ email }).unwrap();
      toast.success("Verification code sent to your email!");
      router.push(`/verify-code`);
    } catch (error) {
      const err = error as FetchBaseQueryError;
      if ("status" in err) {
        if (err.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(
            "Failed to send verification code. Please try again later.",
          );
        }
      } else {
        toast.error("Unexpected error. Please try again later.");
      }
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
          Forgot Password?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          No worries, we&apos;ll send you reset verification code
        </p>
      </div>

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
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            "Send Verification Code"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
