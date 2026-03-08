import { useRouter } from "next/router";

const useGlobalHooks = () => {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return {
    navigate,
  };
};

export default useGlobalHooks;
