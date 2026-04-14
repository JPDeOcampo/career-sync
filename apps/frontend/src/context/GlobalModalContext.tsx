"use client";
import { createContext, useContext, useState } from "react";
import GlobalModal from "@/components/shared/GlobalModal";

type GlobalModalOptions = {
  title?: string;
  description?: string | React.ReactNode;
  variant?: "default" | "custom";
  className?: string;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  onConfirm?: () => void;
};

type GlobalModalContextType = {
  handleGlobalModal: (options: GlobalModalOptions) => void;
};

const GlobalModalContext = createContext<GlobalModalContextType | null>(null);

export const GlobalModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [globalModal, setGlobalModal] = useState<GlobalModalOptions | null>();

  const handleGlobalModal = (options: GlobalModalOptions | null) => {
    setGlobalModal((prev) => {
      // If null or empty object → reset modal
      if (!options || Object.keys(options).length === 0) {
        return null;
      }

      // If there's an existing modal → merge
      if (prev) {
        return {
          ...prev,
          ...options,
        };
      }

      // Otherwise → create new modal
      return options;
    });
  };

  return (
    <GlobalModalContext.Provider value={{ handleGlobalModal }}>
      {children}

      <GlobalModal
        isShow={!!globalModal}
        title={globalModal?.title}
        description={globalModal?.description}
        variant={globalModal?.variant}
        className={globalModal?.className}
        cancelText={globalModal?.cancelText}
        confirmText={globalModal?.confirmText}
        isLoading={globalModal?.isLoading}
        onConfirm={() => {
          globalModal?.onConfirm?.();
        }}
        onClose={() => handleGlobalModal({})}
      >
        {globalModal?.children}
      </GlobalModal>
    </GlobalModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const context = useContext(GlobalModalContext);
  if (!context)
    throw new Error("useGlobal must be used inside GlobalModalProvider");
  return context;
};
