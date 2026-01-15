// src/components/modals/CaseDialog.tsx

import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { ICategory, IMe } from "../../../db/interfaces";
import { CASE_TYPE } from "../../../utils/GLOBAL_PARAMETERS";
import { useTranslation } from "react-i18next";
import SuccessConfirmationModal from "../SuccessConfirmationModal";
import CaseForm from "../../forms/CaseForm";
// Import the hook
import { useFileHandler } from "../../../hooks/useFileHandler";

// Props definition
type CaseDialogProps = {
  me: IMe;
  availableCategories: ICategory[];
  children: React.ReactNode;
  onSuccess?: () => void;
} & (
  | {
      mode: "edit";
      caseId: string;
      caseNumber: number;
      initialData: {
        content: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        type: "PROBLEM" | "SUGGESTION";
        categories: ICategory[];
        attachments: string[];
      };
    }
  | {
      mode: "create";
      caseType: "PROBLEM" | "SUGGESTION";
    }
);

const CaseDialog: React.FC<CaseDialogProps> = (props) => {
  const { t } = useTranslation(["dashboard", "caseSubmission"]);

  // State for the modal "chrome" and interactions
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isMouseDownOnBackdrop = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Initialize the compression hook
  const { isCompressing } = useFileHandler();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowConfirmDialog(false);
      setHasUnsavedChanges(false);
    }
  }, [isOpen]);

  // Modal Control Logic
  const handleOpenChange = (open: boolean) => {
    // Prevent closing via ESC or outside click if compressing
    if (!open && isCompressing) return;

    if (!open) {
      attemptClose();
    } else {
      setIsOpen(true);
    }
  };

  const attemptClose = () => {
    // 2. Prevent closing if compression is in progress
    if (isCompressing) return;

    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setIsOpen(false);
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      isMouseDownOnBackdrop.current = true;
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDownOnBackdrop.current && e.target === e.currentTarget) {
      attemptClose();
    }
    isMouseDownOnBackdrop.current = false;
  };

  // Callbacks for the CaseForm component
  const handleFormSubmitSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setIsOpen(false); // Close the main dialog on success
    if (props.onSuccess) {
      props.onSuccess();
    }
  };

  const handleFormError = (message: string | null) => {
    setError(message);
  };

  // Handler for closing the success confirmation modal
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (props.mode === "create") {
      // Consider if reload is always needed, maybe just clear state or refetch?
      window.location.reload();
    }
  };

  // Render logic for the modal title
  const renderTitle = () => {
    const isSuggestion =
      (props.mode === "edit" ? props.initialData.type : props.caseType) ===
      "SUGGESTION";

    const icon = isSuggestion ? (
      <LightBulbIcon className="h-7 w-7 mr-3 text-green-500 inline-block" />
    ) : (
      <ExclamationTriangleIcon className="h-7 w-7 mr-3 text-red-500 inline-block" />
    );
    const modeText =
      props.mode === "edit"
        ? t("dashboard:editCase")
        : t("dashboard:createCase");
    const typeText = isSuggestion
      ? t(`dashboard:${CASE_TYPE.SUGGESTION}`)
      : t(`dashboard:${CASE_TYPE.PROBLEM}`);

    return (
      <div className="flex items-center">
        {icon}
        <span className="flex-1">
          {modeText}: <span className="font-normal">{typeText}</span>
          {props.mode === "edit" && (
            <span className="font-mono text-gray-500 ml-2">
              #{props.caseNumber}
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
        <Dialog.Portal>
          <AlertDialog.Root
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <Dialog.Overlay
              className="fixed inset-0 bg-black/50 z-40"
              onMouseDown={handleBackdropMouseDown}
              onMouseUp={handleBackdropMouseUp}
            />
            <Dialog.Content
              onMouseDown={(e) => e.stopPropagation()} // Prevent backdrop click logic when clicking inside content
              className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-stone-100 shadow-lg focus:outline-none max-h-[90vh] flex flex-col"
            >
              {/* --- HEADER --- */}
              <div className="sticky top-0 bg-stone-100 z-10 border-b border-gray-300 rounded-t-xl flex-shrink-0">
                <div className="p-6 relative">
                  <Dialog.Title className="text-2xl font-bold text-gray-800">
                    {renderTitle()}
                  </Dialog.Title>

                  {/* Close button - disabled if compressing */}
                  <button
                    onClick={attemptClose}
                    disabled={isCompressing}
                    className={`absolute top-4 right-4 rounded-full p-1 transition-colors ${
                      isCompressing
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-800 hover:cursor-pointer focus:outline-none"
                    }`}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                {error && (
                  <div className="px-6 pb-4">
                    <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="ml-3 text-red-400 hover:text-red-600 focus:outline-none"
                        aria-label="Dismiss error"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- RENDER THE FORM COMPONENT --- */}
              {/* 3. Pass the compression props down to the form */}
              <CaseForm
                {...props} // Pass original props down
                t={t}
                isOpen={isOpen}
                onCancel={attemptClose}
                onUnsavedChangesChange={setHasUnsavedChanges}
                onFormError={handleFormError}
                onSubmissionError={handleFormError}
                onSubmitSuccess={handleFormSubmitSuccess}
              />
            </Dialog.Content>

            {/* --- UNSAVED CHANGES ALERT DIALOG --- */}
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
                <AlertDialog.Title className="mb-2 text-lg font-semibold text-gray-900">
                  Потвърждение
                </AlertDialog.Title>
                <AlertDialog.Description className="mb-5 text-sm text-gray-600">
                  Сигурни ли сте, че искате да излезете? Всички незапазени
                  промени ще бъдат загубени.
                </AlertDialog.Description>
                <div className="flex justify-end gap-4">
                  <AlertDialog.Cancel asChild>
                    <button
                      onClick={handleCancelClose}
                      className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none hover:cursor-pointer"
                    >
                      Отказ
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      onClick={handleConfirmClose}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none hover:cursor-pointer"
                    >
                      Излез
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </Dialog.Portal>
      </Dialog.Root>

      {/* --- SUCCESS CONFIRMATION MODAL --- */}
      <SuccessConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Успех!"
        message={successMessage}
        autoCloseDuration={2000}
      />
    </>
  );
};

export default CaseDialog;
