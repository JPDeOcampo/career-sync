import { useRouter } from "next/router";
import { useRefreshResetPasswordMutation } from "../store/api/authApi";
import { useAppSelector } from "./useRedux";
import { selectAuth } from "../store/selectors";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const useAuthHooks = () => {
  const router = useRouter();
  const user = useAppSelector(selectAuth).user;

  const [
    userRefreshResetPassword,
    { isLoading: isLoadingRefreshResetPassword },
  ] = useRefreshResetPasswordMutation();

  const refreshResetPassword = async () => {
    try {
      const response = await userRefreshResetPassword().unwrap();
      return response.expiresIn;
    } catch (error) {
      const err = error as FetchBaseQueryError;
      const errorData = err.data as { message?: string };
      toast.error(errorData.message);
      router.push("/login");
    }
  };

  return {
    user,
    refreshResetPassword,
    isLoadingRefreshResetPassword,
  };
};

export default useAuthHooks;
