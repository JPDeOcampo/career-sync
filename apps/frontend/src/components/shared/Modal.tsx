import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const Modal = ({
  headerText,
  onClose,
  containerClassName = "max-w-5xl min-h-[75vh] max-h-[90vh]",
  headerClassName,
  children,
}: {
  headerText: string;
  onClose: () => void;
  containerClassName?: string;
  headerClassName?: string;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "surface rounded-2xl shadow-2xl w-full overflow-hidden z-50 flex my-8 flex-col",
            containerClassName,
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-[0_-4px_6px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.03)]",
              headerClassName,
            )}
          >
            <h2 className="text-xl font-bold text-default">{headerText}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
