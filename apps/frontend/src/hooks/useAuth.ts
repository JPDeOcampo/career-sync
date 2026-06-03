import { useRouter } from "next/router";
import {
  useRefreshResetPasswordMutation,
  useOAuthLoginMutation,
} from "@/store/api/authApi";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { selectAuth } from "@/store/selectors";
import { toast } from "sonner";
import {
  GoogleAuthProvider,
  signInWithPopup,
  AuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { handleApiError } from "@/utils/handleApi";
import { OAuthProviderDTO, UserDTO } from "@career-sync/shared";

const useAuthHooks = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuth).user;

  const [userOAuthLogin, { isLoading: isLoadingAuthLogin }] =
    useOAuthLoginMutation();

  const [
    userRefreshResetPassword,
    { isLoading: isLoadingRefreshResetPassword },
  ] = useRefreshResetPasswordMutation();

  const welcomeMessage = (user: UserDTO) => {
    const welcome = (user.loginCount || 0) > 1 ? "Welcome back" : "Welcome";
    toast.success(`${welcome}, ${user.firstName}!`);
  };

  const refreshResetPassword = async () => {
    try {
      const response = await userRefreshResetPassword().unwrap();
      return response.expiresIn;
    } catch (error) {
      toast.error(handleApiError(error));
      router.push("/login");
    }
  };

  const oAuth = async (provider: OAuthProviderDTO) => {
    try {
      let authProvider: AuthProvider;

      switch (provider) {
        case "GOOGLE":
          authProvider = new GoogleAuthProvider();
          break;
        default:
          throw new Error("Unsupported provider.");
      }

      const result = await signInWithPopup(auth, authProvider);
      return await result.user.getIdToken();
    } catch (error) {
      console.error("Auth Login Error: Please try again later.", error);
      toast.error("Authentication failed. Please try again later.");
      return null;
    }
  };

  const oAuthLogin = async (provider: OAuthProviderDTO) => {
    const authData = await oAuth(provider);

    if (!authData) return;

    const idToken = authData;

    try {
      const response = await userOAuthLogin({
        idToken,
        provider,
      }).unwrap();

      dispatch(login(response));
      router.push("/dashboard");
      welcomeMessage(response.user);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return {
    user,
    welcomeMessage,
    refreshResetPassword,
    isLoadingRefreshResetPassword,
    oAuth,
    oAuthLogin,
    isLoadingAuthLogin,
  };
};

export default useAuthHooks;
