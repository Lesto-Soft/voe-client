// src/components/modals/CaseViewerModal.tsx
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import DashboardContent from "../../pages/DashboardContent";
import { ICase } from "../../db/interfaces"; // Import ICase for filter types

// Define the shape of the filters object we expect
type CaseFilters = {
  priority?: ICase["priority"] | "";
  type?: ICase["type"] | "";
  startDate?: Date | null;
  endDate?: Date | null;
};

interface CaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // CHANGED: We now accept a filter object instead of a string
  initialFilters: CaseFilters;
  title: string;
}

const CaseViewerModal: React.FC<CaseViewerModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
  title,
}) => {
  // The component is now much simpler.
  // We no longer need MemoryRouter, history, or any related state.

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-gray-50 p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none">
          <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="cursor-pointer h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* CHANGED: No more Router. 
              We pass the filter object directly to DashboardContent.
            */}
            <DashboardContent initialFiltersOverride={initialFilters} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseViewerModal;
