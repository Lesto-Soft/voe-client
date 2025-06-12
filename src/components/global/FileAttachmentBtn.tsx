import React from "react";
import { MAX_FILES, MAX_FILE_SIZE_MB } from "../../utils/attachment-handling";
import { handleFileChange } from "../../utils/attachment-handling";
import { useTranslation } from "react-i18next";
interface FileAttachmentBtnProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
}

const FileAttachmentBtn: React.FC<FileAttachmentBtnProps> = ({
  attachments,
  setAttachments,
}) => {
  const { t } = useTranslation("caseSubmission"); // Assuming you have a translation function available
  const [fileError, setFileError] = React.useState<string | null>(null); // State for file error message
  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null);
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {/* Update label to show current count vs max */}
        {t("caseSubmission.attachmentsLabel", {
          count: attachments.length,
          max: MAX_FILES,
          maxSize: MAX_FILE_SIZE_MB,
        })}
      </label>
      {/* Styled Label acting as Button - Disable visually if max files reached */}
      <label
        htmlFor="file-upload-input"
        className={`w-full text-center inline-block rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
          attachments.length >= MAX_FILES
            ? "opacity-75 cursor-not-allowed" // Disabled style
            : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" // Enabled style
        }`}
        // Prevent triggering input if disabled (CSS should suffice, but JS backup)
        onClick={(e) => {
          if (attachments.length >= MAX_FILES) e.preventDefault();
        }}
      >
        {t("caseSubmission.selectFilesButton")}
      </label>
      {/* Hidden Actual File Input - Disable if max files reached */}
      <input
        id="file-upload-input"
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

      {/* Display File Errors */}
      <div className="h-5 mt-1">
        {" "}
        {/* Reserve space */}
        <p
          className={`text-sm text-red-500 transition-opacity duration-200 ${
            fileError ? "opacity-100" : "opacity-0"
          }`}
        >
          {fileError || "\u00A0"}
        </p>
      </div>

      {/* Container for Selected Files List - Reserves space */}
      <div className="mt-2 min-h-[3rem]">
        {" "}
        {/* Keeps minimum space */}
        {/* Conditionally render the list container *inside* */}
        <div
          className={`text-sm text-gray-600 space-y-1 h-20 overflow-y-auto rounded p-2 ${
            attachments.length === 0 ? "" : "border border-gray-200 bg-gray-50"
          }`} // Added max-h, overflow, border, padding, bg
        >
          {attachments.length > 0 && (
            // Apply max-height and overflow to this inner div
            <ul className="list-none pl-1 space-y-1">
              {attachments.map((file) => (
                <li
                  key={file.name + "-" + file.lastModified}
                  className="flex justify-between items-center group p-1 rounded hover:bg-gray-200" // Hover effect on item
                >
                  <span
                    className="truncate pr-2 group-hover:underline"
                    title={file.name}
                  >
                    {file.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(file.name)}
                    className="ml-2 px-1.5 py-0.5 text-red-500 hover:text-red-700 text-lg font-bold leading-none rounded focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                    aria-label={`Remove ${file.name}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* End Container for Selected Files List */}
    </div>
  );
};

export default FileAttachmentBtn;
