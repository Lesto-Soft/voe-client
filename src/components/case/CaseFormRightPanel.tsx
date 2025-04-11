// src/components/case/CaseFormRightPanel.tsx
import React, { ChangeEvent } from "react";
// Import necessary types, constants directly or via props type
import {
  Category,
  CaseTypeParam,
  CasePriority,
} from "../../types/CaseSubmittionTypes"; // Adjust path

interface CaseFormRightPanelProps {
  priority: CasePriority;
  handlePriorityChange: (event: ChangeEvent<HTMLInputElement>) => void; // Or pass setter directly
  selectedCategories: string[];
  toggleCategory: (categoryName: string) => void;
  categoryList: Category[];
  maxSelectedCategories: number;
  caseTypeParam: CaseTypeParam; // Needed for styling categories
}

export const CaseFormRightPanel: React.FC<CaseFormRightPanelProps> = ({
  priority,
  handlePriorityChange,
  selectedCategories,
  toggleCategory,
  categoryList,
  maxSelectedCategories,
  caseTypeParam,
}) => {
  // Helper for category button styling (depends on state/props)
  const getCategoryClass = (categoryName: string): string => {
    const isSelected = selectedCategories.includes(categoryName);
    const isDisabled =
      !isSelected && selectedCategories.length >= maxSelectedCategories;
    const commonClasses =
      "px-3 py-1 border rounded-full text-sm transition-colors duration-200 cursor-pointer";
    const styles = {
      PROBLEM: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
      SUGGESTION: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
    };
    const typeKey = caseTypeParam || "PROBLEM"; // Default if null, though page should prevent null
    const state = isSelected
      ? "selected"
      : isDisabled
      ? "disabled"
      : "unselected";
    return `${commonClasses} ${styles[typeKey][state]}`;
  };

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
      {" "}
      {/* Use desired min-h */}
      <div className="space-y-6">
        {/* Priority */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Приоритет*</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[
              { label: "Нисък", value: "LOW", color: "#009b00" },
              { label: "Среден", value: "MEDIUM", color: "#ad8600" },
              { label: "Висок", value: "HIGH", color: "#c30505" },
            ].map(({ label, value, color }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              >
                <input
                  type="radio"
                  value={value}
                  checked={priority === value}
                  onChange={handlePriorityChange} // Use passed handler
                  style={{ accentColor: color }}
                  className="w-4 h-4 cursor-pointer"
                  name="priority"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">
            Отнася се за* (макс. {maxSelectedCategories})
          </h3>
          {categoryList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categoryList.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={getCategoryClass(category.name)} // Use local helper function
                  disabled={
                    !selectedCategories.includes(category.name) &&
                    selectedCategories.length >= maxSelectedCategories
                  }
                  aria-pressed={selectedCategories.includes(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Няма налични категории.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
