// src/components/features/caseSubmission/components/CaseSubmissionRightPanel.tsx
import React, { useRef, useState } from "react";
import { TFunction } from "i18next";
import { FormCategory } from "../types";
import { useFileHandler } from "../../../../hooks/useFileHandler";
import {
  PaperClipIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import AttachmentZone from "../../../forms/partials/TextEditor/TextEditorWithAttachments/AttachmentZone";

interface CaseSubmissionRightPanelProps {
  t: TFunction<"caseSubmission", undefined>;
  categoryList: FormCategory[];
  selectedCategories: string[];
  toggleCategory: (categoryName: string) => void;
  getCategoryClass: (categoryName: string) => string;
  attachments: File[];
  onAttachmentsChange: React.Dispatch<React.SetStateAction<File[]>>;
  onProcessingChange?: (processing: boolean) => void; // Важно за блокиране на Submit
}

const MAX_SELECTED_CATEGORIES = 3;
const MAX_FILES = 5;
const HARD_LIMIT_MB = 10;
const HARD_LIMIT_BYTES = HARD_LIMIT_MB * 1024 * 1024;

const CaseSubmissionRightPanel: React.FC<CaseSubmissionRightPanelProps> = ({
  t,
  categoryList,
  selectedCategories,
  toggleCategory,
  getCategoryClass,
  attachments,
  onAttachmentsChange,
  onProcessingChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { processFiles, isCompressing } = useFileHandler();

  // Синхронизираме лоудъра с родителя
  React.useEffect(() => {
    onProcessingChange?.(isCompressing);
  }, [isCompressing, onProcessingChange]);

  const handleFiles = async (files: File[]) => {
    setFileError(null);
    if (files.length === 0) return;

    // 1. Дубликати
    const duplicateFiles = files.filter((f) =>
      attachments.some((a) => a.name === f.name)
    );
    if (duplicateFiles.length > 0) {
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.duplicatesSkipped", {
          fileList: duplicateFiles.map((f) => f.name).join(", "),
        })
      );
    }

    const uniqueSelection = files.filter((f) => !duplicateFiles.includes(f));

    // 2. Лимит бройка
    const availableSlots = MAX_FILES - attachments.length;
    if (uniqueSelection.length > availableSlots) {
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.maxFilesExceeded", {
          max: MAX_FILES,
        })
      );
    }

    const validSizeSelection = uniqueSelection
      .filter((f) => f.size <= HARD_LIMIT_BYTES)
      .slice(0, Math.max(0, availableSlots));

    if (validSizeSelection.length > 0) {
      try {
        const processed = await processFiles(validSizeSelection);
        onAttachmentsChange((prev) => [...prev, ...processed]);
      } catch (err) {
        setFileError(
          t(
            "caseSubmission:caseSubmission.errors.submission.fileProcessingError"
          )
        );
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Категории */}
      <div className="flex-shrink-0">
        <p className="text-sm font-medium mb-3 text-gray-700">
          {t("caseSubmission.categoriesLabel")}
          <span className="text-red-500">*</span>{" "}
          {t("caseSubmission.categoriesLabelMax", {
            maxSelect: MAX_SELECTED_CATEGORIES,
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryList.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => toggleCategory(category.name)}
              className={`uppercase ${getCategoryClass(category.name)}`}
              disabled={
                !selectedCategories.includes(category.name) &&
                selectedCategories.length >= MAX_SELECTED_CATEGORIES
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Прикачени файлове */}
      <div className="flex-grow flex flex-col min-h-0 border-t border-gray-300 pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">
            {t("caseSubmission.addAttachments")}
          </p>
          <span className="text-xs text-gray-400">
            {attachments.length} / {MAX_FILES}
          </span>
        </div>

        {/* Бутон за добавяне */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCompressing || attachments.length >= MAX_FILES}
          className="cursor-pointer w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isCompressing ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <PaperClipIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {isCompressing
              ? t("caseSubmission.processing")
              : t("caseSubmission.selectFilesButton")}
          </span>
        </button>

        {/* Зона за Thumbnails */}
        <div className="flex-grow overflow-y-auto custom-scrollbar-xs pr-1">
          {fileError && (
            <div className="flex items-start justify-between gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-100 text-red-700 rounded-lg animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
              <button type="button" onClick={() => setFileError(null)}>
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <AttachmentZone
            newAttachments={attachments}
            onRemoveNew={(idx) =>
              onAttachmentsChange((prev) => prev.filter((_, i) => i !== idx))
            }
          />
        </div>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
    </div>
  );
};

export default CaseSubmissionRightPanel;
