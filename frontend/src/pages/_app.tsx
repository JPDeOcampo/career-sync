"use client";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import HelmetMeta from "./helmetMeta";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import Header from "@/components/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const AppContent = ({ Component, pageProps }: AppProps) => {
  return (
    <div className={`${poppins.variable} font-sans`}>
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <Header />
      </header>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Component {...pageProps} />
      </main>
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
