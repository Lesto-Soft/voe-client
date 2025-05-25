// src/components/features/caseSubmission/components/CaseSubmissionHeader.tsx
import React from "react";
import { Link } from "react-router"; // Corrected import
import { TFunction } from "i18next";

interface CaseSubmissionHeaderProps {
  caseTypeParam: "PROBLEM" | "SUGGESTION";
  t: TFunction<"caseSubmission", undefined>;
  onOpenHelpModal: () => void;
  submitButtonClassName: string;
  isSubmitDisabled: boolean;
  isSubmittingText: string;
  submitText: string;
}

const CaseSubmissionHeader: React.FC<CaseSubmissionHeaderProps> = ({
  caseTypeParam,
  t,
  onOpenHelpModal,
  submitButtonClassName,
  isSubmitDisabled,
  isSubmittingText,
  submitText,
}) => {
  return (
    <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {t("caseSubmission.title", {
            type: t(`caseSubmission.caseType.${caseTypeParam.toLowerCase()}`),
          })}
        </h2>
        <p className="text-sm text-gray-500">{t("caseSubmission.subtitle")}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onOpenHelpModal}
          className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer shadow-md font-medium hover:bg-gray-200 active:bg-gray-300"
        >
          {t("caseSubmission.helpButton")}
        </button>
        <Link to="/">
          <button
            type="button"
            className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md cursor-pointer shadow-md font-medium hover:bg-gray-200 active:bg-gray-300"
          >
            {t("caseSubmission.backButton")}
          </button>
        </Link>
        <button
          type="submit"
          form="case-form" // Associates button with the form in CaseSubmissionPage
          className={submitButtonClassName}
          disabled={isSubmitDisabled}
        >
          {isSubmitDisabled ? isSubmittingText : submitText}
        </button>
      </div>
    </div>
  );
};

export default CaseSubmissionHeader;
