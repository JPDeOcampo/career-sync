import { UseFormRegisterReturn } from "react-hook-form";

export type BaseFormFieldProps = {
  label?: string;
  placeholder?: string;
  error?: string;
  autofocus?: boolean;
  subtext?: string;
} & UseFormRegisterReturn;
