import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface EditorHelpModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditorHelpModal: React.FC<EditorHelpModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation("answer");

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-contentShow">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            {t("rte.title")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            {t("rte.description")}
          </Dialog.Description>

          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <strong className="px-1.5 py-0.5 rounded bg-gray-200 w-6 text-center">
                B
              </strong>
              <span>- {t("rte.bold")}</span>
            </li>
            <li className="flex items-center gap-2">
              <em className="px-1.5 py-0.5 rounded bg-gray-200 w-6 text-center">
                I
              </em>
              <span>- {t("rte.italic")}</span>
            </li>
            <li className="flex items-center gap-2">
              <u className="px-1.5 py-0.5 rounded bg-gray-200 w-6 text-center">
                U
              </u>
              <span>- {t("rte.underline")}</span>
            </li>
            <li className="flex items-center gap-2">
              <strong className="px-1.5 py-0.5 rounded bg-gray-200 text-blue-600 w-6 text-center">
                @
              </strong>
              <span>- {t("rte.mention")}</span>
            </li>
          </ul>

          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditorHelpModal;
