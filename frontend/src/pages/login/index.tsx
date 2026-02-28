import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { useAppDispatch } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import Logo from "@/components/shared/Logo";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Label from "@/components/shared/Label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useUserLoginMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/hooks/useRedux";
import useGlobalHooks from "@/hooks/useGlobal";

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { textFieldRequired } = useAppSelector((state) => state.global);
  const [userLogin, { isLoading }] = useUserLoginMutation();
  const { validateField } = useGlobalHooks();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const { email, password } = data;
    console.log(email, password);
    if (
      !validateField("email", email) ||
      !validateField("password", password)
    ) {
      return;
    }

    if (isLoading) return;

    try {
      const response = await userLogin({ email, password }).unwrap();
      dispatch(login(response));
      router.push("/dashboard");
      toast.success(`Welcome back, ${response.user.firstName}!`);
    } catch (error) {
      toast.error("Login failed");
      return;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue to your job tracker
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            onChange={handleChange}
            className={`h-11 ${
              textFieldRequired.email ? "border border-red-500" : ""
            }`}
            autoFocus
          />
          {textFieldRequired.email && (
            <p className="text-red-500 text-sm">{textFieldRequired.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              onChange={handleChange}
              className={`h-11 pr-10 ${
                textFieldRequired.password ? "border border-red-500" : ""
              }`}
            />
            {textFieldRequired.password && (
              <p className="text-red-500 text-sm">
                {textFieldRequired.password}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
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

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
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
