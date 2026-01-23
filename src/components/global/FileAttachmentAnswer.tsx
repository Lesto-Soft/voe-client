import React from "react";
import { PaperClipIcon } from "@heroicons/react/24/outline";

export interface FileAttachmentBtnProps {
  inputId: string;
  attachments: File[];
  setAttachments: (files: File[] | ((prev: File[]) => File[])) => void;
  setFileError: (error: string | null) => void;
  wrapperClassName?: string;
  heightClass?: string;
}

const FileAttachmentAnswer: React.FC<FileAttachmentBtnProps> = ({
  inputId,
  attachments,
  setAttachments,
  setFileError,
  wrapperClassName = "",
  heightClass = "h-36",
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev: any) => [...prev, ...newFiles]);
      setFileError(null);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`${wrapperClassName} flex flex-col items-center justify-center`}
    >
      <label
        htmlFor={inputId}
        className={`flex flex-col items-center justify-center w-full ${heightClass} rounded-md border border-gray-300 bg-white shadow-sm cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all duration-150`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 w-16">
          <PaperClipIcon className="h-8 w-8 mb-1 text-indigo-500" />
        </div>
        <input
          id={inputId}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </label>
    </div>
  );
};

export default FileAttachmentAnswer;
