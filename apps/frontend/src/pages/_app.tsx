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
import { publicRoutes } from "@/constant/routesPath";
import JobModal from "@/components/JobModal";
import useJobHooks from "@/hooks/useJob";
import { GlobalModalProvider } from "@/context/GlobalModalContext";
import DocumentModal from "@/components/shared/DocumentModal";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { setSelectedViewDocument } from "@/store/slices/documentSlice";
import { selectDocuments } from "@/store/selectors";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const AppContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hideHeader = publicRoutes.includes(router.pathname);
  const { selectedViewDocument } = useAppSelector(selectDocuments);

  const { isJobModalShow } = useJobHooks();

  return (
    <div
      className={`${poppins.variable} font-sans flex flex-col min-h-screen min-w-full shrink-0`}
    >
      {!hideHeader && (
        <header
          className="top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 
      surface sticky"
        >
          <Navbar />
          <SubNavbar />
        </header>
      )}

      <main
        className={`flex flex-col items-center bg-background flex-1 w-full 
    ${!hideHeader ? "p-4 md:p-8" : "justify-center"}`}
      >
        <div
          className={`w-full max-w-7xl ${hideHeader ? "flex justify-center items-center" : ""}`}
        >
          <Component {...pageProps} />
        </div>
      </main>
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
