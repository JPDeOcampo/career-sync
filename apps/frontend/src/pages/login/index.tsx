"use client";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import Logo from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { useLoginMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { InputEmail, InputPassword } from "@/components/shared/CustomUserInput";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@career-sync/shared";
import { LoadingSpinner } from "@/components/shared/Loading";
import { getVerifiedStatus } from "@/utils/cookies";

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [userLogin, { isLoading }] = useLoginMutation();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    // mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data;
    if (isLoading) return;

    try {
      const response = await userLogin({ email, password }).unwrap();
      dispatch(login(response));
      router.push("/dashboard");
      const welcome =
        (response.user.loginCount ?? 0 > 0) ? "Welcome back" : "Welcome";
      toast.success(`${welcome}, ${response.user.firstName}!`);
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const status = getVerifiedStatus();

      if (!status) return;

      switch (status) {
        case "true":
          toast.success("Email verified successfully! You can now log in.");
          break;
        case "false":
          toast.error(
            "Invalid or expired verification link, please try again later.",
          );
          break;
      }
      document.cookie = "is_verified=; max-age=0; path=/;";
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="auth-card">
      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-3xl font-bold text-default mb-2">Welcome</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue to your job tracker
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputEmail
            {...register("email")}
            error={errors.email?.message}
            autofocus
          />

          <InputPassword
            withForgotPassword
            showPassword={showPassword}
            setShowPassword={() => setShowPassword(!showPassword)}
            {...register("password")}
            error={errors.password?.message}
          />

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? <LoadingSpinner /> : "Sign In"}
          </Button>
        </form>
      </FormProvider>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} CareerSync. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
