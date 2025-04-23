import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as AlertDialog from "@radix-ui/react-alert-dialog"; // Import Radix UI Alert Dialog

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // This is the function to call when *confirmed* close happens
  title: string;
  children: React.ReactNode;
}

const CreateUserModal: React.FC<ModalProps> = ({
  isOpen,
  onClose, // Renamed for clarity: this is the prop that actually closes the main modal
  title,
  children,
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  // State to control the visibility of the custom confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset flags when the modal opens
      setHasInteracted(false);
      setShowConfirmDialog(false); // Ensure confirm dialog is closed initially
    }
  }, [isOpen]);

  const handleInteraction = () => {
    // Optimization: only set state if it's not already true
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // This function attempts to close the main modal
  const attemptClose = () => {
    if (hasInteracted) {
      // If interacted, show the custom confirmation dialog instead of window.confirm
      setShowConfirmDialog(true);
    } else {
      // If no interaction, close the main modal directly
      onClose();
    }
  };

  // This function is called when the user *confirms* closing from the AlertDialog
  const handleConfirmClose = () => {
    setShowConfirmDialog(false); // Close the confirmation dialog
    onClose(); // Proceed with closing the main modal
  };

  // This function is called when the user *cancels* closing from the AlertDialog
  const handleCancelClose = () => {
    setShowConfirmDialog(false); // Just close the confirmation dialog
  };

  // --- Event Handlers for Interaction Detection ---
  // Use a single wrapper function or attach directly
  const interactionProps = {
    // Consider if all these are needed. onChange on inputs is often sufficient.
    // onClick: handleInteraction, // Be careful with onClick if children have their own clicks
    onChange: handleInteraction, // Good for form inputs
    onKeyDown: handleInteraction, // Good for detecting typing
    // onFocus: handleInteraction, // Might trigger too easily
    // onBlur: handleInteraction, // Might trigger too easily
  };
  // --- End Interaction Detection ---

  if (!isOpen) return null;

  return (
    // Use Radix Portal for the main modal for better stacking context
    <AlertDialog.Root
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
    >
      {/* Main Modal Backdrop & Content */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-stone-500/75"
        // Use attemptClose for backdrop click
        onClick={attemptClose}
      >
        {/* Main Modal Content */}
        <div
          className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          {...interactionProps} // Spread interaction handlers here or on specific child elements
        >
          {/* Close Button for Main Modal */}
          <button
            onClick={attemptClose} // Use attemptClose for the 'X' button
            className="absolute top-3 right-3 text-gray-500 transition-colors hover:text-gray-800 hover:cursor-pointer"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Main Modal Header */}
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
            {title}
          </h2>

          {/* Main Modal Body - Attach interaction handlers here or on inputs within children */}
          <div /* {...interactionProps} */>
            {/* Pass handleInteraction down to form elements if needed */}
            {children}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog (using Radix AlertDialog) */}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <AlertDialog.Title className="mb-2 text-lg font-semibold text-gray-900">
            Потвърждение
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-5 text-sm text-gray-600">
            Сигурни ли сте, че искате да излезете? Всички незапазени промени ще
            бъдат загубени.
          </AlertDialog.Description>
          <div className="flex justify-end gap-4">
            <AlertDialog.Cancel asChild>
              {/* Cancel button - closes the confirmation dialog */}
              <button
                onClick={handleCancelClose} // Explicitly handle cancel if needed, though Radix handles closing
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                Отказ
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              {/* Confirm button - proceeds with closing the main modal */}
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

export default CreateUserModal;
