/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import HelmetMeta from "./helmetMeta";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import SubNavbar from "@/components/SubNavbar";
import JobModal from "@/components/JobModal";
import useJobHooks from "@/hooks/useJob";
import { GlobalModalProvider } from "@/context/GlobalModalContext";
import DocumentModal from "@/components/shared/DocumentModal";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { setSelectedViewDocument } from "@/store/slices/documentSlice";
import { selectDocuments } from "@/store/selectors";
import { getCookieValue } from "@/utils/cookies";
import {
  VERIFICATION_EMAIL_REGISTER,
  VERIFICATION_EMAIL_CHANGE,
} from "@/constant/verifyStatus";
import { handleStatusToast } from "@/utils/toast";
import { initTheme } from "@/store/initTheme";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import useGlobalHooks from "@/hooks/useGlobal";
import { cn } from "@/utils/cn";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const AppContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLandingPage, hasPublicRoute, isPublicNonLandingPage } =
    useGlobalHooks();
  const isErrorPage = Component.name === "Custom404";
  const isPublicPage = hasPublicRoute || isErrorPage;

  const { selectedViewDocument } = useAppSelector(selectDocuments);

  const { isJobModalShow } = useJobHooks();

  useEffect(() => {
    if (!isPublicPage && !isLandingPage) return;
    if (typeof window !== "undefined") {
      initTheme(store);
    }
  }, [router.pathname]);

  useEffect(() => {
    const hasVerified = getCookieValue("is_verified=");
    const isLoginPage = router.pathname === "login";
    const verificationMessage = isLoginPage
      ? VERIFICATION_EMAIL_REGISTER
      : VERIFICATION_EMAIL_CHANGE;

    const timer = setTimeout(() => {
      handleStatusToast(hasVerified, verificationMessage, {
        clearCookie: "is_verified",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "font-sans flex flex-col min-h-screen min-w-full shrink-0",
        poppins.variable,
      )}
    >
      {!isPublicPage && !isLandingPage && (
        <header
          className="top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 
      surface sticky"
        >
          <Navbar />
          <SubNavbar />
        </header>
      )}

      {isLandingPage && <PublicHeader />}

      <main
        className={cn(
          "flex flex-col items-center bg-background flex-1 w-full",
          !isPublicPage ? "p-4 md:p-8" : "justify-center",
          isPublicNonLandingPage && "my-35",
        )}
      >
        <div
          className={cn(
            "w-full",
            !isLandingPage && "max-w-7xl",
            isPublicNonLandingPage && "flex justify-center items-center",
          )}
        >
          <Component {...pageProps} />
        </div>
      </main>

      {isPublicPage && <PublicFooter />}

      {isJobModalShow && <JobModal />}
      <DocumentModal
        isOpen={!!selectedViewDocument.url}
        onClose={() =>
          dispatch(setSelectedViewDocument({ id: null, url: null }))
        }
        documentUrl={selectedViewDocument.url || ""}
        documentId={selectedViewDocument.id || ""}
        title="Document Preview"
      />

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function MyApp(props: AppProps) {
  return (
    <Provider store={store}>
      <GlobalModalProvider>
        <HelmetMeta />
        <AppContent {...props} />
      </GlobalModalProvider>
    </Provider>
  );
}
