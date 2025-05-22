// src/components/modals/SuccessConfirmationModal.tsx
import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; // ArrowPathIcon is not used in this barebones version

interface SuccessConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  autoCloseDuration?: number; // Duration in milliseconds
}

const SuccessConfirmationModal: React.FC<SuccessConfirmationModalProps> = ({
  isOpen,
  onClose,
  title = "Успех!", // Default title in Bulgarian
  message,
  autoCloseDuration = 4000, // Default to 4 seconds
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }
    return () => {
      clearTimeout(timer); // Clear timeout if component unmounts or isOpen changes
    };
  }, [isOpen, onClose, autoCloseDuration]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow data-[state=closed]:animate-contentHide focus:outline-none md:w-full">
          <div className="flex flex-col items-center text-center">
            <CheckCircleIcon className="mb-4 h-16 w-16 text-green-500" />
            <Dialog.Title className="mb-2 text-xl font-semibold text-gray-800 sm:text-2xl">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 sm:text-base">
              {message}
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SuccessConfirmationModal;

/*
  Reminder: Tailwind CSS Animation Keyframes
  Ensure these (or similar) are in your tailwind.config.js or global CSS for the modal to animate correctly.

  // tailwind.config.js
  module.exports = {
    // ... other config
    theme: {
      extend: {
        keyframes: {
          overlayShow: {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
          overlayHide: { 
            from: { opacity: '1' },
            to: { opacity: '0' },
          },
          contentShow: {
            from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
            to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          },
          contentHide: { 
            from: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
            to: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          },
        },
        animation: {
          overlayShow: 'overlayShow 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          overlayHide: 'overlayHide 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          contentShow: 'contentShow 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          contentHide: 'contentHide 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    plugins: [],
  }
*/
