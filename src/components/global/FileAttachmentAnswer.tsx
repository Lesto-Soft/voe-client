import React from "react";
import { MAX_FILES, MAX_FILE_SIZE_MB } from "../../utils/attachment-handling";
import { handleFileChange } from "../../utils/attachment-handling";
import { useTranslation } from "react-i18next";
import { PaperClipIcon } from "@heroicons/react/24/solid";
interface FileAttachmentBtnProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  setFileError: React.Dispatch<React.SetStateAction<string | null>>;
}

const FileAttachmentAnswer: React.FC<FileAttachmentBtnProps> = ({
  attachments,
  setAttachments,
  setFileError,
}) => {
  const { t } = useTranslation("caseSubmission"); // Assuming you have a translation function available
  return (
    <div className="">
      {/* Styled Label acting as Button - Disable visually if max files reached */}
      <label
        htmlFor="file-upload-input-1"
        className={`h-24 flex items-center justify-center w-full text-center  rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
          attachments.length >= MAX_FILES
            ? "opacity-75 cursor-not-allowed" // Disabled style
            : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" // Enabled style
        }`}
        // Prevent triggering input if disabled (CSS should suffice, but JS backup)
        onClick={(e) => {
          if (attachments.length >= MAX_FILES) e.preventDefault();
        }}
      >
        <PaperClipIcon className="h-8 w-8 inline-block " />
      </label>
      {/* Hidden Actual File Input - Disable if max files reached */}
      <input
        id="file-upload-input-1"
        name="attachments"
        type="file"
        multiple
        onChange={(event) =>
          handleFileChange(t, event, setAttachments, setFileError)
        }
        className="sr-only"
        disabled={attachments.length >= MAX_FILES} // HTML disabled attribute
        // Optional: Add accept attribute for client-side hint (doesn't enforce size)
        // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
    </div>
  );
};

export default FileAttachmentAnswer;
