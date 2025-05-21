// src/pages/CaseSubmissionPage.tsx
import React, { useState, useMemo } from "react";
import { useLocation, Link } from "react-router"; // Corrected Link import
import { useTranslation } from "react-i18next";

import { useGetActiveCategories } from "../graphql/hooks/category"; // Adjust path
import { useCreateCase } from "../graphql/hooks/case"; // Adjust path
import { useCaseFormState } from "../components/features/caseSubmission/hooks/useCaseFormState"; // Adjust path
import { FormCategory } from "../components/features/caseSubmission/types"; // Adjust path

import CaseSubmissionHeader from "../components/features/caseSubmission/components/CaseSubmissionHeader"; // Adjust path
import CaseSubmissionLeftPanel from "../components/features/caseSubmission/components/CaseSubmissionLeftPanel"; // Adjust path
import CaseSubmissionRightPanel from "../components/features/caseSubmission/components/CaseSubmissionRightPanel"; // Adjust path
import HelpModal from "../components/modals/HelpModal"; // Adjust path
// import LoadingModal from "../components/modals/LoadingModal"; // Optional

const CaseSubmission: React.FC = () => {
  const { t } = useTranslation("caseSubmission"); // Add namespaces if needed
  const { search } = useLocation();

  const {
    categories: categoriesDataFromHook, // Renamed to avoid conflict
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetActiveCategories();

  const {
    createCase: executeCreateCase,
    loading: createCaseLoadingHook,
    error: createCaseErrorHook,
  } = useCreateCase();

  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const caseTypeParam = useMemo(() => {
    const type = queryParams.get("type")?.toUpperCase();
    return type === "PROBLEM" || type === "SUGGESTION" ? type : null;
  }, [queryParams]);

  // Adapt data for the form hook
  const formCategories = useMemo(
    (): FormCategory[] =>
      (categoriesDataFromHook || []).map((cat) => ({
        _id: cat._id,
        name: cat.name,
        problem: cat.problem,
        suggestion: cat.suggestion,
      })),
    [categoriesDataFromHook]
  );

  const formState = useCaseFormState({
    caseTypeParam,
    categoriesData: formCategories,
    executeCreateCase,
    createCaseLoadingHook,
    createCaseErrorHook,
  });

  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  if (categoriesLoading) {
    // return <LoadingModal message={t("caseSubmission.loadingForm")} />;
    return (
      <div className="p-6 text-center">{t("caseSubmission.loadingForm")}</div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-6 text-red-600 text-center">
        {t("caseSubmission.loadingCategoriesError", {
          message: categoriesError.message,
        })}
      </div>
    );
  }
  if (!caseTypeParam) {
    return (
      <div className="p-6 text-red-600 text-center">
        {t("caseSubmission.invalidType")}
      </div>
    );
  }

  const isOverallSubmittingOrLoading =
    formState.isSubmittingForm ||
    createCaseLoadingHook ||
    formState.isUserLoading;

  return (
    <>
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200">
        <CaseSubmissionHeader
          caseTypeParam={caseTypeParam}
          t={t} // Pass the main t function
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          submitButtonClassName={formState.getSubmitButtonClass(
            createCaseLoadingHook
          )}
          isSubmitDisabled={isOverallSubmittingOrLoading}
          isSubmittingText={t("caseSubmission.submittingButton")}
          submitText={t("caseSubmission.submitButton")}
        />

        <div
          className={`col-span-1 md:col-span-2 p-3 rounded-md border transition-opacity duration-300 ${
            formState.submissionError
              ? "bg-red-100 border-red-400 text-red-700 opacity-100"
              : "border-transparent text-transparent opacity-0"
          }`}
          aria-live="polite"
        >
          {formState.submissionError || "\u00A0"}
        </div>

        <form
          id="case-form"
          className="contents"
          onSubmit={formState.handleSubmit}
        >
          <CaseSubmissionLeftPanel
            t={t} // Pass t
            usernameInput={formState.usernameInput}
            handleUsernameChange={formState.handleUsernameChange}
            isUserLoading={formState.isUserLoading}
            userLookupError={formState.userLookupError}
            notFoundUsername={formState.notFoundUsername}
            fetchedName={formState.fetchedName}
            content={formState.content}
            onContentChange={formState.setContent} // Pass direct setter from hook
            attachments={formState.attachments}
            onAttachmentsChange={formState.setAttachments} // Pass direct setter from hook
            clearAllFormErrors={formState.clearAllFormErrors}
          />
          <CaseSubmissionRightPanel
            t={t} // Pass t
            priority={formState.priority}
            onPriorityChange={formState.setPriority} // Pass direct setter
            categoryList={formCategories}
            selectedCategories={formState.selectedCategories}
            toggleCategory={formState.toggleCategory}
            getCategoryClass={formState.getCategoryClass}
            clearAllFormErrors={formState.clearAllFormErrors}
          />
        </form>
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title={t("caseSubmission.helpModal.title")}
      >
        {formState.helpModalContent}
      </HelpModal>

      {/* // Optional Global Loading Modal for Submission
      // (formState.isSubmittingForm || createCaseLoadingHook) could trigger this
      // if (formState.isSubmittingForm || createCaseLoadingHook) {
      //   return <LoadingModal message={t("caseSubmission.submittingCase")} />;
      // }
      */}
    </>
  );
};

export default CaseSubmission;
