import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface StatusConfig {
  type: ToastType;
  message: string | ((status: string) => string);
}

export const handleStatusToast = (
  status: string | null | undefined,
  config: Record<string, StatusConfig>,
  options?: {
    clearCookie?: string;
  },
) => {
  if (!status) return;

  const statusConfig = config[status];

  if (!statusConfig) return;

  const message =
    typeof statusConfig.message === "function"
      ? statusConfig.message(status)
      : statusConfig.message;

  toast[statusConfig.type](message);

  if (options?.clearCookie) {
    document.cookie = `${options.clearCookie}=; max-age=0; path=/;`;
  }
};
