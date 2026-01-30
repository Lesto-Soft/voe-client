// src/components/forms/partials/TextEditor/HelperModal.tsx
import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslation } from "react-i18next";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

const HelperModal: React.FC = () => {
  const { t } = useTranslation(["menu", "answer"]);

  return (
    <Popover.Root modal={true}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          title={t("menu:rte.help") || "Help"}
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          align="end"
          className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 data-[state=open]:animate-contentShow"
        >
          {/* Content is now directly inside */}
          <h3 className="text-md font-medium text-gray-900">
            {t("answer:rte.title")}
          </h3>
          <p className="mt-1 text-sm text-gray-600 mb-4">
            {t("answer:rte.description")}
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <strong className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-200 text-center font-mono">
                B
              </strong>
              <span>- {t("answer:rte.bold")}</span>
            </li>
            <li className="flex items-start gap-3">
              <em className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-200 text-center font-mono">
                I
              </em>
              <span>- {t("answer:rte.italic")}</span>
            </li>
            <li className="flex items-start gap-3">
              <u className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-200 text-center font-mono">
                U
              </u>
              <span>- {t("answer:rte.underline")}</span>
            </li>
            <li className="flex items-start gap-3">
              <strong className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-200 text-blue-600 text-center font-mono">
                @
              </strong>
              <span>- {t("answer:rte.mention")}</span>
            </li>
          </ul>

          <Popover.Close
            className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default HelperModal;
