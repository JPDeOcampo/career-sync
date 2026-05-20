import { Label } from "./Label";
import Input from "./Input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { BaseFormFieldProps } from "@/@types/fieldTypes";
import { useFormContext } from "react-hook-form";
import { UserDTO } from "@career-sync/shared";

const InputName = ({
  label = "Name",
  placeholder = "John Doe",
  error,
  autofocus = false,
  isViewOnly = false,
  ...registerProps
}: BaseFormFieldProps) => {
  const { watch } = useFormContext<UserDTO>();
  const value = watch(
    registerProps.name as keyof UserDTO,
  ) as UserDTO[keyof UserDTO];
  return (
    <div className="space-y-2">
      <Label htmlFor={registerProps.name}>{label}</Label>
      {isViewOnly && (
        <p className="text-job-value">
          {typeof value === "string" && value !== "" ? value : "-"}
        </p>
      )}

      {!isViewOnly && (
        <>
          <Input
            id={registerProps.name}
            type="text"
            placeholder={placeholder}
            className={`h-11 ${error ? "border border-red-500" : ""}`}
            autoFocus={autofocus}
            {...registerProps}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </>
      )}
    </div>
  );
};

const InputEmail = ({
  label = "Email",
  placeholder = "john@example.com",
  error,
  autofocus = false,
  subtext,
  isViewOnly = false,
  ...registerProps
}: BaseFormFieldProps) => {
  const { watch } = useFormContext<UserDTO>();
  const value = watch(
    registerProps.name as keyof UserDTO,
  ) as UserDTO[keyof UserDTO];
  return (
    <div className="space-y-2">
      <Label htmlFor={registerProps.name}>{label}</Label>
      {isViewOnly && (
        <p className="text-job-value">
          {typeof value === "string" && value !== "" ? value : "-"}
        </p>
      )}

      {!isViewOnly && (
        <>
          <Input
            id={registerProps.name}
            type="email"
            placeholder={placeholder}
            className={`h-11 ${error ? "border border-red-500" : ""}`}
            autoFocus={autofocus}
            {...registerProps}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {subtext && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </>
      )}
    </div>
  );
};

type InputPasswordProps = BaseFormFieldProps & {
  withForgotPassword?: boolean;
  showPassword: boolean;
  setShowPassword: () => void;
};

const InputPassword = ({
  label = "Password",
  placeholder = "••••••••",
  error,
  autofocus = false,
  withForgotPassword = false,
  showPassword,
  setShowPassword,
  ...registerProps
}: InputPasswordProps) => {
  const router = useRouter();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={registerProps.name}>{label}</Label>
        {withForgotPassword && (
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </button>
        )}
      </div>
      <div className="relative">
        <Input
          id={registerProps.name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoFocus={autofocus}
          className={`h-11 pr-10 ${error ? "border border-red-500" : ""}`}
          {...registerProps}
        />
        <button
          type="button"
          onClick={setShowPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export { InputName, InputEmail, InputPassword };
