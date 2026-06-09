import { UseFormRegisterReturn } from "react-hook-form";

export type BaseFormFieldProps = {
  label?: string;
  placeholder?: string;
  error?: string;
  autofocus?: boolean;
  isRequired?: boolean;
  subtext?: string;
  isViewOnly?: boolean;
  showIcon?: {
    isVisible: boolean;
    status: "VERIFIED" | "UNVERIFIED";
  };
} & UseFormRegisterReturn;
