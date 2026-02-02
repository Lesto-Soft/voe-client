import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { IFiveWhy, IWhyStep } from "../../../db/interfaces";
import FiveWhyForm from "./FiveWhyForm";

interface FiveWhyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fiveWhy?: IFiveWhy;
  onSubmit: (data: {
    whys: IWhyStep[];
    rootCause: string;
    counterMeasures: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const FiveWhyModal: React.FC<FiveWhyModalProps> = ({
  isOpen,
  onOpenChange,
  fiveWhy,
  onSubmit,
  isLoading = false,
}) => {
  const handleSubmit = async (data: {
    whys: IWhyStep[];
    rootCause: string;
    counterMeasures: string;
  }) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <QuestionMarkCircleIcon className="h-6 w-6 text-amber-500" />
              {fiveWhy ? "Редактиране на анализ" : "Нов \"5 Защо\" Анализ"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto">
            <FiveWhyForm
              fiveWhy={fiveWhy}
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

export default FiveWhyModal;
