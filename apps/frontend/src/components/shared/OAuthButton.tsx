import Button from "@/components/shared/Button";
import { FcGoogle } from "react-icons/fc";
import { LoadingSpinner } from "@/components/shared/Loading";
import { FaGithub } from "react-icons/fa";

const oAuthTypes: Record<string, { icon: typeof FcGoogle }> = {
  Google: {
    icon: FcGoogle,
  },
  Github: {
    icon: FaGithub,
  },
};

const OAuthButton = ({
  oauthType,
  buttonText = "Sign in with",
  isLoading = false,
  onClick,
}: {
  oauthType: string;
  buttonText?: string;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  const { icon: Icon } = oAuthTypes[oauthType];

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="secondary"
      className="h-11 w-full"
      disabled={isLoading}
    >
      {isLoading && <LoadingSpinner className="ml-2 h-5 w-5" />}
      {!isLoading && <Icon className="w-5 h-5" />}
      {buttonText} {oauthType}
    </Button>
  );
};

export default OAuthButton;
