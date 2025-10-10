import React from "react";
import { handleFileChange } from "../../utils/attachment-handling";
import { useTranslation } from "react-i18next";
import ImagePreviewModal, { GalleryItem } from "../modals/ImagePreviewModal";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { createFileUrl } from "../../utils/fileUtils";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../../db/config";
import { getIconForFile } from "../../utils/fileUtils";

interface FileAttachmentBtnProps {
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  existingAttachments?: string[]; // Optional prop for existing attachments
  setExistingAttachments?: React.Dispatch<React.SetStateAction<string[]>>; // Optional prop for existing attachments setter
  type?: "cases" | "answers" | "comments";
  objectId?: string;
}

const FileAttachmentBtn: React.FC<FileAttachmentBtnProps> = ({
  attachments,
  setAttachments,
  existingAttachments = [], // Default to empty array if not provided
  setExistingAttachments = () => {}, // Default to no-op function if not provided
  type,
  objectId,
}) => {
  const { t } = useTranslation("caseSubmission"); // Assuming you have a translation function available
  const [fileError, setFileError] = React.useState<string | null>(null); // State for file error message

  // Memoize object URLs for each file
  const fileObjectUrls = React.useMemo(() => {
    const map = new Map<string, string>();
    attachments.forEach((file) => {
      map.set(file.name + "-" + file.lastModified, URL.createObjectURL(file));
    });
    return map;
  }, [attachments]);

  // this memo is for managing the combined gallery between added and to-be-added files
  const galleryItems: GalleryItem[] = React.useMemo(() => {
    const existingItems = (existingAttachments || []).map((fileName) => {
      const filename = fileName.split("/").pop() || fileName;
      let fileUrl = "";
      if (type && objectId) {
        fileUrl = createFileUrl(type, objectId, fileName);
      }
      return { url: fileUrl, name: filename };
    });

    const newItems = attachments.map((file) => {
      const fileKey = file.name + "-" + file.lastModified;
      return {
        url: fileObjectUrls.get(fileKey) || "",
        name: file.name,
      };
    });

    return [...existingItems, ...newItems];
  }, [existingAttachments, attachments, fileObjectUrls, type, objectId]);

  // Cleanup object URLs on unmount or when attachments change
  React.useEffect(() => {
    return () => {
      fileObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileObjectUrls]);

  const handleRemoveAttachment = (fileNameToRemove: string) => {
    setFileError(null);
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => file.name !== fileNameToRemove)
    );
  };

  const handleRemoveExistingAttachment = (urlToRemove: string) => {
    setExistingAttachments((prev) => prev.filter((url) => url !== urlToRemove));
  };
  return (
    <div>
      {existingAttachments.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            {t("caseSubmission.currentFiles", {
              count: existingAttachments.length,
              max: MAX_UPLOAD_FILES,
            })}
          </p>
          <div className="mt-2 text-sm text-gray-600 space-y-1 overflow-y-auto rounded p-2 bg-gray-100 border border-gray-200 max-h-32">
            <div className="flex flex-wrap gap-2">
              {existingAttachments.map((fileName) => {
                const filename = fileName.split("/").pop() || fileName;
                let fileUrl = "";
                if (type && objectId) {
                  fileUrl = createFileUrl(type, objectId, fileName);
                }
                const Icon = getIconForFile(filename); // 2. Get the icon

                return (
                  <div
                    key={fileName}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 rounded-full hover:bg-gray-300"
                    title={filename}
                  >
                    <ImagePreviewModal
                      galleryItems={galleryItems}
                      imageUrl={fileUrl}
                      fileName={filename}
                      triggerElement={
                        <button
                          type="button"
                          className="w-30 flex items-center gap-1.5 truncate sm:max-w-xs cursor-pointer"
                          title={filename}
                        >
                          <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          {filename}
                        </button>
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(filename)}
                      className="p-0.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                      aria-label={`Remove ${filename}`}
                    >
                      <XMarkIcon className="h-4 w-4 text-btnRed hover:text-red-700" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {/* Update label to show current count vs max */}
        {MAX_UPLOAD_FILES - (existingAttachments.length + attachments.length) >
        0
          ? t("caseSubmission.attachmentsLabel", {
              count: attachments.length,
              max: MAX_UPLOAD_FILES - existingAttachments.length,
              maxSize: MAX_UPLOAD_MB,
            })
          : t("caseSubmission.noMoreAttachmentsAllowed", {
              max: MAX_UPLOAD_FILES,
            })}
      </label>
      {/* Styled Label acting as Button - Disable visually if max files reached */}
      <label
        htmlFor="file-upload-input"
        className={`w-full text-center inline-block rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
          existingAttachments.length + attachments.length >= MAX_UPLOAD_FILES
            ? "opacity-75 cursor-not-allowed" // Disabled style
            : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" // Enabled style
        }`}
        // Prevent triggering input if disabled (CSS should suffice, but JS backup)
        onClick={(e) => {
          if (attachments.length >= MAX_UPLOAD_FILES) e.preventDefault();
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
          handleFileChange(
            t,
            event,
            setAttachments,
            setFileError,
            existingAttachments
          )
        }
        className="sr-only"
        disabled={
          attachments.length + existingAttachments.length >= MAX_UPLOAD_FILES
        }
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
        {attachments.length > 0 && (
          <div className="text-sm text-gray-600 space-y-1 overflow-y-auto rounded p-2 bg-gray-100 border border-gray-200 max-h-32">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file) => {
                const fileKey = file.name + "-" + file.lastModified;
                const fileUrl = fileObjectUrls.get(fileKey) || "";
                const Icon = getIconForFile(file.name);
                return (
                  <div
                    key={file.name + "-" + file.lastModified}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 rounded-full hover:bg-gray-300"
                    title={file.name}
                  >
                    <ImagePreviewModal
                      galleryItems={galleryItems}
                      imageUrl={fileUrl}
                      fileName={file.name}
                      triggerElement={
                        <button
                          type="button"
                          className="w-35 flex items-center gap-1.5 truncate cursor-pointer"
                          title={file.name}
                        >
                          <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          {file.name}
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </button>
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.name)}
                      className="p-0.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XMarkIcon className="h-4 w-4 text-btnRed hover:text-red-700" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* End Container for Selected Files List */}
    </div>
  );
};

export default FileAttachmentBtn;
