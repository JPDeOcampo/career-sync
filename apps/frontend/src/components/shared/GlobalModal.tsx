/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import CustomTooltip from "./CustomTooltip";
import { cn } from "@/utils/cn";
import { LoadingSpinner } from "./Loading";

const GlobalModal = ({
  isShow,
  title = "Confirm Action",
  description,
  variant = "default",
  onConfirm,
  onClose,
  className = "max-w-md",
  children,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isLoading = false,
}: {
  isShow: boolean;
  title?: string;
  description?: string | React.ReactNode;
  variant?: "default" | "custom";
  onConfirm: () => void;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
}) => {
  const handleOnClose = () => {
    if (onClose) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleOnClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleOnClose]);

  // Prevent Body Scroll
  useEffect(() => {
    if (isShow) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isShow]);

  if (!isShow && !children) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 p-4 sm:p-8"
        onClick={handleOnClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={cn("relative w-full surface p-6 rounded-lg", className)}
        >
          <div className="absolute top-2 right-2">
            <CustomTooltip label="Close" position="bottom">
              <button
                onClick={handleOnClose}
                className="flex p-2 text-foreground/80 hover:text-foreground cursor-pointer"
              >
                <X size={20} />
              </button>
            </CustomTooltip>
          </div>
          {variant === "custom" && <>{children}</>}
          {variant === "default" && (
            <>
              <h2 className="text-lg font-semibold text-default">{title}</h2>
              {/* 
              <div
                className="mt-2"
                dangerouslySetInnerHTML={{ __html: description || "" }}
              /> */}
              <div className="mt-2">{description}</div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={handleOnClose}
                  className="px-4 py-2 text-sm font-medium text-cancel cursor-pointer"
                >
                  {cancelText}
                </button>

                <button
                  onClick={() => {
                    onConfirm?.();
                  }}
                  className="flex justify-center items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
                >
                  {confirmText}
                  {isLoading && <LoadingSpinner className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalModal;
