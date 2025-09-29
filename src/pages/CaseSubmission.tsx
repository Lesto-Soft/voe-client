// src/pages/CaseSubmission.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useGetActiveCategories } from "../graphql/hooks/category";
import { useCreateCase } from "../graphql/hooks/case";
import { useCaseFormState } from "../components/features/caseSubmission/hooks/useCaseFormState";
import { FormCategory } from "../components/features/caseSubmission/types";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../db/config";

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
    const handlePaste = (event: ClipboardEvent) => {
      if (isHelpModalOpen) return;

      const items = event.clipboardData?.items;
      if (!items) return; // Check if clipboard contains any files before proceeding

      const containsFiles = Array.from(items).some(
        (item) => item.kind === "file"
      );
      if (!containsFiles) {
        return; // It's just text, let the browser handle it.
      } // File logic now only runs if files are on the clipboard

      const currentFilesCount = formState.attachments.length;
      if (currentFilesCount >= MAX_UPLOAD_FILES) {
        toast.warn(
          t("caseSubmission.noMoreAttachmentsAllowed", {
            max: MAX_UPLOAD_FILES,
          })
        );
        return;
      }

      const availableSlots = MAX_UPLOAD_FILES - currentFilesCount;
      const pastedBlobs: Blob[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            if (blob.size > MAX_UPLOAD_MB * 1024 * 1024) {
              toast.error(
                t("errors.fileTooLarge", {
                  fileName: "Pasted image",
                  maxSize: MAX_UPLOAD_MB,
                })
              );
              continue;
            }
            pastedBlobs.push(blob);
          }
        }
      }

      if (pastedBlobs.length > 0) {
        event.preventDefault();
        const blobsToProcess = pastedBlobs.slice(0, availableSlots);

        if (pastedBlobs.length > blobsToProcess.length) {
          toast.warn(t("errors.maxFilesExceeded", { max: MAX_UPLOAD_FILES }));
        }

        const newFiles = blobsToProcess.map((blob, index) => {
          const extension = blob.type.split("/")[1] || "png";
          const newFileName = `pasted-image-${Date.now()}-${index}.${extension}`;
          return new File([blob], newFileName, { type: blob.type });
        });

        if (newFiles.length > 0) {
          formState.setAttachments((prevAttachments) => [
            ...prevAttachments,
            ...newFiles,
          ]);
          toast.success(
            t("caseSubmission.filesAdded", { count: newFiles.length })
          );
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isHelpModalOpen, formState.attachments, formState.setAttachments, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 500); // Minimum skeleton display time: 500ms

    return () => clearTimeout(timer);
  }, []);

  if (categoriesLoading || showSkeleton) {
    return <CaseSubmissionSkeleton />;
  }

  if (categoriesError) {
    return (
      <div className="p-6 text-red-600 text-center">
        {" "}
        {t("caseSubmission.loadingCategoriesError", {
          message: categoriesError.message,
        })}{" "}
      </div>
    );
  }
  if (!caseTypeParam) {
    return (
      <div className="p-6 text-red-600 text-center">{t("invalidType")} </div>
    );
  }

  const isOverallSubmittingOrLoading =
    formState.isSubmittingForm ||
    createCaseLoadingHook ||
    formState.isUserLoading;

  return (
    <>
      {" "}
      <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200 grid-rows-[auto_1fr]">
        {" "}
        <CaseSubmissionHeader
          caseTypeParam={caseTypeParam}
          t={t}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          submitButtonClassName={formState.getSubmitButtonClass(
            createCaseLoadingHook
          )}
          isSubmitDisabled={isOverallSubmittingOrLoading}
          isSubmittingText={t("caseSubmission.submittingButton")}
          submitText={t("caseSubmission.submitButton")}
        />{" "}
        <form
          id="case-form"
          className="contents"
          onSubmit={formState.handleSubmit}
        >
          {" "}
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
          />{" "}
          <CaseSubmissionRightPanel
            t={t}
            categoryList={formCategories}
            selectedCategories={formState.selectedCategories}
            toggleCategory={formState.toggleCategory}
            getCategoryClass={formState.getCategoryClass}
            attachments={formState.attachments}
            onAttachmentsChange={formState.setAttachments}
          />{" "}
        </form>{" "}
      </div>{" "}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title={t("caseSubmission.helpModal.title")}
      >
        {formState.helpModalContent}{" "}
      </HelpModal>{" "}
      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        message={successModalMessage}
        title={t("caseSubmission.successModalTitle", "Изпратено Успешно!")}
      />{" "}
    </>
  );
};

export default CaseSubmissionPage;
