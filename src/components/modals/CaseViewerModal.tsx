// src/components/modals/CaseViewerModal.tsx
import React, { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import DashboardContent from "../../pages/DashboardContent";
import { ICase } from "../../db/interfaces"; // Import ICase for filter types
import moment from "moment";

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
  // Construct the dashboard URL from the filter object
  const dashboardUrl = useMemo(() => {
    const params = new URLSearchParams();
    const { startDate, endDate, priority, type } = initialFilters;

    if (startDate) {
      params.set("startDate", moment(startDate).format("DD-MM-YYYY"));
    }
    if (endDate) {
      params.set("endDate", moment(endDate).format("DD-MM-YYYY"));
    }
    if (priority) {
      params.set("priority", priority);
    }
    if (type) {
      params.set("type", type);
    }

    // Ensure we start with a '?' if there are any parameters
    const queryString = params.toString();
    return `/dashboard${queryString ? `?${queryString}` : ""}`;
  }, [initialFilters]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-gray-50 p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none">
          {/* START: MODIFIED HEADER SECTION */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-x-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Отвори в нов прозорец"
                className="flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                Отвори таблото
              </a>
            </div>
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
          {/* END: MODIFIED HEADER SECTION */}

          <div className="flex-1 overflow-y-auto">
            <DashboardContent initialFiltersOverride={initialFilters} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseViewerModal;
