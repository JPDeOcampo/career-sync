/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { LoadingSpinner } from "./Loading";
import useDocumentsHooks from "@/hooks/useDocuments";
import { cn } from "@/utils/cn";

type DocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentId?: string;
  title?: string;
};

const DocumentModal = ({
  isOpen,
  onClose,
  documentUrl,
  documentId,
  title = "Document Viewer",
}: DocumentModalProps) => {
  const [loading, setLoading] = useState(true);
  const { handleDelete } = useDocumentsHooks();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, documentUrl]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-5"
    >
      <div className="relative h-[90vh] w-full max-w-6xl surface rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 p-4">
          <h2 className="text-xl font-bold text-default">{title}</h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loader */}
        {loading && (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner className="w-10 h-10" />
          </div>
        )}

        {/* PDF */}
        <iframe
          src={documentUrl}
          title={title}
          onLoad={() => setLoading(false)}
          className={cn(
            " w-full",
            documentId === ""
              ? "h-[calc(90vh-50px)] rounded-b-2xl"
              : "h-[calc(90vh-150px)]",
          )}
        />

        {documentId && (
          <div className="w-full flex justify-end h-20 p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                if (!documentId) return;
                handleDelete?.(documentId);
              }}
              aria-label="Delete PDF"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg p-4.5",
                "text-sm font-medium",
                "transition-all duration-200",
                "active:scale-95",
                "text-red-600 hover:bg-red-50 hover:text-red-700",
                "dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentModal;
