// src/components/modals/ConfirmActionDialog.tsx
import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructiveAction?: boolean; // Changed from is위험Action
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  isDestructiveAction = false, // Changed from is위험Action
}) => {
  if (!isOpen) return null;

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
          <div className="flex justify-between items-center mb-4">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <button
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
                onClick={() => onOpenChange(false)} // Ensure cancel button also triggers onOpenChange
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </AlertDialog.Cancel>
          </div>
          <AlertDialog.Description className="mb-5 text-sm text-gray-600">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
                {cancelButtonText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className={`rounded px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2  focus-visible:ring-offset-2 ${
                  isDestructiveAction // Changed from is위험Action
                    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                    : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500" // Default to a non-destructive color like blue
                }`}
              >
                {confirmButtonText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmActionDialog;
