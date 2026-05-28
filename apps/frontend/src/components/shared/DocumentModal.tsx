/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { LoadingSpinner } from "./Loading";
import useDocumentsHooks from "@/hooks/useDocuments";
import { cn } from "@/utils/cn";
import Modal from "./Modal";

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
  const [isLoading, setIsLoading] = useState(true);
  const { handleDelete } = useDocumentsHooks();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, documentUrl]);

  if (!isOpen) return null;

  return (
    <Modal
      headerText={title}
      onClose={onClose}
      containerClassName="w-full max-w-6xl h-[90vh]"
    >
      {/* Loader */}
      {isLoading && (
        <div className="h-full flex items-center justify-center">
          <LoadingSpinner className="w-10 h-10" />
        </div>
      )}

      {/* PDF */}
      <iframe
        src={documentUrl}
        title={title}
        onLoad={() => setIsLoading(false)}
        className={cn(
          "w-full",
          isLoading ? "hidden" : "block",
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
    </Modal>
  );
};

export default DocumentModal;
