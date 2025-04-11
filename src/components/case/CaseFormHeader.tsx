// src/components/case/CaseFormHeader.tsx
import React from "react";
import { Link } from "react-router";
import { CaseTypeParam } from "../../types/CaseSubmittionTypes"; // Adjust path

interface CaseFormHeaderProps {
  caseTypeParam: CaseTypeParam;
  isSubmitDisabled: boolean;
  isLoading: boolean; // Combined loading state
  formId: string;
  onHelpClick: () => void;
  getSendButtonClass: () => string; // Pass function for dynamic class
}

export const CaseFormHeader: React.FC<CaseFormHeaderProps> = ({
  caseTypeParam,
  isSubmitDisabled,
  isLoading,
  formId,
  onHelpClick,
  getSendButtonClass,
}) => {
  return (
    <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Подаване на {caseTypeParam === "PROBLEM" ? "проблем" : "предложение"}
        </h2>
        <p className="text-sm text-gray-500">
          Моля, попълнете формуляра по-долу
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onHelpClick}
          className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-100"
        >
          ❓ Помощ
        </button>
        <Link to="/">
          <button
            type="button"
            className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-100"
          >
            ← Назад
          </button>
        </Link>
        <button
          type="submit"
          form={formId}
          className={getSendButtonClass()} // Use passed function for class
          disabled={isSubmitDisabled || isLoading} // Use passed flag for disabled state
        >
          {isLoading ? "Изпращане..." : "Изпрати"}
        </button>
      </div>
    </div>
  );
};
