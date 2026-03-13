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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const AppContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const hideHeader = publicRoutes.includes(router.pathname);

  const {
    isJobModalShow,
    selectedJob,
    handleAddJob,
    handleSaveJob,
    handleCloseModal,
  } = useJobHooks();

  return (
    <div
      className={`${poppins.variable} font-sans flex flex-col min-h-screen min-w-full shrink-0`}
    >
      {!hideHeader && (
        <header
          className="top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 
      surface sticky"
        >
          <Navbar onAddJob={handleAddJob} />
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
      <JobModal
        isShow={isJobModalShow}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        selectedJob={selectedJob}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function MyApp(props: AppProps) {
  return (
    <Provider store={store}>
      <HelmetMeta />
      <AppContent {...props} />
    </Provider>
  );
}
