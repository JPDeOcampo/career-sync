import React, { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/utils/cn";
import { DocumentType } from "@career-sync/shared";
import useUploadFile from "@/hooks/useDocuments";
import { toast } from "sonner";

type DropboxProps = {
  onFileSelect: (file: File, documentType: DocumentType) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
};

const Dropbox: React.FC<DropboxProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  title = "Upload Documents",
  subtitle = "Drag and drop or click to browse",
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getDocumentType } = useUploadFile();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const documentType = getDocumentType(file.name);
      if (!documentType) {
        toast.error("File name must contain CV, Resume, or Cover Letter");
        return;
      }
      onFileSelect(file, documentType);
    }
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const documentType = getDocumentType(file.name);
      if (!documentType) {
        toast.error("File name must contain CV, Resume, or Cover Letter");
        return;
      }
      onFileSelect(file, documentType);
    }

    e.target.value = "";
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className="w-full p-2 group rounded-2xl h-40
  bg-gray-100 hover:bg-gray-200 
  dark:bg-gray-700/50 dark:hover:bg-gray-700/10"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "w-full h-full flex justify-center items-center gap-4 p-4",
            "rounded-xl border-2 border-dashed transition-all duration-200",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",

            isDragging
              ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
              : `
          border-gray-300 bg-white 
          group-hover:bg-gray-100
          dark:border-gray-600 dark:bg-gray-700/50
          dark:group-hover:bg-gray-700/10
        `,
          )}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
          />

          {/* Icon */}
          <div className="p-3 bg-gray-200 dark:bg-[#1e293b] rounded-full text-blue-400 group-hover:opacity-80 shrink-0">
            <UploadCloud size={18} />
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <h5 className="text-sm font-semibold text-foreground">{title}</h5>
            <p className="text-foreground text-sm">
              {subtitle.split("click").map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <React.Fragment key={i}>
                    {part}
                    <span className="text-blue-400">click</span>
                  </React.Fragment>
                ) : (
                  part
                ),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropbox;
