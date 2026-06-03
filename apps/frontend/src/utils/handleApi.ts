import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const handleApiResponse = <T extends { message?: string }>(
  response: T,
  onSuccess?: (data: T) => void,
) => {
  if (response.message) {
    toast.success(response.message);
  }

  onSuccess?.(response);
};

export const handleApiError = (error: unknown): string => {
  // RTK Query error
  if (typeof error === "object" && error !== null && "status" in error) {
    const err = error as FetchBaseQueryError;

    // Backend message
    if (
      typeof err.data === "object" &&
      err.data !== null &&
      "message" in err.data
    ) {
      return String((err.data as { message?: string }).message);
    }

    // Fallback by status
    switch (err.status) {
      case 400:
        return "Invalid request";

      case 401:
        return "Unauthorized";

      case 403:
        return "Access denied";

      case 404:
        return "Not found";

      case 500:
        return "Server error";

      default:
        return "Something went wrong";
    }
  }

  return "Unexpected error";
};
