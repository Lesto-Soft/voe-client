// src/components/features/caseSubmission/components/CaseSubmissionRightPanel.tsx
import React from "react";
import { TFunction } from "i18next";
import { FormCategory } from "../types";
import FileAttachmentBtn from "../../../global/FileAttachmentBtn";

interface CaseSubmissionRightPanelProps {
  t: TFunction<"caseSubmission", undefined>;
  categoryList: FormCategory[];
  selectedCategories: string[];
  toggleCategory: (categoryName: string) => void;
  getCategoryClass: (categoryName: string) => string;
  attachments: File[];
  onAttachmentsChange: React.Dispatch<React.SetStateAction<File[]>>;
}

const MAX_SELECTED_CATEGORIES = 3;

const CaseSubmissionRightPanel: React.FC<CaseSubmissionRightPanelProps> = ({
  t,
  categoryList,
  selectedCategories,
  toggleCategory,
  getCategoryClass,
  attachments,
  onAttachmentsChange,
}) => {
  return (
    <div className="rounded-2xl shadow-md bg-white p-6 h-full space-y-6">
      <div>
        <p className="text-sm font-medium mb-3 text-gray-700">
          {t("caseSubmission.categoriesLabel")}
          <span className="text-red-500">*</span>{" "}
          {t("caseSubmission.categoriesLabelMax", {
            maxSelect: MAX_SELECTED_CATEGORIES,
          })}
        </p>
        {categoryList.length > 0 ? (
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
                aria-pressed={selectedCategories.includes(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {t("caseSubmission.errors.submission.categoryNoneFound")}{" "}
          </p>
        )}
      </div>

      <div>
        <FileAttachmentBtn
          attachments={attachments}
          setAttachments={onAttachmentsChange}
        />
      </div>
    </div>
  );
};

export default CaseSubmissionRightPanel;
