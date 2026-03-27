import { useRouter } from "next/router";
import { useRefreshResetPasswordMutation } from "../store/api/authApi";
import { useAppSelector } from "./useRedux";
import { selectAuth } from "../store/selectors";
import { toast } from "sonner";

const useAuthHooks = () => {
  const router = useRouter();
  const user = useAppSelector(selectAuth).user;

  const [
    userRefreshResetPassword,
    { isLoading: isLoadingRefreshResetPassword },
  ] = useRefreshResetPasswordMutation();

  const refreshResetPassword = async () => {
    try {
      await userRefreshResetPassword().unwrap();
    } catch (error) {
      console.log("Caught error:", error);
      router.push("/login");
      toast.error("Session expired");
    }
  };

  return {
    user,
    refreshResetPassword,
    isLoadingRefreshResetPassword,
  };
};

export default useAuthHooks;
