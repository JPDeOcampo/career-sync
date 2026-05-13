"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useAppDispatch } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import Logo from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { useLoginMutation } from "@/store/api/authApi";
import useGlobalHooks from "@/hooks/useGlobal";
import { InputEmail, InputPassword } from "@/components/shared/CustomUserInput";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@career-sync/shared";

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [userLogin, { isLoading }] = useLoginMutation();
  const { navigate } = useGlobalHooks();

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
      navigate("/dashboard");
      toast.success(`Welcome back, ${response.user.firstName}!`);
    } catch (error) {
      const err = error as FetchBaseQueryError;

      if ("status" in err) {
        if (err.status === 401) {
          toast.error("Invalid email or password");
        } else if (err.status === 500) {
          toast.error("Server error");
        } else {
          toast.error("Login failed");
        }
      } else {
        toast.error("Unexpected error");
      }
    }
  };

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
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </FormProvider>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
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
