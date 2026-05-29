import { useRouter } from "next/router";
import {
  useRefreshResetPasswordMutation,
  useOAuthLoginMutation,
} from "@/store/api/authApi";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { selectAuth } from "@/store/selectors";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { handleApiError } from "@/utils/handleApi";

const useAuthHooks = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuth).user;
  const googleProvider = new GoogleAuthProvider();

  const [userOAuthLogin, { isLoading: isLoadingAuthLogin }] =
    useOAuthLoginMutation();

  const [
    userRefreshResetPassword,
    { isLoading: isLoadingRefreshResetPassword },
  ] = useRefreshResetPasswordMutation();

  const refreshResetPassword = async () => {
    try {
      const response = await userRefreshResetPassword().unwrap();
      return response.expiresIn;
    } catch (error) {
      toast.error(handleApiError(error));
      router.push("/login");
    }
  };

  const oAuthLogin = async (provider: "GOOGLE") => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      if (result) {
        try {
          const response = await userOAuthLogin({
            idToken,
            provider,
          }).unwrap();
          if (response) {
            dispatch(login(response));
            router.push("/dashboard");
          }
        } catch (error) {
          toast.error(handleApiError(error));
        }
      }
    } catch (error) {
      console.error("Auth Login Error: Please try again later.", error);
    }
  };

  return {
    user,
    refreshResetPassword,
    isLoadingRefreshResetPassword,
    oAuthLogin,
    isLoadingAuthLogin,
  };
};

export default useAuthHooks;
