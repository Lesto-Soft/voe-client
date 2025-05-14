// src/components/modals/CreateCategoryModal.tsx
import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // Add a prop to know if form has unsaved changes
  hasUnsavedChanges?: boolean;
}

const CreateCategoryModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  hasUnsavedChanges = false, // Default to false
}) => {
  // State to control the visibility of the custom confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfirmDialog(false); // Ensure confirm dialog is closed initially when modal opens
    }
  }, [isOpen]);

  // This function attempts to close the main modal
  const attemptClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true); // Show confirmation if there are unsaved changes
    } else {
      onClose(); // Close directly if no unsaved changes
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose(); // Proceed with closing the main modal
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false); // Just close the confirmation dialog
  };

  if (!isOpen) return null;

  return (
    <AlertDialog.Root
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
    >
      {/* Main Modal Backdrop & Content */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-stone-500/75 p-4"
        onClick={attemptClose} // Use attemptClose for backdrop click
      >
        <div
          className="relative w-full max-w-md md:max-w-lg lg:max-w-2xl rounded-lg bg-white p-4 md:p-6 shadow-xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <button
            onClick={attemptClose} // Use attemptClose for the 'X' button
            className="absolute top-2 right-2 rounded-sm p-1 text-gray-500 opacity-70 transition-opacity hover:text-gray-800 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 md:top-3 md:right-3 z-10 hover:cursor-pointer"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-800 md:mb-6 md:text-xl">
            {title}
          </h2>
          <div>{children}</div>
        </div>
      </div>

      {/* Confirmation Dialog (Radix UI) */}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <AlertDialog.Title className="mb-2 text-lg font-semibold text-gray-900">
            Потвърждение
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-5 text-sm text-gray-600">
            Сигурни ли сте, че искате да излезете? Всички незапазени промени ще
            бъдат загубени.
          </AlertDialog.Description>
          <div className="flex justify-end gap-4">
            <AlertDialog.Cancel asChild>
              <button
                onClick={handleCancelClose}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                Отказ
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleConfirmClose}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Излез
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default CreateCategoryModal;
