import React, { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Files dropped:", files[0].name);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#0a0f1d] py-2 px-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-full max-w-2xl max-h-18
          flex items-center justify-center gap-4 p-6
          rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-[#111827] hover:bg-[#161e2e]"
          }
        `}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Icon Container */}
        <div className="p-4 bg-[#1e293b] rounded-full text-blue-400">
          <UploadCloud size={18} />
        </div>

        {/* Text Content */}
        <div className="flex flex-col">
          <h5 className="text-md font-semibold text-white">Upload New File</h5>
          <p className="text-gray-400 text-sm">
            Drag and drop or{" "}
            <span className="text-blue-400">click to browse</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
