import React from "react";
import { handleFileChange } from "../../utils/attachment-handling";
import { useTranslation } from "react-i18next";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import { MAX_UPLOAD_FILES } from "../../db/config";
interface FileAttachmentBtnProps {
  inputId: string;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  setFileError: React.Dispatch<React.SetStateAction<string | null>>;
  height?: number;
}

const FileAttachmentAnswer: React.FC<FileAttachmentBtnProps> = ({
  attachments,
  setAttachments,
  setFileError,
  inputId,
  height = 24,
}) => {
  const { t } = useTranslation("caseSubmission"); // Assuming you have a translation function available
  return (
    <div className="" title="Прикачи файл(ове)">
      {/* Styled Label acting as Button - Disable visually if max files reached */}
      <label
        htmlFor={inputId}
        className={`h-${height} flex items-center justify-center w-full text-center  rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
          attachments.length >= MAX_UPLOAD_FILES
            ? "opacity-75 cursor-not-allowed" // Disabled style
            : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" // Enabled style
        }`}
        // Prevent triggering input if disabled (CSS should suffice, but JS backup)
        onClick={(e) => {
          if (attachments.length >= MAX_UPLOAD_FILES) e.preventDefault();
        }}
      >
        <PaperClipIcon className="h-8 w-8 inline-block " />
      </label>
      {/* Hidden Actual File Input - Disable if max files reached */}
      <input
        id={inputId}
        name="attachments"
        type="file"
        multiple
        onChange={(event) => {
          handleFileChange(t, event, setAttachments, setFileError);
        }}
        className="sr-only"
        disabled={attachments.length >= MAX_UPLOAD_FILES} // HTML disabled attribute
        // Optional: Add accept attribute for client-side hint (doesn't enforce size)
        // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
    </div>
  );
};

export default FileAttachmentAnswer;
