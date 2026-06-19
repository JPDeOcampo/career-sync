import React, { useState } from "react";
import { useRouter } from "next/router";
import { publicRoutes } from "@/constant/routesPath";

const usePublicPageHooks = () => {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const isLandingPage = router.pathname === "/";
  const hasPublicRoute = publicRoutes.includes(router.pathname);
  const isPublicNonLandingPage = hasPublicRoute && !isLandingPage;

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    setNavOpen(false);

    if (targetId === "" && isLandingPage) {
      return window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (isPublicNonLandingPage) {
      return router.push(`/` + targetId);
    }

    const targetElement = document.getElementById(targetId.replace("#", ""));

    if (targetElement) {
      const headerOffset = 64;
      const position = targetElement.getBoundingClientRect().top;
      const calculatedOffset = position + window.scrollY - headerOffset;

      window.scrollTo({
        top: calculatedOffset,
        behavior: "smooth",
      });
    }
  };
  return {
    navOpen,
    setNavOpen,
    isLandingPage,
    hasPublicRoute,
    isPublicNonLandingPage,
    handleScroll,
  };
};

export default usePublicPageHooks;
