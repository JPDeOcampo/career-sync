import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

const useGlobalHooks = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path: string) => {
    router.push(path);
  };

  return {
    navigate,
    pathname,
  };
};

export default useGlobalHooks;
