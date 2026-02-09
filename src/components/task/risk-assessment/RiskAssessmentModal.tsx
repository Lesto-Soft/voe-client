import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { IRiskAssessment } from "../../../db/interfaces";
import RiskAssessmentForm from "./RiskAssessmentForm";

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: IRiskAssessment;
  onSubmit: (data: {
    riskDescription: string;
    probability: number;
    impact: number;
    plan: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const RiskAssessmentModal: React.FC<RiskAssessmentModalProps> = ({
  isOpen,
  onOpenChange,
  assessment,
  onSubmit,
  isLoading = false,
}) => {
  const handleSubmit = async (data: {
    riskDescription: string;
    probability: number;
    impact: number;
    plan: string;
  }) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
              {assessment ? "Редактиране на оценка" : "Нова оценка на риска"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto custom-scrollbar-xs">
            <RiskAssessmentForm
              assessment={assessment}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default RiskAssessmentModal;
