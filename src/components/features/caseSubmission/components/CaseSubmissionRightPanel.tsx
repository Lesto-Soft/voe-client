// src/features/caseSubmission/components/CaseSubmissionRightPanel.tsx
import React from "react";
import { TFunction } from "i18next"; // Import TFunction from i18next
import { FormCategory, CreateCaseMutationInput } from "../types"; // Adjusted path

interface CaseSubmissionRightPanelProps {
  t: TFunction<"caseSubmission", undefined>; // Expecting the namespaced t
  priority: CreateCaseMutationInput["priority"];
  onPriorityChange: (priority: CreateCaseMutationInput["priority"]) => void;
  categoryList: FormCategory[];
  selectedCategories: string[];
  toggleCategory: (categoryName: string) => void;
  getCategoryClass: (categoryName: string) => string;
  clearAllFormErrors?: () => void;
}

const MAX_SELECTED_CATEGORIES = 3;

const CaseSubmissionRightPanel: React.FC<CaseSubmissionRightPanelProps> = ({
  t,
  priority,
  onPriorityChange,
  categoryList,
  selectedCategories,
  toggleCategory,
  getCategoryClass,
  clearAllFormErrors,
}) => {
  const priorityOptions = [
    { labelKey: "caseSubmission.priority.low", value: "LOW", color: "#009b00" },
    {
      labelKey: "caseSubmission.priority.medium",
      value: "MEDIUM",
      color: "#ad8600",
    },
    {
      labelKey: "caseSubmission.priority.high",
      value: "HIGH",
      color: "#c30505",
    },
  ];

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-3 text-gray-700">
            {t("caseSubmission.priorityLabel")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {priorityOptions.map(({ labelKey, value, color }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              >
                <input
                  type="radio"
                  value={value}
                  checked={priority === value}
                  onChange={(e) => {
                    if (clearAllFormErrors) clearAllFormErrors();
                    onPriorityChange(
                      e.target.value as CreateCaseMutationInput["priority"]
                    );
                  }}
                  style={{ accentColor: color }}
                  className="w-5 h-5 cursor-pointer"
                  name="priority"
                />
                <span className="text-sm text-gray-700">{t(labelKey)}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-3 text-gray-700">
            {t("caseSubmission.categoriesLabel", {
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
              {/* Corrected key */}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseSubmissionRightPanel;
