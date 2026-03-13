"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Logo from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import {
  InputName,
  InputEmail,
  InputPassword,
} from "@/components/shared/CustomUserInput";
// import { Checkbox } from "@/components/shared/Checkbox";
import { toast } from "sonner";
import { useUserRegisterMutation } from "@/store/api/authApi";
import useGlobalHooks from "@/hooks/useGlobal";
import { registerSchema } from "@career-sync/shared";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userRegister, { isLoading }] = useUserRegisterMutation();
  const { navigate } = useGlobalHooks();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { firstName, lastName, email, password, confirmPassword } = data;

    // if (!agreedToTerms) {
    //   toast.error("Please agree to the terms and conditions");
    //   return;
    // }

    if (isLoading) return;

    try {
      await userRegister({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      const err = error as FetchBaseQueryError;
      if ("status" in err) {
        if (err.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Registration failed. Please try again later.");
        }
      } else {
        toast.error("Unexpected error. Please try again later.");
      }
    }
  };

  return (
    <div className="surface rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-3xl font-bold text-default mb-2">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start tracking your job applications today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InputName
            {...register("firstName")}
            label="First Name"
            placeholder="John"
            autofocus
            error={errors.firstName?.message}
          />

          <InputName
            {...register("lastName")}
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
          />
        </div>
        <InputEmail {...register("email")} error={errors.email?.message} />

        <InputPassword
          showPassword={showPassword}
          setShowPassword={() => setShowPassword(!showPassword)}
          {...register("password")}
          error={errors.password?.message}
        />

        <InputPassword
          {...register("confirmPassword")}
          label="Confirm Password"
          showPassword={showConfirmPassword}
          setShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          error={errors.confirmPassword?.message}
        />

        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            I agree to the{" "}
            <span className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms and Conditions
            </span>
          </label>
        </div> */}

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
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
