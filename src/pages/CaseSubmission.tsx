// src/pages/CaseSubmission.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";

import { useGetActiveCategories } from "../graphql/hooks/category";
import { useCreateCase } from "../graphql/hooks/case";
import { useCaseFormState } from "../components/features/caseSubmission/hooks/useCaseFormState";
import { FormCategory } from "../components/features/caseSubmission/types";

import CaseSubmissionHeader from "../components/features/caseSubmission/components/CaseSubmissionHeader";
import CaseSubmissionLeftPanel from "../components/features/caseSubmission/components/CaseSubmissionLeftPanel";
import CaseSubmissionRightPanel from "../components/features/caseSubmission/components/CaseSubmissionRightPanel";
import HelpModal from "../components/modals/HelpModal";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";
import CaseSubmissionSkeleton from "../components/skeletons/CaseSubmissionSkeleton";

const CaseSubmissionPage: React.FC = () => {
  const { t } = useTranslation("caseSubmission");
  const { search } = useLocation();
  const navigate = useNavigate();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Стейт за следене на обработката на файлове (компресия) в редактора
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const handleSubmissionSuccess = (message?: string) => {
    setSuccessModalMessage(
      message || t("caseSubmission.submissionSuccessAlert")
    );
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate("/");
  };

  const {
    categories: categoriesDataFromHook,
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
    onSuccess: handleSubmissionSuccess,
  });

  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (categoriesLoading || showSkeleton) {
    return <CaseSubmissionSkeleton />;
  }

  if (categoriesError) {
    return (
      <div className="p-6 text-red-600 text-center font-bold">
        {t("caseSubmission.loadingCategoriesError", {
          message: categoriesError.message,
        })}
      </div>
    );
  }

  if (!caseTypeParam) {
    return (
      <div className="p-6 text-red-600 text-center font-bold">
        {t("invalidType")}
      </div>
    );
  }

  // Бутонът е деактивиран ако: се изпраща формата, се търси потребител ИЛИ се обработват файлове
  const isOverallSubmittingOrLoading =
    formState.isSubmittingForm ||
    createCaseLoadingHook ||
    formState.isUserLoading ||
    isProcessingFiles;

  return (
    <>
      <div className="h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200 grid-rows-[auto_1fr] overflow-hidden">
        <CaseSubmissionHeader
          caseTypeParam={caseTypeParam}
          t={t}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          submitButtonClassName={formState.getSubmitButtonClass(
            createCaseLoadingHook
          )}
          isSubmitDisabled={isOverallSubmittingOrLoading}
          isSubmittingText={
            isProcessingFiles
              ? t("caseSubmission.submittingButton")
              : t("caseSubmission.submittingButton")
          }
          submitText={t("caseSubmission.submitButton")}
        />
        <form
          id="case-form"
          className="contents"
          onSubmit={formState.handleSubmit}
        >
          <CaseSubmissionLeftPanel
            t={t}
            usernameInput={formState.usernameInput}
            handleUsernameChange={formState.handleUsernameChange}
            isUserLoading={formState.isUserLoading}
            userLookupError={formState.userLookupError}
            notFoundUsername={formState.notFoundUsername}
            fetchedName={formState.fetchedName}
            content={formState.content}
            onContentChange={formState.setContent}
            priority={formState.priority}
            onPriorityChange={formState.setPriority}
            // Нови пропове за UnifiedEditor
            attachments={formState.attachments}
            setAttachments={formState.setAttachments}
            onProcessingChange={setIsProcessingFiles}
            isSending={formState.isSubmittingForm || createCaseLoadingHook}
          />

          <CaseSubmissionRightPanel
            t={t}
            categoryList={formCategories}
            selectedCategories={formState.selectedCategories}
            toggleCategory={formState.toggleCategory}
            getCategoryClass={formState.getCategoryClass}
            attachments={formState.attachments}
            onAttachmentsChange={formState.setAttachments}
            onProcessingChange={setIsProcessingFiles} // ДОБАВЕНО: Предаваме състоянието за лоудъра
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

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        message={successModalMessage}
        title={t("caseSubmission.successModalTitle", "Изпратено Успешно!")}
      />
    </>
  );
};

export default CaseSubmissionPage;
