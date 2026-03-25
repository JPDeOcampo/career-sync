/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import Button from "@/components/shared/Button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/shared/InputOTP";
import { ArrowLeft } from "lucide-react";
import LogoShield from "@/components/shared/LogoShield";
import { toast } from "sonner";
import {
  useUserVerifyResetPasswordMutation,
  useUserResendResetVerificationCodeMutation,
} from "@/store/api/authApi";
import useAuthHooks from "@/hooks/useAuth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const VerifyCode = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const resetEmail = useSelector((state: RootState) => state.auth.resetEmail);
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [userResendResetVerificationCode] =
    useUserResendResetVerificationCodeMutation();
  const [userVerifyResetPassword, { isLoading }] =
    useUserVerifyResetPasswordMutation();

  const { user, refreshResetPassword } = useAuthHooks();

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Auto-submit when 6 digits are entered
    if (value.length === 6 && !isLoading) {
      // Small delay to show the last digit before verifying
      setTimeout(() => {
        handleVerifyWithCode(value);
      }, 300);
    }
  };

  const handleVerifyWithCode = async (verificationCode: string = code) => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      await userVerifyResetPassword({
        userId: user?.userId,
        verificationCode,
      }).unwrap();
      toast.success("Verification successful!");
      router.replace("/reset-password");
      dispatch(resetPassword());
    } catch (error) {
      const err = error as FetchBaseQueryError;
      if ("status" in err) {
        if (err.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Verification code is invalid or expired.");
        }
      } else {
        toast.error("Unexpected error. Please try again later.");
      }
    }
  };

  const handleVerify = () => handleVerifyWithCode();

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await userResendResetVerificationCode({ userId: user?.userId }).unwrap();
      toast.success("New verification code sent!");
      setResendCooldown(60); // 60 second cooldown
      setCode("");
    } catch {
      toast.error("Failed to resend verification code.");
      return;
    }
  };

  useEffect(() => {
    if (user?.userId) return;
    refreshResetPassword();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="auth-card">
      <button
        onClick={() => router.push("/forgot-password")}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="text-center mb-8">
        <LogoShield />
        <h1 className="text-3xl font-bold text-default mb-2">Verify Code</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We sent a code to <span className="font-bold">{user?.email}</span>
          <span className="font-medium text-default">{resetEmail}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Enter 6-digit code
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleVerify}
          className="w-full h-11"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
